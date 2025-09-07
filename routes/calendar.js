const express = require('express');
const { createEvent, getEvents } = require('../controllers/calendar');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/create', protect, createEvent);
router.get('/', protect, getEvents);

module.exports = router;
