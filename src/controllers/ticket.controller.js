const TicketService = require('../service/ticket.service')
const msg = require('../utils/Message')
require('colors')

exports.createTicket = async (req, res) => {
    const token = req.cookies.token
    const {title, city, lat, long, content, type, priority, status} = req.body
    TicketService.createTicket(token, title, city, lat, long, content, type, priority, status).then(result => {
        msg.sendMsg(res, result)
    }).catch((e) => {
        msg.sendMsg(res, msg.errorMsg(e,'CREATE TICKET SERVICE UNKNOWN ERROR'))
    })
}

exports.getTicket = async (req, res) => {
    const id = req.query.id
    TicketService.getTicket(id).then(result => {
        msg.sendMsg(res, result)
    }).catch((e) => {
        msg.sendMsg(res, msg.errorMsg(e,'GET TICKET SERVICE UNKNOWN ERROR'))
    })
}

exports.getMyRate = async (req, res) => {
    const ticketId = req.query.id
    const token = req.cookies.token
    TicketService.getMyVote(token, ticketId).then(result => {
        msg.sendMsg(res, result)
    }).catch((e) => {
        msg.sendMsg(res, msg.errorMsg(e,'GET MY VOTE SERVICE UNKNOWN ERROR'))
    })
}

exports.modifyTicket = async (req, res) => {
    const ticketId = req.query.id
    const token = req.cookies.token

    const {title, city, lat, long, content, type, priority, status} = req.body

    TicketService.modifyTicket(token, ticketId, title, city, lat, long, content, type, priority, status).then(result => {
        msg.sendMsg(res, result)
    }).catch((e) => {
        msg.sendMsg(res, msg.errorMsg(e,'MODIFY TICKET SERVICE UNKNOWN ERROR'))
    })
}

exports.voteTicket = async (req, res) => {
    const ticketId = req.query.id
    const token = req.cookies.token
    const score = req.body.score
    TicketService.voteTicket(token, ticketId, score).then(result => {
        msg.sendMsg(res, result)
    }).catch((e) => {
        msg.sendMsg(res, msg.errorMsg(e,'VOTE TICKET SERVICE UNKNOWN ERROR'))
    })
}

exports.deleteTicket = async (req, res) => {
    const ticketId = req.query.id
    const token = req.cookies.token
    TicketService.deleteTicket(token, ticketId).then(result => {
        msg.sendMsg(res, result)
    }).catch((e) => {
        console.log('ERROR'.red+JSON.stringify(e))
        msg.sendMsg(res, msg.errorMsg(e,'DELETE TICKET SERVICE UNKNOWN ERROR'))
    })
}