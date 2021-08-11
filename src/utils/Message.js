function Message(code, data, message) {
    this.code = code
    this.data = data
    this.message = message
}

module.exports = {
    Message,
    // Send a success message and proceed data
    successMsg(data = null, message = 'success') {
        return new Message(200, data, message)
    },
    failedMsg(message = 'failed') {
        console.log('[WARNING] FAIL MESSAGE SENT: ' + message)
        return new Message(403, {}, message)
    },
    errorMsg(err, message = 'ERROR') {
        console.log('[ERROR] ERROR MESSAGE SENT: ' + message)
        console.log('REASON: '.red + err.toString())
        return new Message(500, {}, message)
    },
    sendMsg(res, message) {
        res.statusCode = message.code
        res.send(message)
    }
}