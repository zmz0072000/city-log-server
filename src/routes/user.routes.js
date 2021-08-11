const Permission = require('../utils/Permission');

const router = require("express").Router()

const userController = require("../controllers/user.controller")

//改成"/setting/"
router.get("/setting/", userController.getUserInfo)

//改成"/setting/"
router.put("/setting/", userController.updateUserInfo)

router.get("/tickets/", userController.getUserTickets)

router.get("/replies/", userController.getUserReplies)

router.put("/pwd/", userController.updateUserPwd)

router.post('/logout/', userController.logout)

router.post('/sendRecover/', userController.sendRecoverEmail)

router.put('/recoverPwd/', userController.recoverPwd)

module.exports = router