const Permission = require('../utils/Permission');

const router = require("express").Router()

const userController = require("../controllers/user.controller")

router.get("/", Permission.auth(), userController.getUserInfo)

router.put("/", Permission.auth(), userController.updateUserInfo)

module.exports = router