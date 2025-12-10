const express = require("express");
const router = express.Router();
const customerController = require("../controllers/customer.controller");
const { verifyToken } = require("../middleware/auth.middleware");

router.get("/", verifyToken, customerController.getAll);
router.get("/:id", verifyToken, customerController.getById);
router.get("/:id/purchases", verifyToken, customerController.getPurchases);
router.post("/", verifyToken, customerController.create);
router.put("/:id", verifyToken, customerController.update);
router.delete("/:id", verifyToken, customerController.delete);

module.exports = router;
