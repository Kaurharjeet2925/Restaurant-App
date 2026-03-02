const router = require("express").Router();
const auth = require("../middleware/auth");
const allowAdminAndOwner = require("../middleware/allowAdminAndOwner");
const {
  createCustomer,
  getCustomers,
  getCustomerByPhone,
  updateCustomer,
  deleteCustomer,
  getCreditCustomers,
  getCustomerLedger,
  payCreditAmount,
  getCustomerById, // <-- add this
} = require("../controllers/customer.controller");

router.post("/customers", auth, allowAdminAndOwner, createCustomer);
router.get("/customers", auth, getCustomers);
router.get("/by-phone/:phone", auth, getCustomerByPhone);
router.get("/customers/credit", auth, getCreditCustomers);
router.get("/customers/:id", auth, getCustomerById);
router.get("/customers/:id/ledger", auth, getCustomerLedger);
router.post("/customers/:id/credit/pay", auth, payCreditAmount);
// Add route for POST /customers/credit/pay (no :id in path)
router.post("/customers/credit/pay", auth, payCreditAmount);
router.put("/customers/:id", auth, allowAdminAndOwner, updateCustomer);
router.delete("/customers/:id", auth, allowAdminAndOwner, deleteCustomer);
 // <-- add this line

module.exports = router;
