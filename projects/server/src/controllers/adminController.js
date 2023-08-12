const db = require("../models");

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
      const currentDate = new Date();

      const isExist = await db.Discount.findOne({
        where: {
          [db.Sequelize.Op.and]: [
            { branch_id },
            { discount_type_id },
            { amount },
            { expiredDate: { [db.Sequelize.Op.lt]: currentDate } },
          ],
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
    try {
      const discountList = await db.Discount.findAll({
        where: { branch_id },
        include: [
          {
            model: db.Discount_Type,
            attributes: ["type"],
          },
        ],
      });

      return res.status(200).send({
        message: "data successfully retrieved",
        data: discountList,
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
          [db.Sequelize.Op.and]: [
            { branch_id },
            { voucher_type_id },
            { amount },
            { expiredDate: { [db.Sequelize.Op.lt]: currentDate } },
            { minTransaction },
            { maxDiscount },
            { isReferral },
            { usedLimit },
          ],
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
    try {
      const voucherList = await db.Voucher.findAll({
        where: { branch_id },
      });

      return res.status(200).send({
        message: "data successfully retrieved",
        data: voucherList,
      });
    } catch (error) {
      return res.status(500).send({
        message: "fata error",
        errors: error.message,
      });
    }
  },
};
