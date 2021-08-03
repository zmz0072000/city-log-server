function Message(code, data, message) {
    this.code = code
    this.data = data
    this.message = message
}
Message.prototype.toString = function messageToString() {
    return `Message{\n`+
        `Code: ${this.code}\nData: ${JSON.stringify(this.data)}\n`+
        `Message: ${this.message}}`
}

module.exports = {
    // Send a success message and proceed data
    successMsg(data = null, message = 'success') {
        return new Message(200, data, message)
    },
    // Send a failure message
    failMsg(message = 'failed', err) {
        let code = 403
        if (typeof err === 'undefined') {
            console.log('[WARNING] FAIL MESSAGE SENT: '.yellow + message)
        } else {
            code = 500
            console.log('[ERROR] ERROR MESSAGE SENT: '.red + message)
            console.log('REASON: '.red + err)
        }
        return new Message(code, null, message)
    },
    sendMsg(res, message) {
        res.statusCode = message.code
        res.send(message)
    }
}