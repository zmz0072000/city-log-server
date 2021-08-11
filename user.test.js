const UserService = require('./src/service/user.service')
const SettingService = require('./src/service/setting.service')
const TicketService = require('./src/service/ticket.service')
const ReplyService = require('./src/service/reply.service')
const CityService = require('./src/service/city.service')
const SUCCESS = 200
const FAIL = 403

let currentToken = ''
let message = null



test('1: user', async () => {
    //0 Force Sync
    const {forceSync} = require('./src/model/Database')
    await forceSync()

    // 1.1.1 Register
    message = await UserService.register('email1','pwd1','name1','1')
    expect(message.code).toBe(SUCCESS)

    //1.1.2 Register existed user
    message = await UserService.register('email1','pwd1','name1','1')
    expect(message.code).toBe(FAIL)

    // 1.2.1 Login
    message = await UserService.login('email1','pwd1')
    expect(message.code).toBe(SUCCESS)
    currentToken = message.data.token

    // 1.2.2 Login with wrong pwd
    message = await UserService.login('email1','wrongpwd')
    expect(message.code).toBe(FAIL)

    // 1.3.1 Change user settings and get again
    message = await SettingService.getUserInfo(currentToken)
    expect(message.code).toBe(SUCCESS)
    expect(message.data.email).toBe('email1')

    // 1.3.2 Change user settings and get again
    message = await SettingService.updateUserInfo(currentToken, undefined, 'name2', undefined)
    expect(message.code).toBe(SUCCESS)
    message = await SettingService.getUserInfo(currentToken)
    expect(message.code).toBe(SUCCESS)
    expect(message.data.name).toBe('name2')

    // 1.4.1 Change user email and check new token
    const oldToken = currentToken
    message = await SettingService.updateUserInfo(currentToken, 'email2', undefined, undefined)
    expect(message.code).toBe(SUCCESS)
    currentToken = message.data.token
    message = await SettingService.getUserInfo(oldToken)
    expect(message.code).toBe(FAIL)
    message = await SettingService.getUserInfo(currentToken)
    expect(message.code).toBe(SUCCESS)
    expect(message.data.email).toBe('email2')
})


test('2: ticket', async () => {
    //0 Force Sync
    const {forceSync} = require('./src/model/Database')
    await forceSync()

    // 2.1.1 Create ticket and get it
    message = await UserService.register('email1','pwd1','name1','1')
    expect(message.code).toBe(SUCCESS)
    message = await UserService.login('email1','pwd1')
    expect(message.code).toBe(SUCCESS)
    currentToken = message.data.token

    message = await TicketService.createTicket(currentToken, 'title', 1, 0.5, 0.5, 'very good content', 1, 1, true)
    expect(message.code).toBe(SUCCESS)

    message = await TicketService.getTicket(1)
    expect(message.code).toBe(SUCCESS)
    expect(message.data.title).toBe('title')
    expect(message.data.lat).toBe(0.5)

    // 2.1.2 Create ticket without enough info
    message = await TicketService.createTicket(currentToken, 'title', 1, undefined, 0.5, 'very good content', 1, 1, true)
    expect(message.code).toBe(FAIL)

    // 2.1.2 Modify ticket
    message = await TicketService.modifyTicket(currentToken, 1, undefined, undefined, undefined, undefined, 'new content', undefined, undefined, false)
    expect(message.code).toBe(SUCCESS)
    message = await TicketService.getTicket(1)
    expect(message.code).toBe(SUCCESS)
    expect(message.data.content).toBe('new content')
    expect(message.data.status).toBe(false)

    // 2.2.1 Get rate
    message = await TicketService.getTicket(1)
    expect(message.code).toBe(SUCCESS)
    expect(message.data.rateSum).toBe(0)

    // 2.2.2 Vote rate from ticket author
    message = await TicketService.voteTicket(currentToken, 1, 1)
    expect(message.code).toBe(FAIL)

    //create user 2
    message = await UserService.register('email2','pwd1','name2','1')
    expect(message.code).toBe(SUCCESS)
    message = await UserService.login('email2','pwd1')
    expect(message.code).toBe(SUCCESS)
    currentToken = message.data.token

    // 2.2.3 Vote and get new rate
    message = await TicketService.voteTicket(currentToken, 1, 1)
    expect(message.code).toBe(SUCCESS)
    message = await TicketService.getTicket(1)
    expect(message.code).toBe(SUCCESS)
    expect(message.data.rateSum).toBe(1)

    // 2.3.1 Delete ticket with user 2 (not author)
    message = await TicketService.deleteTicket(currentToken, 1)
    expect(message.code).toBe(FAIL)

    //Login user 1
    message = await UserService.login('email1','pwd1')
    expect(message.code).toBe(SUCCESS)
    currentToken = message.data.token
    // 2.3.2 Delete ticket with author
    message = await TicketService.deleteTicket(currentToken, 1)
    expect(message.code).toBe(SUCCESS)
    message = await TicketService.getTicket(1)
    expect(message.code).toBe(FAIL)
})

