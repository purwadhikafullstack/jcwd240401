const db = require("../models");
const {
  setFromFileNameToDBValueCategory,
  getAbsolutePathPublicFileCategory,
  getFileNameFromDbValue,
  setFromFileNameToDBValueProduct,
  getAbsolutePathPublicFileProduct,
} = require("../helpers/fileConverter");
const fs = require("fs");
const geolib = require("geolib");

const validUnitOfMeasurementValues = ["gr", "ml"];
module.exports = {
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

  async allCategory(req, res) {
    const pagination = {
      page: Number(req.query.page) || 1,
      perPage: 12,
      search: req.query.search,
      name: req.query.sortName || "",
    };

    const where = {};
    let order = [["createdAt", "DESC"]];
    try {
      where.isRemoved = 0;

      if (pagination.name) {
        order = [];
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

  async allCategoryNoPaginationPerBranch(req, res) {
    try {
      const branchProducts = await db.Branch_Product.findAll({
        where: { branch_id: req.params.id, isRemoved: 0 },
        include: [{ model: db.Product, include: { model: db.Category } }],
      });

      if (branchProducts.length === 0) {
        return res.status(200).send({
          message: "No products found for the specified branch",
        });
      }

      const uniqueCategoryIds = new Set();

      const uniqueCategories = [];

      branchProducts.forEach((branchProduct) => {
        const product = branchProduct.Product;
        const category = product.Category;
        if (category && !uniqueCategoryIds.has(category.id)) {
          uniqueCategoryIds.add(category.id);
          uniqueCategories.push({
            id: category.id,
            name: category.name,
            imgCategory: category.imgCategory,
          });
        }
      });

      return res.status(200).send({
        message: "Successfully retrieved categories for the specified branch",
        data: uniqueCategories,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).send({ message: "Internal Server Error" });
    }
  },

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
        return res.status(404).send({
          message: "Category not found",
        });
      }

      switch (action) {
        case "modify":
          try {
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
          } catch (error) {
            await transaction.rollback();
            console.log(error);
            return res.status(500).send({
              message: "Internal Server Error",
            });
          }
        case "remove":
          try {
            const isUsed = await db.Product.findOne({
              where: {
                category_id: parseInt(req.params.id),
                isRemoved: 0,
              },
            });

            if (isUsed !== null) {
              await transaction.rollback();
              return res.status(400).send({
                message: "Unable to delete. Category in use by product(s).",
              });
            }

            getCategory.isRemoved = true;
            await getCategory.save({ transaction });
            await transaction.commit();
            return res.status(200).send({
              message: "Successfully delete category",
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

    const transaction = await db.sequelize.transaction();

    try {
      const isExist = await db.Product.findOne({
        where: {
          name,
          weight,
          unitOfMeasurement,
          isRemoved: 0,
        },
      });
      if (isExist) {
        await transaction.rollback();
        return res
          .status(400)
          .send({ message: "Similar product already exist" });
      }

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
        return res.status(404).send({
          message: "Product not found",
        });
      }

      switch (action) {
        case "modify":
          try {
            if (name || weight || unitOfMeasurement) {
              const isExist = await db.Product.findOne({
                where: {
                  name,
                  weight,
                  unitOfMeasurement,
                  isRemoved: false
                },
              });
              if (isExist) {
                await transaction.rollback();
                return res
                  .status(400)
                  .send({ message: "Similar product already exist" });
              }
            }
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
          } catch (error) {
            await transaction.rollback();
            console.log(error);
            return res.status(500).send({
              message: "Internal Server Error",
            });
          }
        case "remove":
          try {
            const isUsed = await db.Branch_Product.findOne({
              where: {
                product_id: parseInt(req.params.id),
                [db.Sequelize.Op.or]: [
                  { status: "empty" },
                  { status: "ready" },
                  { status: "restock" },
                ],
                isRemoved: 0,
              },
            });

            if (isUsed) {
              await transaction.rollback();
              return res.status(400).send({
                message: "Unable to delete. Product in use by branch(es)",
              });
            }

            getProduct.isRemoved = true;
            await getProduct.save({ transaction });
            await transaction.commit();
            return res.status(200).send({
              message: "Successfully delete product",
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
      let order = [["createdAt", "DESC"]];

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
        order = [];
        if (pagination.name.toUpperCase() === "DESC") {
          order.push(["name", "DESC"]);
        } else {
          order.push(["name", "ASC"]);
        }
      }
      if (pagination.price) {
        order = [];
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

      res.status(200).send({
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

  async allUnaddedProducts(req, res) {
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
      const branchProducts = await db.Branch_Product.findAll({
        attributes: ["product_id"],
        where: {
          branch_id: user.Branch.id,
          isRemoved: false,
        },
      });
      const userProductIds = branchProducts.map(
        (branchProduct) => branchProduct.product_id
      );
      const unaddedProducts = await db.Product.findAll({
        where: {
          isRemoved: false,
          id: {
            [db.Sequelize.Op.notIn]: userProductIds,
          },
        },
      });
      if (unaddedProducts.length === 0) {
        return res
          .status(200)
          .send({ message: "All products are added to your branch" });
      }
      return res.status(200).send({
        message: "Successfully retrieved the unadded products",
        data: unaddedProducts,
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({
        message: "Internal Server Error",
        error: error.message,
      });
    }
  },

  async productsFromNearestBranch(req, res) {
    const latitude = req.query.latitude ? req.query.latitude : "";
    const longitude = req.query.longitude ? req.query.longitude : "";
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
      let order = [["quantity", "DESC"]];

      where.isRemoved = 0;

      if (pagination.search) {
        where["$Product.name$"] = {
          [db.Sequelize.Op.like]: `%${pagination.search}%`,
        };
      }
      if (pagination.category) {
        where["$Product.category_id$"] = pagination.category;
      }
      if (pagination.name) {
        order = [];
        if (pagination.name.toUpperCase() === "DESC") {
          order.push([{ model: db.Product, as: "Product" }, "name", "DESC"]);
        } else {
          order.push([{ model: db.Product, as: "Product" }, "name", "ASC"]);
        }
      }
      if (pagination.price) {
        order = [];
        if (pagination.price.toUpperCase() === "DESC") {
          order.push([
            { model: db.Product, as: "Product" },
            "basePrice",
            "DESC",
          ]);
        } else {
          order.push([
            { model: db.Product, as: "Product" },
            "basePrice",
            "ASC",
          ]);
        }
      }

      const userLocation = { latitude: latitude, longitude: longitude };

      const branchData = await db.Branch.findAll();
      let nearestBranchId = 0;
      let max = 50000;
      let nearest = 50000;
      let outOfReach = true;

      if (latitude && longitude) {
        branchData.map((branch) => {
          const branchLocation = {
            latitude: branch.latitude,
            longitude: branch.longitude,
          };
          const distance = geolib.getDistance(userLocation, branchLocation);
          if (distance < max) {
            outOfReach = false;
            if (distance < nearest) {
              nearest = distance;
              nearestBranchId = branch.id;
            }
          }
        });
      } else {
        nearestBranchId = branchData[0].id;
      }
      if (outOfReach) {
        nearestBranchId = branchData[0].id;
      }

      const nearestBranchData = await db.Branch.findOne({
        where: {
          id: nearestBranchId,
        },
        include: [
          {
            model: db.City,
            include: {
              model: db.Province,
            },
          },
        ],
      });

      const branchProductData = await db.Branch_Product.findAndCountAll({
        where: {
          branch_id: nearestBranchId,
          isRemoved: 0,
        },
        include: [
          {
            model: db.Product,
            where: where,
            include: { model: db.Category, where: { isRemoved: 0 } },
          },
          {
            model: db.Discount,
            include: { model: db.Discount_Type },
          },
        ],
        order: order,
        limit: pagination.perPage,
        offset: (pagination.page - 1) * pagination.perPage,
      });
      const totalCount = branchProductData.count;
      pagination.totalData = totalCount;

      if (branchProductData.rows.length === 0) {
        return res.status(200).send({
          message: "No products found",
          branchData: nearestBranchData,
        });
      }

      return res.status(200).send({
        message: "Success get branch product",
        outOfReach: outOfReach,
        branchData: nearestBranchData,
        pagination,
        data: branchProductData,
      });
    } catch (error) {
      return res.status(500).send({
        message: "Server error",
        error: error.message,
      });
    }
  },

  async promotedProducts(req, res) {
    const branchId = req.query.branchId;
    try {
      const promotedProducts = await db.Branch_Product.findAll({
        where: {
          branch_id: branchId,
        },
        include: [
          {
            model: db.Product,
            include: { model: db.Category, where: { isRemoved: 0 } },
          },
          {
            model: db.Discount,
            where: { isExpired: false },
            include: { model: db.Discount_Type },
          },
        ],
      });

      return res.status(200).send({
        message: "Promoted products",
        data: promotedProducts,
      });
    } catch (error) {
      return res.status(500).send({
        message: "Server error",
        error: error.message,
      });
    }
  },
};
