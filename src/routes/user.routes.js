const Permission = require('../utils/Permission');

const router = require("express").Router()

const userController = require("../controllers/user.controller")

//改成"/setting/"
router.get("/", userController.getUserInfo)

//改成"/setting/"
router.put("/", userController.updateUserInfo)

//TODO：增加"/tickets/"


router.put("/pwd/", userController.updateUserPwd)

router.post('/logout/', userController.logout)

module.exports = router