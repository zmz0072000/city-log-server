const Db = require('../model/Database')
const msg = require('../utils/Message')
require('colors')

// Get: api/city
// Params: ?cityId=1

const getCityInfo = async (cityId) => {
    try {
        // city exist check
        const city = await Db.City.findOne({
            attributes: ['name', 'detail'],
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
        return msg.failMsg('get city info failed: internal error', e.toString())
    }
}

const getCityTickets = async (cityId, status, priority, isDesc = true, pageNum = 1) => {
    try {
        let where = {
            CityId: cityId
        }
        if (typeof status !== 'undefined') {
            where.status = status
        }
        if (typeof priority !== 'undefined') {
            where.priority = priority
        }

        let order
        if (isDesc === true) {
            order = [['createdAt', 'DESC']]
        } else {
            order = [['createdAt']]
        }
        console.log('order: '.red+order)
        let offset = (pageNum - 1) * 10
        if (offset < 0) {
            offset = 0
        }
        const cityTickets = await Db.Ticket.findAll({
            where: where,
            attributes: ['id', 'title', 'type', 'priority', 'status', 'rateSum', 'createdAt'],
            include: [
                {model: Db.User, as: 'ticketAuthor', attributes: ['id', 'name']}
            ],
            order: order,
            limit: 10,
            offset: offset

        })

        const cityTicketCount = await Db.Ticket.count({
            where: where
        })
        const totalPage = Math.ceil(cityTicketCount / 10.0)

        const data = {
            totalPage, cityTickets
        }
        return msg.successMsg(data, 'get city tickets success')

    } catch (e) {
        return msg.failMsg('get city detail failed: internal error', e.toString())
    }

}

// const getLandingInfo = async () => {
//     try {
//         const newTickets = await Db.Ticket.findAll({
//             attributes: ['id', 'title', 'type', 'priority', 'status', 'rateSum', 'createdAt'],
//             order: [['createdAt', 'DESC']],
//
//         })
//     } catch (e) {
//         return msg.failMsg('get landing page data failed: internal error', e.toString())
//     }
// }

module.exports = {getCityInfo, getCityTickets}