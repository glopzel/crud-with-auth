const express = require('express');
const dotenv = require('dotenv');
const exphbs = require('express-handlebars');
const connectDB = require('./config/db');
const methodOverride = require('method-override');
const morgan = require('morgan');
const MongoStore = require('connect-mongo')
const path = require('path');
const passport = require('passport');
const session = require('express-session')

// load config
dotenv.config({path: './config/config.env'})

// passport config
require('./config/passport')(passport)

connectDB()

const app = express()

// body parser
app.use(express.urlencoded({extended: false}))
app.use(express.json())

// intercept the method POST from the form with something that we want
app.use(methodOverride(function (req, res) {
    // is there a body, is the body an object and did you pass in an override
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        let method = req.body._method
        // we extract the method, put it in a variable and delete it
        delete req.body._method
        return method
    }
}))

// logging
if (process.env.NODE_ENV === 'development') {
    // checks if we are in the dev environment, so we dont have morgan running on prod
    app.use(morgan('dev'))
    // morgan is the one that shows you something like: GET /dashboard 200 143.862 ms - 784
}

// handlebars helpers
const { formatDate, stripTags, truncate, editIcon, select } = require('./helpers/hbs')

// handlebars middleware, templating engine
app.engine('.hbs', exphbs.engine({
    helpers: {
        formatDate,
        stripTags, 
        truncate,
        editIcon,
        select
    },
    // main wraps the body pages, that's where we set the default
    // main has the default layout
    defaultLayout: 'main', 
    extname: '.hbs'
}))
app.set('view engine', '.hbs')

// express session middleware must go before the passport middleware
app.use(session({ // to save info about the session on mongo
    secret: 'middleware cat',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI 
    })
}))

// middleware should go before CRUD methods
// add passport middleware
app.use(passport.initialize())
app.use(passport.session())

// set global variable
// next is to go on, trigger the next middleware to not break the sequence
app.use(function (req, res, next) {
    // with the authentication middleware we can use req.user, it comes frm passport, we assign it the a global variable to use user within our tempaltes
    res.locals.user = req.user
    next()
})

// static folder 
app.use(express.static(path.join(__dirname, 'public')))

// Routes
// login page
app.use('/', require('./routes/index'))
// authentication
app.use('/auth', require('./routes/auth'))
// stories
app.use('/stories', require('./routes/stories'))

const PORT = process.env.PORT || 8000

app.listen(PORT, console.log(`Server running in ${process.env.NODE_ENV} mode on ${PORT}`))
// node_env comes from the scripts in the package.json