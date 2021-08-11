const Db = require('../model/Database')
const Permission = require('../utils/Permission')
const msg = require('../utils/Message')
const Email = require('../utils/Email')
const bcrypt = require('bcrypt');

/**
 * Get user settings from token
 * @param {?string} token - token from cookie
 * @returns {Promise<Message>} - Message class to send, code in message shows running result
 */
const getUserInfo = async (token) => {
    try {
        //call permission method
        const {user, error} = await Permission.getPermission(token).then(user => {
            return {user, error: null}
        }).catch((e) => {
            return {user: null, error: e.toString()}
        })
        if (user === null) {
            return msg.failedMsg('authorization failed: '+error)
        }

        //Db access
        const {email, name, CityId, GroupId} = user
        return msg.successMsg({email, name, CityId, GroupId},
            'get user info success')
    } catch (e) {
        return msg.errorMsg(e, 'get user info failed: internal error')
    }
}

/**
 * Change user settings, and provide new token if email changed
 * @param {?string} token - token from cookie
 * @param {?string} email - new email
 * @param {?string} name - new name
 * @param {?number} CityId - new city id
 * @returns {Promise<Message>} - Message class to send, code in message shows running result
 */
const updateUserInfo = async (token, email, name, CityId) => {
    try {
        //Call permission method
        const {user, error} = await Permission.getPermission(token).then(user => {
            return {user, error: null}
        }).catch((e) => {
            return {user: null, error: e.toString()}
        })
        if (!user) {
            return msg.failedMsg('authorization failed: '+error)
        }
        if (email) {
            const userCount = await Db.User.count({
                where: {
                    email: email
                }
            })
            if (userCount !== 0) {
                return msg.failedMsg('Register error: user already exists')
            }
        }

        //Db access
        const newUserInfo = {
            email: email,
            name: name,
            CityId: CityId
        }
        await Db.User.update(newUserInfo, {
            where: {
                email: user.get('email')
            }
        }).catch((e) => {
            console.log('database access error: '+e)
            throw 'database access error'
        })
        //Give new token if necessary
        let newToken
        if (typeof email !== 'undefined'){
            newToken = Permission.createToken(email)
        } else {
            newToken = token
        }
        return msg.successMsg({token: newToken}, 'update info success')
    } catch (e) {
        return msg.errorMsg(e, 'update user info failed: internal error')
    }
}

/**
 * Change user password
 * @param {?string} token
 * @param {!string} pwd
 * @returns {Promise<Message>} - Message class to send, code in message shows running result
 */
const updateUserPwd = async (token, pwd) => {
    try {
        //undefined check for all objects
        const nonNullObjects = {pwd}
        for (const object in nonNullObjects) {
            if (!nonNullObjects[object]) {
                return msg.failedMsg('Invalid input format, missing '+object)
            }
        }

        const {user, error} = await Permission.getPermission(token).then(user => {
            return {user, error: null}
        }).catch((e) => {
            return {user: null, error: e.toString()}
        })
        if (user === null) {
            return msg.failedMsg('update pwd authorization failed: '+error)
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
        return msg.errorMsg(e, 'update user info failed: internal error')
    }
}

/**
 * Helper method to get user's ticket/reply history
 * @param {?string} token - token from cookie
 * @returns {Promise<{error: *, user: User}>} - error if failed, User if found
 */
const getUserHistoryAuth = async (token) => {
    const {user, error} = await Permission.getPermission(token).then(user => {
        return {user, error: null}
    }).catch((e) => {
        return {user: null, error: e.toString()}
    })
    return {user, error}
}

/**
 * Get all tickets with current user in token as author
 * @param {?string} token - token from cookie
 * @param {?number} pageNum - number of page, default 1
 * @returns {Promise<Message>} - Message class to send, code in message shows running result
 */
const getUserTickets = async (token, pageNum = 1) => {
    try {
        // Call helper method
        const {user, error} = await getUserHistoryAuth(token)
        if (user === null) {
            return msg.failedMsg('authorization failed: '+error)
        }

        //calculate offset, should be non-negative
        let offset = (pageNum - 1) * 10
        if (offset < 0) {
            offset = 0
        }

        //access db
        const userTickets = await Db.Ticket.findAll({
            where: {
                ticketAuthorId: user.get('id')
            },
            attributes: ['id', 'title', 'type', 'priority', 'status', 'rateSum', 'createdAt'],
            order: [['createdAt', 'DESC']],
            limit: 10,
            offset: offset
        })

        //count from db to get page number
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
        return msg.errorMsg(e, 'get user tickets failed: internal error')
    }
}

/**
 * Get all replies with current user in token as author
 * @param {?string} token - token from cookie
 * @param {?number} pageNum - number of page, default 1
 * @returns {Promise<Message>} - Message class to send, code in message shows running result
 */
const getUserReplies = async (token, pageNum = 1) => {
    try {
        // Call helper method
        const {user, error} = await getUserHistoryAuth(token)
        if (user === null) {
            return msg.failedMsg('authorization failed: '+error)
        }

        //calculate offset, should be non-negative
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

        //access db
        const userRepliesCount = await Db.Reply.count({
            where: {
                replyAuthorId: user.get('id')
            }
        })
        const totalPage = Math.ceil(userRepliesCount / 10.0)

        const data = {
            totalPage, userReplies
        }

        //count from db to get page number
        return msg.successMsg(data, 'get user replies success')


    } catch (e) {
        return msg.errorMsg(e, 'get user replies failed: internal error')
    }
}

/**
 * Send a password recovery email to certain email. Returned message contains sending address and receiving address
 * @param {!string} email - email address to send
 * @returns {Promise<Message>} - Message class to send, code in message shows running result
 */
const sendRecoverEmail = async (email) => {
    try {
        const userCount = await Db.User.count({
            where: {
                email: email
            }
        })
        if (userCount === 0) {
            return msg.failedMsg('Send recover email failed: no such email registered')
        }

        const token = Permission.createResetToken(email)
        const data = await Email.sendEmail(email, token)
        return msg.successMsg(data, 'send recover email success')
    } catch (e) {
        return msg.errorMsg(e, 'send recover email failed: internal error')
    }
}

/**
 * Use token from recovery email to change password
 * @param token
 * @param {!string} pwd - new password
 * @returns {Promise<Message>} - Message class to send, code in message shows running result
 */
const recoverPwd = async (token, pwd) => {
    try {
        //undefined check for all objects
        const nonNullObjects = {pwd}
        for (const object in nonNullObjects) {
            if (!nonNullObjects[object]) {
                return msg.failedMsg('Invalid input format, missing '+object)
            }
        }

        const {user, error} = await Permission.getResetPermission(token).then(user => {
            return {user, error: null}
        }).catch((e) => {
            return {user: null, error: e.toString()}
        })
        if (user === null) {
            return msg.failedMsg('reset pwd authorization failed: '+error)
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
        return msg.errorMsg(e, 'reset pwd failed: internal error')
    }
}

module.exports = {getUserInfo, updateUserInfo, updateUserPwd, getUserTickets, getUserReplies, sendRecoverEmail, recoverPwd}