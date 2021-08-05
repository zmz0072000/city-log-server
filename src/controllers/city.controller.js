const CityService = require('../service/city.service')
const msg = require('../utils/Message')
require('colors')

exports.getCity = async (req, res) => {
    const id = req.query.id

    CityService.getCity(id).then(result => {
        msg.sendMsg(res, result)
    }).catch((e) => {
        msg.sendMsg(res, msg.failMsg('CITY SERVICE UNKNOWN ERROR'), e)
    })


}