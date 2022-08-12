const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
    googleId: {
        type: String,
        required: true
    },
    displayName: {
        type: String,
        required: true
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    image: {
        type: String
        // if there is no imag there will be a broken image link, it wont break the app but it wont look the best 
    },
    createdAt: {
        type: Date,
        defaulte: Date.now
    }
})

module.exports = mongoose.model('User', UserSchema)