const Db = require('../model/Database')
const Permission = require('../utils/Permission')
const msg = require('../utils/Message')
require('colors')

const createReply = async (token, ticketId, content) => {
    try {
        const {user, error} = await Permission.getPermission(token).then(user => {
            return {user, error: null}
        }).catch((e) => {
            return {user: null, error: e.toString()}
        })
        if (user === null) {
            return msg.failedMsg('authorization failed: '+error)
        }


        const ticket = await Db.Ticket.findOne({
            where: {
                id: ticketId
            }
        }).then(ticket => {
            return ticket
        })
        const userId = user.get('id')
        if (!ticket) {
            return msg.failedMsg('create reply failed: ticket not exist')
        }
        const newReply = await Db.Reply.create({
            content: content,
            replyAuthorId: userId,
            TicketId: ticketId
        }).then(reply => {
            return reply
        })
        if (typeof newReply !== 'undefined') {
            console.log("create reply: success")
            return msg.successMsg(null, 'create reply success')
        } else {
            return msg.errorMsg('db create empty return value', 'create reply error: unknown reason')
        }
    } catch (e) {
        return msg.errorMsg(e, 'create reply failed: internal error')
    }
}

const modifyAuth = async (token, replyId) => {
    try {
        const {user, error} = await Permission.getPermission(token).then(user => {
            return {user}
        }).catch((e) => {
            return {error: e.toString()}
        })
        if (!user) {
            return {
                error: 'authorization failed: '+error
            }
        }
        const reply = await Db.Reply.findOne({
            where: {
                id: replyId
            }, include: [{model: Db.User, as: 'replyAuthor'}]
        }).then(reply => {
            return reply
        })

        if (!reply) {
            return {
                error: 'ticket not found'
            }
        }

        const replyAuthor = reply.get('replyAuthor').get('email')
        const tokenUserGroup = user.get('Group').get('name')
        const tokenUserName = user.get('email')

        if (tokenUserName === replyAuthor || tokenUserGroup === 'admin') {
            return {
                reply
            }
        } else {
            return {
                error: 'you don\'t have permission to do it'
            }
        }
    } catch (e) {
        throw 'modifyAuth: '+e.toString()
    }
}

const modifyReply = async (token, replyId, content) => {
    try {
        const authResult = await modifyAuth(token, replyId)
        if (!authResult.reply){
            return msg.failedMsg('modify reply failed: '+authResult.error)
        }
        const reply = authResult.reply

        const newReplyInfo = {
            content: content
        }
        await reply.update(newReplyInfo)
        return msg.successMsg(null, 'modify reply success')
    } catch (e) {
        return msg.errorMsg(e, 'modify reply failed: internal error')
    }
}

const deleteReply = async (token, replyId) => {
    try {
        const authResult = await modifyAuth(token, replyId)
        if (!authResult.reply){
            return msg.failedMsg('modify reply failed: '+authResult.error)
        }
        const reply = authResult.reply
        await reply.destroy()
        return msg.successMsg(null, 'delete reply success')
    } catch (e) {
        return msg.errorMsg(e.toString(), 'delete reply failed: internal error')
    }
}

module.exports = {createReply, modifyReply, deleteReply}