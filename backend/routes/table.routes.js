const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth")
const {createTable,getTables,updateTable,updateTableStatus,deleteTable} = require("../controllers/table.controller");

router.post("/tables/create", auth, createTable);
router.get("/tables", auth, getTables);
router.put("/tables:id", auth,  updateTable);
router.patch("/tables:id/status", auth, updateTableStatus);
router.delete("/tables:id", auth,  deleteTable);

module.exports = router;
