const nodemailer = require("nodemailer")

const transporter = nodemailer.createTransport({
    service: process.env.MY_SERVICE,
    auth: {
        user: process.env.MY_EMAIL,
        pass: process.env.MY_PASS
    },
    tls: {
        rejectUnauthorized: false,
    }
})

module.exports = transporter