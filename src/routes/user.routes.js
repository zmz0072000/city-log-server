const Permission = require('../utils/Permission');

const router = require("express").Router()

const userController = require("../controllers/user.controller")

router.get("/", userController.getUserInfo)

router.put("/", userController.updateUserInfo)

router.put("/pwd/", userController.updateUserPwd)

module.exports = router