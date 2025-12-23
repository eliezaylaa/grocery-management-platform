const express = require("express");
const router = express.Router();
const productController = require("../controllers/product.controller");
const { verifyToken, isManager } = require("../middleware/auth.middleware");

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *         barcode:
 *           type: string
 *         price:
 *           type: number
 *           format: decimal
 *         brand:
 *           type: string
 *         category:
 *           type: string
 *         pictureUrl:
 *           type: string
 *         description:
 *           type: string
 *         nutritionalInfo:
 *           type: object
 *         stockQuantity:
 *           type: integer
 *         openFoodFactsId:
 *           type: string
 *         lastSyncedAt:
 *           type: string
 *           format: date-time
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     ProductInput:
 *       type: object
 *       required:
 *         - name
 *         - price
 *       properties:
 *         name:
 *           type: string
 *         barcode:
 *           type: string
 *         price:
 *           type: number
 *         brand:
 *           type: string
 *         category:
 *           type: string
 *         pictureUrl:
 *           type: string
 *         description:
 *           type: string
 *         stockQuantity:
 *           type: integer
 *           default: 0
 *     ProductList:
 *       type: object
 *       properties:
 *         products:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Product'
 *         total:
 *           type: integer
 *         page:
 *           type: integer
 *         totalPages:
 *           type: integer
 */

/**
 * @swagger
 * /api/products/search/openfoodfacts:
 *   get:
 *     summary: Search products in Open Food Facts API (Manager/Admin only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *     responses:
 *       200:
 *         description: List of products from Open Food Facts
 *       400:
 *         description: Search query required
 *       403:
 *         description: Manager access required
 */
router.get("/search/openfoodfacts", verifyToken, isManager, productController.searchOpenFoodFacts);

/**
 * @swagger
 * /api/products/import/bulk:
 *   post:
 *     summary: Bulk import products from Open Food Facts (Manager/Admin only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - barcodes
 *             properties:
 *               barcodes:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Import results
 *       400:
 *         description: Array of barcodes required
 *       403:
 *         description: Manager access required
 */
router.post("/import/bulk", verifyToken, isManager, productController.bulkImportFromOpenFoodFacts);

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get all products with pagination and filtering
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: brand
 *         schema:
 *           type: string
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: lowStock
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [name, price, stockQuantity, createdAt]
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: DESC
 *     responses:
 *       200:
 *         description: List of products
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProductList'
 *       401:
 *         description: Unauthorized
 */
router.get("/", verifyToken, productController.getAll);

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Get product by ID
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Product details
 *       404:
 *         description: Product not found
 */
router.get("/:id", verifyToken, productController.getById);

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Create a new product (Manager/Admin only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductInput'
 *     responses:
 *       201:
 *         description: Product created successfully
 *       400:
 *         description: Invalid input
 *       403:
 *         description: Manager access required
 */
router.post("/", verifyToken, isManager, productController.create);

/**
 * @swagger
 * /api/products/sync/{barcode}:
 *   post:
 *     summary: Sync product with Open Food Facts API (Manager/Admin only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: barcode
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product synced successfully
 *       404:
 *         description: Product not found in Open Food Facts
 *       403:
 *         description: Manager access required
 */
router.post("/sync/:barcode", verifyToken, isManager, productController.syncWithOpenFoodFacts);

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Update a product (Manager/Admin only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductInput'
 *     responses:
 *       200:
 *         description: Product updated successfully
 *       404:
 *         description: Product not found
 *       403:
 *         description: Manager access required
 */
router.put("/:id", verifyToken, isManager, productController.update);

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Delete a product (Manager/Admin only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *       404:
 *         description: Product not found
 *       403:
 *         description: Manager access required
 */
router.delete("/:id", verifyToken, isManager, productController.delete);

module.exports = router;
