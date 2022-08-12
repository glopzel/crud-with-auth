const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // connection variable, await for the promise
        const conn = await mongoose.connect(process.env.MONGO_URI)
        // other properties are no longer needed, like the addition of useNewUrlParser, useUnifiedTopology or useFindAndModify
        console.log(`mongoDB connected ${conn.connection.host}`)
    } catch(err) {
        console.error(err)
        // stop process
        // 1: exit with failure
        process.exit(1)
    }
}

module.exports = connectDB