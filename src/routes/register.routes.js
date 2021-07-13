const router = require("express").Router()

const registerController = require("../controllers/register.controller")

router.post('/', registerController.register)

module.exports = router