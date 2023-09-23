const User = require('../models/user');
const Range = require('../models/range');
const Review = require('../models/review');
const { cloudinary } = require('../integrations/cloudinary');
const { welcome, verifyEmail } = require('../integrations/sendgrid');
const { createHash } = require('crypto');


module.exports.renderRegistrationForm = async (req, res) => {
    res.render('users/register', { pg_title: 'Glocacity: New User Registration' });
}

module.exports.registerUser = async (req, res) => {
    try {
        const { username, email, password, firstname } = req.body;
        const { path, filename } = req.files[0];
        const avatar = { url: path, filename: filename };
        const user = new User({ email, username, firstname, avatar });
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if (err) return next(err);
            welcome(email, firstname);
            req.flash('success', `${firstname}, Welcome to Glocacity`);
            res.redirect('/');
        })
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('/register');
    }
}

module.exports.renderLoginForm = async (req, res) => {
    res.render('users/login', { pg_title: 'Glocacity: Login' });
}

module.exports.loginUser = async (req, res) => {
    req.flash('success', `You have logged in, ${req.user.firstname}`);
    const redirectUrl = res.locals.returnTo || '/';
    res.redirect(redirectUrl);
}

module.exports.logoutUser = (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.flash('success', 'You have been logged out');
        const redirectUrl = res.locals.returnTo || '/';
        res.redirect(redirectUrl);
    });
}

module.exports.renderEditUserDetails = async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) {
        req.flash('error', 'Cant find the user!');
        return res.redirect('/login');
    }
    res.render('users/edit', { pg_title: `Glocacity: Edit User: ${req.user.firstname}`, user })
}

module.exports.updateUserDetails = async (req, res) => {
    const user = await User.findByIdAndUpdate(req.params.id, { ...req.body.user });
    if (req.files[0]) {
        if (req.user.avatar.filename) {
            await cloudinary.uploader.destroy(req.user.avatar.filename);
        }
        const { path, filename } = req.files[0];
        user.avatar = { url: path, filename: filename };
    }
    await user.save();
    req.flash('success', 'Successfuly updated User');
    res.redirect(`/user/${user._id}/edit`);
}

module.exports.changePassword = async (req, res) => {
    const user = await User.findById(req.params.id);
    if (req.body.newpassword == req.body.renewpassword) {
        try {
            await user.changePassword(req.body.oldpassword, req.body.newpassword);
            req.flash('success', 'Successfuly changed password');
        } catch (e) {
            req.flash('error', 'Password or username is incorrect');
        }
    } else {
        req.flash('error', 'New password does not match');
    }
    res.redirect(`/user/${user._id}/edit`);
}

module.exports.renderListings = async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) {
        req.flash('error', 'Cant find the user!');
        return res.redirect('/login');
    }
    const ranges = await Range.find({ author: user.id }).sort('-_id')
        .populate({
            path: 'reviews'
        });

    res.render('users/listings', { pg_title: `Glocacity listings of ${req.user.firstname}`, user, ranges })
}

module.exports.renderReviews = async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) {
        req.flash('error', 'Cant find the user!');
        return res.redirect('/login');
    }
    const reviews = await Review.find({ author: user.id }).populate('author').populate('range');
    res.render('users/reviews', { pg_title: `Reviews of ${req.user.firstname}`, user, reviews })
}

module.exports.sendVerification = async (req, res) => {
    try {
        const verificationHash = createHash('sha256').update(`${Math.floor(Math.random() * 1000)}`).digest('hex');
        const hashValidity = (Date.now() + (24 * 60 * 60 * 1000));
        const user = await User.findByIdAndUpdate(req.params.id, {
            $set: {
                "isverified.hash": verificationHash,
                "isverified.hashvalidity": hashValidity
            }
        });
        verifyEmail(user.email, user.firstname, `http://${req.hostname}/verifylink?u=${user._id}&h=${verificationHash}`);
        req.flash('success', `E-mail with verification link hase been send to ${user.email}. Please follow instructions in it.`);
        res.redirect(`/user/${user._id}/edit`);

    } catch (e) {
        req.flash('error', e.message);
        res.redirect(`/user/${user._id}/edit`);
    }
}

module.exports.verifylink = async (req, res) => {
    if (!req.query.u && !req.query.h) {
        res.redirect('/');
    }
    const user = await User.findOne({ _id: req.query.u });
    const dateNow = Date.now();

    if (user.isverified.hash == req.query.h && user.isverified.hashvalidity > dateNow && !user.isverified.status) {
        const verifiedUser = await user.updateOne({ "isverified.status": true });
        req.flash('success', `Your profile has been successfully verified.`);
    } else {
        req.flash('error', `Invalid or expired veryification link.`);
    }
    res.redirect(`/user/${user._id}/edit`);




}