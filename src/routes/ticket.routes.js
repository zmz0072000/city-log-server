const router = require("express").Router()

const ticketController = require("../controllers/ticket.controller")

router.post('/', ticketController.createTicket)
router.get('/', ticketController.getTicket)
router.put('/', ticketController.modifyTicket)
router.put('/vote/', ticketController.voteTicket)
router.delete('/', ticketController.deleteTicket)

module.exports = router