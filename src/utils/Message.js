/**
 * Message class that serves as the uniformed format of service return value
 * @param {!number} code - http code of running result
 * @param data - Possible data that will be passed in message
 * @param {!string} message - string message that will be send with data
 * @constructor
 */
function Message(code, data, message) {
    this.code = code
    this.data = data
    this.message = message
}

module.exports = {
    Message,
    /**
     * Send a success message with data
     * @param data - Possible data that will be passed in message
     * @param message - string message that will be send with data
     * @returns {Message} - Message class that serves as the uniformed format of service return value
     */
    successMsg(data = null, message = 'success') {
        return new Message(200, data, message)
    },

    /**
     * Send a FAIL message with data
     * @param message - string message that will be send
     * @returns {Message} - Message class that serves as the uniformed format of service return value
     */
    failedMsg(message = 'failed') {
        console.log('[WARNING] FAIL MESSAGE SENT: ' + message)
        return new Message(403, {}, message)
    },

    /**
     * Send an ERROR message. Content of ERROR will be shown on the console log but not sent with message
     * @param err - Error information
     * @param message - string message that will be send
     * @returns {Message} - Message class that serves as the uniformed format of service return value
     */
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