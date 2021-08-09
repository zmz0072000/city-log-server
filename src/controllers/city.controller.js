const CityService = require('../service/city.service')
const msg = require('../utils/Message')
require('colors')

exports.getCityInfo = async (req, res) => {
    const id = req.query.id

    CityService.getCityInfo(id).then(result => {
        msg.sendMsg(res, result)
    }).catch((e) => {
        msg.sendMsg(res, msg.failMsg('CITY INFO SERVICE UNKNOWN ERROR'), e)
    })
}

exports.getCityTickets = async (req, res) => {
    const {id, status, priority, isDesc, pageNum} = req.query
    CityService.getCityTickets(id, status, priority, isDesc, pageNum).then(result => {
        msg.sendMsg(res, result)
    }).catch((e) => {
        msg.sendMsg(res, msg.failMsg('CITY TICKET SERVICE UNKNOWN ERROR'), e)
    })
}