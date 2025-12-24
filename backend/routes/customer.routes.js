const router = require("express").Router();
const {
  createCustomer,
  getCustomers,
  getCustomerByPhone,
  updateCustomer,
  deleteCustomer
} = require("../controllers/customer.controller");

router.post("/customers", createCustomer);
router.get("/customers", getCustomers);
router.get("/by-phone/:phone", getCustomerByPhone);

router.put("/customers/:id", updateCustomer);
router.delete("/customers/:id", deleteCustomer);

module.exports = router;
