const Db = require('../model/Database')
const msg = require('../utils/Message')
require('colors')

// Get: api/city
// Params: ?cityId=1

const getCity = async (cityId) => {
    try {
        // city exist check
        const city = await Db.City.findOne({
            where: {
                id: cityId
            }
        })
        if (typeof city === 'undefined') {
            return msg.failMsg('get city error: city not exist')
        }

        const recentTickets = await Db.Ticket.findAll({
            attributes: ['id', 'title', 'createdAt'],
            include: [
                {model: Db.User, as: 'ticketAuthor', attributes: ['id', 'name']}
            ],
            order: [['createdAt', 'DESC']],
            limit: 3
        })

        const data = {city, recentTickets}

        return msg.successMsg(data, 'get city success')

        //recent posts
    } catch (e) {
        return msg.failMsg('get city failed: internal error', e.toString())
    }


}

module.exports = {getCity}