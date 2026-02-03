const router = require("express").Router();

const {
  createCustomer,
  getCustomers,
  getCustomerByPhone,
  updateCustomer,
  deleteCustomer,
  getCreditCustomers,
  getCustomerLedger,
  payCreditAmount,
} = require("../controllers/customer.controller");

router.post("/customers",  createCustomer);
router.get("/customers", getCustomers);
router.get("/by-phone/:phone",getCustomerByPhone);
router.get("/customer/credit", getCreditCustomers);
router.get("/customers/:id/ledger", getCustomerLedger);
router.post("/customers/:id/credit/pay", payCreditAmount);
// Add route for POST /customers/credit/pay (no :id in path)
router.post("/customers/credit/pay", payCreditAmount);
router.put("/customers/:id", updateCustomer);
router.delete("/customers/:id", deleteCustomer);

module.exports = router;
