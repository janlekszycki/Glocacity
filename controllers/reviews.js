const Range = require('../models/range');
const Review = require('../models/review');

module.exports.postReview = async (req, res) => {
    const range = await Range.findById(req.params.id);
    const review = new Review(req.body.review);
    review.date = Date.now();
    review.author = req.user._id;
    review.range = range.id;
    range.reviews.push(review);
    await review.save();
    await range.save();
    req.flash('success', 'Thank you for review');
    res.redirect(`/ranges/${range._id}`);
}

module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params;
    const range = await Range.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    const review = await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Review has been deleted');
    res.redirect(`/ranges/${range._id}`);
}