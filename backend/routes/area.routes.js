const router = require("express").Router();
const auth = require("../middleware/auth");
const {getAreas, createArea, updateArea, deleteArea} = require("../controllers/area.controller");

router.get("/area", auth, getAreas);
router.post("/area/create", auth, createArea);
router.put("/area/:id", auth, updateArea);
router.delete("/area/:id", auth, deleteArea);

module.exports = router;
