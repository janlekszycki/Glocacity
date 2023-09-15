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

module.exports.storeReturnToV2 = (req, res, next) => {
    if (req.path != '/login') {
        req.session.returnTo = req.originalUrl;
    } else {
        if (req.session.returnTo) {
            res.locals.returnTo = req.session.returnTo;
        }
    }
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