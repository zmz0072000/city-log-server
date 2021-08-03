const jsonwebtoken = require('jsonwebtoken');
require('dotenv').config();
const secret = process.env.SECRET;

const {User, Group, City} = require('../model/Database');

const createToken = (email) => {
    return jsonwebtoken.sign({
        email
    }, secret, {
        expiresIn: "15m"
    })
}

const getPermission = async (token) => {
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
    }).catch((e) => {
        throw 'internal error: database access failed'
    })

    if (user) {
        return user
    } else {
        throw 'user with email not exist'
    }
}

module.exports = {
    createToken, getPermission
}





