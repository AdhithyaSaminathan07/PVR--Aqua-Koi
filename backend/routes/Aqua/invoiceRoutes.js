const express = require('express');
const router = express.Router();
const { 
    createInvoice, 
    getInvoices, 
    getInvoiceById, 
    deleteInvoice 
} = require('../../controllers/Aqua/invoiceController');

router.post('/', createInvoice);
router.get('/', getInvoices);
router.get('/:id', getInvoiceById);
router.delete('/:id', deleteInvoice);

module.exports = router;
