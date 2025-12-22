const express = require("express");
const router = express.Router();
const productController = require("../controllers/product.controller");
const { verifyToken, isManager } = require("../middleware/auth.middleware");

// AUTHENTICATED USERS
router.get("/", verifyToken, productController.getAll);
router.get("/:id", verifyToken, productController.getById);

// MANAGER / ADMIN
router.post("/", verifyToken, isManager, productController.create);
router.post(
  "/sync/:barcode",
  verifyToken,
  isManager,
  productController.syncWithOpenFoodFacts
);
router.put("/:id", verifyToken, isManager, productController.update);
router.delete("/:id", verifyToken, isManager, productController.delete);

module.exports = router;
