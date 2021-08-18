const ReplyService = require('../service/reply.service')
const msg = require('../utils/Message')
require('colors')

exports.createReply = async (req, res) => {
    const token = req.cookies.token
    const ticketId = req.query.ticket
    const content = req.body.content

    ReplyService.createReply(token, ticketId, content).then(result => {
        msg.sendMsg(res, result)
    }).catch((e) => {
        msg.sendMsg(res, msg.errorMsg(e,'CREATE REPLY SERVICE UNKNOWN ERROR'))
    })
}

exports.modifyReply = async (req, res) => {
    const token = req.cookies.token
    const replyId = req.query.reply
    const content = req.body.content
    ReplyService.modifyReply(token, replyId, content).then(result => {
        msg.sendMsg(res, result)
    }).catch((e) => {
        msg.sendMsg(res, msg.errorMsg(e,'MODIFY REPLY SERVICE UNKNOWN ERROR'))
    })
}

exports.deleteReply = async (req, res) => {
    const token = req.cookies.token
    const replyId = req.query.reply
    ReplyService.deleteReply(token, replyId).then(result => {
        msg.sendMsg(res, result)
    }).catch((e) => {
        msg.sendMsg(res, msg.errorMsg(e,'DELETE REPLY SERVICE UNKNOWN ERROR'))
    })
}