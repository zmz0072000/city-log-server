const express = require('express')
const session = require('express-session');
const cors = require('cors')

const app = express()

// App configuration
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

app.use(cors())

// Routes
const loginRoute = require('./routes/login.routes')
const registerRoute = require('./routes/register.routes')
const userRoute = require('./routes/user.routes')
app.use('/api/login', loginRoute)
app.use('/api/register', registerRoute)
app.use('/api/user', userRoute)

module.exports = app