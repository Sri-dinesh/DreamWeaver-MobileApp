const express = require("express");
const router = express.Router();
const dreamartController = require("../controllers/dreamart.controller");
const verifyToken = require("../middleware/auth.middleware");

router.use(verifyToken);

router.get("/", dreamartController.getDreamArt);
router.post("/upload", dreamartController.uploadDreamArt);
router.post("/generate", dreamartController.generateDreamArt);
router.delete("/:id", dreamartController.deleteDreamArt);

module.exports = router;