test('3: reply', async () => {
    //0 Force Sync
    const {forceSync} = require('./src/model/Database')
    await forceSync()

    //create login user 1
    message = await UserService.register('email1','pwd1','name1','1')
    expect(message.code).toBe(SUCCESS)
    message = await UserService.login('email1','pwd1')
    expect(message.code).toBe(SUCCESS)
    currentToken = message.data.token

    //create ticket
    message = await TicketService.createTicket(currentToken, 'title', 1, 0.5, 0.5, 'very good content', 1, 1, true)
    expect(message.code).toBe(SUCCESS)

    // 3.1.0 create reply with undefined id
    message = await ReplyService.createReply(currentToken, undefined, 'some reply')
    expect(message.code).toBe(FAIL)

    // 3.1.1 create reply
    message = await ReplyService.createReply(currentToken, 1, 'some reply')
    expect(message.code).toBe(SUCCESS)

    // 3.1.2 check reply
    message = await TicketService.getTicket(1)
    expect(message.code).toBe(SUCCESS)
    expect(message.data.Replies[0].content).toBe('some reply')
    expect(message.data.Replies[0].replyAuthor.name).toBe('name1')

    // 3.1.3 modify reply
    const replyId = message.data.Replies[0].id
    await ReplyService.modifyReply(currentToken, replyId, 'new reply')
    message = await TicketService.getTicket(1)
    expect(message.code).toBe(SUCCESS)
    expect(message.data.Replies[0].content).toBe('new reply')

    // 3.1.4 modify/delete reply with other people
    //create user 2
    message = await UserService.register('email2','pwd1','name2','1')
    expect(message.code).toBe(SUCCESS)
    message = await UserService.login('email2','pwd1')
    expect(message.code).toBe(SUCCESS)
    currentToken = message.data.token
    message = await ReplyService.modifyReply(currentToken, replyId, 'new reply 2')
    expect(message.code).toBe(FAIL)
    message = await ReplyService.deleteReply(currentToken, replyId)
    expect(message.code).toBe(FAIL)

    //Login user 1
    message = await UserService.login('email1','pwd1')
    expect(message.code).toBe(SUCCESS)
    currentToken = message.data.token
    message = await ReplyService.deleteReply(currentToken, replyId)
    expect(message.code).toBe(SUCCESS)

    //see if deleted
    message = await TicketService.getTicket(1)
    expect(message.code).toBe(SUCCESS)
    expect(message.data.Replies[0]).toBe(undefined)


})

test('4: history & city', async () => {
    //0 Force Sync
    const {forceSync} = require('./src/model/Database')
    await forceSync()

    //create login user 1
    message = await UserService.register('email1','pwd1','name1','1')
    expect(message.code).toBe(SUCCESS)
    message = await UserService.login('email1','pwd1')
    expect(message.code).toBe(SUCCESS)
    currentToken = message.data.token

    //create 3 ticket
    message = await TicketService.createTicket(currentToken, 'title1', 1, 0.5, 0.5, 'very good content', 1, 1, true)
    expect(message.code).toBe(SUCCESS)
    message = await TicketService.createTicket(currentToken, 'title2', 1, 0.5, 0.5, 'very good content', 2, 3, true)
    expect(message.code).toBe(SUCCESS)
    message = await TicketService.createTicket(currentToken, 'title3', 1, 0.5, 0.5, 'very good content', 2, 3, true)
    expect(message.code).toBe(SUCCESS)

    //create 4 replies
    message = await ReplyService.createReply(currentToken, 1, 'reply1')
    expect(message.code).toBe(SUCCESS)
    message = await ReplyService.createReply(currentToken, 1, 'reply2')
    expect(message.code).toBe(SUCCESS)
    message = await ReplyService.createReply(currentToken, 1, 'reply3')
    expect(message.code).toBe(SUCCESS)
    message = await ReplyService.createReply(currentToken, 1, 'reply4')
    expect(message.code).toBe(SUCCESS)

    //4.1.1 Get user tickets history
    message = await SettingService.getUserTickets(currentToken)
    expect(message.code).toBe(SUCCESS)
    const tickets = message.data.userTickets
    expect(tickets.length).toBe(3)

    //4.1.2 Get user replies history
    message = await SettingService.getUserReplies(currentToken)
    expect(message.code).toBe(SUCCESS)
    const replies = message.data.userReplies
    expect(replies.length).toBe(4)

    //4.2.1 Get city recent post
    message = await CityService.getCityInfo(1)
    expect(message.data.city.name).toBe("San Francisco")
    expect(message.data.recentTickets[0].title).toBe('title3')

    //4.3.1 Get city new tickets from landing page
    message = await CityService.getLandingInfo()
    expect(message.data.newTickets[0].title).toBe('title3')

    //4.4.1 Test city tickets list filter
    //3 tickets finished
    message = await CityService.getCityTickets(1, true, undefined, undefined, undefined)
    expect(message.data.cityTickets.length).toBe(3)

    //2 tickets with priority 3
    message = await CityService.getCityTickets(1, undefined, 3, undefined, undefined)
    expect(message.data.cityTickets.length).toBe(2)
})


