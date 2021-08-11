const Db = require('../model/Database')
const Permission = require('../utils/Permission')
const msg = require('../utils/Message')
require('colors')

const createTicket = async (token, title, city, lat, long, content, type, priority, status) => {
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
            title, lat, long, content, type, priority, status,
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
            return msg.failMsg('get ticket failed: ticket not exist')
        }
        return msg.successMsg(ticket, 'get ticket success')
    } catch (e) {
        return msg.failMsg('create ticket failed: internal error', e.toString())
    }
}

const modifyAuth = async (token, ticketId, isRating = false) => {
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

const voteTicket = async (token, ticketId, score) => {
    try {
        if (score > 1 || score < -1) {
            return msg.failMsg('rate ticket failed: invalid score')
        }

        const authResult = await modifyAuth(token, ticketId, true)
        if (!authResult.ticket) {
            return msg.failMsg('rate ticket failed: '+authResult.error)
        }
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
        return msg.failMsg('rate ticket failed: internal error', e.toString())
    }
}

const getMyVote = async (token, ticketId) => {
    try {
        let currentRate = 0
        const user = await Permission.getPermission(token).then(user => {
            return user
        }).catch(() => {
            // if error occurs, user will be null and currentRate stays zero
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
        return msg.failMsg('get current rate failed: internal error', e.toString())
    }
}

const modifyTicket = async (token, ticketId, title, city, lat, long, content, type, priority, status) => {
    try {
        const authResult = await modifyAuth(token, ticketId)
        if (!authResult.ticket) {
            return msg.failMsg('modify ticket failed: '+authResult.error)
        }
        const ticket = authResult.ticket

        const newTicketInfo = {
            title, lat, long, content, type, priority, status,
            CityId: city,
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

module.exports = {createTicket, getTicket, getMyVote, modifyTicket, voteTicket, deleteTicket}