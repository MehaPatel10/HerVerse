const express = require('express');
const router = express.Router();
const asyncHandler = require('../utils/asyncHandler');
const { listPublishedBlogs, listPublishedFaqs } = require('../controllers/contentController');

router.get('/blogs', asyncHandler(listPublishedBlogs));
router.get('/faqs', asyncHandler(listPublishedFaqs));

module.exports = router;
