const express = require('express');
const { createChallenge, getChallenges } = require('../controllers/challenge.js');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/create', protect, createChallenge);
router.get('/', protect, getChallenges);

module.exports = router;
