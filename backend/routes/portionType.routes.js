const router = require("express").Router();
const auth = require("../middleware/auth");
const onlyAdmin = require("../middleware/onlyAdmin");
const portionCtrl = require("../controllers/portionType.contoller");
const allowAdminAndOwner = require("../middleware/allowAdminAndOwner");

// MENU CONFIGURATION (SUPER ADMIN ONLY)
router.get(
  "/portion-types",
  auth,
  allowAdminAndOwner,
  portionCtrl.getPortionTypes
);

router.post(
  "/portion-types",
  auth,
  allowAdminAndOwner,
  portionCtrl.savePortionType
);

router.put(
  "/portion-types/:id",
  auth,
  allowAdminAndOwner  ,
  portionCtrl.updatePortionType
);

module.exports = router;
