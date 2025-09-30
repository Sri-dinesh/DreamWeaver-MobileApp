const express = require("express");
const router = express.Router();
const dreamartController = require("../controllers/dreamart.controller");
const verifyToken = require("../middleware/auth.middleware");
const upload = require("../middleware/upload.middleware");

router.use(verifyToken);

router
  .route("/")
  .get(dreamartController.getDreamArt)
  .post(upload.single("image"), dreamartController.uploadDreamArt);
router.route("/:id").delete(dreamartController.deleteDreamArt);
router.route("/generate").post(dreamartController.generateDreamArt);

module.exports = router;
