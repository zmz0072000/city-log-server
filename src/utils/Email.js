const nodemailer = require('nodemailer')
require('colors')
require('dotenv').config()

/**
 * Helper method to generate html content for pwd reset email
 * @param {!string} link - starting part of link
 * @returns {string} - Full HTML email
 */
const generateEmail = (link) => {
    return "<h2>CITYLOG</h2>\n" +
        "<p>Dear customer,</p>\n" +
        "<p>Please click the link below to reset your password.</p>\n" +
        "<p>If you didn't require this email, please ignore it.</p>" +
        `<p><a href=\"${link}\">Click me to reset password</a></p>\n` +
        "<p>Sincerely,</p>\n" +
        "<p>CITYLOG team</p>"
}

/**
 * Config of transporter
 */
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

/**
 * Use nodemailer to send password reset email to user
 * @param {!string} userEmail - user email
 * @param {!string} token - token part of link
 * @returns {Promise<*>} - Error if failed, envelope part of returned info if successed
 */
exports.sendEmail = async (userEmail, token) => {
    const link = process.env.EMAIL_LINK+token

    //Send email using defined transporter
    const info = await transporter.sendMail({
        from: `"CITY LOG ACCOUNT SECURITY" <${process.env.EMAIL_USER}>`,
        to: userEmail,
        subject: 'City Log password reset link',
        html: generateEmail(link)
    })
    return info.envelope
}