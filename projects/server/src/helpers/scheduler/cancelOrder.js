const schedule = require("node-schedule");
const db = require("../../models");

const rule = new schedule.RecurrenceRule();
rule.second = 0;

const job = schedule.scheduleJob(rule, async () => {
  const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
  await db.Order.update(
    {
      orderStatus: "Canceled",
      cancelReason: "time has run out",
    },
    {
      where: {
        orderStatus: "Waiting for payment",
        orderDate: { [db.Sequelize.Op.lt]: thirtyMinutesAgo },
      },
    }
  );
});
