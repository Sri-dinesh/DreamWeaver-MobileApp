const express = require("express");
const router = express.Router();
const sharedController = require("../controllers/shared.controller");
const verifyToken = require("../middleware/auth.middleware");

router.use(verifyToken);

router.get("/", sharedController.getPublicDreams);
router.get("/:id", sharedController.getSharedDreamById);

module.exports = router;
