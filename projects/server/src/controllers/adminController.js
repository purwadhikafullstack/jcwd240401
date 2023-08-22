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

      const newBranchProduct = await user.Branch.addProduct(product, {
        through: { quantity, origin, status },
        transaction,
      });

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
        attributes: [
          "id",
          "branch_id",
          "product_id",
          "quantity",
          "origin",
          "discount_id",
          "status",
          "isRemoved",
          "createdAt",
          "updatedAt",
        ],
        where: {
          id: parseInt(req.params.id),
          isRemoved: false,
        },
      });
      console.log(getBranchProduct);
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
        attributes: [
          "id",
          "branch_id",
          "product_id",
          "quantity",
          "origin",
          "discount_id",
          "status",
          "isRemoved",
          "createdAt",
          "updatedAt",
        ],
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
        attributes: [
          "id",
          "branch_id",
          "product_id",
          "quantity",
          "origin",
          "discount_id",
          "status",
          "isRemoved",
          "createdAt",
          "updatedAt",
        ],
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
  // stock history (A)
  async getStockHistory(req, res) {
    const pagination = {
      page: Number(req.query.page) || 1,
      perPage: 12,
      branch_product_id: req.query.filterBranchProduct || "",
      status: req.query.filterStatus || "",
      date: req.query.sortDate,
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
      const order = [];
      if (pagination.branch_product_id) {
        where.branch_product_id = pagination.branch_product_id;
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
            as:"StockBranchProduct",
            attributes: ["id"],
            where: branchProductWhere,
            include: { model: db.Product, where: { isRemoved: 0 } },
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
  //get cart
  async getCart(req, res) {
    try {
      const blabla = await db.Cart.findAll({
        include:{
          model: db.Branch_Product
        }
      });

      res.status(200).send({
        message: "blabla",
        data: blabla,
      });
    } catch (err) {}
  },
};
// get branch product
// get branch product per id

// sales report (SA & A)
// stock history (A)
// create discount (A)
// get discount list (A)
// create voucher (A)
// get voucher list (A)
