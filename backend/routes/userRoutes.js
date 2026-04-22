const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { getPreferences, updatePreferences } = require('../controllers/userController');

// @route   GET api/user/preferences
// @desc    Get user preferences
// @access  Private
router.get('/preferences', auth, getPreferences);

// @route   PUT api/user/preferences
// @desc    Update user preferences (including favorites)
// @access  Private
router.put('/preferences', auth, updatePreferences);

module.exports = router;
