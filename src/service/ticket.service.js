const Db = require('../model/Database')
const Permission = require('../utils/Permission')
const msg = require('../utils/Message')
require('colors')

/**
 * Create a ticket
 * @param {?string} token - token to create ticket
 * @param {!string} title - title
 * @param {!number} city - city of ticket
 * @param {!number} lat - Latitude
 * @param {!number} long - Latitude
 * @param {!string} content - Longitude
 * @param {!number} type - type
 * @param {!number} priority - priority
 * @param {!boolean} status - status
 * @returns {Promise<Message>} - Message class to send, code in message shows running result
 */
const createTicket = async (token, title, city, lat, long, content, type, priority, status) => {
    try {
        //undefined check for all objects
        const nonNullObjects = {title, city, lat, long, content, type, priority, status}
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
            return msg.failedMsg('authorization failed: '+error)
        }
        // city exist check
        const userCity = await Db.City.findOne({
            where: {
                id: city
            }
        }).then(city => {
            return city
        })
        if (!userCity) {
            return msg.failedMsg('create ticket error: city not exist')
        }

        // Create new ticket
        const newTicket = await Db.Ticket.create({
            title, lat, long, content, type, priority, status,
            ticketAuthorId: user.get('id'),
            CityId: city,
        }).then(ticket => {
            return ticket
        })
        if (typeof newTicket != 'undefined') {
            return msg.successMsg(null, 'create ticket success')
        } else {
            return msg.errorMsg('db create empty return value', 'create ticket error: unknown reason')
        }
    } catch (e) {
        return msg.errorMsg(e, 'create ticket failed: internal error')
    }
}

/**
 * Find a ticket with certain id
 * @param {!number} id - ticket id
 * @returns {Promise<Message>} - Message class to send, code in message shows running result
 */
const getTicket = async (id) => {
    try {
        //undefined check for all objects
        const nonNullObjects = {id}
        for (const object in nonNullObjects) {
            if (!nonNullObjects[object]) {
                return msg.failedMsg('Invalid input format, missing '+object)
            }
        }

        //Db access to find ticket info
        const ticket = await Db.Ticket.findOne({
            where: {
                id: id
            },
            attributes: ['title', 'content', 'lat', 'long', 'rateSum', 'type', 'priority', 'status', 'createdAt', 'updatedAt'],
            include: [
                {model: Db.City, attributes: ['id', 'name']},
                {model: Db.User, as: 'ticketAuthor', attributes: ['id', 'name']},
                {model: Db.Reply,  attributes: ['id', 'content', 'createdAt', 'updatedAt'], include: [
                        {model: Db.User, as: 'replyAuthor', attributes: ['id', 'name']}]}
            ], order: [
                [Db.Reply, 'id']
            ]
        }).then(ticket => {
            return ticket
        })
        if (!ticket) {
            return msg.failedMsg('get ticket failed: ticket not exist')
        }
        return msg.successMsg(ticket, 'get ticket success')
    } catch (e) {
        return msg.errorMsg(e, 'create ticket failed: internal error')
    }
}

/**
 * Helper function to authenticate ticket modification
 * @param {?string} token - string from cookie
 * @param {!number} ticketId - id of ticket to vote
 * @param {!boolean} isRating - if true, calculate permission based on who can rate ticket
 * @returns {Promise<{error: string}|{ticket, user}>} - error if failed, ticket and user if success
 */
