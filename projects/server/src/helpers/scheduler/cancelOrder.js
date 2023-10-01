const schedule = require("node-schedule");
const db = require("../../models");

const rule = new schedule.RecurrenceRule();
rule.second = 0;

const job = schedule.scheduleJob(rule, async () => {
  const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

  const ordersToCancel = await db.Order.findAll({
    where: {
      orderStatus: "Waiting for payment",
      orderDate: { [db.Sequelize.Op.lt]: thirtyMinutesAgo },
    },
    include: [
      {
        model: db.Branch_Product,
      },
    ],
  });

  if (ordersToCancel.length > 0) {
    const transaction = await db.sequelize.transaction();

    try {
      for (const order of ordersToCancel) {
        await order.update(
          {
            orderStatus: "Canceled",
            cancelReason: "time has run out",
          },
          {
            transaction,
          }
        );
        if (order.voucher_id) {
          await db.User_Voucher.update(
            { isUsed: false },
            {
              where: {
                voucher_id: order.voucher_id,
                user_id: order.user_id,
              },
            },
            { transaction }
          );
  
          const voucher = await db.Voucher.findByPk(order.voucher_id);
          if (!voucher.isReferral) {
            await db.Voucher.increment(
              "usedLimit",
              {
                by: 1,
                where: { id: order.voucher_id },
              },
              { transaction }
            );
          }
        }
      

        for (const orderItem of order.Branch_Products) {
          const { branch_product_id, quantity } = orderItem.Order_Item;

          const branchProduct = await db.Branch_Product.findOne({
            where: { id: branch_product_id },
            transaction,
          });

          if (branchProduct) {
            const currentStockQuantity = branchProduct.quantity;

            await db.Branch_Product.increment("quantity", {
              by: quantity,
              where: { id: branch_product_id },
              transaction,
            });

            await db.Stock_History.create(
              {
                branch_product_id,
                totalQuantity: currentStockQuantity + quantity,
                quantity,
                status: "canceled by user",
              },
              { transaction }
            );
          }
        }
      }

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      console.error("Error canceling orders:", error);
    }
  }
});
