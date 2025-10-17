const express = require("express");
const router = express.Router();
const friendController = require("../controllers/friend.controller");
const verifyToken = require("../middleware/auth.middleware");

router.use(verifyToken);

// Friend request operations
router.post("/request/:receiverId", friendController.sendFriendRequest);
router.delete("/request/:requestId", friendController.cancelFriendRequest);

// Friend request actions
router.post("/accept/:requestId", friendController.acceptFriendRequest);
router.post("/reject/:requestId", friendController.rejectFriendRequest);

// Get friends and requests
router.get("/", friendController.getFriends);
router.get("/status/:otherUserId", friendController.checkFriendStatus);
router.get("/requests/sent", friendController.getSentFriendRequests);
router.get("/requests/received", friendController.getReceivedFriendRequests);

module.exports = router;
