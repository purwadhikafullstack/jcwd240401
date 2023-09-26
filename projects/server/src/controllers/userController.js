const db = require("../models");
const axios = require("axios");
const hbs = require("handlebars");
const fs = require("fs");
const crypto = require("crypto");
const { join } = require("path");
const transporter = require("../helpers/transporter");
const {
  setFromFileNameToDBValueProfile,
  getAbsolutePathPublicFileProfile,
  getFileNameFromDbValue,
} = require("../helpers/fileConverter");

module.exports = {
  async getProfileWithVerificationToken(req, res) {
    const token = req.query.token;

    try {
      const userData = await db.User.findOne({
        where: {
          verificationToken: token,
        },
      });
      if (!userData) {
        return res.status(400).send({
          message: "No user found",
        });
      }

      return res.status(200).send({
        message: "User found",
        data: userData,
      });
    } catch (error) {
      return res.status(500).send({
        message: "Server error",
        error: error.message,
      });
    }
  },

  async getMainAddress(req, res) {
    const userId = req.user.id;

    try {
      const userData = await db.Address.findOne({
        where: {
          user_id: userId,
          isMain: true,
        },
        include: [
          {
            model: db.City,
            include: [
              {
                model: db.Province,
                attributes: ["province_name"],
              },
            ],
            attributes: {
              exclude: ["city_id", "province_id"],
            },
          },
        ],
      });
      if (!userData) {
        return res.status(400).send({
          message: "No address found",
        });
      }

      return res.status(200).send({
        message: "User's address found",
        data: userData,
      });
    } catch (error) {
      return res.status(500).send({
        message: "Server error",
        error: error.message,
      });
    }
  },

  async getAllAddress(req, res) {
    const userId = req.user.id;
    try {
      const userAddress = await db.Address.findAll({
        where: {
          user_id: userId,
          isRemoved: 0,
        },
        include: [
          {
            model: db.City,
            include: [
              {
                model: db.Province,
                attributes: ["province_name"],
              },
            ],
            attributes: {
              exclude: ["city_id", "province_id"],
            },
          },
        ],
        order: [
          ["isMain", "DESC"],
          ["streetName", "ASC"],
        ],
      });

      if (userAddress.length === 0) {
        return res.status(200).send({
          message: "No address found",
        });
      }

      return res.status(200).send({
        message: "Successfully retrieved user's address/es",
        data: userAddress,
      });
    } catch (error) {
      return res.status(500).send({
        message: "Server error",
        error: error.message,
      });
    }
  },

  async getAddressByName(req, res) {
    try {
      console.log(decodeURIComponent(req.params.name));
      const userAddress = await db.Address.findOne({
        where: {
          user_id: req.user.id,
          streetName: decodeURIComponent(req.params.name),
          isRemoved: 0,
        },
        include: [
          {
            model: db.City,
            include: [
              {
                model: db.Province,
                attributes: ["province_name"],
              },
            ],
            attributes: {
              exclude: ["city_id", "province_id"],
            },
          },
        ],
      });

      if (!userAddress) {
        return res.status(200).send({
          message: "No address found",
        });
      }

      return res.status(200).send({
        message: "Successfully retrieved user's address/es",
        data: userAddress,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).send({
        message: "Server error",
        error: error.message,
      });
    }
  },

  async createAddress(req, res) {
    const transaction = await db.sequelize.transaction();
    const {
      province,
      city,
      streetName,
      receiver,
      contact,
      addressLabel,
      isMain,
    } = req.body;
    try {
      const userAddressCount = await db.Address.count({
        where: {
          user_id: req.user.id,
          isRemoved: 0,
        },
        transaction,
      });

      if (userAddressCount >= 5) {
        await transaction.rollback();
        return res.status(400).send({
          message: "You already have the maximum number of addresses (5)",
        });
      }
      const selectedProvince = await db.Province.findOne({
        where: {
          province_name: province,
        },
        attributes: ["province_id", "province_name"],
      });
      const selectedCity = await db.City.findOne({
        where: {
          city_name: city,
          province_id: selectedProvince.province_id,
        },
        attributes: ["city_id", "province_id", "city_name", "postal_code"],
      });
      if (!selectedCity) {
        await transaction.rollback();
        return res.status(400).send({
          message: "There is no city in the selected province",
        });
      }
      const isExist = await db.Address.findOne({
        where: {
          user_id: req.user.id,
          city_id: selectedCity.city_id,
          streetName,
        },
      });
      if (isExist) {
        await transaction.rollback();
        return res.status(404).send({
          message: "An address with similar details already exists",
        });
      }

      const data = {
        user_id: req.user.id,
        streetName,
        city_id: selectedCity.city_id,
        latitude: req.geometry.lat,
        longitude: req.geometry.lng,
        addressLabel,
        receiver,
        contact,
        postalCode: selectedCity.postal_code,
      };
      if (isMain) {
        await db.Address.update(
          { isMain: false },
          {
            where: {
              user_id: req.user.id,
              isMain: true,
            },
            transaction,
          }
        );
        data.isMain = true;
      }

      const newAddress = await db.Address.create(data, {
        transaction,
      });

      await transaction.commit();
      return res.status(201).send({
        message: "Successfully create new address",
        admin: newAddress,
      });
    } catch (error) {
      await transaction.rollback();
      console.log(error);
      return res.status(500).send({
        message: "Internal Server Error",
      });
    }
  },

  async setMainOrRemoveAddress(req, res) {
    const transaction = await db.sequelize.transaction();
    const action = req.params.action;
    try {
      const getAddress = await db.Address.findOne({
        where: {
          id: parseInt(req.params.id),
          user_id: req.user.id,
          isRemoved: 0,
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
        ],
        transaction,
      });
      if (!getAddress) {
        await transaction.rollback();
        return res.status(404).send({ message: "Address not found" });
      }
      switch (action) {
        case "main":
          try {
            if (getAddress.isMain) {
              await transaction.rollback();
              return res.status(400).send({
                message: "This address is already set as the main address",
              });
            }

            await db.Address.update(
              { isMain: false },
              {
                where: {
                  user_id: req.user.id,
                  isMain: true,
                },
                transaction,
              }
            );
            await getAddress.update({ isMain: true }, { transaction });
            await transaction.commit();
            return res.status(200).send({
              message: "Sucessfully set address as main",
              data: getAddress,
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
            if (getAddress.isMain) {
              await transaction.rollback();
              return res.status(400).send({
                message: "Unable to delete the main address",
              });
            }
            getAddress.isRemoved = true;
            await getAddress.save({ transaction });
            await transaction.commit();
            return res.status(200).send({
              message: "Successfully delete address",
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

  async modifyAddress(req, res) {
    const transaction = await db.sequelize.transaction();
    const { province, city, streetName, receiver, contact, addressLabel } =
      req.body;
    try {
      const getAddress = await db.Address.findOne({
        where: {
          id: parseInt(req.params.id),
          user_id: req.user.id,
          isRemoved: false,
        },
        transaction,
      });
      if (!getAddress) {
        await transaction.rollback();
        return res.status(400).send({ message: "Address not found" });
      }

      const data = {};
      if (province || city || streetName) {
        const selectedProvince = await db.Province.findOne({
          where: {
            province_name: province,
          },
          attributes: ["province_id", "province_name"],
          transaction,
        });
        const selectedCity = await db.City.findOne({
          where: {
            city_name: city,
            province_id: selectedProvince.province_id,
          },
          attributes: ["city_id", "province_id", "city_name", "postal_code"],
          transaction,
        });
        if (!selectedCity) {
          await transaction.rollback();
          return res.status(400).send({
            message: "There is no city in the selected province",
          });
        }
        const isExist = await db.Address.findOne({
          where: {
            user_id: req.user.id,
            city_id: selectedCity.city_id,
            streetName,
          },
          transaction,
        });
        if (isExist) {
          await transaction.rollback();
          return res.status(404).send({
            message: "An address with similar details already exists",
          });
        }
        data.streetName = streetName;
        data.city_id = selectedCity.city_id;
        data.latitude = req.geometry.lat;
        data.longitude = req.geometry.lng;
        data.postalCode = selectedCity.postal_code;
      }
      if (receiver) {
        data.receiver = receiver;
      }
      if (contact) {
        data.contact = contact;
      }
      if (addressLabel) {
        data.addressLabel = addressLabel;
      }
      await getAddress.update(data, { transaction });
      await transaction.commit();
      return res.status(200).send({
        message: "Successfully modified address",
        data: getAddress,
      });
    } catch (error) {
      await transaction.rollback();
      console.log(error);
      return res.status(500).send({
        message: "Internal Server Error",
      });
    }
  },

  async branchProductByName(req, res) {
    try {
      const result = await db.Branch_Product.findOne({
        where: { branch_id: req.params.branchId, isRemoved: false },
        include: [
          {
            model: db.Product,
            where: {
              name: decodeURIComponent(req.params.name),
              weight: req.params.weight,
              unitOfMeasurement: req.params.unitOfMeasurement,
              isRemoved: 0,
            },
            include: { model: db.Category, where: { isRemoved: 0 } },
          },
          {
            model: db.Discount,
            include: { model: db.Discount_Type },
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

  async modifyCredential(req, res) {
    const { name, email, phone, gender, birthdate } = req.body;
    let message;
    const transaction = await db.sequelize.transaction();
    try {
      const user = await db.User.findOne({
        where: {
          id: req.user.id,
        },
        transaction,
      });

      if (!user) {
        await transaction.rollback();
        return res.status(404).send({
          message: "User not found",
        });
      }
      if (name) user.name = name;
      if (phone) user.phone = phone;
      if (gender) user.gender = gender;
      if (birthdate) user.birthdate = birthdate;
      if (email) {
        const verifyToken = crypto.randomBytes(16).toString("hex");
        user.email = email;
        user.isVerify = false;
        user.verificationToken = verifyToken;
        const verifyLink = `${process.env.BASE_PATH_FE}/verify-account/${verifyToken}`;
        const templatePath = join(
          __dirname,
          "../helpers/template/resendVerify.html"
        );
        const template = fs.readFileSync(templatePath, "utf-8");
        const templateCompile = hbs.compile(template);
        const htmlResult = templateCompile({ name: user.name, verifyLink });

        const nodemailerEmail = {
          from: "Groceer-e",
          to: email,
          subject:
            "Proccessing your update request. Please re-verify your email!",
          html: htmlResult,
        };

        transporter.sendMail(nodemailerEmail, (error, info) => {
          if (error) {
            transaction.rollback();
            return res.status(500).json({ error: "Error sending email" });
          }
        });

        message =
          "Successfully update profile. Please check your email to re-verify your account";
      } else {
        message = "Successfully update profile";
      }

      await user.save({ transaction });

      await transaction.commit();

      return res.status(200).send({
        message,
        data: {
          name: user.name,
          email: user.email,
          phone: user.phone,
          gender: user.gender,
          birthdate: user.birthdate,
        },
      });
    } catch (error) {
      await transaction.rollback();
      console.log(error);
      return res.status(500).send({
        message: "Internal Server Error",
      });
    }
  },

  async modifyImgProfile(req, res) {
    const transaction = await db.sequelize.transaction();
    try {
      const user = await db.User.findOne({
        where: {
          id: req.user.id,
        },
        transaction,
      });

      if (!user) {
        await transaction.rollback();
        return res.status(404).send({
          message: "User not found",
        });
      }

      if (!req.file) {
        await transaction.rollback();
        return res
          .status(400)
          .send({ message: "No file found. Please upload the file" });
      }

      const realImgProfile = user.getDataValue("imgProfile");
      const oldFileName = getFileNameFromDbValue(realImgProfile);
      if (oldFileName) {
        fs.unlinkSync(getAbsolutePathPublicFileProfile(oldFileName));
      }
      user.imgProfile = setFromFileNameToDBValueProfile(req.file.filename);

      await user.save({ transaction });

      await transaction.commit();

      return res.status(200).send({
        message: "Successfully updated the image profile",
      });
    } catch (error) {
      await transaction.rollback();
      console.log(error);
      return res.status(500).send({
        message: "Internal Server Error",
      });
    }
  },

  async getProfile(req, res) {
    try {
      const myProfile = await db.User.findOne({
        where: {
          id: req.user.id,
        },
        attributes: {
          exclude: ["password"],
        },
      });

      if (!myProfile) {
        return res.status(404).send({
          message: "Profile not found",
          errors: error.message,
        });
      }
      res.send({ message: "Get profile success", data: myProfile });
    } catch (error) {
      console.log(error);
      return res.status(500).send({
        message: "Internal Server Error",
      });
    }
  },

  async getOrderList(req, res) {
    const userId = req.user.id;
    const pagination = {
      page: Number(req.query.page) || 1,
      perPage: 12,
      search: req.query.search || "",
      status: req.query.filterStatus || "",
      date: req.query.sortDate || "DESC",
      startDate: req.query.startDate || "",
      endDate: req.query.endDate || "",
    };
    try {
      let where = { user_id: userId };
      const order = [];
      if (pagination.startDate && pagination.endDate) {
        const startDateUTC = new Date(pagination.startDate);
        startDateUTC.setUTCHours(0, 0, 0, 0);

        const endDateUTC = new Date(pagination.endDate);
        endDateUTC.setUTCHours(23, 59, 59, 999);

        where["orderDate"] = {
          [db.Sequelize.Op.between]: [startDateUTC, endDateUTC],
        };
      } else if (pagination.startDate) {
        const startDateUTC = new Date(pagination.startDate);
        startDateUTC.setUTCHours(0, 0, 0, 0);

        where["orderDate"] = {
          [db.Sequelize.Op.gte]: startDateUTC,
        };
      } else if (pagination.endDate) {
        const endDateUTC = new Date(pagination.endDate);
        endDateUTC.setUTCHours(0, 0, 0, 0);
        endDateUTC.setUTCDate(endDateUTC.getUTCDate() + 1);

        where["orderDate"] = {
          [db.Sequelize.Op.lt]: endDateUTC,
        };
      }
      if (pagination.search) {
        where["invoiceCode"] = {
          [db.Sequelize.Op.like]: `%${pagination.search}%`,
        };
      }
      if (pagination.status) {
        where["orderStatus"] = pagination.status;
      }
      if (pagination.date) {
        if (pagination.date.toUpperCase() === "DESC") {
          order.push(["orderDate", "DESC"]);
        } else {
          order.push(["orderDate", "ASC"]);
        }
      }

      const orders = await db.Order.findAndCountAll({
        include: [
          {
            model: db.Branch_Product,
          },
        ],
        where,
        order,
        distinct: true,
        limit: pagination.perPage,
        offset: (pagination.page - 1) * pagination.perPage,
      });

      if (!orders) {
        return res.status(200).send({
          message: "No transaction found",
        });
      }
      const totalCount = orders.count;
      pagination.totalData = totalCount;

      return res.status(200).send({
        message: "Success get all orders",
        pagination,
        data: orders,
      });
    } catch (error) {
      return res.status(500).send({
        message: "Server error",
        error: error.message,
      });
    }
  },
};
