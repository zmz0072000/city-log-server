const {forceSync} = require('./src/model/Database')

forceSync().then(() => {
    console.log("Force Sync Script finished successfully.")
})