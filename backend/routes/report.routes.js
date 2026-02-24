const express = require("express");
const router = express.Router();
const {dailyOrderWiseReport} = require("../controllers/report.controller");

// DAILY ORDER-WISE SALES REPORT
router.get(
  "/reports/daily-order-wise",
  dailyOrderWiseReport	
);

module.exports = router;
