const Range = require('../models/range');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapboxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapboxToken });
const { cloudinary } = require('../integrations/cloudinary');
const { object } = require('joi');
const reviewStarsAvarage = require('../utils/reviewStarsAvarage');

module.exports.index = async (req, res) => {
    const sortByObj = {};
    let { sortby, sortway, pageno } = req.query;
    if (sortby && sortway) {
        Object.defineProperty(sortByObj, `${sortby}`, { value: `${sortway}`, enumerable: true });
    } else {
        sortByObj._id = 'desc';
    };
    if (!pageno) {
        pageno = 0;
    };
    // if (!resperpage) {
    //     resperpage = 5;
    // }
    const totalResults = await Range.aggregate().count('title');

    const ranges = await Range.find({}, null, { skip: pageno * req.session.resperpage }).sort(sortByObj).limit(req.session.resperpage);
    res.render('ranges/index', { pg_title: 'All Ranges', ranges, pageno, totalresults: totalResults[0].title, sortByObj });
};

module.exports.search = async (req, res) => {
    try {
        let result = await Range.collection.aggregate([
            {
                "$search": {
                    "autocomplete": {
                        "query": `${req.query.query}`,
                        "path": "title",
                        "fuzzy": {
                            "maxEdits": 2,
                            "prefixLength": 3
                        }
                    }
                }
            }
        ]).toArray();
        res.send(result);
    } catch (e) {
        res.status(500).send({ message: e.message });
    }
};

module.exports.renderNewForm = (req, res) => {
    res.render('ranges/new', { pg_title: 'Add New Range' });
};

module.exports.createRange = async (req, res, next) => {

    const range = new Range(req.body.range);
    const geoData = await geocoder.forwardGeocode({
        query: range.location,
        limit: 1
    }).send();
    range.geometry = (geoData.body.features[0].geometry);
    range.author = req.user._id;
    range.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    await range.save();
    req.flash('success', 'Successfuly created a new shoooting range');
    res.redirect(`/ranges/${range._id}`);
}

module.exports.showRange = async (req, res) => {
    const range = await Range.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    if (!range) {
        req.flash('error', 'Cant find that shooting range!');
        return res.redirect('/ranges');
    }

    reviewStarsAvarage(range.reviews);

    res.render('ranges/show', { pg_title: range.title, range });
}

module.exports.renderEditRange = async (req, res) => {
    const range = await Range.findById(req.params.id);
    res.render('ranges/edit', { pg_title: `Edit: ${range.title}`, range });
}

module.exports.updateRange = async (req, res) => {
    const range = await Range.findByIdAndUpdate(req.params.id, { ...req.body.range });
    range.images.push(...req.files.map(f => ({ url: f.path, filename: f.filename })));
    const geoData = await geocoder.forwardGeocode({
        query: range.location,
        limit: 1
    }).send();
    range.geometry = (geoData.body.features[0].geometry);
    await range.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await range.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } });
    }
    req.flash('success', 'Successfuly updated shoooting range');
    res.redirect(`/ranges/${range._id}`);
}

module.exports.deleteRange = async (req, res) => {
    const range = await Range.findByIdAndDelete(req.params.id);
    req.flash('success', 'Successfuly deleted shoooting range');
    res.redirect('/ranges');
}



