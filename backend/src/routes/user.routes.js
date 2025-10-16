const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const verifyToken = require("../middleware/auth.middleware");

router.use(verifyToken);

router.get("/search", userController.searchUsers);
router.get("/discover", userController.discoverUsers);
router.get("/me", userController.getCurrentUser);

router.get("/:userId", userController.getUserProfile);

router.put("/profile", userController.updateProfile);
router.put("/preferences", userController.updatePreferences);

module.exports = router;
