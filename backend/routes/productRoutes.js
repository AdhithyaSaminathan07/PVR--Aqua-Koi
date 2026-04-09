const express = require('express');
const router = express.Router();
const { getProducts, createProduct, updateProduct, deleteProduct, stockUpdate } = require('../controllers/productController');

router.get('/', getProducts);
router.post('/', createProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);
router.patch('/:id/stock', stockUpdate);

module.exports = router;
