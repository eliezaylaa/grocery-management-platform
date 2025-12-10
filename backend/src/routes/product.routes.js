const express = require("express");
const router = express.Router();
const productController = require("../controllers/product.controller");
const { verifyToken } = require("../middleware/auth.middleware");

router.get("/", verifyToken, productController.getAll);
router.get("/:id", verifyToken, productController.getById);
router.post("/", verifyToken, productController.create);
router.post(
  "/sync/:barcode",
  verifyToken,
  productController.syncWithOpenFoodFacts
);
router.put("/:id", verifyToken, productController.update);
router.delete("/:id", verifyToken, productController.delete);

module.exports = router;
