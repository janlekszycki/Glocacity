const express = require('express');
const router = express.Router({ mergeParams: true });
//const Range = require('../models/range');
const catchAsync = require('../utils/catchAsync'); // Async Error Catch Wrapper
const { isLoggedIn, isAuthor, validateRange } = require('../middleware'); // calls middleware functions
const ranges = require('../controllers/ranges'); // calls controllers
const multer = require('multer');
const { storage } = require('../integrations/cloudinary');
const upload = multer({ storage })


router.route('/')
    .get(catchAsync(ranges.index))
    .post(isLoggedIn, upload.array('image'), validateRange, catchAsync(ranges.createRange))

router.get('/new', isLoggedIn, ranges.renderNewForm)

router.route('/:id')
    .get(catchAsync(ranges.showRange))
    .put(isLoggedIn, isAuthor, upload.array('image'), validateRange, catchAsync(ranges.updateRange))
    .delete(isLoggedIn, isAuthor, catchAsync(ranges.deleteRange))

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(ranges.renderEditRange))

module.exports = router;