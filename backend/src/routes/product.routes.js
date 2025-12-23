const express = require("express");
const router = express.Router();
const productController = require("../controllers/product.controller");
const { verifyToken, isManager } = require("../middleware/auth.middleware");

/**
 * @swagger
 * /api/products/search/openfoodfacts:
 *   get:
 *     summary: Search products in Open Food Facts API
 *     tags: [Products]
 */
router.get("/search/openfoodfacts", verifyToken, isManager, productController.searchOpenFoodFacts);

/**
 * @swagger
 * /api/products/import/bulk:
 *   post:
 *     summary: Bulk import products from Open Food Facts
 *     tags: [Products]
 */
router.post("/import/bulk", verifyToken, isManager, productController.bulkImportFromOpenFoodFacts);

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get all products
 *     tags: [Products]
 */
router.get("/", verifyToken, productController.getAll);

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Get product by ID
 *     tags: [Products]
 */
router.get("/:id", verifyToken, productController.getById);

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Create a new product
 *     tags: [Products]
 */
router.post("/", verifyToken, isManager, productController.create);

/**
 * @swagger
 * /api/products/sync/{barcode}:
 *   post:
 *     summary: Sync product with Open Food Facts
 *     tags: [Products]
 */
router.post("/sync/:barcode", verifyToken, isManager, productController.syncWithOpenFoodFacts);

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Update a product
 *     tags: [Products]
 */
router.put("/:id", verifyToken, isManager, productController.update);

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Delete a product
 *     tags: [Products]
 */
router.delete("/:id", verifyToken, isManager, productController.delete);

module.exports = router;
