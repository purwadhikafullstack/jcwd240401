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

module.exports = {
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
  async createDiscount(req, res) {
    const transaction = await db.sequelize.transaction();
    try {
      const { branch_id, discount_type_id, amount, expiredDate } = req.body;

      const isExist = await db.Discount.findOne({
        where: {
          branch_id,
          discount_type_id,
          amount,
          expiredDate,
        },
      });

      if (isExist) {
        await transaction.rollback();
        return res.status(400).send({
          message: "you still have a similar discount available",
          data: isExist,
        });
      }

      //if buy one get one
      if (discount_type_id == 1) {
        const newDiscount = await db.Discount.create(
          {
            branch_id,
            discount_type_id: 1,
            amount: 1,
            expiredDate,
          },
          { transaction: transaction }
        );

        await transaction.commit();
        return res.status(200).send({
          message: "new discount created",
          data: newDiscount,
        });
      } else {
        const newDiscount = await db.Discount.create(
          {
            branch_id,
            discount_type_id,
            amount,
            expiredDate,
          },
          { transaction }
        );
        await transaction.commit();
        return res.status(200).send({
          message: "new discount created",
          data: newDiscount,
        });
      }
    } catch (error) {
      await transaction.rollback();
      return res.status(500).send({
        message: "fatal errors",
        errors: error.message,
      });
    }
  },
  // get discount list (A)
  async getAllDiscount(req, res) {
    const branch_id = 1;
    const pagination = {
      page: Number(req.query.page) || 1,
      perPage: 12,
      expiredDate: req.query.sortDiscount || "ASC",
    };
    const where = { branch_id };
    const order = [];
    try {
      if (pagination.expiredDate) {
        if (pagination.expiredDate.toUpperCase() === "DESC") {
          order.push(["expiredDate", "DESC"]);
        } else {
          order.push(["expiredDate", "ASC"]);
        }
      }
      const results = await db.Discount.findAll({
        include: [
          {
            model: db.Discount_Type,
            attributes: ["type"],
          },
        ],
        where,
        order,
        limit: pagination.perPage,
        offset: (pagination.page - 1) * pagination.perPage,
      });

      const totalCount = results.count;
      pagination.totalData = totalCount;

      // if (results.rows.length === 0) {
      //   return res.status(200).send({
      //     message: "No discount found",
      //   });
      // }

      return res.status(200).send({
        message: "data successfully retrieved",
        pagination,
        data: results,
      });
    } catch (error) {
      return res.status(500).send({
        message: "fatal error",
        errors: error.message,
      });
    }
  },
  // get discount type list (A)
  async getAllDiscountType(req, res) {
    try {
      const discountTypelist = await db.Discount_Type.findAll();

      return res.status(200).send({
        message: "data successfully retrieved",
        data: discountTypelist,
      });
    } catch (error) {
      return res.status(500).send({
        message: "fatal error",
        error: error.message,
      });
    }
  },

  // create voucher (A)
  async createVoucher(req, res) {
    const transaction = await db.sequelize.transaction();

    try {
      const currentDate = new Date();
      const {
        branch_id,
        voucher_type_id,
        expiredDate,
        usedLimit,
        amount,
        minTransaction,
        maxDiscount,
        isReferral,
      } = req.body;

      const isExist = await db.Voucher.findOne({
        where: {
          branch_id,
          voucher_type_id,
          amount,
          expiredDate,
          minTransaction,
          maxDiscount,
          isReferral,
          usedLimit,
        },
      });

      if (isExist) {
        await transaction.rollback();
        return res.status(400).send({
          message: "you still have a similar voucher available",
          data: isExist,
        });
      }

      const newVoucher = await db.Voucher.create(
        {
          branch_id,
          voucher_type_id,
          amount,
          expiredDate,
          minTransaction,
          maxDiscount,
          isReferral,
          usedLimit,
        },
        { transaction }
      );
      await transaction.commit();
      return res.status(200).send({
        message: "new voucher created",
        data: newVoucher,
      });
    } catch (error) {
      await transaction.rollback();
      return res.status(500).send({
        message: "fatal errors",
        errors: error.message,
      });
    }
  },
  // get voucher list (A)
  async getAllVoucher(req, res) {
    const branch_id = 1;
    const pagination = {
      page: Number(req.query.page) || 1,
      perPage: 12,
      expiredDate: req.query.sortVoucher || "ASC",
    };
    const where = { branch_id };
    const order = [];
    try {
      if (pagination.expiredDate) {
        if (pagination.expiredDate.toUpperCase() === "DESC") {
          order.push(["expiredDate", "DESC"]);
        } else {
          order.push(["expiredDate", "ASC"]);
        }
      }
      const results = await db.Voucher.findAll({
        include: [
          {
            model: db.Voucher_Type,
            attributes: ["type"],
          },
        ],
        where,
        order,
        limit: pagination.perPage,
        offset: (pagination.page - 1) * pagination.perPage,
      });

      const totalCount = results.count;
      pagination.totalData = totalCount;

      return res.status(200).send({
        message: "data successfully retrieved",
        pagination,
        data: results,
      });
    } catch (error) {
      return res.status(500).send({
        message: "fata error",
        errors: error.message,
      });
    }
  },

  //get voucher type list (A)
  // get discount type list (A)
  async getAllVoucherType(req, res) {
    try {
      const voucherTypelist = await db.Voucher_Type.findAll();

      return res.status(200).send({
        message: "data successfully retrieved",
        data: voucherTypelist,
      });
    } catch (error) {
      return res.status(500).send({
        message: "fatal error",
        error: error.message,
      });
    }
  },
};
