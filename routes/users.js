const express = require('express');
const router = express.Router({ mergeParams: true });
const catchAsync = require('../utils/catchAsync'); // Async Error Catch Wrapper
const { isLoggedIn, isTheUser } = require('../middleware'); // calls middleware functions
const passport = require('passport');
const users = require('../controllers/users');
const multer = require('multer');
const { storage } = require('../integrations/cloudinary');
const upload = multer({ storage })


router.route('/register')
    .get(catchAsync(users.renderRegistrationForm))
    .post(upload.array('avatar'), catchAsync(users.registerUser));

router.route('/login')
    .get(catchAsync(users.renderLoginForm))
    .post(passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }), catchAsync(users.loginUser));

router.get('/logout', users.logoutUser);

router.route('/user/:id')
    //    .get(isLoggedIn, isTheUser, catchAsync(users.renderUserDetails))
    .put(isLoggedIn, isTheUser, upload.array('newavatar'), catchAsync(users.updateUserDetails));

router.get('/user/:id/edit', isLoggedIn, isTheUser, catchAsync(users.renderEditUserDetails));

router.route('/user/:id/changepassword')
    .put(isLoggedIn, isTheUser, catchAsync(users.changePassword));

router.route('/user/:id/listings')
    .get(isLoggedIn, isTheUser, catchAsync(users.renderListings));

router.route('/user/:id/reviews')
    .get(isLoggedIn, isTheUser, catchAsync(users.renderReviews));

router.route('/user/:id/verify')
    .post(isLoggedIn, isTheUser, catchAsync(users.sendVerification));

router.get('/verifylink', users.verifylink);

module.exports = router;