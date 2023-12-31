// const Range = require('../models/range');
// const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
// const mapboxToken = process.env.MAPBOX_TOKEN;
// const geocoder = mbxGeocoding({ accessToken: mapboxToken });
// const { cloudinary } = require('../integrations/cloudinary');

module.exports.index = async (req, res) => {
    // const ranges = await Range.find({}).sort('-_id');
    res.render('store/index', { pg_title: 'Store ***' });
};

// module.exports.renderNewForm = (req, res) => {
//     res.render('ranges/new', { pg_title: 'Add New Range' });
// };

// module.exports.createRange = async (req, res, next) => {

//     const range = new Range(req.body.range);
//     const geoData = await geocoder.forwardGeocode({
//         query: range.location,
//         limit: 1
//     }).send();
//     range.geometry = (geoData.body.features[0].geometry);
//     range.author = req.user._id;
//     range.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
//     await range.save();
//     req.flash('success', 'Successfuly created a new shoooting range');
//     res.redirect(`/ranges/${range._id}`);
// }

// module.exports.showRange = async (req, res) => {
//     const range = await Range.findById(req.params.id).populate({
//         path: 'reviews',
//         populate: {
//             path: 'author'
//         }
//     }).populate('author');
//     if (!range) {
//         req.flash('error', 'Cant find that shooting range!');
//         return res.redirect('/ranges');
//     }
//     // Avarage Review Rating and respective Stars Count
//     if (range.reviews.length) {
//         let avgRating = 0;
//         range.reviews.forEach((e) => avgRating += e.rating);
//         range.reviews.avgRating = (avgRating / range.reviews.length).toFixed(1);
//         range.reviews.fullStars = Math.floor(range.reviews.avgRating);
//         range.reviews.halfStars = (range.reviews.avgRating - Math.floor(range.reviews.avgRating) > 0.4) ? 1 : 0;
//         range.reviews.emptyStars = 5 - range.reviews.fullStars - range.reviews.halfStars;
//     }
//     res.render('ranges/show', { pg_title: range.title, range });
// }

// module.exports.renderEditRange = async (req, res) => {
//     const range = await Range.findById(req.params.id);
//     res.render('ranges/edit', { pg_title: `Edit: ${range.title}`, range });
// }

// module.exports.updateRange = async (req, res) => {
//     const range = await Range.findByIdAndUpdate(req.params.id, { ...req.body.range });
//     range.images.push(...req.files.map(f => ({ url: f.path, filename: f.filename })));
//     const geoData = await geocoder.forwardGeocode({
//         query: range.location,
//         limit: 1
//     }).send();
//     range.geometry = (geoData.body.features[0].geometry);
//     await range.save();
//     if (req.body.deleteImages) {
//         for (let filename of req.body.deleteImages) {
//             await cloudinary.uploader.destroy(filename);
//         }
//         await range.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } });
//     }
//     req.flash('success', 'Successfuly updated shoooting range');
//     res.redirect(`/ranges/${range._id}`);
// }

// module.exports.deleteRange = async (req, res) => {
//     const range = await Range.findByIdAndDelete(req.params.id);
//     req.flash('success', 'Successfuly deleted shoooting range');
//     res.redirect('/ranges');
// }



