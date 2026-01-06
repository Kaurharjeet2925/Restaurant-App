const router = require("express").Router();
const auth = require("../middleware/auth");
const onlySuperAdmin = require("../middleware/onlySuperAdmin");
const portionCtrl = require("../controllers/portionType.contoller");

// MENU CONFIGURATION (SUPER ADMIN ONLY)
router.get(
  "/portion-types",
  auth,
  onlySuperAdmin,
  portionCtrl.getPortionTypes
);

router.post(
  "/portion-types",
  auth,
  onlySuperAdmin,
  portionCtrl.savePortionType
);

router.put(
  "/portion-types/:id",
  auth,
  onlySuperAdmin,
  portionCtrl.updatePortionType
);

module.exports = router;
