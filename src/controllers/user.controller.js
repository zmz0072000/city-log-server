const SettingService = require('../service/setting.service')
const msg = require('../utils/Message')
require('colors')

exports.getUserInfo = async (req, res) => {
    const token = req.query.token


    SettingService.getUserInfo(token).then(result => {
        msg.sendMsg(res, result)
    }).catch((e) => {
        msg.sendMsg(res, msg.failMsg('GET USER INFO SERVICE UNKNOWN ERROR'), e)
    })
}

exports.updateUserInfo = async (req, res) => {
    const {email, name, city} = req.body
    const token = req.query.token

    SettingService.updateUserInfo(token, email, name, city).then(result => {
        msg.sendMsg(res, result)
    }).catch((e) => {
        msg.sendMsg(res, msg.failMsg('MODIFY USER INFO SERVICE UNKNOWN ERROR'), e)
    })
}

exports.updateUserPwd = async (req, res) => {
    const pwd = req.body.pwd
    const token = req.query.token

    SettingService.updateUserPwd(token, pwd).then(result => {
        msg.sendMsg(res, result)
    }).catch((e) => {
        msg.sendMsg(res, msg.failMsg('MODIFY USER PASSWORD SERVICE UNKNOWN ERROR'), e)
    })
}