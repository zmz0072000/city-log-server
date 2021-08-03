const Db = require('../model/Database')
const Permission = require('../utils/Permission')
const msg = require('../utils/Message')
require('colors')

const createTicket = async (token, title, city, lat, long, content) => {
    try {
        const {user, error} = await Permission.getPermission(token).then(user => {
            return {user, error: null}
        }).catch((e) => {
            return {user: null, error: e.toString()}
        })
        if (user === null) {
            return msg.failMsg('authorization failed: '+error)
        }
        // city exist check
        const userCity = await Db.City.findOne({
            where: {
                id: city
            }
        }).then(city => {
            return city
        })
        const authorId = user.get('id')
        if (!userCity) {
            return msg.failMsg('create ticket error: city not exist')
        }
        const newTicket = await Db.Ticket.create({
            title: title,
            content: content,
            lat: lat,
            long: long,
            ticketAuthorId: authorId,
            CityId: city,
        }).then(ticket => {
            return ticket
        })
        if (typeof newTicket != 'undefined') {
            console.log("create ticket: success")
            return msg.successMsg(null, 'create ticket success')
        } else {
            return msg.failMsg('create ticket error: unknown reason', 'db create empty return value')
        }
    } catch (e) {
        return msg.failMsg('create ticket failed: internal error', e.toString())
    }
}

const getTicket = async (id) => {
    try {
        const ticket = await Db.Ticket.findOne({
            where: {
                id: id
            },
            attributes: ['title', 'content', 'rate', 'lat', 'long', 'followedCount', 'createdAt', 'updatedAt'],
            include: [
                {model: Db.User, as: 'ticketAuthor', attributes: ['id']},
                {model: Db.Reply,  attributes: ['id', 'content', 'createdAt', 'updatedAt'], include: [
                        {model: Db.User, as: 'replyAuthor', attributes: ['id', 'name']}
                    ]}
            ], order: [
                [Db.Reply, 'id']
            ]
        }).then(ticket => {
            return ticket
        })
        if (!ticket) {
            return msg.failMsg('get ticket failed: ticket not exist')
        }
        return msg.successMsg(ticket, 'get ticket success')
    } catch (e) {
        return msg.failMsg('create ticket failed: internal error', e.toString())
    }
}

const modifyAuth = async (token, ticketId) => {
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

        const tokenUserGroup = user.get('Group').get('name')
        const ticketAuthor = ticket.get('ticketAuthor').get('email')
        const tokenUserName = user.get('email')

        if (tokenUserName === ticketAuthor || tokenUserGroup === 'admin') {
            return {
                ticket
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

const modifyTicket = async (token, ticketId, title, city, lat, long, content) => {
    try {
        const authResult = await modifyAuth(token, ticketId)
        if (!authResult.ticket) {
            return msg.failMsg('modify ticket failed: '+authResult.error)
        }
        const ticket = authResult.ticket

        const newTicketInfo = {
            title: title,
            city: city,
            lat: lat,
            long: long,
            content: content
        }
        await ticket.update(newTicketInfo)
        return msg.successMsg(null, 'modify ticket success')

    } catch (e) {
        return msg.failMsg('modify ticket failed: internal error', e.toString())
    }
}

const deleteTicket = async (token, ticketId) => {
    try {
        const authResult = await modifyAuth(token, ticketId)
        if (!authResult.ticket) {
            return msg.failMsg('delete ticket failed: '+authResult.error)
        }
        const ticket = authResult.ticket
        await ticket.destroy()
        return msg.successMsg('delete ticket success')
    } catch (e) {
        return msg.failMsg('delete ticket failed: internal error', e.toString())
    }
}

module.exports = {createTicket, getTicket, modifyTicket, deleteTicket}