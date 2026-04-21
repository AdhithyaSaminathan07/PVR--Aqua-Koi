const express = require('express');
const router = express.Router();
const { getCustomers, createCustomer, updateCustomer, getCustomerById, deleteCustomer } = require('../controllers/koiCustomerController');

router.get('/', getCustomers);
router.post('/', createCustomer);
router.get('/:id', getCustomerById);
router.patch('/:id', updateCustomer);
router.delete('/:id', deleteCustomer);

module.exports = router;
