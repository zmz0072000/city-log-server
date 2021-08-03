const Db = require('../model/Database')
const Permission = require('../utils/Permission')
const msg = require('../utils/Message')
const bcrypt = require('bcrypt');

const getUserInfo = async (token) => {
    try {
        const {user, error} = await Permission.getPermission(token).then(user => {
            return {user, error: null}
        }).catch((e) => {
            return {user: null, error: e.toString()}
        })
        if (user === null) {
            return msg.failMsg('authorization failed: '+error)
        }
        const {email, name, CityId, GroupId} = User
        return msg.successMsg({email, name, CityId, GroupId},
            'get user info success')
    } catch (e) {
        return msg.failMsg('get user info failed: internal error', e.toString())
    }
}

const updateUserInfo = async (token, email, name, CityId) => {
    try {
        const {user, error} = await Permission.getPermission(token).then(user => {
            return {user, error: null}
        }).catch((e) => {
            return {user: null, error: e.toString()}
        })
        if (user === null) {
            return msg.failMsg('authorization failed: '+error)
        }
        const newUserInfo = {
            email: email,
            name: name,
            CityId: CityId
        }
        await Db.User.update(newUserInfo, {
            where: {
                id: user.get('id')
            }
        }).catch((e) => {
            console.log('database access error: '+e)
            throw 'database access error'
        })
        let newToken
        if (typeof email !== 'undefined'){
            newToken = Permission.createToken(email)
        } else {
            newToken = token
        }
        return msg.successMsg({token: newToken}, 'update info success')
    } catch (e) {
        return msg.failMsg('update user info failed: internal error', e.toString())
    }
}

const updateUserPwd = async (token, pwd) => {
    try {
        const {user, error} = await Permission.getPermission(token).then(user => {
            return {user, error: null}
        }).catch((e) => {
            return {user: null, error: e.toString()}
        })
        if (user === null) {
            return msg.failMsg('authorization failed: '+error)
        }
        const newUserInfo = {
            pwd: bcrypt.hashSync(pwd, bcrypt.genSaltSync())
        }
        await Db.User.update(newUserInfo, {
            where: {
                id: user.get('id')
            }
        }).catch((e) => {
            console.log('database access error: '+e)
            throw 'database access error'
        })
        return msg.successMsg({}, 'update info success')
    } catch (e) {
        return msg.failMsg('update user info failed: internal error', e.toString())
    }
}

module.exports = {getUserInfo, updateUserInfo, updateUserPwd}