const modifyAuth = async (token, ticketId, isRating = false) => {
    try {
        //Call getPermission method to verify token
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
        //Get ticket info from ticketId
        const ticket = await Db.Ticket.findOne({
            where: {
                id: ticketId
            }, include: [{model: Db.User, as: 'ticketAuthor'}]
        }).then(ticket => {
            return ticket
        })
        if (!ticket) {
            return {
                error: 'ticket not found'
            }
        }

        //Auth logic
        const tokenUserGroup = user.get('Group').get('name')
        const ticketAuthor = ticket.get('ticketAuthor').get('email')
        const tokenUserName = user.get('email')

        if (isRating) {
            if (tokenUserName !== ticketAuthor) {
                return {ticket, user}
            }
            else {
                return {
                    error: 'you can\'t vote for ticket you wrote'
                }
            }
        }
        if (tokenUserName === ticketAuthor || tokenUserGroup === 'admin') {
            return {ticket, user}
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
 * Vote good or bad for a ticket
 * @param {?string} token - token from cookie
 * @param {!number} ticketId - ticket id to vote
 * @param {!number} score - score to vote for ticket. 1 for upvote, -1 for down vote, 0 for cancelling
 * @returns {Promise<Message>} - Message class to send, code in message shows running result
 */
const voteTicket = async (token, ticketId, score) => {
    try {
        //Score can only be 1 or -1 or 0
        if (score > 1 || score < -1) {
            return msg.failedMsg('rate ticket failed: invalid score')
        }

        //Auth helper method
        const authResult = await modifyAuth(token, ticketId, true)
        if (!authResult.ticket) {
            return msg.failedMsg('rate ticket failed: '+authResult.error)
        }

        //Get current rate in Rate join table. If exist modify it, if not create new rate
        const currentRate = await Db.Rate.findOne ({
            where: {
                TicketId: ticketId,
                UserId: authResult.user.get('id')
            }
        })
        if (currentRate) {
            await currentRate.update({
                score: score
            })
        } else {
            await Db.Rate.create({
                score: score,
                TicketId: ticketId,
                UserId: authResult.user.get('id')
            })
        }

        //Update rateSum of ticket
        const rateSum = await Db.Rate.sum('score', {
            where: {
                TicketId: ticketId
            }
        })
        await authResult.ticket.update({
            rateSum: rateSum
        })

        return msg.successMsg({newRateSum: rateSum},'rate ticket success')
    } catch (e) {
        return msg.errorMsg(e, 'rate ticket failed: internal error')
    }
}

/**
 * Get current vote state for a user
 * @param {?string} token - token from cookie
 * @param {!number} ticketId - ticket id to vote
 * @returns {Promise<Message>} - Message class to send, code in message shows running result
 */
const getMyVote = async (token, ticketId) => {
    try {
        let currentRate = 0
        const user = await Permission.getPermission(token).then(user => {
            return user
        }).catch(() => {
            // if error occurs, user will be null and method will still return success message with zero vote
            return null
        })

        if (user) {
            //update rate
            const rate = await Db.Rate.findOne({
                where: {
                    TicketId: ticketId,
                    UserId: user.get('id')
                }
            })
            currentRate = rate.get('score')
        }
        return msg.successMsg({currentRate}, 'get current rate of user success')

    } catch (e) {
        return msg.errorMsg(e, 'get current rate failed: internal error')
    }
}

/**
 * Modify a ticket
 * @param {?string} token - token to create ticket
 * @param {!number} ticketId - ticket id to modify
 * @param {?string} title - title
 * @param {?number} city - city of ticket
 * @param {?number} lat - Latitude
 * @param {?number} long - Latitude
 * @param {?string} content - Longitude
 * @param {?number} type - type
 * @param {?number} priority - priority
 * @param {?boolean} status - status
 * @returns {Promise<Message>} - Message class to send, code in message shows running result
 */
const modifyTicket = async (token, ticketId, title, city, lat, long, content, type, priority, status) => {
    try {
        //undefined check for all objects
        const nonNullObjects = {ticketId}
        for (const object in nonNullObjects) {
            if (!nonNullObjects[object]) {
                return msg.failedMsg('Invalid input format, missing '+object)
            }
        }

        //Call auth help method
        const authResult = await modifyAuth(token, ticketId)
        if (!authResult.ticket) {
            return msg.failedMsg('modify ticket failed: '+authResult.error)
        }
        const ticket = authResult.ticket

        //Update ticket with new information
        const newTicketInfo = {
            title, lat, long, content, type, priority, status,
            CityId: city,
        }
        await ticket.update(newTicketInfo)
        return msg.successMsg(null, 'modify ticket success')

    } catch (e) {
        return msg.errorMsg(e, 'modify ticket failed: internal error')
    }
}

/**
 * Delete a ticket
 * @param {?string} token - token to create ticket
 * @param {!number} ticketId - ticket id to modify
 * @returns {Promise<Message>} - Message class to send, code in message shows running result
 */
const deleteTicket = async (token, ticketId) => {
    try {
        //undefined check for all objects
        const nonNullObjects = {ticketId}
        for (const object in nonNullObjects) {
            if (!nonNullObjects[object]) {
                return msg.failedMsg('Invalid input format, missing '+object)
            }
        }

        //Auth helper method
        const authResult = await modifyAuth(token, ticketId)
        if (!authResult.ticket) {
            return msg.failedMsg('delete ticket failed: '+authResult.error)
        }
        const ticket = authResult.ticket
        //Delete ticket
        await ticket.destroy()
        return msg.successMsg('delete ticket success')
    } catch (e) {
        return msg.errorMsg(e, 'delete ticket failed: internal error')
    }
}

module.exports = {createTicket, getTicket, getMyVote, modifyTicket, voteTicket, deleteTicket}