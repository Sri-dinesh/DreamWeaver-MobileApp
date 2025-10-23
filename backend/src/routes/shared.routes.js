const express = require("express");
const router = express.Router();
const sharedController = require("../controllers/shared.controller");
const verifyToken = require("../middleware/auth.middleware");

router.use(verifyToken);

router.get("/", sharedController.getSharedDreams);
router.get("/:id", sharedController.getSharedDreamById);

module.exports = router;