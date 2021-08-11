const UserService = require('../service/user.service')
const msg = require('../utils/Message')
require('colors')

exports.register = async (req, res) => {
    const { email, pwd, name, city } = req.body
    UserService.register(email, pwd, name, city).then(result => {
        msg.sendMsg(res, result)
    }).catch((e) => {
        msg.sendMsg(res, msg.errorMsg(e,'REGISTER SERVICE UNKNOWN ERROR'))
    })
}