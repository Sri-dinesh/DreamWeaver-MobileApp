const express = require("express");
const router = express.Router();
const dreamController = require("../controllers/dream.controller");
const verifyToken = require("../middleware/auth.middleware");

router.use(verifyToken);

// Static routes first
router.get("/stats", dreamController.getDreamStats);
router.post("/search", dreamController.searchDreams);
router.post("/:id/analyze", dreamController.analyzeDream);

// Then parameterized routes
router
  .route("/:id")
  .get(dreamController.getDreamById)
  .put(dreamController.updateDream)
  .delete(dreamController.deleteDream);

// Finally the root route
router
  .route("/")
  .get(dreamController.getDreams)
  .post(dreamController.createDream);

module.exports = router;
