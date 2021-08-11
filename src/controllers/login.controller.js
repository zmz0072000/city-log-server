const UserService = require('../service/user.service')
const msg = require('../utils/Message')
require('colors')

exports.login = async (req, res) => {
    const {email, pwd} = req.body;
    UserService.login(email, pwd).then(result => {
        if (result.code === 200) {
            res.cookie('token',result.data.token)
        }
        msg.sendMsg(res, result)
    }).catch((e) => {
        msg.sendMsg(res, msg.errorMsg(e,'LOGIN SERVICE UNKNOWN ERROR'))
    })
}