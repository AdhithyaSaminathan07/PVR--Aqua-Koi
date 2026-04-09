const express = require('express');
const router = express.Router();
const { getEnquiries, createEnquiry, getOrders, createOrderFromQuotation, updatePayment, updateOrderStatus } = require('../controllers/orderController');

router.get('/enquiries', getEnquiries);
router.post('/enquiries', createEnquiry);
router.get('/', getOrders);
router.post('/', createOrderFromQuotation);
router.patch('/:id/payment', updatePayment);
router.patch('/:id/status', updateOrderStatus);

module.exports = router;

