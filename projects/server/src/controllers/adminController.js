const db = require("../models");

module.exports = {
  async allBranch(req, res) {
    const pagination = {
      page: Number(req.query.page) || 1,
      perPage: 12,
      search: req.query.search,
      city_id: req.query.sortOrder || "",
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
      let order = [["createdAt", "DESC"]];
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
        order = [];
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
          message: "Successfully created discount",
          data: newDiscount,
          totalProduct: `${products.length} product(s)`,
        });
      } else if (discount_type_id == 3) {
        const invalidProducts = await db.Branch_Product.findOne({
          where: {
            product_id: {
              [db.Sequelize.Op.in]: products,
            },
            branch_id: user.Branch.id,
          },
          include: {
            model: db.Product,
            where: {
              basePrice: {
                [db.Sequelize.Op.lte]: amount,
              },
            },
          },
        });

        if (invalidProducts) {
          await transaction.rollback();
          return res.status(400).send({
            message:
              "The discount is not applicable to one or more selected products",
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
            message: "Successfully created discount",
            data: newDiscount,
            totalProduct: `${products.length} product(s)`,
          });
        }
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
          message: "Successfully created discount",
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
                maxDiscount: 0,
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
                isExpired: false,
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
                isExpired: false,
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
                isExpired: false,
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

  async getAllVoucher(req, res) {
    const pagination = {
      page: Number(req.query.page) || 1,
      perPage: 12,
      createDate: req.query.sortVoucher || "DESC",
      voucher_type_id: req.query.filterVoucherType,
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
      const branch_id = user.Branch.id;
      const where = { branch_id };
      const order = [];
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

  async getStockHistory(req, res) {
    const pagination = {
      page: Number(req.query.page) || 1,
      perPage: 12,
      search: req.query.search || "",
      status: req.query.filterStatus || "",
      date: req.query.sortDate || "DESC",
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
        startDateUTC.setUTCHours(0, 0, 0, 0);

        const endDateUTC = new Date(pagination.endDate);
        endDateUTC.setUTCHours(23, 59, 59, 999);

        where.createdAt = {
          [db.Sequelize.Op.between]: [startDateUTC, endDateUTC],
        };
      } else if (pagination.startDate) {
        const startDateUTC = new Date(pagination.startDate);
        startDateUTC.setUTCHours(0, 0, 0, 0);

        where.createdAt = {
          [db.Sequelize.Op.gte]: startDateUTC,
        };
      } else if (pagination.endDate) {
        const endDateUTC = new Date(pagination.endDate);
        endDateUTC.setUTCHours(0, 0, 0, 0);
        endDateUTC.setUTCDate(endDateUTC.getUTCDate() + 1);

        where.createdAt = {
          [db.Sequelize.Op.lt]: endDateUTC,
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

  async getStockHistorySuperAdmin(req, res) {
    const pagination = {
      page: Number(req.query.page) || 1,
      perPage: 12,
      search: req.query.search || "",
      status: req.query.filterStatus || "",
      date: req.query.sortDate || "DESC",
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
        startDateUTC.setUTCHours(0, 0, 0, 0);

        const endDateUTC = new Date(pagination.endDate);
        endDateUTC.setUTCHours(23, 59, 59, 999);

        where.createdAt = {
          [db.Sequelize.Op.between]: [startDateUTC, endDateUTC],
        };
      } else if (pagination.startDate) {
        const startDateUTC = new Date(pagination.startDate);
        startDateUTC.setUTCHours(0, 0, 0, 0);

        where.createdAt = {
          [db.Sequelize.Op.gte]: startDateUTC,
        };
      } else if (pagination.endDate) {
        const endDateUTC = new Date(pagination.endDate);
        endDateUTC.setUTCHours(0, 0, 0, 0);
        endDateUTC.setUTCDate(endDateUTC.getUTCDate() + 1);

        where.createdAt = {
          [db.Sequelize.Op.lt]: endDateUTC,
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
        startDateUTC.setUTCHours(0, 0, 0, 0);

        const endDateUTC = new Date(pagination.endDate);
        endDateUTC.setUTCHours(23, 59, 59, 999);

        whereOrderData.orderDate = {
          [db.Sequelize.Op.between]: [startDateUTC, endDateUTC],
        };
      } else if (pagination.startDate) {
        const startDateUTC = new Date(pagination.startDate);
        startDateUTC.setUTCHours(0, 0, 0, 0);

        const nextDayUTC = new Date(startDateUTC);
        nextDayUTC.setUTCDate(nextDayUTC.getUTCDate() + 1);

        whereOrderData.orderDate = {
          [db.Sequelize.Op.gte]: nextDayUTC,
        };
      } else if (pagination.endDate) {
        const endDateUTC = new Date(pagination.endDate);
        endDateUTC.setUTCHours(23, 59, 59, 999);
        endDateUTC.setUTCDate(endDateUTC.getUTCDate() + 1);

        whereOrderData.orderDate = {
          [db.Sequelize.Op.lt]: endDateUTC,
        };
      }

      const orderData = await db.Order.findAndCountAll({
        where: whereOrderData,
        include: [
          { model: db.Branch_Product, where: { branch_id: user.Branch.id } },
          { model: db.User, distinct: true },
        ],
        order: [["createdAt", "DESC"]],
      });

      const totalPriceByDay = [];
      let totalAllTransactions = 0;
      const uniqueUsers = new Set();
      let totalCompletedOrders = 0;
      let totalCancelledOrders = 0;

      const lastFiveTransactions = [];

      const productSales = {};

      const courierUsage = {};

      const currentDate = new Date();

      orderData.rows.forEach((order) => {
        if (order.orderStatus === "Order completed") {
          const orderDate = new Date(order.orderDate).toLocaleDateString();

          const timeDifferenceInDays = Math.floor(
            (currentDate - new Date(order.orderDate)) / (1000 * 60 * 60 * 24)
          );

          if (timeDifferenceInDays <= 15 && timeDifferenceInDays >= -15) {
            if (totalPriceByDay.length < 30) {
              const dayTotalPrice = totalPriceByDay.find(
                (item) => item.date === orderDate
              );

              if (dayTotalPrice) {
                dayTotalPrice.totalPrice += order.totalPrice;
              } else {
                totalPriceByDay.push({
                  date: orderDate,
                  totalPrice: order.totalPrice,
                });
              }
            }
          }

          totalAllTransactions += order.totalPrice;

          uniqueUsers.add(order.User.id);

          totalCompletedOrders += 1;

          if (lastFiveTransactions.length < 5) {
            lastFiveTransactions.push({
              id: order.id,
              invoiceCode: order.invoiceCode,
              orderStatus: order.orderStatus,
              orderDate: order.orderDate,
              totalPrice: order.totalPrice,
            });
          }

          order.Branch_Products.forEach((branchProduct) => {
            const productId = branchProduct.product_id;

            if (!productSales[productId]) {
              productSales[productId] = 0;
            }

            productSales[productId] += branchProduct.quantity;
          });

          const courier = order.shippingMethod;

          if (!courierUsage[courier]) {
            courierUsage[courier] = 0;
          }

          courierUsage[courier] += 1;
        } else if (order.orderStatus === "Canceled") {
          totalCancelledOrders += 1;
        }
      });

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
            productName: product.name,
            totalStock: product.stock,
            sales: productSales[productId],
          };
        })
      );

      const topProducts = top5Products
        .sort((a, b) => b.sales - a.sales)
        .slice(0, 5);

      const courierUsagePercentage = [];
      const totalCompletedOrdersCount = totalCompletedOrders;

      for (const courier in courierUsage) {
        courierUsagePercentage.push({
          courier,
          percentage: (courierUsage[courier] / totalCompletedOrdersCount) * 100,
        });
      }

      res.status(200).send({
        message: "sales report data retreived",
        data: {
          count: orderData.count,

          areaChart: totalPriceByDay,
          pieChart: courierUsagePercentage,
          totalTransaction: totalAllTransactions,
          totalUsers: uniqueUsers.size,
          totalCompletedOrders,
          totalCancelledOrders,
          lastTransactions: lastFiveTransactions,
          topProducts,
        },
      });
    } catch (error) {
      res.status(500).send({
        error: error.message,
      });
    }
  },

  async getSuperAdminSalesReport(req, res) {
    const pagination = {
      branch_id: req.query.filterBranch || "1",
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
        startDateUTC.setUTCHours(0, 0, 0, 0);

        const endDateUTC = new Date(pagination.endDate);
        endDateUTC.setUTCHours(23, 59, 59, 999);

        whereOrderData.orderDate = {
          [db.Sequelize.Op.between]: [startDateUTC, endDateUTC],
        };
      } else if (pagination.startDate) {
        const startDateUTC = new Date(pagination.startDate);
        startDateUTC.setUTCHours(0, 0, 0, 0);

        const nextDayUTC = new Date(startDateUTC);
        nextDayUTC.setUTCDate(nextDayUTC.getUTCDate() + 1);

        whereOrderData.orderDate = {
          [db.Sequelize.Op.gte]: nextDayUTC,
        };
      } else if (pagination.endDate) {
        const endDateUTC = new Date(pagination.endDate);
        endDateUTC.setUTCHours(23, 59, 59, 999);
        endDateUTC.setUTCDate(endDateUTC.getUTCDate() + 1);

        whereOrderData.orderDate = {
          [db.Sequelize.Op.lt]: endDateUTC,
        };
      }

      const orderData = await db.Order.findAndCountAll({
        where: whereOrderData,
        include: [
          {
            model: db.Branch_Product,
            where: { branch_id: pagination.branch_id },
          },
          { model: db.User, distinct: true },
        ],
        order: [["createdAt", "DESC"]],
      });

      const totalPriceByDay = [];
      let totalAllTransactions = 0;
      const uniqueUsers = new Set();
      let totalCompletedOrders = 0;
      let totalCancelledOrders = 0;

      const lastFiveTransactions = [];

      const productSales = {};

      const courierUsage = {};

      const currentDate = new Date();

      orderData.rows.forEach((order) => {
        if (order.orderStatus === "Order completed") {
          const orderDate = new Date(order.orderDate).toLocaleDateString();

          const timeDifferenceInDays = Math.floor(
            (currentDate - new Date(order.orderDate)) / (1000 * 60 * 60 * 24)
          );

          if (timeDifferenceInDays <= 15 && timeDifferenceInDays >= -15) {
            if (totalPriceByDay.length < 30) {
              const dayTotalPrice = totalPriceByDay.find(
                (item) => item.date === orderDate
              );

              if (dayTotalPrice) {
                dayTotalPrice.totalPrice += order.totalPrice;
              } else {
                totalPriceByDay.push({
                  date: orderDate,
                  totalPrice: order.totalPrice,
                });
              }
            }
          }

          totalAllTransactions += order.totalPrice;

          uniqueUsers.add(order.User.id);

          totalCompletedOrders += 1;

          if (lastFiveTransactions.length < 5) {
            lastFiveTransactions.push({
              id: order.id,
              invoiceCode: order.invoiceCode,
              orderStatus: order.orderStatus,
              orderDate: order.orderDate,
              totalPrice: order.totalPrice,
            });
          }

          order.Branch_Products.forEach((branchProduct) => {
            const productId = branchProduct.product_id;

            if (!productSales[productId]) {
              productSales[productId] = 0;
            }

            productSales[productId] += branchProduct.quantity;
          });

          const courier = order.shippingMethod;

          if (!courierUsage[courier]) {
            courierUsage[courier] = 0;
          }

          courierUsage[courier] += 1;
        } else if (order.orderStatus === "Canceled") {
          totalCancelledOrders += 1;
        }
      });

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
            productName: product.name,
            totalStock: product.stock,
            sales: productSales[productId],
          };
        })
      );

      const topProducts = top5Products
        .sort((a, b) => b.sales - a.sales)
        .slice(0, 5);

      const courierUsagePercentage = [];
      const totalCompletedOrdersCount = totalCompletedOrders;

      for (const courier in courierUsage) {
        courierUsagePercentage.push({
          courier,
          percentage: (courierUsage[courier] / totalCompletedOrdersCount) * 100,
        });
      }

      res.status(200).send({
        message: "sales report data retreived",
        data: {
          count: orderData.count,
          areaChart: totalPriceByDay,
          pieChart: courierUsagePercentage,
          totalTransaction: totalAllTransactions,
          totalUsers: uniqueUsers.size,
          totalCompletedOrders,
          totalCancelledOrders,
          lastTransactions: lastFiveTransactions,
          topProducts,
        },
      });
    } catch (error) {
      res.status(500).send({
        error: error.message,
      });
    }
  },

  async branchInfo(req, res) {
    const userId = req.user.id;
    try {
      const branchInfo = await db.Branch.findOne({
        where: {
          user_id: userId,
        },
        include: [
          {
            model: db.City,
            include: [
              {
                model: db.Province,
              },
            ],
          },
          {
            model: db.User,
            attributes: ["name", "email", "phone"],
          },
        ],
      });

      if (!branchInfo) {
        return res.status(500).send({
          message: "No branch found",
        });
      }

      return res.status(200).send({
        message: "Branch Info",
        data: branchInfo,
      });
    } catch (error) {
      return res.status(500).send({
        message: "Internal server error",
      });
    }
  },
};
