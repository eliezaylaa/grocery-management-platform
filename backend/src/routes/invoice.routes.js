const express = require("express");
const router = express.Router();
const invoiceController = require("../controllers/invoice.controller");
const {
  verifyToken,
  isAdmin,
  isManager,
} = require("../middleware/auth.middleware");

// AUTHENTICATED USERS
router.get("/", verifyToken, isManager, invoiceController.getInvoices);
router.get("/my-orders", verifyToken, invoiceController.getMyInvoices);
router.post("/", verifyToken, invoiceController.createInvoice);

// MANAGER / ADMIN
router.put("/:id", verifyToken, isManager, invoiceController.updateInvoice);

// ADMIN ONLY
router.delete("/:id", verifyToken, isAdmin, invoiceController.deleteInvoice);

module.exports = router;
