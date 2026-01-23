const router = require("express").Router();

const {
  createCustomer,
  getCustomers,
  getCustomerByPhone,
  updateCustomer,
  deleteCustomer,
  getCreditCustomers,
  getCreditLedger,
  payCreditAmount,
} = require("../controllers/customer.controller");

router.post("/customers",  createCustomer);
router.get("/customers", getCustomers);
router.get("/by-phone/:phone",getCustomerByPhone);
router.get("/customer/credit", getCreditCustomers);
router.get("/credit/ledger/:phone", getCreditLedger);
router.post("/customers/credit/pay", payCreditAmount);
router.put("/customers/:id", updateCustomer);
router.delete("/customers/:id", deleteCustomer);

module.exports = router;
