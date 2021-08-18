const Db = require('../model/Database')
const Permission = require('../utils/Permission')
const msg = require('../utils/Message')
require('colors')

/**
 * Create a reply of ticket and put it into database
 * @param {?string} token - token from cookie
 * @param {!number} ticketId - ticketId to query
 * @param {?string} content - content of reply
 * @returns {Promise<Message>} - Message class to send, code in message shows running result
 */
const createReply = async (token, ticketId, content) => {
    try {
        //undefined check for all objects
        const nonNullObjects = {ticketId}
        for (const object in nonNullObjects) {
            if (!nonNullObjects[object]) {
                return msg.failedMsg('Invalid input format, missing:  '+object)
            }
        }

        //Get permission
        const {user, error} = await Permission.getPermission(token).then(user => {
            return {user, error: null}
        }).catch((e) => {
            return {user: null, error: e.toString()}
        })
        if (user === null) {
            return msg.failedMsg('authorization failed: '+error)
        }

        //Ticket exist check
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

        //Create reply
        const newReply = await Db.Reply.create({
            content: content,
            replyAuthorId: userId,
            TicketId: ticketId
        })
        if (typeof newReply !== 'undefined') {
            return msg.successMsg(null, 'create reply success')
        } else {
            return msg.errorMsg('db create empty return value', 'create reply error: unknown reason')
        }
    } catch (e) {
        return msg.errorMsg(e, 'create reply failed: internal error')
    }
}

/**
 * Helper function to make authentication for reply modification
 * @param {!string} token - token from cookie
 * @param {!number} replyId - reply to modify
 * @returns {Promise<{error: string}|{reply: Reply}>} - error if auth failed, Reply class if success
 */
const modifyAuth = async (token, replyId) => {
    try {
        //Call Permission class to decrypt token
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

        //Get reply from database
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

        //auth logic
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

/**
 * Modify a reply
 * @param {?string} token - token from cookie
 * @param {!number} replyId - replyId to modify
 * @param {?string} content - new content
 * @returns {Promise<Message>} - Message class to send, code in message shows running result
 */
const modifyReply = async (token, replyId, content) => {
    try {
        //undefined check for all objects
        const nonNullObjects = {replyId}
        for (const object in nonNullObjects) {
            if (!nonNullObjects[object]) {
                return msg.failedMsg('Invalid input format, missing: '+object)
            }
        }

        //Use helper function
        const authResult = await modifyAuth(token, replyId)
        if (!authResult.reply){
            return msg.failedMsg('modify reply failed: '+authResult.error)
        }
        const reply = authResult.reply

        const newReplyInfo = {
            content: content
        }

        //access db
        await reply.update(newReplyInfo)
        return msg.successMsg(null, 'modify reply success')
    } catch (e) {
        return msg.errorMsg(e, 'modify reply failed: internal error')
    }
}

/**
 * Delete a reply
 * @param {?string} token - token from cookie
 * @param {!number} replyId - replyId to delete
 * @returns {Promise<Message>} - Message class to send, code in message shows running result
 */
const deleteReply = async (token, replyId) => {
    try {
        //undefined check for all objects
        const nonNullObjects = {replyId}
        for (const object in nonNullObjects) {
            if (!nonNullObjects[object]) {
                return msg.failedMsg('Invalid input format, missing '+object)
            }
        }
        //call helper function
        const authResult = await modifyAuth(token, replyId)
        if (!authResult.reply){
            return msg.failedMsg('modify reply failed: '+authResult.error)
        }
        const reply = authResult.reply
        //DB access
        await reply.destroy()
        return msg.successMsg(null, 'delete reply success')
    } catch (e) {
        return msg.errorMsg(e.toString(), 'delete reply failed: internal error')
    }
}

module.exports = {createReply, modifyReply, deleteReply}