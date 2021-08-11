const nodemailer = require('nodemailer')
require('colors')
require('dotenv').config()

const generateEmail = (link) => {
    return "<h2>CITYLOG</h2>\n" +
        "<p>Dear customer,</p>\n" +
        "<p>Please click the linke below to reset your password.</p>\n" +
        "<p>If you didn't require this email, please ignore it.</p>" +
        `<p><a href=\"${link}\">Click me to reset password</a></p>\n` +
        "<p>Sincerely,</p>\n" +
        "<p>CITYLOG team</p>"
}

const config = {
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: {
        ciphers:'SSLv3'
    }
}

const transporter = nodemailer.createTransport(config)

exports.sendEmail = async (userEmail, token) => {
    const link = process.env.EMAIL_LINK+token

    const info = await transporter.sendMail({
        from: `"CITY LOG ACCOUNT SECURITY" <${process.env.EMAIL_USER}>`,
        to: userEmail,
        subject: 'City Log password reset link',
        html: generateEmail(link)
    })
    return info.envelope
}