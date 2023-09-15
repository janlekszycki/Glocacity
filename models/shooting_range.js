const mongoose = require('mongoose');

const shootingRangeSchema = new mongoose.Schema({
    title: String,
    piclink: String,
    description: String,
    quote: String,
    address: String,
    streetno: String,
    postcode: String,
    city: String,
    country: String,
    phone: [String],
    email: String,
    website: String,
    line: [String]
});


module.exports = mongoose.model('Shootingrange', shootingRangeSchema);
