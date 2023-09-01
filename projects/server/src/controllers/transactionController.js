const db = require("../models");

module.exports = {
    async allOrdersByBranch(req,res) {
        try{
            const userId = req.user.id
            const branchData = await db.Branch.findOne({
                where: {
                    user_id: userId
                }
            })

            if(!branchData){
                return res.status(400).send({
                    message: "Branch not found"
                })
            }

            const orders = await db.Order_Item.findAll({
                include: [
                    { 
                        model: db.Branch_Product,
                        where: {
                            branch_id: branchData.id
                        } 
                    },{
                        model: db.Order
                    }
                ]
            })

            return res.status(200).send({
                message: "Success get all transactions",
                data: orders
            })
        }catch(error){
            return res.status(500).send({
                message: "Server error",
                error: error.message
            })
        }
    },
}

// admin
// admin get all order
// admin change order status
// admin cancel order

// user
// user add to cart
// user remove from cart
// user get all cart
// user checkout
// user payment
// user cancel order
// user confirm order
