const GoggleStrategy = require('passport-google-oauth20');
const mongoose = require('mongoose');
const User = require('../models/User')

module.exports = function(passport) {
    passport.use(new GoggleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_SECRET,
        callbackURL: '/auth/google/callback'
    },
    async (accessToken, refreshToken, profile, done) => {
        // profile returns the id, displayName, the name as familyName and givenName and the photo

        // construct new User object
        const newUser = {
            googleId: profile.id,
            displayName: profile.displayName,
            firstName: profile.name.givenName,
            lastName: profile.name.familyName,
            image: profile.photos[0].value
        }
 
        try {
            // check in the database if the user already exists
            let user = await User.findOne({ googleId: profile.id })

            console.log('made it here')
            if (user) {
                // if the user exists throw an error
                done(null, user)
            } else {
                user = await User.create(newUser)
                done(null, user)
            }
        } catch (err) {
            console.error(err)
        }
    }))

    // serialized and deserialized user
    // maybe change this to arrow functions
    passport.serializeUser(function (user, done) {
        done(null, user.id)
    })
    // maybe change this to arrow functions
    passport.deserializeUser(function (id, done) {
        // this could also be an arrow function
        User.findById(id, function (err, user) {
            done(err, user)
        })
    })
}