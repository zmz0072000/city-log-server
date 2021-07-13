const app = require('./src/app')
require('dotenv').config()

const port = process.env.PORT

app.listen(port, () => {
    console.log('Application running on the port: ', port)
})