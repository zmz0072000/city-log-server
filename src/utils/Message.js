module.exports = {
    // Send a success message and proceed data
    successMsg(data) {
        return {
            code: 20000,
            message: 'success',
            data
        }
    },
    // Send a failure message
    failMsg(message) {
        return {
            code: 0,
            message
        }
    }

}