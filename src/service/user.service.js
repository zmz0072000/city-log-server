const msg = require('../utils/Message');
const bcrypt = require('bcrypt');
const {createToken} = require('../utils/Permission')

const {User, City} = require('../model/Database');

const register = async (email, pwd, name, city) => {
    try {
        const userCount = await User.count({
            where: {
                email: email
            }
        })
        if (userCount !== 0) {
            return msg.failedMsg('Register error: user already exists')
        }

        // city exist check
        const userCity = await City.findOne({
            where: {
                id: city
            }
        })
        if (typeof userCity === 'undefined') {
            return msg.failedMsg('Register error: city not exist')
        }

        console.log("REGISTER STARTED")
        const newUser = await User.create({
            email: email,
            pwd: bcrypt.hashSync(pwd, bcrypt.genSaltSync()),
            name: name,
            CityId: city,
            GroupId: 3
        })

        if (typeof newUser !== 'undefined'){
            console.log("register: success")
            return msg.successMsg(null, 'Register success!')
        } else {
            console.log("register: failed due to unknown reason")
            return msg.errorMsg('unknown reason (create returned empty result)', 'Register error: unknown reason')
        }
    } catch (e) {
        return msg.errorMsg(e, 'Register error: internal error')
    }
}

const login = async (email, pwd) => {
    let user = null
    try {
         user = await User.findOne({
            where: {
                email: email
            }
        })
    } catch (e) {
        return msg.errorMsg(e, 'login internal error')
    }
    if (user === null) {
        return msg.failedMsg('login failed: email not exist')
    }

    try {
        const hashedPwd = user.get('pwd')
        if (bcrypt.compareSync(pwd, hashedPwd)) {
            const data = {
                token: createToken(email)
            }
            return msg.successMsg(data, 'Login Success')
        } else {
            return msg.failedMsg('login failed: password does not match record')
        }
    } catch (e) {
        return msg.errorMsg(e, 'login internal error')
    }
}

module.exports = {register, login}