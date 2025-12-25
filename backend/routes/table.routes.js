const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth")
const {createTable,getTables,updateTable,updateTableStatus,deleteTable, occupyTable, getTableById} = require("../controllers/table.controller");

router.post("/tables/create", auth, createTable);
router.get("/tables", auth, getTables);
router.get("/tables/:id", auth,  getTableById);
router.put("/tables/:id", auth,  updateTable);
router.patch("/tables/:id/status", auth, updateTableStatus);
router.delete("/tables/:id", auth,  deleteTable);
router.patch("/tables/:id/occupy", auth, occupyTable);
module.exports = router;
