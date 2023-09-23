const ExpressError = require('./utils/ExpressError'); // Custom Error Hanler
const { rangeValidationSchema, reviewValidationSchema } = require('./validation-schemas'); // validation schemas
const Range = require('./models/range');
const Review = require('./models/review');
const User = require('./models/user');

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        //req.session.returnTo = req.originalUrl;
        req.flash('error', 'You need to sign in first');
        return res.redirect('/login');
    }
    next();
}

module.exports.setLocalVars = (req, res, next) => {
    // setting return path after login
    if (req.path == '/login' || req.path == '/register' || req.path == '/logout') {
        if (req.session.returnTo) {
            res.locals.returnTo = req.session.returnTo;
        }
    } else {
        req.session.returnTo = req.originalUrl;
    }
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');

    // showing number of results per page
    // Attention: so far it is global setting
    // Consider evolving to function depending on route in the future

    if (req.query.resperpage) {
        req.session.resperpage = req.query.resperpage
    };
    if (!req.session.resperpage) { req.session.resperpage = 5 }
    res.locals.resperpage = req.session.resperpage

    next();
}


module.exports.validateRange = (req, res, next) => {
    const { error } = rangeValidationSchema.validate(req.body)
    if (error) {
        message = error.details.map(el => el.message).join(', ')
        throw new ExpressError(message, 400);
    } else {
        next();
    }
}

module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params;
    const range = await Range.findById(id);
    if (!range.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/ranges/${id}`);
    }
    next();
}

module.exports.isTheUser = async (req, res, next) => {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user._id.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that! Log in as respective User');
        return res.redirect('/logout');
    }
    next();
}

module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/ranges/${id}`);
    }
    next();
}

module.exports.validateReview = (req, res, next) => {
    const { error } = reviewValidationSchema.validate(req.body)
    if (error) {
        message = error.details.map(el => el.message).join(', ')
        throw new ExpressError(message, 400);
    } else {
        next();
    }

}