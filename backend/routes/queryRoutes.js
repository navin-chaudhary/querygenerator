const express = require('express');
const router = express.Router();
const queryController = require('../controllers/queryController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/generate-query', authMiddleware, queryController.generateQuery);

module.exports = router;