const jsonwebtoken = require('jsonwebtoken');
require('dotenv').config();
const secret = process.env.SECRET;

const {User, Group, City} = require('../model/Database');

/**
 * Generate a token with email
 * @param {!string} email - user email used to make token
 * @returns {*} - token
 */
const createToken = (email) => {
    return jsonwebtoken.sign({
        email
    }, secret, {
        expiresIn: "15m"
    })
}

/**
 * check if a user token is valid
 * @param token - token to be check
 * @returns {Promise} - throw error with detailed message if token is invalid, return user behind the token if success
 */
const getPermission = async (token) => {
    if (typeof token === 'undefined') throw 'empty token, please login again'
    let decoded = ''
    try {
        decoded = jsonwebtoken.verify(token, secret);
    } catch (e) {
        throw 'invalid token, please login again'
    }

    const {email} = decoded
    const user = await User.findOne({
        where: {
            email: email
        },
        include: [
            Group,
            City
        ]
    }).catch(() => {
        throw 'internal error: database access failed'
    })

    if (user) {
        return user
    } else {
        throw 'user with email not exist'
    }
}

/**
 * Use different secret to generate token for password resetting
 * @param {!string} email - user email used to make token
 * @returns {*} - token
 */
const createResetToken = (email) => {
    return jsonwebtoken.sign({
        email
    }, secret+'reset', {
        expiresIn: "30m"
    })
}

/**
 * check if a reset token is valid
 * @param token - token to be check
 * @returns {Promise} - throw error with detailed message if token is invalid, return user behind the token if success
 */
const getResetPermission = async (token) => {
    if (typeof token === 'undefined') throw 'empty token, require reset email again'
    let decoded = ''
    try {
        decoded = jsonwebtoken.verify(token, secret+'reset');
    } catch (e) {
        throw 'invalid token, please require reset email again'
    }
    const {email} = decoded
    const user = await User.findOne({
        where: {
            email: email
        },
        include: [
            Group,
            City
        ]
    }).catch(() => {
        throw 'internal error: database access failed'
    })
    if (user) {
        return user
    } else {
        throw 'user with email not exist'
    }
}

module.exports = {
    createToken, getPermission, createResetToken, getResetPermission
}





