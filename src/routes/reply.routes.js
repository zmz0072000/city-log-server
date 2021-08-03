const router = require("express").Router()

const replyController = require("../controllers/reply.controller")

router.post('/', replyController.createReply)
router.put('/', replyController.modifyReply)
router.delete('/', replyController.deleteReply)

module.exports = router