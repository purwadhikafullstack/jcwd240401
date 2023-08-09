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
          message: "you still have a similiar discount available",
          data: isExist,
        });
      }

      const newDiscount = await db.Discount.create(
        {
          branch_id,
          discount_type_id,
          amount,
          expiredDate,
        },
        { transaction: transaction }
      );

      await transaction.commit();
      res.status(200).send({
        message: "new discount created",
        data: newDiscount,
      });
    } catch (error) {
      await transaction.rollback();
      return res.status(500).send({
        message: "fatal errors",
        errors: error.message,
      });
    }
  },
  // get discount list (A)
  // create voucher (A)
  // get voucher list (A)
};
