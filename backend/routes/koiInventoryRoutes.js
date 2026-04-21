const express = require('express');
const router = express.Router();
const { 
    getStock, 
    createItem, 
    updateItem,
    deleteItem,
    purchaseStock, 
    reduceStock, 
    setStock,
    getLowStock, 
    getTransactionHistory,
    getAnalytics
} = require('../controllers/koiInventoryController');

router.get('/', getStock);
router.post('/items', createItem);
router.put('/items/:id', updateItem);
router.delete('/items/:id', deleteItem);
router.post('/purchase', purchaseStock);
router.post('/reduce', reduceStock);
router.post('/set-stock', setStock);
router.get('/low-stock', getLowStock);
router.get('/history/:itemId', getTransactionHistory);
router.get('/analytics', getAnalytics);

module.exports = router;
