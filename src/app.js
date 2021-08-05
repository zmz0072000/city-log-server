const express = require('express')
const cookieParser = require('cookie-parser')
//const cors = require('cors')

const app = express()

// App configuration
app.use(cookieParser())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));


//fixme: I have no idea why cors should be here. Maybe it shouldn't?
//app.use(cors())

// Routes
const loginRoute = require('./routes/login.routes')
const registerRoute = require('./routes/register.routes')
const userRoute = require('./routes/user.routes')
const ticketRoute = require('./routes/ticket.routes')
const replyRoute = require('./routes/reply.routes')
const cityRoute = require('./routes/city.routes')

//const publicRoute = require('./routes/public.routes')
app.use('/api/login', loginRoute)
app.use('/api/register', registerRoute)
app.use('/api/user', userRoute)
app.use('/api/ticket', ticketRoute)
app.use('/api/reply', replyRoute)
app.use('/api/city', cityRoute)
//app.use('/api/public', publicRoute)

module.exports = app