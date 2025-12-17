const router = require("express").Router();
const {getAreas, createArea, updateArea, deleteArea} = require("../controllers/area.controller");

router.get("/area", getAreas);
router.post("/area/create", createArea);
router.put("/area/:id", updateArea);
router.delete("/area/:id", deleteArea);

module.exports = router;
