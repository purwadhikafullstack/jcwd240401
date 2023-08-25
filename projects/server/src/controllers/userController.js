const db = require("../models");
const opencageKey = process.env.OPENCAGE_API_KEY;
const axios = require("axios");

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
      const userAddress = await db.Address.findOne({
        where: {
          user_id: req.user.id,
          streetName: req.params.name,
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
};

// get profile (all account)

// modify name
// modify email
// modify phone
// modify birthdate
// modify password
// modify img profile

// order history
