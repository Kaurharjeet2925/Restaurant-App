const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const allowAdminAndOwner = require("../middleware/allowAdminAndOwner");
const {salesReport} = require("../controllers/report.controller");

// DAILY ORDER-WISE SALES REPORT
router.get(
  "/reports/sales-report", auth, allowAdminAndOwner,
  salesReport	
);

module.exports = router;
