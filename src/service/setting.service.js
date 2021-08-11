const Db = require('../model/Database')
const Permission = require('../utils/Permission')
const msg = require('../utils/Message')
const Email = require('../utils/Email')
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
        const {email, name, CityId, GroupId} = user
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
        const userCount = await Db.User.count({
            where: {
                email: email
            }
        })
        if (userCount !== 0) {
            return msg.failMsg('Register error: user already exists')
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
        })
        return msg.successMsg({}, 'update info success')
    } catch (e) {
        return msg.failMsg('update user info failed: internal error', e.toString())
    }
}

const getUserHistoryAuth = async (token) => {
    const {user, error} = await Permission.getPermission(token).then(user => {
        return {user, error: null}
    }).catch((e) => {
        return {user: null, error: e.toString()}
    })
    return {user, error}
}

const getUserTickets = async (token, pageNum = 1) => {
    try {
        const {user, error} = await getUserHistoryAuth(token)
        if (user === null) {
            return msg.failMsg('authorization failed: '+error)
        }

        let offset = (pageNum - 1) * 10
        if (offset < 0) {
            offset = 0
        }

        const userTickets = await Db.Ticket.findAll({
            where: {
                ticketAuthorId: user.get('id')
            },
            attributes: ['id', 'title', 'type', 'priority', 'status', 'rateSum', 'createdAt'],
            order: [['createdAt', 'DESC']],
            limit: 10,
            offset: offset
        })

        const userTicketCount = await Db.Ticket.count({
            where: {
                ticketAuthorId: user.get('id')
            }
        })
        const totalPage = Math.ceil(userTicketCount / 10.0)

        const data = {
            totalPage, userTickets
        }

        return msg.successMsg(data, 'get user tickets success')

    } catch (e) {
        return msg.failMsg('get user tickets failed: internal error', e.toString())
    }
}

const getUserReplies = async (token, pageNum = 1) => {
    try {
        const {user, error} = await getUserHistoryAuth(token)
        if (user === null) {
            return msg.failMsg('authorization failed: '+error)
        }

        let offset = (pageNum - 1) * 10
        if (offset < 0) {
            offset = 0
        }

        const userReplies = await Db.Reply.findAll({
            where: {
                replyAuthorId: user.get('id')
            },
            attributes: ['id', 'content', 'createdAt'],
            include: [
                {model: Db.Ticket, attributes: ['id', 'title']}
            ],
            order: [['createdAt', 'DESC']],
            limit: 10,
            offset: offset
        })

        const userRepliesCount = await Db.Reply.count({
            where: {
                replyAuthorId: user.get('id')
            }
        })
        const totalPage = Math.ceil(userRepliesCount / 10.0)

        const data = {
            totalPage, userReplies
        }

        return msg.successMsg(data, 'get user replies success')


    } catch (e) {
        return msg.failMsg('get user replies failed: internal error', e.toString())
    }
}

const sendRecoverEmail = async (email) => {
    try {
        const userCount = await Db.User.count({
            where: {
                email: email
            }
        })
        if (userCount === 0) {
            return msg.failMsg('Send recover email failed: no such email registered')
        }

        const token = Permission.createResetToken(email)
        const data = await Email.sendEmail(email, token)
        return msg.successMsg(data, 'send recover email success')
    } catch (e) {
        return msg.failMsg('send recover email failed: internal error', e.toString())
    }
}

const recoverPwd = async (token, pwd) => {
    try {
        const {user, error} = await Permission.getResetPermission(token).then(user => {
            return {user, error: null}
        }).catch((e) => {
            return {user: null, error: e.toString()}
        })
        if (user === null) {
            return msg.failMsg('reset pwd authorization failed: '+error)
        }
        const newUserInfo = {
            pwd: bcrypt.hashSync(pwd, bcrypt.genSaltSync())
        }
        await Db.User.update(newUserInfo, {
            where: {
                id: user.get('id')
            }
        })
        return msg.successMsg({}, 'reset pwd success')
    } catch (e) {
        return msg.failMsg('reset pwd failed: internal error', e.toString())
    }
}

module.exports = {getUserInfo, updateUserInfo, updateUserPwd, getUserTickets, getUserReplies, sendRecoverEmail, recoverPwd}