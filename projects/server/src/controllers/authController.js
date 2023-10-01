const db = require("../models");
const transporter = require("../helpers/transporter");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const handlebars = require("handlebars");
const fs = require("fs");
const geolib = require("geolib");
const refCode = require("referral-codes");
const { join } = require("path");

const secretKey = process.env.JWT_SECRET_KEY;

const findNearestBranch = (userLocation, branchData) => {
  let nearestBranchId = 0;
  let max = 50000;
  let nearest = 50000;
  let outOfReach = true;

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

  if (outOfReach) {
    nearestBranchId = branchData[0].id;
  }

  return nearestBranchId;
};

module.exports = {
  async login(req, res) {
    const { email, password } = req.body;
    try {
      const userData = await db.User.findOne({
        where: {
          email: email,
        },
      });
      if (!userData) {
        return res.status(400).send({
          message:
            "Login failed. Please input your registered email and password",
        });
      }

      const isValid = await bcrypt.compare(password, userData.password);
      if (!isValid) {
        return res.status(400).send({
          message:
            "Login failed. Please input your registered email and password",
        });
      }

      const payload = {
        id: userData.id,
        name: userData.name,
        phone: userData.phone,
        status: userData.isVerify,
        role: userData.role_id,
        imgProfile: userData.imgProfile,
      };
      const token = jwt.sign(payload, secretKey, {
        expiresIn: "30m",
      });

      const loggedInUser = await db.User.findOne({
        where: {
          email: email,
        },
        attributes: {
          exclude: [
            "id",
            "role_id",
            "password",
            "verificationToken",
            "isVerify",
            "resetPasswordToken",
            "createdAt",
            "updatedAt",
          ],
        },
      });

      return res.status(200).send({
        message: "You are logged in!",
        data: loggedInUser,
        accessToken: token,
      });
    } catch (error) {
      return res.status(500).send({
        message: "Server Error",
        error: error.message,
      });
    }
  },

  async registerAdmin(req, res) {
    const transaction = await db.sequelize.transaction();
    try {
      const { name, email, phone, province, city, streetName } = req.body;
      const userData = await db.User.findOne({
        where: {
          email: email,
        },
      });
      if (userData) {
        await transaction.rollback();
        return res.status(400).send({
          message: "This email has been taken",
        });
      }
      const selectedProvince = await db.Province.findOne({
        where: {
          province_name: province,
        },
        attributes: {
          exclude: ["id"],
        },
      });

      const city_details = city.split(" (");

      const selectedCity = await db.City.findOne({
        where: {
          city_name: city_details[0],
          province_id: selectedProvince.province_id,
        },
        attributes: {
          exclude: ["id"],
        },
      });

      if (!selectedCity) {
        await transaction.rollback();
        return res.status(400).send({
          message: "There is no city in the selected province",
        });
      }

      const branchExist = await db.Branch.findOne({
        where: {
          city_id: selectedCity.city_id,
        },
      });
      if (branchExist) {
        await transaction.rollback();
        return res.status(400).send({
          message: "There's already a branch in this city",
        });
      }

      const verificationToken = crypto.randomBytes(16).toString("hex");
      const newAdmin = await db.User.create(
        {
          role_id: 2,
          name: name,
          email: email,
          phone: phone,
          isVerify: 1,
          verificationToken,
        },
        {
          transaction,
        }
      );

      const newBranch = await db.Branch.create(
        {
          user_id: newAdmin.id,
          streetName: streetName,
          city_id: selectedCity.city_id,
          postalCode: selectedCity.postal_code,
          latitude: req.geometry.lat,
          longitude: req.geometry.lng,
        },
        {
          transaction,
        }
      );

      const newReferralVoucher = await db.Voucher.create(
        {
          branch_id: newBranch.id,
          voucher_type_id: 1,
          isReferral: true,
          isExpired: false,
        },
        {
          transaction,
        }
      );

      const link = `${process.env.BASE_PATH_FE}/set-password/${verificationToken}`;
      const templatePath = join(
        __dirname,
        "../helpers/template/setaccount.html"
      );
      const template = fs.readFileSync(
        templatePath,
        "utf-8"
      );
      const templateCompile = handlebars.compile(template);
      const registerEmail = templateCompile({ name: newAdmin.name, link });

      const nodemailerEmail = {
        from: "Groceer-e",
        to: email,
        subject: "Set Your Account Password",
        html: registerEmail,
      }

      transporter.sendMail(nodemailerEmail, (error) => {
        if (error) {
          transaction.rollback();
          return res.status(500).json({ error: "Error sending email" });
        }
      });

      await transaction.commit();

      return res.status(200).send({
        message: "Successfully add admin branch",
        admin: newAdmin,
        branch: newBranch,
        voucher: newReferralVoucher,
      });
    } catch (error) {
      await transaction.rollback();
      return res.status(500).send({
        message: "Server error",
        error: error.message,
      });
    }
  },

  async setPassword(req, res) {
    const { password, confirmPassword } = req.body;
    const token = req.query.token;
    try {
      const userData = await db.User.findOne({
        where: {
          verificationToken: token,
        },
      });
      if (!userData) {
        return res.status({
          message: "token invalid",
        });
      }

      if (confirmPassword !== password) {
        return res.status({
          message: "Password doesn't match",
        });
      }

      const salt = await bcrypt.genSalt(10);
      const hashPassword = await bcrypt.hash(password, salt);

      if (hashPassword) {
        userData.password = hashPassword;
      }
      await userData.save();

      return res.status(200).send({
        message: "Successfully set password",
      });
    } catch (error) {
      return res.status(500).send({
        messasge: "Server error",
        error: error.message,
      });
    }
  },

  async allProvince(req, res) {
    try {
      const provinces = await db.Province.findAll();

      return res.status(200).send({
        messages: "All Provinces",
        data: provinces,
      });
    } catch (error) {
      return res.status(500).send({
        message: "Server error",
        error: error.message,
      });
    }
  },

  async allCityByProvince(req, res) {
    try {
      const province = req.query.province ? req.query.province : "";

      const selectedProvince = await db.Province.findOne({
        where: {
          province_name: province,
        },
      });

      let cities = [];
      if (province) {
        cities = await db.City.findAll({
          where: {
            province_id: selectedProvince.province_id,
          },
        });
      } else {
        cities = await db.City.findAll();
      }

      return res.status(200).send({
        messages: "All Cities",
        data: cities,
      });
    } catch (error) {
      return res.status(500).send({
        message: "Server error",
        error: error.message,
      });
    }
  },

  async keepLogin(req, res) {
    const userId = req.user.id;

    try {
      const userData = await db.User.findOne({
        where: {
          id: userId,
        },
      });
      const payload = {
        id: userData.id,
        name: userData.name,
        phone: userData.phone,
        status: userData.isVerify,
        role: userData.role_id,
        imgProfile: userData.imgProfile,
      };
      const refreshToken = jwt.sign(payload, secretKey, {
        expiresIn: "2h",
      });

      return res.status(200).send({
        message: "This is your refresh token",
        userId: userId,
        refreshToken: refreshToken,
      });
    } catch (error) {
      return res.status(500).send({
        message: "Server error",
        error: error.message,
      });
    }
  },

  async registerUser(req, res) {
    const transaction = await db.sequelize.transaction();
    try {
      const {
        name,
        email,
        phone,
        password,
        confirmPassword,
        province,
        city,
        streetName,
        referralCode,
      } = req.body;
      const userData = await db.User.findOne({
        where: {
          [db.Sequelize.Op.or]: [{ email: email }, { phone: phone }],
        },
      });
      if (userData) {
        await transaction.rollback();
        return res.status(400).send({
          message: "There is already an account with this email or phone",
        });
      }

      const salt = await bcrypt.genSalt(10);
      const hashPassword = await bcrypt.hash(password, salt);

      if (confirmPassword !== password) {
        await transaction.rollback();
        return res.status(400).send({
          message: "Password doesn't match",
        });
      }

      const city_details = city.split(" (");

      const selectedProvince = await db.Province.findOne({
        where: {
          province_name: province,
        },
        attributes: {
          exclude: ["id"],
        },
      });

      const selectedCity = await db.City.findOne({
        where: {
          city_name: city_details[0],
          province_id: selectedProvince.province_id,
        },
        attributes: {
          exclude: ["id"],
        },
      });

      if (!selectedCity) {
        await transaction.rollback();
        return res.status(400).send({
          message: "There is no city in the selected province",
        });
      }

      const automatedReferralCode = refCode.generate({
        length: 8,
        count: 1,
        charset: "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ",
      });

      const verificationToken = crypto.randomBytes(16).toString("hex");
      const newUser = await db.User.create(
        {
          role_id: 3,
          name: name,
          email: email,
          phone: phone,
          password: hashPassword,
          referralCode: automatedReferralCode[0],
          verificationToken,
        },
        {
          transaction,
        }
      );

      const userAddress = await db.Address.create(
        {
          user_id: newUser.id,
          streetName: streetName,
          city_id: selectedCity.city_id,
          latitude: req.geometry.lat,
          longitude: req.geometry.lng,
          isMain: true,
          addressLabel: "Home",
          receiver: newUser.name,
          contact: newUser.phone,
          postalCode: selectedCity.postal_code,
        },
        {
          transaction,
        }
      );

      if (referralCode) {
        const userReferral = await db.User.findOne({
          where: {
            referralCode: referralCode,
          },
        });

        if (!userReferral) {
          await transaction.rollback();
          return res.status(400).send({
            message: "Invalid referral code",
          });
        }

        const userReferralAddress = await db.Address.findOne({
          where: {
            user_id: userReferral.id,
            isMain: true,
          },
        });

        const userLocation = {
          latitude: req.geometry.lat,
          longitude: req.geometry.lng,
        };
        const userReferralLocation = {
          latitude: userReferralAddress.latitude,
          longitude: userReferralAddress.longitude,
        };

        const branchData = await db.Branch.findAll();

        const nearestBranchToUser = findNearestBranch(userLocation, branchData);
        const nearestBranchToUserReferral = findNearestBranch(
          userReferralLocation,
          branchData
        );

        const branchVoucherForUser = await db.Voucher.findOne({
          where: {
            branch_id: nearestBranchToUser,
            isReferral: true,
          },
        });

        const branchVoucherForUserReferral = await db.Voucher.findOne({
          where: {
            branch_id: nearestBranchToUserReferral,
            isReferral: true,
          },
        });

        await db.User_Voucher.create(
          {
            user_id: userReferral.id,
            voucher_id: branchVoucherForUserReferral.id,
            isUsed: false,
          },
          {
            transaction,
          }
        );

        await db.User_Voucher.create(
          {
            user_id: newUser.id,
            voucher_id: branchVoucherForUser.id,
            isUsed: false,
          },
          {
            transaction,
          }
        );
      }

      const link = `${process.env.BASE_PATH_FE}/verify-account/${verificationToken}`;
      const templatePath = join(
        __dirname,
        "../helpers/template/verifyaccount.html"
      );
      const template = fs.readFileSync(
        templatePath,
        "utf-8"
      );
      const templateCompile = handlebars.compile(template);
      const registerEmail = templateCompile({ name: newUser.name, link });
      
      const nodemailerEmail = {
        from: "Groceer-e",
        to: email,
        subject: "Verify Your Groceer-e Account",
        html: registerEmail,
      }
      transporter.sendMail(nodemailerEmail, (error) => {
        if(error){
          transaction.rollback()
          return res.status(500).json({error: "Error sending email"})
        }
      });

      await transaction.commit();

      return res.status(200).send({
        message:
          "You have registered to Groceer-e! Please check your email to verify your account",
        User: newUser,
        Address: userAddress,
      });
    } catch (error) {
      await transaction.rollback();
      return res.status(500).send({
        message: "Server error",
        error: error.message,
      });
    }
  },

  async verifyAccount(req, res) {
    const token = req.query.token;
    try {
      const userData = await db.User.findOne({
        where: {
          verificationToken: token,
        },
      });

      if (!userData) {
        return res.status(400).send({
          message: "token invalid",
        });
      }

      userData.isVerify = true;
      await userData.save();

      return res.status(200).send({
        message: "Your account has been verified",
      });
    } catch (error) {
      return res.status(500).send({
        message: "Server error",
        error: error.message,
      });
    }
  },

  async forgotPassword(req, res) {
    const { email } = req.body;
    const transaction = await db.sequelize.transaction();

    try {
      const userData = await db.User.findOne({
        where: {
          email: email,
        },
      });
      if (!userData) {
        await transaction.rollback();
        return res.status(400).send({
          message: "Email not found",
        });
      }

      const payload = {
        id: userData.id,
        name: userData.name,
        status: userData.isVerify,
        role: userData.role_id,
      };
      const token = jwt.sign(payload, secretKey, {
        expiresIn: "30m",
      });

      userData.resetPasswordToken = token;
      await userData.save();

      const link = `${process.env.BASE_PATH_FE}/reset-password/${token}`;
      const templatePath = join(
        __dirname,
        "../helpers/template/resetpassword.html"
      );
      const template = fs.readFileSync(
        templatePath,
        "utf-8"
      );
      const templateCompile = handlebars.compile(template);
      const resetPasswordEmail = templateCompile({ name: userData.name, link });

      const nodemailerEmail = {
        from: "Groceer-e",
        to: email,
        subject: "Reset Your Groceer-e Account Password",
        html: resetPasswordEmail,
      }

      transporter.sendMail(nodemailerEmail, (error) => {
        if (error) {
          transaction.rollback();
          return res.status(500).json({ error: "Error sending email" });
        }
      });

      await transaction.commit();

      return res.status(200).send({
        message: "Check your email to reset your password",
      });
    } catch (error) {
      return res.status(500).send({
        message: "Server error",
        error: error.message,
      });
    }
  },

  async resetPassword(req, res) {
    const token = req.query.token;
    const transaction = await db.sequelize.transaction();

    const { password, confirmPassword } = req.body;
    try {
      const userData = await db.User.findOne({
        where: {
          resetPasswordToken: token,
        },
      });
      if (!userData) {
        await transaction.rollback();
        return res.status(400).send({
          message: "token invalid",
        });
      }

      if (confirmPassword !== password) {
        await transaction.rollback();
        return res.status(400).send({
          message: "Password doesn't match",
        });
      }

      const salt = await bcrypt.genSalt(10);
      const hashPassword = await bcrypt.hash(password, salt);

      userData.password = hashPassword;
      userData.resetPasswordToken = null;
      await userData.save();

      await transaction.commit();

      return res.status(200).send({
        message: "You have successfully reset your password",
      });
    } catch (error) {
      return res.status(500).send({
        message: "Server error",
        error: error.message,
      });
    }
  },

  async changePassword(req, res) {
    const userId = req.user.id;
    const transaction = await db.sequelize.transaction();

    const { currentPassword, password, confirmPassword } = req.body;
    try {
      const userData = await db.User.findOne({
        where: {
          id: userId,
        },
      });
      if (!userData) {
        await transaction.rollback();
        return res.status(400).send({
          message: "user not found",
        });
      }

      const isValid = await bcrypt.compare(currentPassword, userData.password);
      if (!isValid) {
        return res.status(400).send({
          message: "Incorrect current password",
        });
      }

      if (confirmPassword !== password) {
        await transaction.rollback();
        return res.status(400).send({
          message: "Password doesn't match",
        });
      }

      const salt = await bcrypt.genSalt(10);
      const hashPassword = await bcrypt.hash(password, salt);

      userData.password = hashPassword;
      await userData.save();

      await transaction.commit();

      return res.status(200).send({
        message: "You have successfully changed your password",
      });
    } catch (error) {
      return res.status(500).send({
        message: "Internal server error",
        error: error.message,
      });
    }
  },
};
