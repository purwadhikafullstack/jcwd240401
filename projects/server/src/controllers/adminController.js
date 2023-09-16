const db = require("../models");

module.exports = {
  async allBranch(req, res) {
    const pagination = {
      page: Number(req.query.page) || 1,
      perPage: 12,
      search: req.query.search,
      city_id: req.query.sortOrder || "ASC",
    };

    const where = {};
    const order = [];
    try {
      if (pagination.city_id) {
        if (pagination.city_id.toUpperCase() === "DESC") {
          order.push(["city_id", "DESC"]);
        } else {
          order.push(["city_id", "ASC"]);
        }
      }
      if (pagination.search) {
        where[db.Sequelize.Op.or] = [
          {
            "$City.city_name$": {
              [db.Sequelize.Op.like]: `%${pagination.search}%`,
            },
          },
          {
            "$City.Province.province_name$": {
              [db.Sequelize.Op.like]: `%${pagination.search}%`,
            },
          },
        ];
      }

      const results = await db.Branch.findAndCountAll({
        include: [
          {
            model: db.User,
            attributes: ["name", "phone"],
          },
          {
            model: db.City,
            include: [
              {
                model: db.Province,
                attributes: ["province_name"],
              },
            ],
            attributes: {
              exclude: ["city_id"],
            },
          },
        ],
        where,
        order,
        limit: pagination.perPage,
        offset: (pagination.page - 1) * pagination.perPage,
      });

      const totalCount = results.count;
      pagination.totalData = totalCount;

      if (results.rows.length === 0) {
        return res.status(200).send({
          message: "No branch found",
        });
      }

      return res.status(200).send({
        message: "Successfully retrieved branch",
        pagination,
        data: results,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).send({ message: "Internal Server Error" });
    }
  },
  async addBranchProduct(req, res) {
    const { product_id, quantity, origin } = req.body;
    const transaction = await db.sequelize.transaction();
    try {
      const user = await db.User.findOne({
        where: {
          id: req.user.id,
        },
        include: {
          model: db.Branch,
        },
      });
      if (!user) {
        await transaction.rollback();
        return res.status(401).send({ message: "User not found" });
      }
      const isExist = await db.Branch_Product.findOne({
        where: {
          branch_id: user.Branch.id,
          product_id: parseInt(product_id),
          isRemoved: 0,
        },
      });
      if (isExist) {
        await transaction.rollback();
        return res
          .status(400)
          .send({ message: "The product already exist in your branch" });
      }

      const product = await db.Product.findByPk(product_id);

      const status = quantity <= 5 ? "restock" : "ready";

      const newBranchProduct = await db.Branch_Product.create(
        {
          branch_id: user.Branch.id,
          product_id: product_id,
          quantity: quantity,
          origin: origin,
          status: status,
        },
        { transaction, returning: ["id"] }
      );

      await db.Stock_History.create(
        {
          branch_product_id: newBranchProduct.id,
          totalQuantity: quantity,
          quantity: quantity,
          status: "restock by admin",
        },
        { transaction }
      );

      await transaction.commit();

      return res.status(201).send({
        message: "Successfully created new branch product",
        data: newBranchProduct,
      });
    } catch (error) {
      console.log(error);
      await transaction.rollback();
      return res.status(500).send({ message: "Internal Server Error" });
    }
  },
  async modifyOrRemoveBranchProduct(req, res) {
    const transaction = await db.sequelize.transaction();
    const action = req.params.action;
    const { origin } = req.body;
    try {
      const getBranchProduct = await db.Branch_Product.findOne({
        where: {
          id: parseInt(req.params.id),
          isRemoved: false,
        },
      });

      if (!getBranchProduct) {
        await transaction.rollback();
        return res.status(404).send({
          message: "Branch product not found",
        });
      }

      switch (action) {
        case "modify":
          try {
            if (origin) {
              getBranchProduct.origin = origin;
            }
            await getBranchProduct.save({ transaction });

            await transaction.commit();
            return res.status(200).send({
              message: "Sucessfully changed branch product detail",
              data: getBranchProduct,
            });
          } catch (error) {
            await transaction.rollback();
            console.log(error);
            return res.status(500).send({
              message: "Internal Server Error",
            });
          }
        case "remove":
          try {
            const isUsed = await db.Order.findOne({
              where: {
                orderStatus: {
                  [db.Sequelize.Op.in]: [
                    "Waiting for payment",
                    "Waiting for payment confirmation",
                    "Processing",
                  ],
                },
              },
              include: {
                model: db.Branch_Product,
                where: {
                  id: parseInt(req.params.id),
                },
              },
            });

            if (isUsed) {
              await transaction.rollback();
              return res.status(400).send({
                message: "Unable to delete. Branch product is in transaction/s",
              });
            }

            getBranchProduct.isRemoved = true;
            await getBranchProduct.save({ transaction });
            await transaction.commit();
            return res.status(200).send({
              message: "Successfully delete product from branch",
            });
          } catch (error) {
            await transaction.rollback();
            console.log(error);
            return res.status(500).send({
              message: "Internal Server Error",
            });
          }
        default:
          await transaction.rollback();
          return res.status(400).send({
            message: "Invalid action",
          });
      }
    } catch (error) {
      await transaction.rollback();
      console.log(error);
      return res.status(500).send({
        message: "Internal Server Error",
      });
    }
  },
  async plusOrMinusBranchProduct(req, res) {
    const transaction = await db.sequelize.transaction();
    const action = req.params.action;
    const { quantity } = req.body;
    const parsedQuantity = parseInt(quantity);
    try {
      const getBranchProduct = await db.Branch_Product.findOne({
        where: {
          id: parseInt(req.params.id),
          isRemoved: false,
        },
      });
      console.log("ini branch product", getBranchProduct);
      if (!getBranchProduct) {
        await transaction.rollback();
        return res.status(404).send({
          message: "Branch product not found",
        });
      }
      switch (action) {
        case "plus":
          try {
            const newQuantity = getBranchProduct.quantity + parsedQuantity;
            const status =
              newQuantity === 0
                ? "empty"
                : newQuantity <= 5
                ? "restock"
                : "ready";
            if (newQuantity)
              await getBranchProduct.update(
                { quantity: newQuantity, status },
                { transaction }
              );
            await db.Stock_History.create(
              {
                branch_product_id: getBranchProduct.id,
                totalQuantity: newQuantity,
                quantity: parsedQuantity,
                status: "restock by admin",
              },
              { transaction }
            );
            await transaction.commit();
            return res.status(200).send({
              message: "Stock incremented successfully",
              data: getBranchProduct,
            });
          } catch (error) {
            await transaction.rollback();
            console.log(error);
            return res.status(500).send({
              message: "Internal Server Error",
            });
          }
        case "minus":
          try {
            if (parsedQuantity > getBranchProduct.quantity) {
              await transaction.rollback();
              return res.status(400).send({
                message: "Insufficient stock to decrement",
              });
            }
            const newQuantity = getBranchProduct.quantity - parsedQuantity;
            const status =
              newQuantity === 0
                ? "empty"
                : newQuantity <= 5
                ? "restock"
                : "ready";
            await getBranchProduct.update(
              { quantity: newQuantity, status },
              { transaction }
            );
            await db.Stock_History.create(
              {
                branch_product_id: getBranchProduct.id,
                totalQuantity: newQuantity,
                quantity: parsedQuantity,
                status: "reduced by admin",
              },
              { transaction }
            );
            await transaction.commit();
            return res.status(200).send({
              message: "Stock decremented successfully",
              data: getBranchProduct,
            });
          } catch (error) {
            await transaction.rollback();
            console.log(error);
            return res.status(500).send({
              message: "Internal Server Error",
            });
          }
        default:
          await transaction.rollback();
          return res.status(400).send({
            message: "Invalid action",
          });
      }
    } catch (error) {
      await transaction.rollback();
      console.log(error);
      return res.status(500).send({
        message: "Internal Server Error",
      });
    }
  },
  async allBranchProduct(req, res) {
    const pagination = {
      page: Number(req.query.page) || 1,
      perPage: 12,
      search: req.query.search || "",
      category: req.query.filterCategory || "",
      status: req.query.filterStatus || "",
      name: req.query.sortName,
    };
    try {
      const user = await db.User.findOne({
        where: {
          id: req.user.id,
        },
        include: {
          model: db.Branch,
        },
      });
      if (!user) {
        return res.status(401).send({ message: "User not found" });
      }
      const where = { branch_id: user.Branch.id, isRemoved: 0 };
      const productWhere = {
        isRemoved: 0,
      };
      const order = [];
      if (pagination.search) {
        productWhere.name = {
          [db.Sequelize.Op.like]: `%${pagination.search}%`,
        };
      }
      if (pagination.category) {
        productWhere.category_id = pagination.category;
      }
      if (pagination.status) {
        where.status = pagination.status;
      }
      if (pagination.name) {
        if (pagination.name.toUpperCase() === "DESC") {
          order.push(["Product", "name", "DESC"]);
        } else {
          order.push(["Product", "name", "ASC"]);
        }
      }

      const results = await db.Branch_Product.findAndCountAll({
        where,
        include: [
          {
            model: db.Product,
            where: productWhere,
            include: { model: db.Category, where: { isRemoved: 0 } },
          },
        ],
        limit: pagination.perPage,
        offset: (pagination.page - 1) * pagination.perPage,
        order,
      });

      const totalCount = results.count;
      pagination.totalData = totalCount;

      if (results.rows.length === 0) {
        return res.status(200).send({
          message: "No branch products found",
        });
      }
      res.status(200).send({
        message: "Successfully retrieved branch products",
        pagination,
        data: results,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).send({
        message: "Internal Server Error",
      });
    }
  },
  async allBranchProductNoPagination(req, res) {
    try {
      const user = await db.User.findOne({
        where: {
          id: req.user.id,
        },
        include: {
          model: db.Branch,
        },
      });
      if (!user) {
        return res.status(401).send({ message: "User not found" });
      }
      const results = await db.Branch_Product.findAll({
        where: { branch_id: user.Branch.id, isRemoved: 0 },
        include: [
          {
            model: db.Product,
            where: {
              isRemoved: 0,
            },
            include: { model: db.Category, where: { isRemoved: 0 } },
          },
        ],
      });

      if (results.length === 0) {
        return res.status(200).send({
          message: "No branch products found",
        });
      }

      res.status(200).send({
        message: "Successfully retrieved products",
        data: results,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).send({
        message: "Internal Server Error",
      });
    }
  },
  async branchProductPerId(req, res) {
    try {
      const user = await db.User.findOne({
        where: {
          id: req.user.id,
        },
        include: {
          model: db.Branch,
        },
      });
      if (!user) {
        return res.status(401).send({ message: "User not found" });
      }
      const result = await db.Branch_Product.findOne({
        where: { id: req.params.id, isRemoved: false },
        include: [
          {
            model: db.Product,
            where: {
              isRemoved: 0,
            },
            include: { model: db.Category, where: { isRemoved: 0 } },
          },
          {
            model: db.Discount,
          },
        ],
      });

      if (!result) {
        return res.status(404).send({
          message: "Branch product not found",
        });
      }

      res.status(200).send({
        message: "Successfully retrieved branch product",
        data: result,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).send({
        message: "Internal Server Error",
      });
    }
  },
  // create discount
  async createDiscount(req, res) {
    const transaction = await db.sequelize.transaction();
    try {
      const user = await db.User.findOne({
        where: {
          id: req.user.id,
        },
        include: {
          model: db.Branch,
        },
      });
      if (!user) {
        return res.status(401).send({ message: "User not found" });
      }
      const { discount_type_id, amount, expiredDate, products } = req.body;

      const isExist = await db.Discount.findOne({
        where: {
          branch_id: user.Branch.id,
          discount_type_id,
          amount,
          expiredDate,
        },
      });

      if (isExist) {
        await transaction.rollback();
        return res.status(400).send({
          message: "you still have a similar discount available",
          data: isExist,
        });
      }

      //if buy one get one
      if (discount_type_id == 1) {
        const newDiscount = await db.Discount.create(
          {
            branch_id: user.Branch.id,
            discount_type_id: 1,
            amount: 1,
            expiredDate,
          },
          { transaction: transaction }
        );

        // selected
        const results = products.forEach(async (data) => {
          const updateProductDiscount = await db.Branch_Product.findOne({
            where: {
              product_id: data,
              branch_id: user.Branch.id,
            },
          });
          updateProductDiscount.discount_id = newDiscount.id;
          console.log(updateProductDiscount, "ini updateProductDiscount");
          await updateProductDiscount.save();
        });
        await transaction.commit();
        return res.status(200).send({
          message: "new discount created",
          data: newDiscount,
          totalProduct: `${products.length} product(s)`,
        });
      } else {
        const newDiscount = await db.Discount.create(
          {
            branch_id: user.Branch.id,
            discount_type_id,
            amount,
            expiredDate,
          },
          { transaction }
        );

        // selected

        const results = products.forEach(async (data) => {
          const updateProductDiscount = await db.Branch_Product.findOne({
            where: {
              product_id: data,
              branch_id: user.Branch.id,
            },
          });
          updateProductDiscount.discount_id = newDiscount.id;
          await updateProductDiscount.save();
        });
        await transaction.commit();
        return res.status(200).send({
          message: "new discount created",
          data: newDiscount,
          totalProduct: `${products.length} product(s)`,
        });
      }
    } catch (error) {
      await transaction.rollback();
      return res.status(500).send({
        message: "fatal errors",
        errors: error.message,
      });
    }
  },
  // get discount list (A)
  async getAllDiscount(req, res) {
    const pagination = {
      page: Number(req.query.page) || 1,
      perPage: 12,
      createDate: req.query.sortDiscount || "DESC",
      discount_type_id: req.query.filterDiscountType || "",
    };

    try {
      const user = await db.User.findOne({
        where: {
          id: req.user.id,
        },
        include: {
          model: db.Branch,
        },
      });
      console.log(user);
      if (!user) {
        return res.status(401).send({ message: "User not found" });
      }
      const where = { branch_id: user.Branch.id };
      const order = [];

      if (pagination.createDate) {
        if (pagination.createDate.toUpperCase() === "DESC") {
          order.push(["createdAt", "DESC"]);
        } else {
          order.push(["createdAt", "ASC"]);
        }
      }
      if (pagination.discount_type_id) {
        where.discount_type_id = pagination.discount_type_id;
      }
      const results = await db.Discount.findAndCountAll({
        include: [
          {
            model: db.Discount_Type,
            attributes: ["type"],
          },
        ],
        where,
        order,
        limit: pagination.perPage,
        offset: (pagination.page - 1) * pagination.perPage,
      });

      const totalCount = results.count;
      pagination.totalData = totalCount;

      if (results.rows.length === 0) {
        return res.status(200).send({
          message: "No discount found",
        });
      }

      return res.status(200).send({
        message: "data successfully retrieved",
        pagination,
        data: results,
      });
    } catch (error) {
      return res.status(500).send({
        message: "fatal error",
        errors: error.message,
      });
    }
  },
  // get discount type list (A)
  async getAllDiscountType(req, res) {
    try {
      const discountTypelist = await db.Discount_Type.findAll();

      return res.status(200).send({
        message: "data successfully retrieved",
        data: discountTypelist,
      });
    } catch (error) {
      return res.status(500).send({
        message: "fatal error",
        error: error.message,
      });
    }
  },

  // create voucher (A)
  async createVoucher(req, res) {
    const transaction = await db.sequelize.transaction();

    try {
      const user = await db.User.findOne({
        where: {
          id: req.user.id,
        },
        include: {
          model: db.Branch,
        },
      });
      if (!user) {
        return res.status(401).send({ message: "User not found" });
      }

      const {
        branch_id,
        voucher_type_id,
        expiredDate,
        usedLimit,
        amount,
        minTransaction,
        maxDiscount,
        isReferral,
      } = req.body;

      switch (voucher_type_id) {
        case "1":
          if (isReferral) {
            await db.Voucher.update(
              { isReferral: false },
              {
                where: {
                  isReferral: true,
                  branch_id: user.Branch.id,
                },
              }
            );

            const newVoucher = await db.Voucher.create(
              {
                branch_id: user.Branch.id,
                voucher_type_id,
                isReferral,
                isExpired: false,
              },
              { transaction }
            );

            await transaction.commit();
            return res.status(201).send({
              message: "new voucher created",
              data: newVoucher,
            });
          } else {
            if (!minTransaction || !usedLimit || !expiredDate) {
              await transaction.rollback();
              return res.status(400).send({
                message: "please fill the required field",
              });
            }
            const isExist = await db.Voucher.findOne({
              where: {
                branch_id: user.Branch.id,
                voucher_type_id,
                minTransaction,
                usedLimit,
              },
            });

            if (isExist) {
              await transaction.rollback();
              return res.status(400).send({
                message: "you still have a similar voucher available",
                data: isExist,
              });
            }

            const newVoucher = await db.Voucher.create(
              {
                branch_id: user.Branch.id,
                voucher_type_id,
                isReferral,
                minTransaction,
                usedLimit,
                expiredDate,
                isExpired: false,
              },
              { transaction }
            );

            await transaction.commit();
            return res.status(201).send({
              message: "new voucher created",
              data: newVoucher,
            });
          }
          break;

        case "2":
          if (isReferral) {
            if (!amount || !maxDiscount) {
              await transaction.rollback();
              return res.status(400).send({
                message: "please fill the required field",
              });
            }
            await db.Voucher.update(
              { isReferral: false },
              {
                where: {
                  isReferral: true,
                  branch_id: user.Branch.id,
                },
              }
            );

            const newVoucher = await db.Voucher.create(
              {
                branch_id: user.Branch.id,
                voucher_type_id,
                isReferral,
                amount,
                maxDiscount,
                isExpired: false,
              },
              { transaction }
            );

            await transaction.commit();
            return res.status(201).send({
              message: "new voucher created",
              data: newVoucher,
            });
          } else {
            if (
              !amount ||
              !maxDiscount ||
              !minTransaction ||
              !usedLimit ||
              !expiredDate
            ) {
              await transaction.rollback();
              return res.status(400).send({
                message: "please fill the required field",
              });
            }
            const isExist = await db.Voucher.findOne({
              where: {
                branch_id: user.Branch.id,
                voucher_type_id,
                amount,
                minTransaction,
                maxDiscount,
                usedLimit,
              },
            });

            if (isExist) {
              await transaction.rollback();
              return res.status(400).send({
                message: "you still have a similar voucher available",
                data: isExist,
              });
            }

            const newVoucher = await db.Voucher.create(
              {
                branch_id: user.Branch.id,
                voucher_type_id,
                isReferral,
                amount,
                maxDiscount,
                minTransaction,
                usedLimit,
                expiredDate,
                isExpired: false,
              },
              { transaction }
            );

            await transaction.commit();
            return res.status(201).send({
              message: "new voucher created",
              data: newVoucher,
            });
          }

          break;

        case "3":
          if (isReferral) {
            if (!amount || !maxDiscount) {
              await transaction.rollback();
              return res.status(400).send({
                message: "please fill the required field",
              });
            }
            await db.Voucher.update(
              { isReferral: false },
              {
                where: {
                  isReferral: true,
                  branch_id: user.Branch.id,
                },
              }
            );

            const newVoucher = await db.Voucher.create(
              {
                branch_id: user.Branch.id,
                voucher_type_id,
                isReferral,
                amount,
                maxDiscount,
                isExpired: false,
              },
              { transaction }
            );

            await transaction.commit();
            return res.status(201).send({
              message: "new voucher created",
              data: newVoucher,
            });
          } else {
            if (
              !amount ||
              !maxDiscount ||
              !minTransaction ||
              !usedLimit ||
              !expiredDate
            ) {
              await transaction.rollback();
              return res.status(400).send({
                message: "please fill the required field",
              });
            }
            const isExist = await db.Voucher.findOne({
              where: {
                branch_id: user.Branch.id,
                voucher_type_id,
                amount,
                minTransaction,
                maxDiscount,
                usedLimit,
              },
            });

            if (isExist) {
              await transaction.rollback();
              return res.status(400).send({
                message: "you still have a similar voucher available",
                data: isExist,
              });
            }

            const newVoucher = await db.Voucher.create(
              {
                branch_id: user.Branch.id,
                voucher_type_id,
                isReferral,
                amount,
                maxDiscount,
                minTransaction,
                usedLimit,
                expiredDate,
                isExpired: false,
              },
              { transaction }
            );

            await transaction.commit();
            return res.status(201).send({
              message: "new voucher created",
              data: newVoucher,
            });
          }

          break;

        default:
          throw new Error("Invalid voucher type");
      }
    } catch (error) {
      await transaction.rollback();
      return res.status(500).send({
        message: "fatal errors",
        errors: error.message,
      });
    }
  },
  // get voucher list (A)
  async getAllVoucher(req, res) {
    const branch_id = 1;
    const pagination = {
      page: Number(req.query.page) || 1,
      perPage: 12,
      createDate: req.query.sortVoucher || "DESC",
      voucher_type_id: req.query.filterVoucherType,
    };
    const where = { branch_id };
    const order = [];
    try {
      if (pagination.createDate) {
        if (pagination.createDate.toUpperCase() === "DESC") {
          order.push(["createdAt", "DESC"]);
        } else {
          order.push(["createdAt", "ASC"]);
        }
      }
      if (pagination.voucher_type_id) {
        where.voucher_type_id = pagination.voucher_type_id;
      }
      const results = await db.Voucher.findAndCountAll({
        include: [
          {
            model: db.Voucher_Type,
            attributes: ["type"],
          },
        ],
        where,
        order,
        limit: pagination.perPage,
        offset: (pagination.page - 1) * pagination.perPage,
      });
      const totalCount = results.count;
      pagination.totalData = totalCount;

      if (results.rows.length === 0) {
        return res.status(200).send({
          message: "No vouchers found",
        });
      }

      return res.status(200).send({
        message: "data successfully retrieved",
        pagination,
        data: results,
      });
    } catch (error) {
      return res.status(500).send({
        message: "fatal error",
        errors: error.message,
      });
    }
  },
  //get voucher type list (A)
  async getAllVoucherType(req, res) {
    try {
      const voucherTypelist = await db.Voucher_Type.findAll();

      return res.status(200).send({
        message: "data successfully retrieved",
        data: voucherTypelist,
      });
    } catch (error) {
      return res.status(500).send({
        message: "fatal error",
        error: error.message,
      });
    }
  },

  //stock history (A)
  async getStockHistory(req, res) {
    const pagination = {
      page: Number(req.query.page) || 1,
      perPage: 12,
      search: req.query.search || "",
      status: req.query.filterStatus || "",
      date: req.query.sortDate,
      branch_product_id: req.query.filterBranchProduct || "",
      startDate: req.query.startDate || "",
      endDate: req.query.endDate || "",
    };
    try {
      const user = await db.User.findOne({
        where: {
          id: req.user.id,
        },
        include: {
          model: db.Branch,
        },
      });
      if (!user) {
        return res.status(401).send({ message: "User not found" });
      }

      const where = {};
      const branchProductWhere = {
        branch_id: user.Branch.id,
        isRemoved: 0,
      };
      let productWhere = { isRemoved: 0 };
      const order = [];
      if (pagination.startDate && pagination.endDate) {
        const startDateUTC = new Date(pagination.startDate);
        startDateUTC.setUTCHours(0, 0, 0, 0); // Set the time to start of the day in UTC

        const endDateUTC = new Date(pagination.endDate);
        endDateUTC.setUTCHours(23, 59, 59, 999); // Set the time to end of the day in UTC

        where.createdAt = {
          [db.Sequelize.Op.between]: [startDateUTC, endDateUTC],
        };
      } else if (pagination.startDate) {
        const startDateUTC = new Date(pagination.startDate);
        startDateUTC.setUTCHours(0, 0, 0, 0); // Set the time to start of the day in UTC

        where.createdAt = {
          [db.Sequelize.Op.gte]: startDateUTC,
        };
      } else if (pagination.endDate) {
        const endDateUTC = new Date(pagination.endDate);
        endDateUTC.setUTCHours(0, 0, 0, 0); // Set the time to start of the day in UTC
        endDateUTC.setUTCDate(endDateUTC.getUTCDate() + 1); // Add 1 day

        where.createdAt = {
          [db.Sequelize.Op.lt]: endDateUTC, // Use less than operator to filter until the end of the previous day
        };
      }

      if (pagination.search) {
        productWhere["$Branch_Product.Product.name$"] = {
          [db.Sequelize.Op.like]: `%${pagination.search}%`,
        };
      }
      if (pagination.branch_product_id) {
        branchProductWhere.id = pagination.branch_product_id;
      }
      if (pagination.status) {
        where.status = pagination.status;
      }
      if (pagination.date) {
        if (pagination.date.toUpperCase() === "DESC") {
          order.push(["createdAt", "DESC"]);
        } else {
          order.push(["createdAt", "ASC"]);
        }
      }
      const results = await db.Stock_History.findAndCountAll({
        where,
        include: [
          {
            model: db.Branch_Product,
            attributes: ["id"],
            where: branchProductWhere,
            include: {
              model: db.Product,
              where: productWhere,
              attributes: [
                "name",
                "weight",
                "unitOfMeasurement",
                "category_id",
                "isRemoved",
              ],
              include: {
                model: db.Category,
                attributes: ["name"],
              },
            },
          },
        ],
        limit: pagination.perPage,
        offset: (pagination.page - 1) * pagination.perPage,
        order,
      });
      console.log(results);
      const totalCount = results.count;
      pagination.totalData = totalCount;

      if (results.rows.length === 0) {
        return res.status(200).send({
          message: "No branch products found",
        });
      }
      res.status(200).send({
        message: "Successfully retrieved branch products",
        pagination,
        data: results,
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({
        message: "Internal Server Error",
        error: error.message,
      });
    }
  },

  //stock history (SA)
  async getStockHistorySuperAdmin(req, res) {
    const pagination = {
      page: Number(req.query.page) || 1,
      perPage: 12,
      search: req.query.search || "",
      status: req.query.filterStatus || "",
      date: req.query.sortDate,
      branch_product_id: req.query.filterBranchProduct || "",
      branch_id: req.query.filterBranch || "1",
      startDate: req.query.startDate || "",
      endDate: req.query.endDate || "",
    };
    try {
      const where = {};
      const branchProductWhere = {
        branch_id: pagination.branch_id,
        isRemoved: 0,
      };
      let productWhere = { isRemoved: 0 };
      const order = [];
      if (pagination.startDate && pagination.endDate) {
        const startDateUTC = new Date(pagination.startDate);
        startDateUTC.setUTCHours(0, 0, 0, 0); // Set the time to start of the day in UTC

        const endDateUTC = new Date(pagination.endDate);
        endDateUTC.setUTCHours(23, 59, 59, 999); // Set the time to end of the day in UTC

        where.createdAt = {
          [db.Sequelize.Op.between]: [startDateUTC, endDateUTC],
        };
      } else if (pagination.startDate) {
        const startDateUTC = new Date(pagination.startDate);
        startDateUTC.setUTCHours(0, 0, 0, 0); // Set the time to start of the day in UTC

        where.createdAt = {
          [db.Sequelize.Op.gte]: startDateUTC,
        };
      } else if (pagination.endDate) {
        const endDateUTC = new Date(pagination.endDate);
        endDateUTC.setUTCHours(0, 0, 0, 0); // Set the time to start of the day in UTC
        endDateUTC.setUTCDate(endDateUTC.getUTCDate() + 1); // Add 1 day

        where.createdAt = {
          [db.Sequelize.Op.lt]: endDateUTC, // Use less than operator to filter until the end of the previous day
        };
      }

      if (pagination.search) {
        productWhere["$Branch_Product.Product.name$"] = {
          [db.Sequelize.Op.like]: `%${pagination.search}%`,
        };
      }
      if (pagination.branch_product_id) {
        branchProductWhere.id = pagination.branch_product_id;
      }
      if (pagination.status) {
        where.status = pagination.status;
      }
      if (pagination.date) {
        if (pagination.date.toUpperCase() === "DESC") {
          order.push(["createdAt", "DESC"]);
        } else {
          order.push(["createdAt", "ASC"]);
        }
      }
      const results = await db.Stock_History.findAndCountAll({
        where,
        include: [
          {
            model: db.Branch_Product,
            attributes: ["id", "branch_id"],
            where: branchProductWhere,
            include: [
              {
                model: db.Branch,
                attributes: ["id", "city_id"],
                where: { id: pagination.branch_id },
                include: {
                  model: db.City,
                  attributes: ["city_name"],
                },
              },
              {
                model: db.Product,
                where: productWhere,
                attributes: [
                  "name",
                  "weight",
                  "unitOfMeasurement",
                  "category_id",
                  "isRemoved",
                ],
                include: {
                  model: db.Category,
                  attributes: ["name"],
                },
              },
            ],
          },
        ],
        limit: pagination.perPage,
        offset: (pagination.page - 1) * pagination.perPage,
        order,
      });
      console.log(results);
      const totalCount = results.count;
      pagination.totalData = totalCount;

      if (results.rows.length === 0) {
        return res.status(200).send({
          message: "No branch products found",
        });
      }
      res.status(200).send({
        message: "Successfully retrieved branch products",
        pagination,
        data: results,
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({
        message: "Internal Server Error",
        error: error.message,
      });
    }
  },
  //all branch no pagination (SA)
  async allBranchNoPagination(req, res) {
    try {
      const results = await db.Branch.findAndCountAll({
        include: [
          {
            model: db.User,
            attributes: ["name", "phone"],
          },
          {
            model: db.City,
            include: [
              {
                model: db.Province,
                attributes: ["province_name"],
              },
            ],
            attributes: {
              exclude: ["city_id"],
            },
          },
        ],
      });

      if (results.rows.length === 0) {
        return res.status(200).send({
          message: "No branch found",
        });
      }

      return res.status(200).send({
        message: "Successfully retrieved branch",
        data: results,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).send({ message: "Internal Server Error" });
    }
  },
  //all branch product no pagination (SA)
  async allBranchProductNoPaginationSuperAdmin(req, res) {
    try {
      const results = await db.Branch_Product.findAll({
        where: { isRemoved: 0 },
        include: [
          {
            model: db.Product,
            where: {
              isRemoved: 0,
            },
            include: { model: db.Category, where: { isRemoved: 0 } },
          },
        ],
      });

      if (results.length === 0) {
        return res.status(200).send({
          message: "No branch products found",
        });
      }

      res.status(200).send({
        message: "Successfully retrieved products",
        data: results,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).send({
        message: "Internal Server Error",
      });
    }
  },
  //sales report (A)
  async getBranchAdminSalesReport(req, res) {
    const pagination = {
      startDate: req.query.startDate || "",
      endDate: req.query.endDate || "",
    };
    try {
      const user = await db.User.findOne({
        where: {
          id: req.user.id,
        },
        include: {
          model: db.Branch,
        },
      });

      if (!user) {
        return res.status(401).send({ message: "User not found" });
      }

      const whereOrderData = {};

      if (pagination.startDate && pagination.endDate) {
        const startDateUTC = new Date(pagination.startDate);
        startDateUTC.setUTCHours(0, 0, 0, 0); // Set the time to start of the day in UTC

        const endDateUTC = new Date(pagination.endDate);
        endDateUTC.setUTCHours(23, 59, 59, 999); // Set the time to end of the day in UTC

        whereOrderData.orderDate = {
          [db.Sequelize.Op.between]: [startDateUTC, endDateUTC],
        };
      } else if (pagination.startDate) {
        const startDateUTC = new Date(pagination.startDate);
        startDateUTC.setUTCHours(0, 0, 0, 0); // Set the time to start of the day in UTC

        whereOrderData.orderDate = {
          [db.Sequelize.Op.gte]: startDateUTC,
        };
      } else if (pagination.endDate) {
        const endDateUTC = new Date(pagination.endDate);
        endDateUTC.setUTCHours(0, 0, 0, 0); // Set the time to start of the day in UTC
        endDateUTC.setUTCDate(endDateUTC.getUTCDate() + 1); // Add 1 day

        whereOrderData.orderDate = {
          [db.Sequelize.Op.lt]: endDateUTC, // Use less than operator to filter until the end of the previous day
        };
      }

      const orderData = await db.Order.findAndCountAll({
        where: whereOrderData,
        include: [
          { model: db.Branch_Product, where: { branch_id: user.Branch.id } },
          { model: db.User, distinct: true }, // Include User model with distinct set to true
        ],
        order: [["createdAt", "DESC"]], // Order the results by createdAt in descending order
      });

      // Calculate total prices per day for "Order completed" orders only
      const totalPriceByDay = {};
      let totalAllTransactions = 0; // Initialize the total price for all transactions
      const uniqueUsers = new Set(); // Initialize a Set to store unique user IDs
      let totalCompletedOrders = 0; // Initialize the total number of completed orders
      let totalCancelledOrders = 0; // Initialize the total number of cancelled orders

      const lastFiveTransactions = []; // Initialize an array to store the last 5 transactions

      const productSales = {}; // Initialize an object to track product sales

      const courierUsage = {}; // Initialize an object to track courier usage

      orderData.rows.forEach((order) => {
        if (order.orderStatus === "Order completed") {
          const orderDate = new Date(order.orderDate).toLocaleDateString();

          if (!totalPriceByDay[orderDate]) {
            totalPriceByDay[orderDate] = 0;
          }

          totalPriceByDay[orderDate] += order.totalPrice;

          // Add the order's total price to the total for all transactions
          totalAllTransactions += order.totalPrice;

          // Add the user's ID to the Set to count unique users
          uniqueUsers.add(order.User.id);

          totalCompletedOrders += 1; // Increment totalCompletedOrders for each completed order

          // Add order details to the lastFiveTransactions array
          if (lastFiveTransactions.length < 5) {
            lastFiveTransactions.push({
              id: order.id,
              invoiceCode: order.invoiceCode,
              orderStatus: order.orderStatus,
              orderDate: order.orderDate,
              totalPrice: order.totalPrice,
            });
          }

          // Update product sales
          order.Branch_Products.forEach((branchProduct) => {
            const productId = branchProduct.product_id;

            if (!productSales[productId]) {
              productSales[productId] = 0;
            }

            productSales[productId] += branchProduct.quantity;
          });

          // Update courier usage
          const courier = order.shippingMethod; // Assuming courier information is in the shippingMethod column

          if (!courierUsage[courier]) {
            courierUsage[courier] = 0;
          }

          courierUsage[courier] += 1;
        } else if (order.orderStatus === "Canceled") {
          totalCancelledOrders += 1; // Increment totalCancelledOrders for each cancelled order
        }
      });

      // Sort products by sales in descending order and get the top 5
      const top5Products = await Promise.all(
        Object.keys(productSales).map(async (productId) => {
          const product = await db.Product.findOne({
            where: {
              id: productId,
            },
          });

          return {
            productId,
            productImg: product.imgProduct,
            productName: product.name, // Include product name
            totalStock: product.stock, // Include total stock
            sales: productSales[productId],
          };
        })
      );

      top5Products.sort((a, b) => b.sales - a.sales).slice(0, 5);

      // Calculate courier usage in percentage
      const courierUsagePercentage = {};
      const totalCompletedOrdersCount = totalCompletedOrders;

      for (const courier in courierUsage) {
        courierUsagePercentage[courier] =
          (courierUsage[courier] / totalCompletedOrdersCount) * 100;
      }

      res.status(200).send({
        message: "sales report data retreived",
        data: {
          count: orderData.count,
          // rows: orderData.rows,
          areaChart: totalPriceByDay,
          pieChart: courierUsagePercentage, // Include courier usage in percentage
          totalTransaction: totalAllTransactions, // Include the total price for "Order completed" transactions
          totalUsers: uniqueUsers.size, // Include the total number of unique users
          totalCompletedOrders, // Include the total number of completed orders
          totalCancelledOrders, // Include the total number of cancelled orders
          lastTransactions: lastFiveTransactions, // Include the last 5 transactions
          topProducts: top5Products, // Include the top 5 products based on sales
        },
      });
    } catch (error) {
      res.status(500).send({
        error: error.message,
      });
    }
  },
};

// sales report (SA & A)
// stock history (A)
// create discount (A)
// get discount list (A)
// create voucher (A)
// get voucher list (A)
