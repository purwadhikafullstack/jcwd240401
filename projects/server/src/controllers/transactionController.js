const db = require("../models");

module.exports = {
    async allOrdersByBranch(req,res) {
        const pagination = {
            page: Number(req.query.page) || 1,
            perPage: 12,
            search: req.query.search || "",
            status: req.query.filterStatus || "",
            date: req.query.sortDate,
            startDate: req.query.startDate || "",
            endDate: req.query.endDate || "",
        }
        try{
            let where = {}
            const order = [];
            if (pagination.startDate && pagination.endDate) {
                const startDateUTC = new Date(pagination.startDate);
                startDateUTC.setUTCHours(0, 0, 0, 0); // Set the time to start of the day in UTC

                const endDateUTC = new Date(pagination.endDate);
                endDateUTC.setUTCHours(23, 59, 59, 999); // Set the time to end of the day in UTC

                where["$Order.order_date$"] = {
                    [db.Sequelize.Op.between]: [startDateUTC, endDateUTC],
                };
            } else if (pagination.startDate) {
                const startDateUTC = new Date(pagination.startDate);
                startDateUTC.setUTCHours(0, 0, 0, 0); // Set the time to start of the day in UTC

                where["$Order.order_date$"] = {
                    [db.Sequelize.Op.gte]: startDateUTC,
                };
            } else if (pagination.endDate) {
                const endDateUTC = new Date(pagination.endDate);
                endDateUTC.setUTCHours(0, 0, 0, 0); // Set the time to start of the day in UTC
                endDateUTC.setUTCDate(endDateUTC.getUTCDate() + 1); // Add 1 day

                where["$Order.order_date$"] = {
                    [db.Sequelize.Op.lt]: endDateUTC, // Use less than operator to filter until the end of the previous day
                };
            }
            if (pagination.search) {
                productWhere["$Order.invoiceCode$"] = {
                  [db.Sequelize.Op.like]: `%${pagination.search}%`,
                };
            }
            if (pagination.status) {
                where["$Order.status$"] = pagination.status;
            }
            if (pagination.date) {
                if (pagination.date.toUpperCase() === "DESC") {
                  order.push([db.Order, "order_date", "DESC"]);
                } else {
                  order.push([db.Order, "order_date", "ASC"]);
                }
            }

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
                        model: db.Order,
                        where,
                        order,
                    }
                ],
                limit: pagination.perPage,
                offset: (pagination.page - 1) * pagination.perPage,
            })

            return res.status(200).send({
                message: "Success get all transactions",
                pagination,
                data: orders
            })
        }catch(error){
            return res.status(500).send({
                message: "Server error",
                error: error.message
            })
        }
    },
    async allOrders(req,res) {
        const pagination = {
            page: Number(req.query.page) || 1,
            perPage: 12,
            search: req.query.search || "",
            status: req.query.filterStatus || "",
            branchId: req.query.branchId || "1",
            date: req.query.sortDate,
            startDate: req.query.startDate || "",
            endDate: req.query.endDate || "",
        }
        try{
            let where = {}
            const order = [];
            if (pagination.startDate && pagination.endDate) {
                const startDateUTC = new Date(pagination.startDate);
                startDateUTC.setUTCHours(0, 0, 0, 0); // Set the time to start of the day in UTC

                const endDateUTC = new Date(pagination.endDate);
                endDateUTC.setUTCHours(23, 59, 59, 999); // Set the time to end of the day in UTC

                where["$Order.order_date$"] = {
                    [db.Sequelize.Op.between]: [startDateUTC, endDateUTC],
                };
            } else if (pagination.startDate) {
                const startDateUTC = new Date(pagination.startDate);
                startDateUTC.setUTCHours(0, 0, 0, 0); // Set the time to start of the day in UTC

                where["$Order.order_date$"] = {
                    [db.Sequelize.Op.gte]: startDateUTC,
                };
            } else if (pagination.endDate) {
                const endDateUTC = new Date(pagination.endDate);
                endDateUTC.setUTCHours(0, 0, 0, 0); // Set the time to start of the day in UTC
                endDateUTC.setUTCDate(endDateUTC.getUTCDate() + 1); // Add 1 day

                where["$Order.order_date$"] = {
                    [db.Sequelize.Op.lt]: endDateUTC, // Use less than operator to filter until the end of the previous day
                };
            }
            if (pagination.search) {
                productWhere["$Order.invoiceCode$"] = {
                  [db.Sequelize.Op.like]: `%${pagination.search}%`,
                };
            }
            if (pagination.status) {
                where["$Order.status$"] = pagination.status;
            }
            if (pagination.date) {
                if (pagination.date.toUpperCase() === "DESC") {
                  order.push([db.Order, "order_date", "DESC"]);
                } else {
                  order.push([db.Order, "order_date", "ASC"]);
                }
            }

            const orders = await db.Order_Item.findAll({
                include: [
                    { 
                        model: db.Branch_Product, 
                        where: {branch_id: pagination.branchId}
                    },{
                        model: db.Order,
                        where,
                        order
                    }
                ],
                limit: pagination.perPage,
                offset: (pagination.page - 1) * pagination.perPage,
            })

            if(!orders){
                return res.status(200).send({
                    message: "No order found"
                })
            }

            return res.status(200).send({
                message: "All Orders",
                pagination,
                data: orders
            })

        }catch(error){
            return res.status(500).send({
                message: "Server error",
                error: error.message
            })
        }
    }
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
