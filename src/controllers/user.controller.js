const SettingService = require('../service/setting.service')
const msg = require('../utils/Message')
require('colors')

exports.getUserInfo = async (req, res) => {
    const token = req.cookies.token

    SettingService.getUserInfo(token).then(result => {
        msg.sendMsg(res, result)
    }).catch((e) => {
        msg.sendMsg(res, msg.errorMsg(e,'GET USER INFO SERVICE UNKNOWN ERROR'))
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
        msg.sendMsg(res, msg.errorMsg(e,'MODIFY USER INFO SERVICE UNKNOWN ERROR'))
    })
}

exports.updateUserPwd = async (req, res) => {
    const pwd = req.body.pwd
    const token = req.cookies.token

    SettingService.updateUserPwd(token, pwd).then(result => {
        msg.sendMsg(res, result)
    }).catch((e) => {
        msg.sendMsg(res, msg.errorMsg(e,'MODIFY USER PASSWORD SERVICE UNKNOWN ERROR'))
    })
}

exports.getUserTickets = async (req, res) => {
    const token = req.cookies.token
    const pageNum = req.query.pageNum

    SettingService.getUserTickets(token, pageNum).then(result => {
        msg.sendMsg(res, result)
    }).catch((e) => {
        msg.sendMsg(res, msg.errorMsg(e,'GET USER TICKETS SERVICE UNKNOWN ERROR'))
    })
}

exports.getUserReplies = async (req, res) => {
    const token = req.cookies.token
    const pageNum = req.query.pageNum

    SettingService.getUserReplies(token, pageNum).then(result => {
        msg.sendMsg(res, result)
    }).catch((e) => {
        msg.sendMsg(res, msg.errorMsg(e,'GET USER REPLIES SERVICE UNKNOWN ERROR'))
    })
}

exports.sendRecoverEmail = async (req, res) => {
    const {email} = req.body;

    SettingService.sendRecoverEmail(email).then(result => {
        msg.sendMsg(res, result)
    }).catch((e) => {
        msg.sendMsg(res, msg.errorMsg(e,'SEND RECOVER EMAIL SERVICE UNKNOWN ERROR'))
    })
}

exports.recoverPwd = async (req, res) => {
    const {token, pwd} = req.body;
    SettingService.recoverPwd(token, pwd).then(result => {
        msg.sendMsg(res, result)
    }).catch((e) => {
        msg.sendMsg(res, msg.errorMsg(e,'RECOVER PASSWORD SERVICE UNKNOWN ERROR'))
    })
}

exports.logout = async (req, res) => {
    res.cookie('token', {expires: Date.now()})
    msg.sendMsg(res, msg.successMsg({},'LOGOUT SUCCESS'))
}