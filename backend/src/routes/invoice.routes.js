const express = require("express");
const router = express.Router();
const invoiceController = require("../controllers/invoice.controller");
const { verifyToken } = require("../middleware/auth.middleware");

router.get("/", verifyToken, invoiceController.getAll);
router.get("/:id", verifyToken, invoiceController.getById);
router.post("/", verifyToken, invoiceController.create);
router.put("/:id", verifyToken, invoiceController.update);
router.delete("/:id", verifyToken, invoiceController.delete);

module.exports = router;
