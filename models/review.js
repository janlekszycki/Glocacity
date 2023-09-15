const mongoose = require('mongoose');
const { Schema } = mongoose;

const reviewSchema = new Schema({
    body: String,
    rating: Number,
    date: Date,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    range: {
        type: Schema.Types.ObjectId,
        ref: 'Range'
    }
})

module.exports = mongoose.model("Review", reviewSchema);