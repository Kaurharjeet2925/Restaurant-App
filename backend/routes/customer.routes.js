const router = require("express").Router();
const {
  createCustomer,
  getCustomers,
  updateCustomer,
  deleteCustomer
} = require("../controllers/customer.controller");

router.post("/customers", createCustomer);
router.get("/customers", getCustomers);
router.put("/customers/:id", updateCustomer);
router.delete("/customers/:id", deleteCustomer);

module.exports = router;
