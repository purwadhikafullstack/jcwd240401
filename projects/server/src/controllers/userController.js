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
  async getAddress(req, res) {
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
  async createAddress(req, res) {
    const transaction = await db.sequelize.transaction();
    const { province, city, streetName, isMain } = req.body;
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
        attributes: ["city_id", "province_id", "city_name"],
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
      const responseData = await axios.get(
        `https://api.opencagedata.com/geocode/v1/json?q=${city}+${province}&key=${opencageKey}`
      );
      if (!responseData) {
        await transaction.rollback();
        return res.status(400).send({
          message: "Can't get location's latitude and longitude",
        });
      }
      const sanitizedResponse = JSON.stringify(responseData, (key, value) => {
        if (typeof value === "object" && value !== null) {
          if (value === responseData.request) {
            return;
          }
        }
        return value;
      });
      const latlong = JSON.parse(sanitizedResponse);
      const geometry = latlong.data.results[0].geometry;

      const data = {
        user_id: req.user.id,
        streetName,
        city_id: selectedCity.city_id,
        latitude: geometry.lat,
        longitude: geometry.lng,
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
};

// get profile (all account)

// modify name
// modify email
// modify phone
// modify birthdate
// modify password
// modify img profile

// get address
// modify street name
// modify province
// modify city
// delete address

// order history
