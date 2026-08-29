const express = require('express');
const {
  getAccounts,
  getTimeline,
  getBudget,
  getInsights
} = require('../controllers/analyticsController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/accounts', getAccounts);
router.get('/timeline', getTimeline);
router.get('/budget', getBudget);
router.get('/insights', getInsights);

module.exports = router;
