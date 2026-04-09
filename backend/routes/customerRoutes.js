const express = require('express');
const router = express.Router();
const { getCustomers, createCustomer, getCustomerById } = require('../controllers/customerController');

router.get('/', getCustomers);
router.post('/', createCustomer);
router.get('/:id', getCustomerById);

module.exports = router;
