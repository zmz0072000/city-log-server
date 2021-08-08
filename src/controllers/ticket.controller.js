const TicketService = require('../service/ticket.service')
const msg = require('../utils/Message')
require('colors')

exports.createTicket = async (req, res) => {
    const token = req.cookies.token
    const {title, city, lat, long, content, type, priority, status} = req.body
    TicketService.createTicket(token, title, city, lat, long, content, type, priority, status).then(result => {
        msg.sendMsg(res, result)
    }).catch((e) => {
        msg.sendMsg(res, msg.failMsg('CREATE TICKET SERVICE UNKNOWN ERROR'), e)
    })
}

exports.getTicket = async (req, res) => {
    const id = req.query.id
    TicketService.getTicket(id).then(result => {
        msg.sendMsg(res, result)
    }).catch((e) => {
        msg.sendMsg(res, msg.failMsg('GET TICKET SERVICE UNKNOWN ERROR'), e)
    })
}

exports.modifyTicket = async (req, res) => {
    const ticketId = req.query.id
    const token = req.cookies.token

    const {title, city, lat, long, content, type, priority, status} = req.body

    TicketService.modifyTicket(token, ticketId, title, city, lat, long, content, type, priority, status).then(result => {
        msg.sendMsg(res, result)
    }).catch((e) => {
        msg.sendMsg(res, msg.failMsg('MODIFY TICKET SERVICE UNKNOWN ERROR'), e)
    })
}

exports.voteTicket = async (req, res) => {
    const ticketId = req.query.id
    const token = req.cookies.token
    const score = req.body.score
    TicketService.voteTicket(token, ticketId, score).then(result => {
        msg.sendMsg(res, result)
    }).catch((e) => {
        msg.sendMsg(res, msg.failMsg('VOTE TICKET SERVICE UNKNOWN ERROR'), e)
    })
}

exports.deleteTicket = async (req, res) => {
    const ticketId = req.query.id
    const token = req.cookies.token
    TicketService.deleteTicket(token, ticketId).then(result => {
        msg.sendMsg(res, result)
    }).catch((e) => {
        console.log('ERROR'.red+JSON.stringify(e))
        msg.sendMsg(res, msg.failMsg('DELETE TICKET SERVICE UNKNOWN ERROR'), e)
    })
}