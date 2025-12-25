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
 *         brand:
 *           type: string
 *         category:
 *           type: string
 *         description:
 *           type: string
 *         price:
 *           type: number
 *         stockQuantity:
 *           type: integer
 *         pictureUrl:
 *           type: string
 *         calories:
 *           type: number
 *         proteins:
 *           type: number
 *         carbs:
 *           type: number
 *         fat:
 *           type: number
 *         fiber:
 *           type: number
 *         nutriscore:
 *           type: string
 *         ingredients:
 *           type: string
 *         restockDate:
 *           type: string
 *           format: date
 *         restockQuantity:
 *           type: integer
 *         createdAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/products/search/openfoodfacts:
 *   get:
 *     summary: Search products in Open Food Facts database
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *         description: Search term (e.g., "nutella", "coca cola")
 *     responses:
 *       200:
 *         description: Search results from Open Food Facts
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 products:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       barcode:
 *                         type: string
 *                       name:
 *                         type: string
 *                       brand:
 *                         type: string
 *                       pictureUrl:
 *                         type: string
 */
router.get("/search/openfoodfacts", verifyToken, productController.searchOpenFoodFacts);

/**
 * @swagger
 * /api/products/import/bulk:
 *   post:
 *     summary: Bulk import products from Open Food Facts (Manager only)
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
 *                 description: Array of product barcodes to import
 *     responses:
 *       200:
 *         description: Products imported successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 imported:
 *                   type: integer
 *                 failed:
 *                   type: integer
 *                 products:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 *       403:
 *         description: Manager access required
 */
router.post("/import/bulk", verifyToken, isManager, productController.bulkImportFromOpenFoodFacts);

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get all products
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
 *           default: 12
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name, brand, or barcode
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
 *         description: Filter products with stock <= 10
 *       - in: query
 *         name: inStock
 *         schema:
 *           type: string
 *           enum: ['true', 'false']
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [name, price, stockQuantity, createdAt]
 *           default: createdAt
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
 *               type: object
 *               properties:
 *                 products:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *                 filters:
 *                   type: object
 *                   properties:
 *                     categories:
 *                       type: array
 *                       items:
 *                         type: string
 *                     brands:
 *                       type: array
 *                       items:
 *                         type: string
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found
 */
router.get("/:id", verifyToken, productController.getById);

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Create a new product (Manager only)
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
 *               - name
 *               - price
 *             properties:
 *               name:
 *                 type: string
 *               barcode:
 *                 type: string
 *               brand:
 *                 type: string
 *               category:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               stockQuantity:
 *                 type: integer
 *                 default: 0
 *               pictureUrl:
 *                 type: string
 *               restockDate:
 *                 type: string
 *                 format: date
 *               restockQuantity:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Product created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       403:
 *         description: Manager access required
 */
router.post("/", verifyToken, isManager, productController.create);

/**
 * @swagger
 * /api/products/sync/{barcode}:
 *   post:
 *     summary: Sync product with Open Food Facts data (Manager only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: barcode
 *         required: true
 *         schema:
 *           type: string
 *         description: Product barcode
 *     responses:
 *       200:
 *         description: Product synced successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found on Open Food Facts
 *       403:
 *         description: Manager access required
 */
router.post("/sync/:barcode", verifyToken, isManager, productController.syncWithOpenFoodFacts);

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Update a product (Manager only)
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
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               barcode:
 *                 type: string
 *               brand:
 *                 type: string
 *               category:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               stockQuantity:
 *                 type: integer
 *               pictureUrl:
 *                 type: string
 *               restockDate:
 *                 type: string
 *                 format: date
 *               restockQuantity:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Product updated
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
 *     summary: Delete a product (Manager only)
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
 *         description: Product deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Product not found
 *       403:
 *         description: Manager access required
 */
router.delete("/:id", verifyToken, isManager, productController.delete);

module.exports = router;
