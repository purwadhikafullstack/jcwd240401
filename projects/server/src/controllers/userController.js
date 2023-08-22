const db = require("../models");

module.exports = {
    async getProfileWithVerificationToken(req,res) {
        const token = req.query.token

        try{
            const userData = await db.User.findOne({
                where: {
                    verificationToken: token
                }
            })
            if(!userData) {
                return res.status(400).send({
                    message: "No user found"
                })
            }

            return res.status(200).send({
                message: "User found",
                data: userData
            })
        }catch(error){
            return res.status(500).send({
                message: "Server error",
                error: error.message
            })
        }
    },
    async getAddress(req,res){
        const userId = req.user.id

        try{
            const userData = await db.Address.findOne({
                where: {
                    id: userId,
                    isMain: true
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
            })
            if(!userData){
                return res.status(400).send({
                    message: "No address found"
                })
            }

            return res.status(200).send({
                message: "User's address found",
                data: userData
            })
        }catch(error){
            return res.status(500).send({
                message: "Server error",
                error: error.message
            })
        }
    }
}

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
