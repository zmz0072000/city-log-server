const ReplyService = require('../service/reply.service')
const msg = require('../utils/Message')
require('colors')

/*router.post('/', replyController.createReply)
router.put('/', replyController.modifyReply)
router.delete('/', replyController.deleteReply)*/

exports.createReply = async (req, res) => {
    const token = req.cookies.token
    const ticketId = req.query.ticket
    const content = req.body.content

    ReplyService.createReply(token, ticketId, content).then(result => {
        msg.sendMsg(res, result)
    }).catch((e) => {
        msg.sendMsg(res, msg.failMsg('CREATE REPLY SERVICE UNKNOWN ERROR'), e)
    })
}

exports.modifyReply = async (req, res) => {
    const token = req.cookies.token
    const replyId = req.query.reply
    const content = req.body.content
    ReplyService.modifyReply(token, replyId, content).then(result => {
        msg.sendMsg(res, result)
    }).catch((e) => {
        msg.sendMsg(res, msg.failMsg('MODIFY REPLY SERVICE UNKNOWN ERROR'), e)
    })
}

exports.deleteReply = async (req, res) => {
    const token = req.cookies.token
    const replyId = req.query.reply
    ReplyService.deleteReply(token, replyId).then(result => {
        msg.sendMsg(res, result)
    }).catch((e) => {
        msg.sendMsg(res, msg.failMsg('DELETE REPLY SERVICE UNKNOWN ERROR'), e)
    })
}