const express = require('express')
const passport = require('passport')
const router = express.Router()

// @description tuthenticate with Goggle
// @route GET request to /auth/google
router.get('/google', passport.authenticate('google', { scope: ['profile']}))

// @description google auth callback
// @route GET /auth/google/callback
router.get('/google/callback', passport.authenticate('google', {failureRedirect: '/'}), (req, res) => {
    res.redirect('/dashboard')
})
// if there is an error in login we redirect so the user is not trapped, we route them back. If it is successful it gets passed to the dashboard

// @desc logout user
// @route /auth/logout
router.get('/logout', (req, res, next) => {
    req.logout(function(err) {
        if (err) {return next(err)}
        res.redirect('/')
    })
})

module.exports = router