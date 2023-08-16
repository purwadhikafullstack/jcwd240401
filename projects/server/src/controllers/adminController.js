const db = require("../models");

module.exports = {
    async allBranch(req,res){
    const pagination = {
        page: Number(req.query.page) || 1,
        perPage: 12,
        search: req.query.search,
        city_id: req.query.sortOrder || "ASC",
    };
  
        const where = {};
        const order = [];
        try {
            if (pagination.city_id) {
                if (pagination.city_id.toUpperCase() === "DESC") {
                    order.push(["city_id", "DESC"]);
                } else {
                    order.push(["city_id", "ASC"]);
                }
            }
        if (pagination.search) {
            where[db.Sequelize.Op.or] = [{
                "$City.city_name$": {
                    [db.Sequelize.Op.like]: `%${pagination.search}%`
              },
            }, {
                "$City.Province.province_name$": {
                    [db.Sequelize.Op.like]: `%${pagination.search}%`
                }
            }]
        }
  
        const results = await db.Branch.findAndCountAll({
            include: [
                {
                  model: db.User,
                  attributes: ["name", "phone"],
                },
                {
                  model: db.City,
                  include: [
                    {
                      model: db.Province,
                      attributes: ["province_name"],
                    },
                  ],
                  attributes: {
                    exclude: ["city_id"],
                  },
                },
            ],
            where,
            order,
            limit: pagination.perPage,
            offset: (pagination.page - 1) * pagination.perPage,
        });
  
        const totalCount = results.count;
        pagination.totalData = totalCount;
  
        if (results.rows.length === 0) {
          return res.status(200).send({
            message: "No branch found",
          });
        }
  
        return res.status(200).send({
          message: "Successfully retrieved branch",
          pagination,
          data: results,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).send({ message: "Internal Server Error" });
    }
},
}

// add branch product
// modify origin branch product
// modify discount branch product
// remove branch product
// restock branch product
// reduce branch product
// update branch product details (ETC)
// get branch product
// get branch product per id

// sales report (SA & A)
// stock history (A)
// create discount (A)
// get discount list (A)
// create voucher (A)
// get voucher list (A)
