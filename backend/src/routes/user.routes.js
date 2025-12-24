const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { verifyToken, isAdmin, isManager } = require('../middleware/auth.middleware');

// Get all users - managers and admins
router.get('/', verifyToken, isManager, userController.getAll);

// Get user by ID
router.get('/:id', verifyToken, isManager, userController.getById);

// Get specific user's orders
router.get('/:id/orders', verifyToken, isManager, userController.getUserOrders);

// Create user - admin only
router.post('/', verifyToken, isAdmin, userController.create);

// Update user - admin only
router.put('/:id', verifyToken, isAdmin, userController.update);

// Delete user - admin only
router.delete('/:id', verifyToken, isAdmin, userController.delete);

module.exports = router;
