const express = require('express');
const router = express.Router();
const { 
    getEnquiries, 
    createEnquiry, 
    updateEnquiryStatus, 
    deleteEnquiry, 
    getOrders, 
    createOrderFromQuotation, 
    updatePayment, 
    updateOrderStatus,
    convertEnquiryToCustomer
} = require('../../controllers/Aqua/orderController');

router.get('/enquiries', getEnquiries);
router.post('/enquiries', createEnquiry);
router.post('/enquiries/:id/convert-customer', convertEnquiryToCustomer);
router.patch('/enquiries/:id/status', updateEnquiryStatus);
router.delete('/enquiries/:id', deleteEnquiry);
router.get('/', getOrders);
router.post('/', createOrderFromQuotation);
router.patch('/:id/payment', updatePayment);
router.patch('/:id/status', updateOrderStatus);

module.exports = router;

