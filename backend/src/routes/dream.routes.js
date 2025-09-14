
const express = require('express');
const router = express.Router();
const dreamController = require('../controllers/dream.controller');
const verifyToken = require('../middleware/auth.middleware');

router.use(verifyToken);

router.route('/').get(dreamController.getDreams).post(dreamController.createDream);
router
  .route('/:id')
  .get(dreamController.getDreamById)
  .put(dreamController.updateDream)
  .delete(dreamController.deleteDream);

module.exports = router;
