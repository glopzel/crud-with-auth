const express = require('express')
const router = express.Router()
// destructuring, you bring in both at the same time from the same location
const { ensureAuth, ensureGuest } = require('../middleware/auth')
const Story = require('../models/Story');

// @description Login/landing page
// @route GET request to /
// route for login page
router.get('/', ensureGuest, (req, res) => {
    // looks for templates/views called login
    res.render('login', {
        layout: 'login',
    })
})

// @description dashboard
// @route GET /dashboard
router.get('/dashboard', ensureAuth, async (req, res) => {
    try {
        // go into the story and find anything that matches the user id
        const stories = await Story.find({ user: req.user.id }).lean()
        // looks for templates/views called dashboard
        res.render('dashboard', {
            name: req.user.firstName,
            stories
        })
    } catch (err) {
        console.error(err)
        res.render('error/500')
    }
})

module.exports = router