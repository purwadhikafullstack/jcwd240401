const schedule = require("node-schedule");
const db = require("../../models");

const rule = new schedule.RecurrenceRule();
rule.second = 0;

const job = schedule.scheduleJob(rule, async () => {
  const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

  // Find orders that are waiting for payment and have exceeded the time limit
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
    // Start a transaction
    const transaction = await db.sequelize.transaction();

    try {
      for (const order of ordersToCancel) {
        // Update order status and cancel reason
        await order.update(
          {
            orderStatus: "Canceled",
            cancelReason: "time has run out",
          },
          {
            transaction,
          }
        );

        // Return the stock and update stock history
        for (const orderItem of order.Branch_Products) {
          const { branch_product_id, quantity } = orderItem.Order_Item;

          // Get the current stock quantity
          const branchProduct = await db.Branch_Product.findOne({
            where: { id: branch_product_id },
            transaction,
          });

          if (branchProduct) {
            const currentStockQuantity = branchProduct.quantity;

            // Increment the stock
            await db.Branch_Product.increment("quantity", {
              by: quantity,
              where: { id: branch_product_id },
              transaction,
            });

            // Create a stock history entry for the return
            await db.Stock_History.create(
              {
                branch_product_id,
                totalQuantity: currentStockQuantity + quantity, // Update totalQuantity
                quantity,
                status: "canceled by user",
              },
              { transaction }
            );
          }
        }
      }

      // Commit the transaction
      await transaction.commit();
    } catch (error) {
      // Rollback the transaction in case of an error
      await transaction.rollback();
      console.error("Error canceling orders:", error);
    }
  }
});
