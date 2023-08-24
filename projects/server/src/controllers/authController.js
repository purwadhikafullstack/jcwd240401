const db = require("../models");
const transporter = require("../helpers/transporter")
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken")
const crypto = require("crypto")
const axios = require("axios")
const handlebars = require("handlebars")
const fs = require("fs")
const geolib = require('geolib')
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
    },
    async keepLogin(req,res) {
        const userId = req.user.id

        try{
            const userData = await db.User.findOne({
                where: {
                    id: userId
                }
            })
            const payload = {id: userData.id, name: userData.name, status: userData.isVerify, role: userData.role_id, imgProfile: userData.imgProfile}
            const refreshToken = jwt.sign(payload, secretKey, {
                expiresIn: "1h"
            })

            return res.status(200).send({
                message: "This is your refresh token",
                userId: userId,
                refreshToken: refreshToken
            })
        }catch(error){
            return res.status(500).send({
                message: "Server error",
                error: error.message
            })
        }
    },
    async nearestBranch(req,res){
        try{
        const latitude = req.query.latitude ? req.query.latitude : "" 
        const longitude = req.query.longitude ? req.query.longitude : ""

        const userLocation = { latitude: latitude, longitude: longitude }

        const branchData = await db.Branch.findAll()
        let nearestBranchId = 0
        let nearest = 100000

        if(latitude && longitude){
        branchData.map((branch) => {
            const branchLocation = {latitude: branch.latitude, longitude: branch.longitude}
            const distance = geolib.getDistance(userLocation, branchLocation)
            if(distance < nearest){
                nearest = distance
                nearestBranchId = branch.id
            }
        })} else {
            nearestBranchId = branchData[0].id
        }

        const nearestBranchData = await db.Branch.findOne({
            where: {
                id: nearestBranchId
            },
            
                include: [
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
            }
        )

        return res.status(200).send({
            message: "This is your nearest branch",
            brachId: nearestBranchId,
            branchData: nearestBranchData
        })
        }catch(error){
            return res.status(500).send({
                message: "Server error",
                error: error.message
            })
        }
    },
    async registerUser(req,res) {
        const transaction = await db.sequelize.transaction()
        try {
            const {name, email, phone, password, confirmPassword, province, city, streetName, referralCode} = req.body
            const userData = await db.User.findOne({
                where: {
                    [db.Sequelize.Op.or] : [{email: email}, {phone: phone}]
                }
            })
            if(userData) {
                if(userData.email === email) {
                    await transaction.rollback()
                    return res.status(400).send({
                        message: "There's already an account with this email"
                    })
                }
                
                if(userData.phone === phone) {
                    await transaction.rollback()
                    return res.status(400).send({
                        message: "There's already an account with this phone number"
                    })
                }
            }

            const salt = await bcrypt.genSalt(10)
            const hashPassword = await bcrypt.hash(password, salt)

            if(confirmPassword !== password){
                await transaction.rollback()
                return res.status(400).send({
                    message: "Password doesn't match"
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

            const verificationToken = crypto.randomBytes(16).toString("hex")
            const newUser = await db.User.create({
                role_id: 3,
                name: name,
                email: email,
                phone: phone,
                password: hashPassword,
                referralCode: referralCode,
                verificationToken
            }, {
                transaction,
            })

            const responseData = await axios.get(`https://api.opencagedata.com/geocode/v1/json?q=${city}+${province}&key=${opencageKey}`)
            if(!responseData){
                await transaction.rollback()
                return res.status(400).send({
                    message: "Can't get location's latitude and longitude"
                })
            }
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

            const userAddress = await db.Address.create({
                user_id: newUser.id,
                streetName: streetName,
                city_id: selectedCity.city_id,
                latitude: geometry.lat,
                longitude: geometry.lng,
                isMain: true
            }, {
                transaction
            })

            const link = `${process.env.BASE_PATH_FE}/verify-account/${verificationToken}`
            const template = fs.readFileSync("./src/helpers/template/verifyaccount.html", "utf-8")
            const templateCompile = handlebars.compile(template)
            const registerEmail = templateCompile({link})
            
            await transporter.sendMail({
                from: "Groceer-e",
                to: email,
                subject: "Verify Your Groceer-e Account",
                html: registerEmail
            })

            await transaction.commit()

            return res.status(200).send({
                message: "You have registered to Groceer-e! Please check your email to verify your account",
                User: newUser,
                Address: userAddress
            })

        }catch(error){
            await transaction.rollback()
            return res.status(500).send({
                message: "Server error",
                error: error.message
            })
        }
    },
    async verifyAccount(req,res) {
        const token = req.query.token
        try{

            const userData = await db.User.findOne({
                where: {
                    verificationToken: token
                }
            })
    
            if(!userData){
                return res.status(400).send({
                    message: "token invalid"
                })
            }
    
            userData.isVerify = true
            await userData.save()
    
            return res.status(200).send({
                message: "Your account has been verified"
            })
        }catch(error){
            return res.status(500).send({
                message: "Server error",
                error: error.message
            })
        }
    },
    async forgotPassword(req,res) {
        const {email} = req.body
        const transaction = await db.sequelize.transaction()

        try {
            const userData = await db.User.findOne({
                where: {
                    email: email
                }
            })
            if(!userData) {
                await transaction.rollback()
                return res.status(400).send({
                    message: "Email not found"
                })
            }

            const payload = {id: userData.id, name: userData.name, status: userData.isVerify, role: userData.role_id}
            const token = jwt.sign(payload, secretKey, {
                expiresIn: "30m"
            })

            userData.resetPasswordToken = token
            await userData.save()

            const link = `${process.env.BASE_PATH_FE}/reset-password/${token}`
            const template = fs.readFileSync("./src/helpers/template/resetpassword.html", "utf-8")
            const templateCompile = handlebars.compile(template)
            const registerEmail = templateCompile({link})
            
            await transporter.sendMail({
                from: "Groceer-e",
                to: email,
                subject: "Reset Your Groceer-e Account Password",
                html: registerEmail
            })

            await transaction.commit()

            return res.status(200).send({
                message: "Check your email to reset your password",
            })
        }catch(error){
            return res.status(500).send({
                message: "Server error",
                error: error.message
            })
        }
    },
    async resetPassword(req,res) {
        const token = req.query.token
        const transaction = await db.sequelize.transaction()

        const {password, confirmPassword } = req.body
        try{
            const userData = await db.User.findOne({
                where: {
                    resetPasswordToken: token
                }
            })
            if(!userData) {
                await transaction.rollback()
                return res.status(400).send({
                    message: "token invalid"
                })
            }

            if(confirmPassword !== password) {
                await transaction.rollback()
                return res.status(400).send({
                    message: "Password doesn't match"
                })
            }

            const salt = await bcrypt.genSalt(10)
            const hashPassword = await bcrypt.hash(password, salt)

            userData.password = hashPassword
            userData.resetPasswordToken = null
            await userData.save()

            await transaction.commit()

            return res.status(200).send({
                message: "You have successfully reset your password"
            })
        }catch(error){
            return res.status(500).send({
                message: "Server error",
                error: error.message
            })
        }
    }
}