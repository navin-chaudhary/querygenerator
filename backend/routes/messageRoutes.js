// backend/routes/messageRoutes.js
const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/messages', authMiddleware, messageController.saveMessage);
router.get('/messages', authMiddleware, messageController.getMessages);

module.exports = router;