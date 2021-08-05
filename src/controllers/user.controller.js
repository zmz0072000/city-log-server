const SettingService = require('../service/setting.service')
const msg = require('../utils/Message')
require('colors')

exports.getUserInfo = async (req, res) => {
    const token = req.cookies.token

    SettingService.getUserInfo(token).then(result => {
        msg.sendMsg(res, result)
    }).catch((e) => {
        msg.sendMsg(res, msg.failMsg('GET USER INFO SERVICE UNKNOWN ERROR'), e)
    })
}

exports.updateUserInfo = async (req, res) => {
    const {email, name, city} = req.body
    const token = req.cookies.token

    SettingService.updateUserInfo(token, email, name, city).then(result => {
        if (result.code === 200) {
            res.cookie('token',result.data.token)
        }
        msg.sendMsg(res, result)
    }).catch((e) => {
        msg.sendMsg(res, msg.failMsg('MODIFY USER INFO SERVICE UNKNOWN ERROR'), e)
    })
}

exports.updateUserPwd = async (req, res) => {
    const pwd = req.body.pwd
    const token = req.cookies.token

    SettingService.updateUserPwd(token, pwd).then(result => {
        msg.sendMsg(res, result)
    }).catch((e) => {
        msg.sendMsg(res, msg.failMsg('MODIFY USER PASSWORD SERVICE UNKNOWN ERROR'), e)
    })
}

exports.logout = async (req, res) => {
    res.cookie('token', {expires: Date.now()})
    msg.sendMsg(res, msg.successMsg({},'LOGOUT SUCCESS'))
}