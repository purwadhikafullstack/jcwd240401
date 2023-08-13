const db = require("../models");
const transporter = require("../helpers/transporter")
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken")
const crypto = require("crypto")
const axios = require("axios")
const handlebars = require("handlebars")
const fs = require("fs")
// login
// keep login

// admin
// register admin
// set account

// user
// register user
// verify account
// forget password
// reset password
const secretKey = process.env.JWT_SECRET_KEY
const opencageKey = process.env.OPENCAGE_API_KEY

module.exports = {
    async login(req,res) {
        const { email, password } = req.body
        try {
            const userData = await db.User.findOne({
                where: {
                    email: email,
                },
            })
            if (!userData) {
                return res.status(400).send({
                    message: "Login failed. Please input your registered email and password"
                })
            }

            const isValid = await bcrypt.compare(password, userData.password)
            if(!isValid) {
                return res.status(400).send({
                    message: "Login failed. Please input your registered email and password"
                })
            }

            const payload = {id: userData.id, name: userData.name, status: userData.isVerify, role: userData.role_id, imgProfile: userData.imgProfile}
            const token = jwt.sign(payload, secretKey, {
                expiresIn: "7d"
            })
            
            const loggedInUser = await db.User.findOne({
                where: {
                    email:email
                },
                attributes: {
                    exclude: ["id", "role_id", "password", "verificationToken", "isVerify", "resetPasswordToken", "createdAt", "updatedAt"]
                }
            })

            return res.status(200).send({
                message: "You are logged in!",
                data: loggedInUser,
                accessToken: token
            })

        }catch(error){
            return res.status(500).send({
                message: "Server Error",
                error: error.message
            })
        }
    },
    async registerAdmin(req,res) {
        const transaction = await db.sequelize.transaction()
        try {
            const {name, email, phone, province, city} = req.body
            const userData = await db.User.findOne({
                where: {
                    email: email
                }
            })
            if(userData) {
                await transaction.rollback()
                return res.status(400).send({
                    message: "There's already an admin with this email"
                })
            }
            const selectedProvince = await db.Province.findOne({
                where: {
                    province_name: province
                },
                attributes: {
                    exclude: ["id"]
                }
            })

            const selectedCity = await db.City.findOne({
                where: {
                    city_name: city,
                    province_id: selectedProvince.province_id
                },
                attributes: {
                    exclude: ["id"]
                }
            })

            if(!selectedCity){
                await transaction.rollback()
                return res.status(400).send({
                    message: "There is no city in the selected province"
                })
            }

            const branchExist = await db.Branch.findOne({
                where: {
                    city_id: selectedCity.city_id
                }
            })
            if(branchExist){
                await transaction.rollback()
                return res.status(400).send({
                    message: "There's already a branch in this city"
                })
            }

            const verificationToken = crypto.randomBytes(16).toString("hex")
            const newAdmin = await db.User.create({
                role_id: 2,
                name: name,
                email: email,
                phone: phone,
                isVerify: 1,
                verificationToken
            }, {
                transaction,
            })

            const responseData = await axios.get(`https://api.opencagedata.com/geocode/v1/json?q=${city}+${province}&key=${opencageKey}`)
            const sanitizedResponse = JSON.stringify(responseData, (key, value) => {
                if (typeof value === 'object' && value !== null) {
                    if (value === responseData.request) {
                        return;
                    }
                }
                return value;
            });
            const latlong = JSON.parse(sanitizedResponse)
            const geometry = latlong.data.results[0].geometry
            
            const newBranch = await db.Branch.create({
                user_id: newAdmin.id,
                city_id: selectedCity.city_id,
                latitude: geometry.lat,
                longitude: geometry.lng
            }, {
                transaction
            })

            const link = `${process.env.BASE_PATH_FE}/set-password/${verificationToken}`
            const template = fs.readFileSync("./src/helpers/template/setaccount.html", "utf-8")
            const templateCompile = handlebars.compile(template)
            const registerEmail = templateCompile({link})
            
            await transporter.sendMail({
                from: "Groceer-e",
                to: email,
                subject: "Set Your Account Password",
                html: registerEmail
            })

            await transaction.commit()

            return res.status(200).send({
                message: "Successfully add admin branch",
                admin: newAdmin,
                branch: newBranch
            })

        }catch(error){
            await transaction.rollback()
            return res.status(500).send({
                message: "Server error",
                error: error.message
            })
        }
    },
    async setPassword(req,res){
        const {password, confirmPassword} = req.body
        const token = req.query.token
        try{
            const userData = await db.User.findOne({
                where: {
                    verificationToken: token
                }
            })
            if(!userData){
                return res.status({
                    message: "token invalid"
                })
            }

            if(confirmPassword !== password){
                return res.status({
                    message: "Password doesn't match"
                })
            }

            const salt = await bcrypt.genSalt(10)
            const hashPassword = await bcrypt.hash(password, salt)

            if(hashPassword){
                userData.password = hashPassword
            }
            await userData.save()

            return res.status(200).send({
                message: "Successfully set password"
            })

        }catch(error){
            return res.status(500).send({
                messasge: "Server error",
                error: error.message
            })
        }
    },
    async allBranch(req,res){
        try{
            const allBranch = await db.Branch.findAll({
                include: [
                    {
                        model: db.User,
                        attributes: ["name", "phone"]
                    },
                    {
                        model: db.City,
                        include: [
                            {
                                model: db.Province,
                                attributes: ["province_name"]
                            }
                        ],
                        attributes: {
                            exclude: ["city_id", "province_id"]
                        }
                    }
                ]
            })
            return res.status(200).send({
                message: "Successfully get all branch",
                data: allBranch
            })
        } catch(error){
            return res.status(500).send({
                message: "Server error",
                error: error.message
            })
        }
    },
    async allProvince(req,res) {
        try{
            const provinces = await db.Province.findAll()

            return res.status(200).send({
                messages: "All Provinces",
                data: provinces
            })
        } catch(error){
            return res.status(500).send({
                message: "Server error",
                error: error.message
            })
        }
    },
    async allCityByProvince(req,res) {
        try{
            const province = req.query.province ? req.query.province : ""

            const selectedProvince = await db.Province.findOne({
                where: {
                    province_name: province
                }
            })
            
            let cities = []
            if(province){
            cities = await db.City.findAll({
                where: {
                    province_id: selectedProvince.province_id
                }
            })}else{
                cities = await db.City.findAll()
            }

            return res.status(200).send({
                messages: "All Cities",
                data: cities
            })
        } catch(error){
            return res.status(500).send({
                message: "Server error",
                error: error.message
            })
        }
    }
}