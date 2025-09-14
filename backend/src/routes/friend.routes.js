
const express = require('express');
const router = express.Router();
const friendController = require('../controllers/friend.controller');
const verifyToken = require('../middleware/auth.middleware');

router.use(verifyToken);

router.post('/request/:receiverId', friendController.sendFriendRequest);
router.post('/accept/:requestId', friendController.acceptFriendRequest);
router.post('/reject/:requestId', friendController.rejectFriendRequest);

router.get('/', friendController.getFriends);
router.get('/requests/sent', friendController.getSentFriendRequests);
router.get('/requests/received', friendController.getReceivedFriendRequests);

module.exports = router;
