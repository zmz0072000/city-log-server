const UserService = require('../service/user.service')
const msg = require('../utils/Message')
require('colors')

exports.login = async (req, res) => {
    const {email, pwd} = req.body;
    UserService.login(email, pwd).then(result => {
        msg.sendMsg(res, result)
    }).catch((e) => {
        msg.sendMsg(res, msg.failMsg('LOGIN SERVICE UNKNOWN ERROR'), e)
    })
}