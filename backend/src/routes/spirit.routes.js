
const express = require('express');
const router = express.Router();
const spiritController = require('../controllers/spirit.controller');
const verifyToken = require('../middleware/auth.middleware');

router.use(verifyToken);

router.route('/chat').get(spiritController.getChatHistory).post(spiritController.sendMessage).delete(spiritController.clearChatHistory);

module.exports = router;
