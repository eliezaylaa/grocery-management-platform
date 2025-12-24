const express = require("express");
const router = express.Router();
const productController = require("../controllers/product.controller");
const { verifyToken, isManager } = require("../middleware/auth.middleware");

// Search Open Food Facts - any authenticated user can search
router.get("/search/openfoodfacts", verifyToken, productController.searchOpenFoodFacts);

// Bulk import - managers only
router.post("/import/bulk", verifyToken, isManager, productController.bulkImportFromOpenFoodFacts);

// Get all products - any authenticated user
router.get("/", verifyToken, productController.getAll);

// Get product by ID - any authenticated user
router.get("/:id", verifyToken, productController.getById);

// Create product - managers only
router.post("/", verifyToken, isManager, productController.create);

// Sync with Open Food Facts - managers only
router.post("/sync/:barcode", verifyToken, isManager, productController.syncWithOpenFoodFacts);

// Update product - managers only
router.put("/:id", verifyToken, isManager, productController.update);

// Delete product - managers only
router.delete("/:id", verifyToken, isManager, productController.delete);

module.exports = router;
