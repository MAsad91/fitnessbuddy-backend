const express = require('express');
const { createPost, getPosts } = require('../controllers/community.js');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/create', protect, createPost);
router.get('/', protect, getPosts);

module.exports = router;
