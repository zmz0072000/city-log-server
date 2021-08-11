const Db = require('../model/Database')
const msg = require('../utils/Message')
require('colors')

// Get: api/city
// Params: ?cityId=1
/**
 * Return information of a city and its trending tickets
 * @param {!number} cityId - id of querying city
 * @returns {Promise<Message>} - Message class to send, code in message shows running result
 */
const getCityInfo = async (cityId) => {
    //undefined check
    if (typeof cityId === 'undefined') {
        return msg.failedMsg('Invalid input format')
    }

    try {
        // city exist check
        const city = await Db.City.findOne({
            attributes: ['name', 'detail'],
            where: {
                id: cityId
            }
        })
        if (typeof city === 'undefined') {
            return msg.failedMsg('get city info failed: city not exist')
        }
        //recent posts
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
    } catch (e) {
        return msg.errorMsg(e,'get city info failed: internal error')
    }
}

/**
 * Query all tickets within a city
 * @param {!number} cityId - id of querying city
 * @param {?boolean} status - status filter
 * @param {?number} priority - priority filter
 * @param {?boolean} isDesc - if true, oldest ticket will be shown first
 * @param {?number} pageNum - number of page to query
 * @returns {Promise<Message>} - Message class to send, code in message shows running result
 */
const getCityTickets = async (cityId, status, priority, isDesc = true, pageNum = 1) => {
    //undefined check
    if (typeof cityId === 'undefined') {
        return msg.failedMsg('Invalid input format')
    }

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
        return msg.errorMsg(e,'get city detail failed: internal error')
    }

}

/**
 * Query information to show on the landing page
 * @returns {Promise<Message>} - Message class to send, code in message shows running result
 */
const getLandingInfo = async () => {
    try {
        const newTickets = await Db.Ticket.findAll({
            attributes: ['id', 'title', 'type', 'priority', 'status', 'rateSum', 'createdAt'],
            order: [['createdAt', 'DESC']],
            limit: 5
        })
        const highestRateTickets = await Db.Ticket.findAll({
            attributes: ['id', 'title', 'type', 'priority', 'status', 'rateSum', 'createdAt'],
            order: [['rateSum', 'DESC'], ['createdAt', 'DESC']],
            limit: 5
        })
        const data = {newTickets, highestRateTickets}
        return msg.successMsg(data, 'get landing page info success')
    } catch (e) {
        msg.errorMsg(e,'get landing page data failed: internal error')
    }
}

module.exports = {getCityInfo, getCityTickets, getLandingInfo}