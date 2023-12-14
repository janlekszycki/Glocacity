if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}
const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const methodOverride = require('method-override');
const morgan = require('morgan');
const ejsMate = require('ejs-mate'); // nice ejs layouts
const ExpressError = require('./utils/ExpressError'); // Custom Error Hanler
const session = require('express-session'); // Sessions
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
// Routes import 
const rangeRoutes = require('./routes/ranges');
const reviewRoutes = require('./routes/reviews');
const userRoutes = require('./routes/users');
const storeRoutes = require('./routes/store');
// 
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const { returnTo, setLocalVars } = require('./middleware'); // calls middleware functions

mongoose.connect(process.env.ATLAS_MONGO_CREDS + process.env.DB_COLLECTION)
    .then(() => {
        console.log('[index.js] CONNECTION TO MONGO CLOUD OPEN!')
        console.log(`[index.js] DATA STORE/COLLECTION: ${process.env.DB_COLLECTION}`)
    })
    .catch(err => {
        console.log('[index.js] CONNECTION TO MONGO CLOUD FAIL!!!')
        console.log(err)
    });

// Setup for views nad ejs
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.engine('ejs', ejsMate);
// To parse form data in POST request body:
app.use(express.urlencoded({ extended: true }));
// Additional methods for browsers
app.use(methodOverride('_method'));
// Glocacity public folders incl. custom css and img
app.use(express.static(path.join(__dirname, 'public')));
// Sanitazation of queries
app.use(mongoSanitize());

const store = MongoStore.create({
    mongoUrl: process.env.ATLAS_MONGO_CREDS + process.env.DB_COLLECTION,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret: process.env.SESSION_SECRET
    }
}); // Store Sessions in MongoDB 

store.on("error", (e) => {
    console.log("SESSION STORE ERROR", e);
})
const sessionCofig = {
    store,
    name: 'pewpew',
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() + 604800000,
        maxAge: 604800000
    }
}; // Session Options

// Sessions Init
app.use(session(sessionCofig));
// Flash messages Init
app.use(flash());
// Security measure
const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
    "https://use.fontawesome.com/",

];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net",

];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
    "https://use.fontawesome.com/",
    "https://kit.fontawesome.com/",
    "https://cdn.jsdelivr.net",

];
const fontSrcUrls = [
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net",

];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dcb1ggwtj/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
                "https://cdn.weatherapi.com/"
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

// Passport authentication Init
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Setting Local Variables
app.use(setLocalVars);

// Middleware supporting develpment
app.use(morgan('dev'));

// Routes Init
app.use('/ranges', rangeRoutes);
app.use('/ranges/:id/reviews', reviewRoutes);
app.use('/', userRoutes);
app.use('/store', storeRoutes);

// Home Page

app.get('/', (req, res) => {
    res.render('home', { pg_title: 'Shooters place to keep track of their excellence - Glocacity' });
});


// // Playing with sessions and making a shoping cart
// app.get('/store', async (req, res) => {
//     res.render('store/index', { pg_title: 'Golocacity Store' });
// });

// 404 route
app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
});

// Error handlig
app.use((err, req, res, next) => {
    const { statusCode = 500, message = 'Internal Server Error' } = err;
    res.status(statusCode).render('error', { status: res.statusCode, pg_title: res.statusCode, err })
})
//
app.listen(process.env.PORT || 5000, () => {
    console.log(`[index.js] EXPRESS APP IS LISTENING ON PORT ${process.env.PORT}!`)
})
