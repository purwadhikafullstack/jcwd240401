const schedule = require("node-schedule");
const dayjs = require("dayjs");
const isToday = require("dayjs/plugin/isToday");
const db = require("../../models");
dayjs.extend(isToday);

const job = schedule.scheduleJob("1 0 * * *", async () => {
  const now = dayjs();

  await db.Voucher.update(
    { isExpired: true },
    {
      where: {
        expiredDate: {
          [db.Sequelize.Op.lt]: now.toDate(),
        },
        isExpired: false,
        isReferral: false,
      },
    }
  );
});
