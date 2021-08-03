const UserService = require('../service/user.service')
const msg = require('../utils/Message')
require('colors')

exports.register = async (req, res) => {
    const { email, pwd, name, city } = req.body
    console.log('register: '.green+JSON.stringify({ email, pwd, name, city }))
    UserService.register(email, pwd, name, city).then(result => {
        msg.sendMsg(res, result)
    }).catch((e) => {
        msg.sendMsg(res, msg.failMsg('REGISTER SERVICE UNKNOWN ERROR'), e)
    })
}