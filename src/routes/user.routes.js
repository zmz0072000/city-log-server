const Permission = require('../utils/Permission');

const router = require("express").Router()

const userController = require("../controllers/user.controller")

router.get("/", Permission.auth(), userController.getUserInfo)

router.put("/", Permission.auth(), userController.updateUserInfo)

router.put("/pwd/", Permission.auth(), userController.updateUserPwd)

module.exports = router