const db = require("../models");
const {
  setFromFileNameToDBValueCategory,
  getAbsolutePathPublicFileCategory,
  getFileNameFromDbValue,
  setFromFileNameToDBValueProduct,
  getAbsolutePathPublicFileProduct,
} = require("../helpers/fileConverter");
const fs = require("fs");

const validUnitOfMeasurementValues = ["gr", "ml"];

module.exports = {
  // create category
  async createCategory(req, res) {
    const { name } = req.body;
    const imgFileName = req.file ? req.file.filename : null;

    if (!name || !imgFileName) {
      return res.status(400).send({
        message: "Both name and category image file are required",
      });
    }

    const transaction = await db.sequelize.transaction();

    try {
      await db.Category.create(
        {
          name,
          imgCategory: setFromFileNameToDBValueCategory(imgFileName),
        },
        { transaction }
      );

      await transaction.commit();

      return res
        .status(201)
        .send({ message: "Successfully created new category" });
    } catch (error) {
      console.log(error);
      await transaction.rollback();
      return res.status(500).send({ message: "Internal Server Error" });
    }
  },
  // get all category
  async allCategory(req, res) {
    const pagination = {
      page: Number(req.query.page) || 1,
      perPage: 12,
      search: req.query.search,
      name: req.query.sortOrder || "ASC",
    };

    const where = {};
    const order = [];
    try {
      where.isRemoved = 0;

      if (pagination.name) {
        if (pagination.name.toUpperCase() === "DESC") {
          order.push(["name", "DESC"]);
        } else {
          order.push(["name", "ASC"]);
        }
      }
      if (pagination.search) {
        where.name = {
          [db.Sequelize.Op.like]: `%${pagination.search}%`,
        };
      }

      const results = await db.Category.findAndCountAll({
        attributes: ["id", "name", "imgCategory"],
        where,
        limit: pagination.perPage,
        offset: (pagination.page - 1) * pagination.perPage,
        order,
      });

      const totalCount = results.count;
      pagination.totalData = totalCount;

      if (results.rows.length === 0) {
        return res.status(200).send({
          message: "No category found",
        });
      }

      return res.status(200).send({
        message: "Successfully retrieved categories",
        pagination,
        data: results,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).send({ message: "Internal Server Error" });
    }
  },
  async allCategoryNoPagination(req, res) {
    try {
      const results = await db.Category.findAll({
        attributes: ["id", "name", "imgCategory"],
        where: { isRemoved: 0 },
        order: [["name", "ASC"]],
      });

      if (results.length === 0) {
        return res.status(200).send({
          message: "No category found",
        });
      }

      return res.status(200).send({
        message: "Successfully retrieved categories",
        data: results,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).send({ message: "Internal Server Error" });
    }
  },
  // get category per id
  async oneCategoryById(req, res) {
    try {
      const category = await db.Category.findOne({
        where: {
          id: req.params.id,
          isRemoved: 0,
        },
      });

      if (!category) {
        return res.status(404).send({
          message: "Category not found",
        });
      }

      res.send({
        message: "Successfully retrieved product",
        data: category,
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({
        message: "Internal Server Error",
        error: error.message,
      });
    }
  },
  // modify and remove category
  async modifyOrRemoveCategory(req, res) {
    const transaction = await db.sequelize.transaction();
    const action = req.params.action;
    try {
      const { name } = req.body;

      const getCategory = await db.Category.findOne({
        where: {
          id: parseInt(req.params.id),
          isRemoved: false,
        },
        transaction,
      });

      if (!getCategory) {
        await transaction.rollback();
        return res.status(400).send({
          message: "Category not found",
        });
      }

      switch (action) {
        case "modify":
          if (req.file) {
            const realimgCategory = getCategory.getDataValue("imgCategory");
            const oldFilename = getFileNameFromDbValue(realimgCategory);
            if (oldFilename) {
              fs.unlinkSync(getAbsolutePathPublicFileCategory(oldFilename));
            }
            getCategory.imgCategory = setFromFileNameToDBValueCategory(
              req.file.filename
            );
          }

          if (name) {
            getCategory.name = name;
          }

          await getCategory.save({ transaction });

          await transaction.commit();
          return res.status(200).send({
            message: "Sucessfully changed category details",
            data: getCategory,
          });

        case "remove":
          getCategory.isRemoved = true;
          await getCategory.save({ transaction });
          await transaction.commit();
          return res.status(200).send({
            message: "Successfully delete category",
          });

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
  // create product
  async createProduct(req, res) {
    const {
      name,
      description,
      weight,
      unitOfMeasurement,
      basePrice,
      category_id,
      storageInstruction,
      storagePeriod,
    } = req.body;

    const imgFileName = req.file ? req.file.filename : null;
    const categoryId = parseInt(category_id);

    if (!validUnitOfMeasurementValues.includes(unitOfMeasurement)) {
      return res.status(400).send({
        message:
          "Invalid unit of measurement value. Allowed values are 'gr' and 'ml'",
      });
    }
    const isExist = await db.Product.findOne({
      where: {
        name,
        weight,
        unitOfMeasurement,
      },
    });
    if (isExist) {
      return res.status(400).send({ message: "Similar product already exist" });
    }

    const transaction = await db.sequelize.transaction();

    try {
      const newProduct = await db.Product.create(
        {
          name,
          description,
          weight,
          unitOfMeasurement,
          basePrice,
          category_id: categoryId,
          storageInstruction,
          storagePeriod,
          imgProduct: setFromFileNameToDBValueProduct(imgFileName),
        },
        { transaction }
      );

      await transaction.commit();

      return res.status(201).send({
        message: "Successfully created new product",
        data: { newProduct },
      });
    } catch (error) {
      console.log(error);
      await transaction.rollback();
      return res.status(500).send({ message: "Internal Server Error" });
    }
  },
  // modify and remove product
  async modifyOrRemoveProduct(req, res) {
    const transaction = await db.sequelize.transaction();
    const action = req.params.action;
    const {
      name,
      description,
      weight,
      unitOfMeasurement,
      basePrice,
      category_id,
      storageInstruction,
      storagePeriod,
    } = req.body;

    if (
      unitOfMeasurement !== undefined &&
      !validUnitOfMeasurementValues.includes(unitOfMeasurement)
    ) {
      await transaction.rollback();
      return res.status(400).send({
        message:
          "Invalid unit of measurement value. Allowed values are 'gr' and 'ml'",
      });
    }
    try {
      const getProduct = await db.Product.findOne({
        where: {
          id: parseInt(req.params.id),
          isRemoved: false,
        },
      });

      const categoryId = parseInt(category_id);

      if (!getProduct) {
        await transaction.rollback();
        return res.status(400).send({
          message: "Product not found",
        });
      }

      switch (action) {
        case "modify":
          if (req.file) {
            const realimgProduct = getProduct.getDataValue("imgProduct");
            const oldFilename = getFileNameFromDbValue(realimgProduct);
            if (oldFilename) {
              fs.unlinkSync(getAbsolutePathPublicFileProduct(oldFilename));
            }
            getProduct.imgProduct = setFromFileNameToDBValueProduct(
              req.file.filename
            );
          }
          if (name) {
            getProduct.name = name;
          }
          if (description) {
            getProduct.description = description;
          }
          if (weight) {
            getProduct.weight = weight;
          }
          if (unitOfMeasurement) {
            getProduct.unitOfMeasurement = unitOfMeasurement;
          }
          if (basePrice) {
            getProduct.basePrice = basePrice;
          }
          if (categoryId) {
            getProduct.category_id = categoryId;
          }
          if (storageInstruction) {
            getProduct.storageInstruction = storageInstruction;
          }
          if (storagePeriod) {
            getProduct.storagePeriod = storagePeriod;
          }

          await getProduct.save({ transaction });

          await transaction.commit();
          return res.status(200).send({
            message: "Sucessfully changed product details",
            data: getProduct,
          });

        case "remove":
          const isUsed = await db.Branch_Product.findOne({
            where: {
              product_id: parseInt(req.params.id),
            },
          });

          if (isUsed !== null) {
            await transaction.rollback();
            return res.status(400).send({
              message: "Uable to delete. Product in use by branch/es.",
            });
          }

          getProduct.isRemoved = true;
          await getProduct.save({ transaction });
          await transaction.commit();
          return res.status(200).send({
            message: "Successfully delete product",
          });

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
  // get product
  async allProduct(req, res) {
    const pagination = {
      page: Number(req.query.page) || 1,
      perPage: 12,
      search: req.query.search || "",
      category: req.query.filterCategory || "",
      name: req.query.sortName,
      price: req.query.sortPrice,
    };

    try {
      const where = {};
      const order = [];

      where.isRemoved = 0;

      if (pagination.search) {
        where.name = {
          [db.Sequelize.Op.like]: `%${pagination.search}%`,
        };
      }
      if (pagination.category) {
        where.category_id = pagination.category;
      }
      if (pagination.name) {
        if (pagination.name.toUpperCase() === "DESC") {
          order.push(["name", "DESC"]);
        } else {
          order.push(["name", "ASC"]);
        }
      }
      if (pagination.price) {
        if (pagination.price.toUpperCase() === "DESC") {
          order.push(["basePrice", "DESC"]);
        } else {
          order.push(["basePrice", "ASC"]);
        }
      }

      const results = await db.Product.findAndCountAll({
        where,
        include: [
          {
            model: db.Category,
            where: {
              isRemoved: 0,
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
          message: "No products found",
        });
      }

      res.status(200).send({
        message: "Successfully retrieved products",
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
  async allProductNoPagination(req, res) {
    try {
      const results = await db.Product.findAll({
        where: { isRemoved: 0 },
        include: [
          {
            model: db.Category,
            where: {
              isRemoved: 0,
            },
          },
        ],
        order: [["name", "ASC"]],
      });

      if (results.length === 0) {
        return res.status(200).send({
          message: "No products found",
        });
      }

      res.status(200).send({
        message: "Successfully retrieved products",
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
  // get product per id
  async oneProductById(req, res) {
    try {
      const product = await db.Product.findOne({
        where: {
          id: req.params.id,
          isRemoved: 0,
        },
        include: [
          {
            model: db.Category,
          },
        ],
      });

      if (!product) {
        return res.status(404).send({
          message: "Product not found",
        });
      }

      res.send({
        message: "Successfully retrieved product",
        data: product,
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({
        message: "Internal Server Error",
        error: error.message,
      });
    }
  },
};
// get branch category
