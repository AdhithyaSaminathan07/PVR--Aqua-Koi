import React, { useState, useEffect } from 'react';
import {
    FileText,
    Search,
    Download,
    Printer,
    Mail,
    ChevronRight,
    Loader2,
    CheckCircle2,
    Clock,
    AlertCircle,
    Eye,
    Plus,
    Trash2,
    Pencil
} from 'lucide-react';

import { getOrders, getCustomers, getProducts, createOrder, updateOrderStatus, updatePayment } from '../../services/api';
import Modal from '../../components/Modal';

// Helper for Total in Words
const numberToWords = (num) => {
    const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    const inWords = (n) => {
        if ((n = n.toString()).length > 9) return 'overflow';
        let nArray = ('000000000' + n).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
        if (!nArray) return '';
        let str = '';
        str += (nArray[1] != 0) ? (a[Number(nArray[1])] || b[nArray[1][0]] + ' ' + a[nArray[1][1]]) + 'Crore ' : '';
        str += (nArray[2] != 0) ? (a[Number(nArray[2])] || b[nArray[2][0]] + ' ' + a[nArray[2][1]]) + 'Lakh ' : '';
        str += (nArray[3] != 0) ? (a[Number(nArray[3])] || b[nArray[3][0]] + ' ' + a[nArray[3][1]]) + 'Thousand ' : '';
        str += (nArray[4] != 0) ? (a[Number(nArray[4])] || b[nArray[4][0]] + ' ' + a[nArray[4][1]]) + 'Hundred ' : '';
        str += (nArray[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(nArray[5])] || b[nArray[5][0]] + ' ' + a[nArray[5][1]]) + 'Only ' : 'Only';
        return str;
    };
    return inWords(Math.floor(num));
};


const Invoices = () => {
    const [orders, setOrders] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('creator'); // 'creator', 'history', 'all', 'deleted'
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editFormData, setEditFormData] = useState({ status: '', paidAmount: 0 });
    const [isExporting, setIsExporting] = useState(false);
    const [zoom, setZoom] = useState(1);
    const [showSuccess, setShowSuccess] = useState(false);


    // New Invoice Form State
    const [newInvoice, setNewInvoice] = useState({
        customerId: '',
        items: [{ productId: '', quantity: 1, price: 0, hsnSac: '' }],
        status: 'Completed',
        paidAmount: 0,
        taxPhase: 'Inside TN',
        transportCharges: 0,
        salesPerson: '',
        invoiceDate: new Date().toISOString().split('T')[0],
        companyInfo: {
            name: 'PVR AQUACULTURE',
            address: '334E, KUMARAN NAGAR, ILLUPUR TALUK,\nPerumanadu, Pudukkottai, Tamil Nadu, 622104',
            contact: '+91 9600124725, +91 9003424998',
            gstin: '33CQRPA2571H1ZW'
        },
        billingInfo: {
            name: '',
            address: '',
            phone: '',
            gstNo: ''
        },
        bankDetails: {
            accountNo: '7037881010',
            ifscCode: 'IDIB000N140',
            bankName: 'INDIAN BANK',
            branch: 'NATHAMPANNAI'
        }
    });

    useEffect(() => {
        fetchInvoices();
        loadFormData();
    }, []);

    const fetchInvoices = async () => {
        try {
            setLoading(true);
            const res = await getOrders();
            setOrders(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateOrder = async (e) => {
        e.preventDefault();
        try {
            // First update status
            await updateOrderStatus(selectedOrder._id, editFormData.status);
            // Then update payment - allows sequential save() on backend to avoid version errors
            await updatePayment(selectedOrder._id, editFormData.paidAmount);

            setIsEditMode(false);
            fetchInvoices();
        } catch (err) {
            console.error("Order Update Error:", err);
            alert('Error updating order: ' + (err.response?.data?.message || err.message));
        }
    };

    const loadFormData = async () => {
        try {
            const [custRes, prodRes] = await Promise.all([getCustomers(), getProducts()]);
            setCustomers(custRes.data);
            setProducts(prodRes.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleCreateInvoice = async (e) => {
        if (e) e.preventDefault();
        try {
            const subTotal = newInvoice.items.reduce((acc, item) => acc + (item.quantity * item.price), 0);
            const transport = newInvoice.transportCharges || 0;
            const taxBase = subTotal + transport;
            const taxAmount = taxBase * 0.18;
            const totalWithTax = taxBase + taxAmount;

            const orderData = {
                ...newInvoice,
                totalAmount: totalWithTax,
                paidAmount: totalWithTax,
                status: 'Completed'
            };
            const response = await createOrder(orderData);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
            await fetchInvoices();


            // Open the newly created invoice immediately
            handleViewInvoice(response.data);

            // Reset form
            setNewInvoice({
                customerId: '',
                items: [{ productId: '', quantity: 1, price: 0, hsnSac: '' }],
                status: 'Completed',
                paidAmount: 0,
                taxPhase: 'Inside TN',
                transportCharges: 0,
                salesPerson: '',
                invoiceDate: new Date().toISOString().split('T')[0],
                companyInfo: {
                    name: 'PVR AQUACULTURE',
                    address: '334E, KUMARAN NAGAR, ILLUPUR TALUK,\nPerumanadu, Pudukkottai, Tamil Nadu, 622104',
                    contact: '+91 9600124725, +91 9003424998',
                    gstin: '33CQRPA2571H1ZW'
                },
                billingInfo: { name: '', address: '', phone: '', gstNo: '' },
                bankDetails: { accountNo: '7037881010', ifscCode: 'IDIB000N140', bankName: 'INDIAN BANK', branch: 'NATHAMPANNAI' }
            });
        } catch (err) {
            console.error(err);
            alert('Error creating invoice');
        }
    };

    const addItem = () => {
        setNewInvoice({ ...newInvoice, items: [...newInvoice.items, { productId: '', quantity: 1, price: 0, hsnSac: '' }] });
    };

    const updateItem = (index, field, value) => {
        const updatedItems = [...newInvoice.items];
        updatedItems[index][field] = value;

        if (field === 'productId') {
            const product = products.find(p => p._id === value);
            if (product) {
                updatedItems[index].price = product.price;
                updatedItems[index].hsnSac = product.hsnSac || '';
            }
        }

        setNewInvoice({ ...newInvoice, items: updatedItems });
    };

    const handleViewInvoice = (order) => {
        setSelectedOrder(order);
        setIsInvoiceModalOpen(true);
    };

    const getStatusStyles = (status) => {
        switch (status) {
            case 'Completed': return 'bg-green-100 text-green-700';
            case 'Dispatched': return 'bg-blue-100 text-blue-700';
            case 'Ready for Dispatch': return 'bg-purple-100 text-purple-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const filtered = orders.filter(o => {
        const matchesSearch = (o.customerId?.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
            (o._id?.toLowerCase() || "").includes(searchTerm.toLowerCase());
        const isQuotation = o.status === 'Quotation';

        if (viewMode === 'history') return matchesSearch && !isQuotation;
        if (viewMode === 'all') return matchesSearch;
        if (viewMode === 'deleted') return false;
        return matchesSearch;
    }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));


    const handleDownloadPDF = (targetElementId) => {
        if (typeof window.html2pdf === 'undefined') {
            alert('PDF library is loading... Please try again in a second.');
            return;
        }

        setIsExporting(true);

        // Allow React to re-render the "Clean" version for capture
        setTimeout(() => {
            const element = document.getElementById(targetElementId);

            if (!element) {
                setIsExporting(false);
                console.error("Target element for PDF not found:", targetElementId);
                return;
            }

            const opt = {
                margin: [10, 10],
                filename: `Invoice_${selectedOrder?._id?.slice(-6).toUpperCase() || 'New'}.pdf`,
                image: { type: 'jpeg', quality: 1.0 },
                html2canvas: {
                    scale: 3,
                    useCORS: true,
                    letterRendering: true,
                    // Ignore elements with 'no-print' class during canvas rendering
                    ignoreElements: (el) => el.classList.contains('no-print')
                },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
                pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
            };

            window.html2pdf().set(opt).from(element).save().then(() => {
                setIsExporting(false);
            });
        }, 300);
    };

    const handlePrint = (targetElementId) => {
        // Temporarily hide all elements except the target for printing
        const bodyChildren = Array.from(document.body.children);
        const elementsToHide = bodyChildren.filter(el => el.id !== targetElementId);

        elementsToHide.forEach(el => {
            if (el.style) el.style.visibility = 'hidden';
            if (el.classList) el.classList.add('hide-for-print'); // Add a class for CSS hiding
        });

        const printableElement = document.getElementById(targetElementId);
        if (printableElement) {
            if (printableElement.style) printableElement.style.visibility = 'visible';
            if (printableElement.classList) printableElement.classList.add('print-only-element');
        }

        window.print();

        // Restore visibility after printing
        elementsToHide.forEach(el => {
            if (el.style) el.style.visibility = '';
            if (el.classList) el.classList.remove('hide-for-print');
        });
        if (printableElement) {
            if (printableElement.style) printableElement.style.visibility = '';
            if (printableElement.classList) printableElement.classList.remove('print-only-element');
        }
    };


    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold text-gray-900 font-display">Invoice Management</h1>
                    <p className="text-gray-500 mt-1 text-lg">Generate, track, and manage customer billing.</p>
                </div>
                {viewMode === 'creator' && (
                    <div className="flex items-center gap-4 bg-white p-2 rounded-xl border border-gray-100 shadow-sm no-print">
                        <div className="flex items-center gap-2 px-3 border-r border-gray-100">
                            <span className="text-xs font-bold text-gray-400 uppercase">{Math.round(zoom * 100)}%</span>
                            <div className="flex gap-1">
                                <button onClick={() => setZoom(Math.max(0.5, zoom - 0.1))} className="p-1 hover:bg-gray-100 rounded text-gray-500">-</button>
                                <button onClick={() => setZoom(Math.min(1.5, zoom + 0.1))} className="p-1 hover:bg-gray-100 rounded text-gray-500">+</button>
                                <button onClick={() => setZoom(1)} className="px-2 py-1 hover:bg-gray-100 rounded text-[10px] font-bold text-gray-500 uppercase">Reset</button>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={handleCreateInvoice} className="btn-primary py-2 px-4 text-xs">
                                <CheckCircle2 size={14} /> Save Invoice
                            </button>
                            <button onClick={() => handlePrint('invoice-to-print')} className="btn-primary bg-green-600 hover:bg-green-700 py-2 px-4 text-xs">
                                <Printer size={14} /> Print
                            </button>
                            <button onClick={() => handleDownloadPDF('invoice-to-print')} className="btn-primary bg-blue-600 hover:bg-blue-700 py-2 px-4 text-xs">
                                <Download size={14} /> Download PDF
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex gap-8 border-b border-gray-100 no-print">
                <button
                    onClick={() => setViewMode('creator')}
                    className={`pb-4 text-sm font-bold transition-all relative ${viewMode === 'creator' ? 'text-primary-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    Advanced Invoice
                    {viewMode === 'creator' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-600 rounded-full" />}
                </button>
                <button
                    onClick={() => setViewMode('history')}
                    className={`pb-4 text-sm font-bold transition-all relative ${viewMode === 'history' ? 'text-primary-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    Invoice History
                    {viewMode === 'history' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-600 rounded-full" />}
                </button>

                <button
                    onClick={() => setViewMode('deleted')}
                    className={`pb-4 text-sm font-bold transition-all relative ${viewMode === 'deleted' ? 'text-primary-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    Delete History
                    {viewMode === 'deleted' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-600 rounded-full" />}
                </button>
            </div>

            {viewMode === 'creator' ? (
                <div className="flex justify-center bg-gray-50 rounded-3xl p-8 min-h-[1000px] overflow-x-auto shadow-inner border border-gray-200">
                    <div
                        style={{
                            transform: `scale(${zoom})`,
                            transformOrigin: 'top center',
                            transition: 'transform 0.2s ease-out'
                        }}
                        className="bg-white shadow-2xl rounded-sm w-[800px] min-h-[1100px] p-12 flex flex-col gap-6 relative print:shadow-none print:scale-100 print:p-0 print:m-0"
                        id="invoice-to-print"
                    >
                        {/* ===== TAX INVOICE LAYOUT ===== */}
                        <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: '12px', width: '100%', border: '1px solid #b0b8cc' }}>

                            {/* TOP TITLE */}
                            <div style={{ textAlign: 'center', padding: '8px', fontWeight: 'bold', fontSize: '16px', background: '#eef2fb', borderBottom: '1px solid #b0b8cc', letterSpacing: '4px' }}>
                                TAX INVOICE
                            </div>

                            {/* HEADER: (Col 1: Company & Bill To) | (Col 2: Inv No, Date, Logo) */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr' }}>
                                {/* Left Column: Company & Bill To */}
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    {/* Company Info (Editable) */}
                                    <div style={{ padding: '8px 12px', borderRight: '1px solid #b0b8cc', borderBottom: '1px solid #b0b8cc' }}>
                                        {isExporting ? (
                                            <div style={{ fontWeight: '900', fontSize: '22px', color: '#1e3a8a', textAlign: 'center', width: '100%', background: 'transparent', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                                {newInvoice.companyInfo.name}
                                            </div>
                                        ) : (
                                            <input
                                                style={{ border: 'none', outline: 'none', fontWeight: '900', fontSize: '22px', color: '#1e3a8a', textAlign: 'center', width: '100%', background: 'transparent', textTransform: 'uppercase', letterSpacing: '1px' }}
                                                value={newInvoice.companyInfo.name}
                                                onChange={(e) => setNewInvoice({ ...newInvoice, companyInfo: { ...newInvoice.companyInfo, name: e.target.value } })}
                                                className="no-print-input" // Add class to hide border/background in print
                                            />
                                        )}
                                        <textarea
                                            style={{ border: 'none', outline: 'none', fontSize: '10.5px', color: '#444', lineHeight: '1.6', textAlign: 'center', width: '100%', background: 'transparent', resize: 'none', height: '35px', marginTop: '3px' }}
                                            value={newInvoice.companyInfo.address}
                                            onChange={(e) => setNewInvoice({ ...newInvoice, companyInfo: { ...newInvoice.companyInfo, address: e.target.value } })}
                                            className="no-print-input"
                                        />
                                        <input
                                            style={{ border: 'none', outline: 'none', fontSize: '10.5px', color: '#444', textAlign: 'center', width: '100%', background: 'transparent' }}
                                            value={newInvoice.companyInfo.contact}
                                            onChange={(e) => setNewInvoice({ ...newInvoice, companyInfo: { ...newInvoice.companyInfo, contact: e.target.value } })}
                                            className="no-print-input"
                                        />
                                        <div style={{ marginTop: '5px', background: '#f0f4ff', padding: '2px 6px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                            <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#1e3a8a' }}>GSTIN/UIN : </span>
                                            <input
                                                style={{ border: 'none', outline: 'none', fontSize: '11px', fontWeight: 'bold', color: '#1e3a8a', background: 'transparent', width: '140px', marginLeft: '4px' }}
                                                value={newInvoice.companyInfo.gstin}
                                                onChange={(e) => setNewInvoice({ ...newInvoice, companyInfo: { ...newInvoice.companyInfo, gstin: e.target.value } })}
                                                className="no-print-input"
                                            />
                                        </div>
                                    </div>

                                    {/* BILL TO (Editable) */}
                                    <div style={{ borderRight: '1px solid #b0b8cc', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                        <div style={{ background: '#dde5f5', padding: '6px 8px', fontWeight: 'bold', color: '#1e3a8a', textAlign: 'center', borderBottom: '1px solid #b0b8cc', fontSize: '12px' }}>
                                            BILL TO
                                        </div>
                                        <div style={{ padding: '8px 10px', flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                            {isExporting ? (
                                                <div style={{ fontWeight: 'bold', fontSize: '13px', color: '#1e1e1e', width: '100%' }}>
                                                    {newInvoice.billingInfo.name || 'N/A'}
                                                </div>
                                            ) : (
                                                <>
                                                    <select
                                                        style={{ width: '100%', border: '1px solid #ccc', padding: '3px', fontSize: '10px', background: 'white' }}
                                                        value={newInvoice.customerId}
                                                        onChange={(e) => {
                                                            const custId = e.target.value;
                                                            const cust = customers.find(c => c._id === custId);
                                                            setNewInvoice({
                                                                ...newInvoice,
                                                                customerId: custId,
                                                                billingInfo: cust ? {
                                                                    name: cust.name,
                                                                    address: cust.address,
                                                                    phone: cust.phone,
                                                                    gstNo: cust.gstNo || ''
                                                                } : { name: '', address: '', phone: '', gstNo: '' }
                                                            });
                                                        }}
                                                        className="no-print-select" // Add class to hide border/background in print
                                                    >
                                                        <option value="">Select Customer</option>
                                                        {customers.map(c => <option key={c._id} value={c._id}>{c.name} ({c.phone})</option>)}
                                                    </select>
                                                    <input
                                                        style={{ border: 'none', outline: 'none', fontWeight: 'bold', fontSize: '13px', color: '#1e1e1e', width: '100%', background: 'transparent' }}
                                                        placeholder="Customer Name"
                                                        value={newInvoice.billingInfo.name}
                                                        onChange={(e) => setNewInvoice({ ...newInvoice, billingInfo: { ...newInvoice.billingInfo, name: e.target.value } })}
                                                        className="no-print-input"
                                                    />
                                                </>
                                            )}
                                            {isExporting ? (
                                                <div style={{ fontSize: '11px', color: '#555', lineHeight: '1.6', width: '100%', minHeight: '45px' }}>
                                                    {newInvoice.billingInfo.address}
                                                </div>
                                            ) : (
                                                <textarea
                                                    style={{ border: 'none', outline: 'none', fontSize: '11px', color: '#555', lineHeight: '1.6', width: '100%', background: 'transparent', resize: 'none', height: '45px' }}
                                                    placeholder="Customer Address"
                                                    value={newInvoice.billingInfo.address}
                                                    onChange={(e) => setNewInvoice({ ...newInvoice, billingInfo: { ...newInvoice.billingInfo, address: e.target.value } })}
                                                    className="no-print-input"
                                                />
                                            )}
                                            <div style={{ fontSize: '11px', color: '#444', display: 'flex', gap: '4px' }}>
                                                <span style={{ fontWeight: 'bold' }}>Phone:</span>
                                                {isExporting ? (
                                                    <span>{newInvoice.billingInfo.phone}</span>
                                                ) : (
                                                    <input
                                                        style={{ border: 'none', outline: 'none', fontSize: '11px', background: 'transparent', width: '100%' }}
                                                        value={newInvoice.billingInfo.phone}
                                                        onChange={(e) => setNewInvoice({ ...newInvoice, billingInfo: { ...newInvoice.billingInfo, phone: e.target.value } })}
                                                        className="no-print-input"
                                                    />
                                                )}
                                            </div>
                                            <div style={{ fontSize: '11px', color: '#444', display: 'flex', gap: '4px' }}>
                                                <span style={{ fontWeight: 'bold' }}>GSTIN/UIN:</span>
                                                {isExporting ? (
                                                    <span>{newInvoice.billingInfo.gstNo}</span>
                                                ) : (
                                                    <input
                                                        style={{ border: 'none', outline: 'none', fontSize: '11px', background: 'transparent', width: '100%' }}
                                                        value={newInvoice.billingInfo.gstNo}
                                                        onChange={(e) => setNewInvoice({ ...newInvoice, billingInfo: { ...newInvoice.billingInfo, gstNo: e.target.value } })}
                                                        className="no-print-input"
                                                    />
                                                )}
                                            </div>
                                        </div>
                                        {/* Sales & Tax */}
                                        <div style={{ padding: '4px 10px', borderTop: '1px solid #eee', display: 'flex', flexDirection: 'column', gap: '3px', background: '#fcfcfc' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px' }}>
                                                <span style={{ color: '#888', fontWeight: 'bold' }}>TAX CATEGORY:</span>
                                                <select
                                                    style={{ border: 'none', fontSize: '10px', fontWeight: 'bold', background: 'transparent' }}
                                                    value={newInvoice.taxPhase}
                                                    onChange={(e) => setNewInvoice({ ...newInvoice, taxPhase: e.target.value })}
                                                    className="no-print-select"
                                                >
                                                    <option value="Inside TN">Inside TN (CGST/SGST)</option>
                                                    <option value="Outside TN">Outside TN (IGST)</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column: Inv Details & Logo */}
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ display: 'flex', borderBottom: '1px solid #b0b8cc', height: '35px' }}>
                                        <div style={{ padding: '4px 8px', fontWeight: 'bold', color: '#1e3a8a', fontSize: '11px', flex: 1, borderRight: '1px solid #b0b8cc', display: 'flex', alignItems: 'center' }}>INVOICE NO.</div>
                                        <div style={{ padding: '4px 8px', fontWeight: 'bold', color: '#333', fontSize: '11px', flex: 1.5, display: 'flex', alignItems: 'center' }}>
                                            {isExporting ? '[AUTO]' : (
                                                <input
                                                    style={{ border: 'none', outline: 'none', fontWeight: 'bold', color: '#333', fontSize: '11px', background: 'transparent', width: '100%' }}
                                                    placeholder="[AUTO]"
                                                    className="no-print-input"
                                                />
                                            )}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', borderBottom: '1px solid #b0b8cc', height: '35px' }}>
                                        <div style={{ padding: '4px 8px', fontWeight: 'bold', color: '#1e3a8a', fontSize: '11px', flex: 1, borderRight: '1px solid #b0b8cc', display: 'flex', alignItems: 'center' }}>DATE</div>
                                        <div style={{ padding: '4px 8px', fontWeight: 'bold', color: '#333', fontSize: '11px', flex: 1.5, display: 'flex', alignItems: 'center' }}>
                                            <input
                                                type="date"
                                                style={{ border: 'none', outline: 'none', fontWeight: 'bold', color: '#1e3a8a', fontSize: '11px', background: 'transparent', width: '100%' }}
                                                value={newInvoice.invoiceDate}
                                                onChange={(e) => setNewInvoice({ ...newInvoice, invoiceDate: e.target.value })}
                                                className="no-print-input"
                                            />
                                        </div>
                                    </div>
                                    <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '15px', minHeight: '200px' }}>
                                        <img src="/PVR.png" alt="Logo" style={{ maxHeight: '180px', maxWidth: '260px', objectFit: 'contain' }} />
                                    </div>
                                </div>
                            </div>

                            {/* ITEMS TABLE */}
                            <table style={{ width: '100%', borderCollapse: 'collapse', borderBottom: '1px solid #b0b8cc' }}>
                                <thead>
                                    <tr style={{ background: '#1e3a8a', color: 'white' }}>
                                        <th style={{ padding: '8px 6px', textAlign: 'center', fontSize: '11px', fontWeight: 'bold', borderRight: '1px solid #3b5daa', width: '40px' }}>SL.NO</th>
                                        <th style={{ padding: '8px 6px', textAlign: 'center', fontSize: '11px', fontWeight: 'bold', borderRight: '1px solid #3b5daa' }}>PRODUCT</th>
                                        <th style={{ padding: '8px 6px', textAlign: 'center', fontSize: '11px', fontWeight: 'bold', borderRight: '1px solid #3b5daa', width: '80px' }}>HSN/SAC</th>
                                        <th style={{ padding: '8px 6px', textAlign: 'center', fontSize: '11px', fontWeight: 'bold', borderRight: '1px solid #3b5daa', width: '50px' }}>QTY</th>
                                        <th style={{ padding: '8px 6px', textAlign: 'center', fontSize: '11px', fontWeight: 'bold', borderRight: '1px solid #3b5daa', width: '90px' }}>UNIT PRICE</th>
                                        <th style={{ padding: '8px 6px', textAlign: 'center', fontSize: '11px', fontWeight: 'bold', borderRight: '1px solid #3b5daa', width: '90px' }}>AMOUNT</th>
                                        <th className="no-print" style={{ padding: '8px 4px', textAlign: 'center', fontSize: '11px', fontWeight: 'bold', width: '24px' }}></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {newInvoice.items.map((item, idx) => (
                                        <tr key={idx} style={{ borderBottom: '1px solid #e5e5e5', height: '30px' }}>
                                            <td style={{ padding: '2px 4px', textAlign: 'center', fontSize: '11px', borderRight: '1px solid #e5e5e5', color: '#888' }}>{idx + 1}</td>
                                            <td style={{ padding: '1px 4px', borderRight: '1px solid #e5e5e5' }}>
                                                {isExporting ? (
                                                    <div style={{ width: '100%', fontSize: '11px', fontWeight: 'bold', color: '#333', textTransform: 'uppercase' }}>
                                                        {products.find(p => p._id === item.productId)?.name || 'SELECT ITEM'}
                                                    </div>
                                                ) : (
                                                    <select
                                                        style={{ width: '100%', border: 'none', outline: 'none', fontSize: '11px', fontWeight: 'bold', background: 'transparent', textTransform: 'uppercase' }}
                                                        value={item.productId}
                                                        onChange={(e) => updateItem(idx, 'productId', e.target.value)}
                                                        className="no-print-select"
                                                    >
                                                        <option value="">SELECT ITEM</option>
                                                        {products.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                                                    </select>
                                                )}
                                            </td>
                                            <td style={{ padding: '1px 4px', borderRight: '1px solid #e5e5e5', textAlign: 'center' }}>
                                                {isExporting ? (
                                                    <span style={{ fontSize: '11px', fontWeight: 'bold' }}>{item.hsnSac || '-'}</span>
                                                ) : (
                                                    <input
                                                        style={{ width: '100%', border: 'none', outline: 'none', textAlign: 'center', fontSize: '11px', fontWeight: 'bold', background: 'transparent' }}
                                                        value={item.hsnSac || ''}
                                                        onChange={(e) => updateItem(idx, 'hsnSac', e.target.value)}
                                                        className="no-print-input"
                                                    />
                                                )}
                                            </td>
                                            <td style={{ padding: '1px 4px', borderRight: '1px solid #e5e5e5', textAlign: 'center' }}>
                                                {isExporting ? (
                                                    <span style={{ fontSize: '11px', fontWeight: 'bold' }}>{item.quantity}</span>
                                                ) : (
                                                    <input
                                                        type="number"
                                                        style={{ width: '100%', border: 'none', outline: 'none', textAlign: 'center', fontSize: '11px', fontWeight: 'bold', background: 'transparent' }}
                                                        value={item.quantity}
                                                        onChange={(e) => updateItem(idx, 'quantity', Number(e.target.value))}
                                                        className="no-print-input"
                                                    />
                                                )}
                                            </td>
                                            <td style={{ padding: '1px 4px', borderRight: '1px solid #e5e5e5', textAlign: 'right' }}>
                                                {isExporting ? (
                                                    <span style={{ fontSize: '11px', fontWeight: 'bold' }}>{item.price}</span>
                                                ) : (
                                                    <input
                                                        type="number"
                                                        style={{ width: '100%', border: 'none', outline: 'none', textAlign: 'right', fontSize: '11px', fontWeight: 'bold', background: 'transparent' }}
                                                        value={item.price}
                                                        onChange={(e) => updateItem(idx, 'price', Number(e.target.value))}
                                                        className="no-print-input"
                                                    />
                                                )}
                                            </td>
                                            <td style={{ padding: '2px 4px', textAlign: 'right', fontSize: '11px', fontWeight: 'bold', color: '#1e1e1e', borderRight: '1px solid #e5e5e5' }}>
                                                ₹{(item.quantity * item.price).toLocaleString()}
                                            </td>
                                            <td className="no-print" style={{ padding: '2px 4px', textAlign: 'center' }}>
                                                <button
                                                    onClick={() => setNewInvoice({ ...newInvoice, items: newInvoice.items.filter((_, i) => i !== idx) })}
                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#cc2222', fontSize: '15px', fontWeight: 'bold', lineHeight: 1, padding: '0 2px' }}
                                                    title="Remove row"
                                                >×</button>
                                            </td>
                                        </tr>
                                    ))}
                                    {/* Add New Item row */}
                                    <tr className="no-print" style={{ borderBottom: '1px solid #e5e5e5' }}>
                                        <td colSpan={7} style={{ padding: '6px', textAlign: 'center' }}>
                                            <button
                                                onClick={addItem}
                                                style={{ fontSize: '11px', fontWeight: 'bold', color: '#1e3a8a', background: 'transparent', border: 'none', cursor: 'pointer' }}
                                            >
                                                + ADD NEW ITEM
                                            </button>
                                        </td>
                                    </tr>
                                    {/* Fill empty rows */}
                                    {[...Array(Math.max(0, 8 - newInvoice.items.length))].map((_, i) => (
                                        <tr key={`empty-${i}`} style={{ height: '24px', borderBottom: '1px solid #e5e5e5' }}>
                                            <td style={{ borderRight: '1px solid #e5e5e5' }}></td>
                                            <td style={{ borderRight: '1px solid #e5e5e5' }}></td>
                                            <td style={{ borderRight: '1px solid #e5e5e5' }}></td>
                                            <td style={{ borderRight: '1px solid #e5e5e5' }}></td>
                                            <td style={{ borderRight: '1px solid #e5e5e5' }}></td>
                                            <td style={{ borderRight: '1px solid #e5e5e5' }}></td>
                                            <td></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* TOTALS SECTION */}
                            {(() => {
                                const subTotal = newInvoice.items.reduce((acc, item) => acc + (item.quantity * item.price), 0);
                                const transport = newInvoice.transportCharges || 0;
                                const taxBase = subTotal + transport;
                                const cgst = taxBase * 0.09;
                                const sgst = taxBase * 0.09;
                                const igst = taxBase * 0.18;
                                const grandTotal = taxBase + (newInvoice.taxPhase === 'Outside TN' ? igst : cgst + sgst);
                                return (
                                    <div style={{ border: '1px solid #b0b8cc', borderTop: 'none' }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr' }}>
                                            <div style={{ borderRight: '1px solid #b0b8cc', padding: '12px', display: 'flex', alignItems: 'flex-end' }}>
                                                <div style={{ fontSize: '10px', color: '#666' }}>
                                                    <span style={{ fontWeight: 'bold', color: '#1e3a8a' }}>Total In Words: </span>
                                                    <span style={{ textTransform: 'capitalize' }}>{numberToWords(grandTotal)}</span>
                                                </div>
                                            </div>
                                            <div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 8px', borderBottom: '1px solid #f0f0f0', fontSize: '11px' }}>
                                                    <span style={{ color: '#555', fontWeight: 'bold' }}>TRANSPORT & INSTALLATION</span>
                                                    {isExporting ? (
                                                        <span style={{ fontWeight: 'bold' }}>₹{transport.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                                    ) : (
                                                        <input
                                                            type="number"
                                                            style={{ border: 'none', outline: 'none', textAlign: 'right', fontSize: '11px', fontWeight: 'bold', background: 'transparent', width: '90px' }}
                                                            value={newInvoice.transportCharges}
                                                            onChange={(e) => setNewInvoice({ ...newInvoice, transportCharges: Number(e.target.value) })}
                                                            className="no-print-input"
                                                        />
                                                    )}
                                                </div>
                                                {newInvoice.taxPhase === 'Outside TN' ? (
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 8px', borderBottom: '1px solid #f0f0f0', fontSize: '11px' }}>
                                                        <span style={{ color: '#555', fontWeight: 'bold' }}>IGST 18%</span>
                                                        <span style={{ fontWeight: 'bold' }}>₹{igst.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 8px', borderBottom: '1px solid #f0f0f0', fontSize: '11px' }}>
                                                            <span style={{ color: '#555', fontWeight: 'bold' }}>CGST 9%</span>
                                                            <span style={{ fontWeight: 'bold' }}>₹{cgst.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                                        </div>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 8px', borderBottom: '1px solid #f0f0f0', fontSize: '11px' }}>
                                                            <span style={{ color: '#555', fontWeight: 'bold' }}>SGST 9%</span>
                                                            <span style={{ fontWeight: 'bold' }}>₹{sgst.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        {/* Total Amount Bar */}
                                        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', background: '#dde5f5', borderTop: '1px solid #b0b8cc', borderBottom: '1px solid #b0b8cc' }}>
                                            <div style={{ borderRight: '1px solid #b0b8cc' }}></div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', fontSize: '16px', fontWeight: '900', color: '#1e3a8a' }}>
                                                <span>TOTAL AMOUNT</span>
                                                <span>₹{grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })()}

                            {/* BANK DETAILS + SIGNATURE */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', border: '1px solid #b0b8cc', borderTop: 'none' }}>
                                {/* Left Section: Bank Details */}
                                <div style={{ borderRight: '1px solid #b0b8cc' }}>
                                    <div style={{ background: '#dde5f5', color: '#1e3a8a', padding: '6px 8px', fontSize: '11px', fontWeight: 'bold', borderBottom: '1px solid #b0b8cc' }}>BANK DETAILS</div>
                                    <table style={{ width: '100%', fontSize: '11px', borderCollapse: 'collapse' }}>
                                        <tbody>
                                            {[
                                                ['ACCOUNT NO', 'accountNo'],
                                                ['IFSC CODE', 'ifscCode'],
                                                ['BANK NAME', 'bankName'],
                                                ['BRANCH', 'branch']
                                            ].map(([label, field]) => (
                                                <tr key={label}>
                                                    <td style={{ padding: '4px 8px', fontWeight: 'bold', color: '#1e3a8a', width: '120px' }}>{label}</td>
                                                    <td style={{ padding: '4px 8px' }}>
                                                        {isExporting ? (
                                                            <span style={{ fontSize: '11px', color: '#333', fontWeight: 'bold' }}>{newInvoice.bankDetails[field]}</span>
                                                        ) : (
                                                            <input
                                                                type="text"
                                                                style={{ width: '100%', border: 'none', outline: 'none', fontSize: '11px', background: 'transparent', color: '#333', fontWeight: 'bold' }}
                                                                value={newInvoice.bankDetails[field]}
                                                                onChange={(e) => setNewInvoice({
                                                                    ...newInvoice,
                                                                    bankDetails: { ...newInvoice.bankDetails, [field]: e.target.value }
                                                                })}
                                                                className="no-print-input"
                                                            />
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                {/* Right Section: Signature */}
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ background: '#dde5f5', color: '#1e3a8a', padding: '6px 8px', fontSize: '11px', fontWeight: 'bold', borderBottom: '1px solid #b0b8cc', textAlign: 'center' }}>
                                        for PVR AQUACULTURE
                                    </div>
                                    <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: '15px' }}>
                                        <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#444' }}>Authorized Signature</div>
                                    </div>
                                </div>
                            </div>

                            {/* FOOTER */}
                            <div style={{ textAlign: 'center', padding: '16px', fontSize: '13px', fontWeight: 'bold', color: '#1e3a8a', fontStyle: 'italic' }}>
                                Thank You For Business!
                            </div>
                        </div>
                        {/* ===== END TAX INVOICE LAYOUT ===== */}
                    </div>
                </div>
            ) : (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm mb-6 no-print">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder={`Search ${viewMode === 'deleted' ? 'deleted' : ''} invoices...`}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                            />
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-64 gap-3">
                            <Loader2 className="animate-spin text-primary-500" size={32} />
                            <p className="text-gray-400 font-medium italic">Loading records...</p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50/50 border-b border-gray-100">
                                        <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Invoice Date</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Order Info</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Customer</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Amount</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {filtered.map((order) => (
                                        <tr key={order._id} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-semibold text-gray-900 leading-none">
                                                        {new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                    </span>
                                                    <span className="text-[10px] text-gray-400 font-medium mt-1">
                                                        {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-primary-600">#{order?._id?.slice(-6).toUpperCase() || 'N/A'}</span>

                                                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tight truncate w-32">
                                                        {order.items?.[0]?.productId?.name || 'Service Order'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-bold text-gray-800">{order.customerId?.name}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-gray-900">₹{(order.totalAmount || 0).toLocaleString()}</span>
                                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md w-fit mt-1 ${order.paidAmount >= order.totalAmount ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                                                        }`}>
                                                        {order.paidAmount >= order.totalAmount ? 'Fully Paid' : `Pending ₹${((order.totalAmount || 0) - (order.paidAmount || 0)).toLocaleString()}`}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusStyles(order.status)}`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => handleViewInvoice(order)}
                                                        className="p-2 hover:bg-primary-50 rounded-lg text-gray-400 hover:text-primary-600 transition-all"
                                                        title="View/Print"
                                                    >
                                                        <Eye size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedOrder(order);
                                                            setIsEditMode(true);
                                                            setEditFormData({
                                                                status: order.status,
                                                                paidAmount: order.paidAmount
                                                            });
                                                        }}
                                                        className="p-2 hover:bg-amber-50 rounded-lg text-gray-400 hover:text-amber-600 transition-all"
                                                        title="Edit Status/Payment"
                                                    >
                                                        <Pencil size={18} />
                                                    </button>
                                                    {viewMode === 'deleted' ? (
                                                        <button className="p-2 hover:bg-green-50 rounded-lg text-gray-400 hover:text-green-600 transition-all" title="Restore">
                                                            <CheckCircle2 size={18} />
                                                        </button>
                                                    ) : (
                                                        <button className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-600 transition-all" title="Delete">
                                                            <Trash2 size={18} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {filtered.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-20 bg-gray-50/30">
                                    <FileText size={48} className="text-gray-200 mb-4" />
                                    <p className="text-gray-400 italic font-medium">No invoice records found.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Create Quick Invoice Modal */}
            <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title={newInvoice.status === 'Quotation' ? 'New Quotation' : 'Generate Quick Invoice'} maxWidth="max-w-3xl">
                <form onSubmit={handleCreateInvoice} className="flex flex-col max-h-[80vh]">
                    <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                        {/* Customer Selection Card */}
                        <div className="p-6 bg-gray-50/50 rounded-2xl border border-gray-100 space-y-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Plus size={16} className="text-primary-600" />
                                <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Customer Details</h4>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 ml-1">Select Existing Customer</label>
                                <select
                                    required className="input-field bg-white"
                                    value={newInvoice.customerId}
                                    onChange={(e) => setNewInvoice({ ...newInvoice, customerId: e.target.value })}
                                >
                                    <option value="">-- Choose Customer --</option>
                                    {customers.map(c => <option key={c._id} value={c._id}>{c.name} ({c.phone})</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Product Items Card */}
                        <div className="p-6 bg-gray-50/50 rounded-2xl border border-gray-100 space-y-6">
                            <div className="flex justify-between items-center mb-2">
                                <div className="flex items-center gap-2">
                                    <Plus size={16} className="text-primary-600" />
                                    <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Invoice Items</h4>
                                </div>
                                <button type="button" onClick={addItem} className="px-3 py-1.5 bg-primary-50 text-primary-600 rounded-lg text-xs font-bold hover:bg-primary-100 transition-colors flex items-center gap-1.5">
                                    <Plus size={14} /> Add Item
                                </button>
                            </div>

                            <div className="space-y-4">
                                {newInvoice.items.map((item, idx) => (
                                    <div key={idx} className="grid grid-cols-12 gap-4 items-end bg-white p-4 rounded-xl border border-gray-100 shadow-sm transition-all hover:border-primary-200">
                                        <div className="col-span-12 md:col-span-5">
                                            <label className="text-[10px] font-black text-gray-400 uppercase ml-1 mb-1 block">Product / Service</label>
                                            <select
                                                required className="input-field py-2 text-sm"
                                                value={item.productId}
                                                onChange={(e) => updateItem(idx, 'productId', e.target.value)}
                                            >
                                                <option value="">Select Product</option>
                                                {products.map(p => (
                                                    <option key={p._id} value={p._id} disabled={p.stock <= 0}>
                                                        {p.name} {p.hsnSac ? `(HSN: ${p.hsnSac})` : ''} - ₹{p.price}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="col-span-12 md:col-span-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase ml-1 mb-1 block text-center">HSN/SAC</label>
                                            <input
                                                type="text" className="input-field py-2 text-sm text-center font-bold"
                                                value={item.hsnSac || ''}
                                                onChange={(e) => updateItem(idx, 'hsnSac', e.target.value)}
                                            />
                                        </div>

                                        <div className="col-span-4 md:col-span-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase ml-1 mb-1 block text-center">Qty</label>
                                            <input
                                                type="number" required min="1" className="input-field py-2 text-sm text-center"
                                                value={item.quantity}
                                                onChange={(e) => updateItem(idx, 'quantity', Number(e.target.value))}
                                            />
                                        </div>
                                        <div className="col-span-6 md:col-span-3">
                                            <label className="text-[10px] font-black text-gray-400 uppercase ml-1 mb-1 block">Unit Price</label>
                                            <input
                                                type="number" required className="input-field py-2 text-sm"
                                                value={item.price}
                                                onChange={(e) => updateItem(idx, 'price', Number(e.target.value))}
                                            />
                                        </div>
                                        <div className="col-span-2 md:col-span-1 flex justify-center pb-2">
                                            <button
                                                type="button"
                                                onClick={() => setNewInvoice({ ...newInvoice, items: newInvoice.items.filter((_, i) => i !== idx) })}
                                                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Tax Phase & Payment Card */}
                        <div className="p-6 bg-gray-50/50 rounded-2xl border border-gray-100 space-y-6">
                            <div className="flex items-center gap-2 mb-2">
                                <Plus size={16} className="text-primary-600" />
                                <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Tax & Additional Details</h4>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
                                <div className="space-y-3">
                                    <label className="text-xs font-bold text-gray-500 ml-1">Taxation Phase</label>
                                    <div className="flex flex-col gap-2">
                                        <label className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${newInvoice.taxPhase === 'Inside TN' ? 'bg-primary-50 border-primary-200 ring-2 ring-primary-500/10' : 'bg-white border-gray-100 hover:border-gray-200'}`}>
                                            <input
                                                type="radio"
                                                name="taxPhase"
                                                className="accent-primary-600 w-4 h-4"
                                                checked={newInvoice.taxPhase === 'Inside TN'}
                                                onChange={() => setNewInvoice({ ...newInvoice, taxPhase: 'Inside TN' })}
                                            />
                                            <div className="flex flex-col">
                                                <span className={`text-sm font-bold ${newInvoice.taxPhase === 'Inside TN' ? 'text-primary-700' : 'text-gray-700'}`}>Inside TN</span>
                                                <span className="text-[10px] text-gray-400 font-medium">9% CGST + 9% SGST</span>
                                            </div>
                                        </label>
                                        <label className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${newInvoice.taxPhase === 'Outside TN' ? 'bg-primary-50 border-primary-200 ring-2 ring-primary-500/10' : 'bg-white border-gray-100 hover:border-gray-200'}`}>
                                            <input
                                                type="radio"
                                                name="taxPhase"
                                                className="accent-primary-600 w-4 h-4"
                                                checked={newInvoice.taxPhase === 'Outside TN'}
                                                onChange={() => setNewInvoice({ ...newInvoice, taxPhase: 'Outside TN' })}
                                            />
                                            <div className="flex flex-col">
                                                <span className={`text-sm font-bold ${newInvoice.taxPhase === 'Outside TN' ? 'text-primary-700' : 'text-gray-700'}`}>Outside TN</span>
                                                <span className="text-[10px] text-gray-400 font-medium">18% IGST</span>
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                {newInvoice.status === 'Quotation' && (
                                    <div className="space-y-3">
                                        <label className="text-xs font-bold text-gray-500 ml-1">Advance Payment (Optional)</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                                            <input
                                                type="number"
                                                className="input-field pl-8 py-3 bg-white text-lg font-bold"
                                                placeholder="0.00"
                                                value={newInvoice.paidAmount}
                                                onChange={(e) => setNewInvoice({ ...newInvoice, paidAmount: Number(e.target.value) })}
                                            />
                                        </div>
                                        <p className="text-[10px] text-gray-400 italic font-medium ml-1">Record advance received for this quotation.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Footer Container */}
                    <div className="p-8 bg-white border-t border-gray-100 flex items-center justify-between flex-shrink-0 shadow-2xl">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Grand Total Amount</span>
                            <div className="flex items-baseline gap-1">
                                <span className="text-xl font-bold text-gray-400">₹</span>
                                <span className="text-4xl font-black text-gray-900 tracking-tighter">
                                    {newInvoice.items.reduce((acc, item) => acc + (item.quantity * item.price), 0).toLocaleString()}
                                </span>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-6 py-3 text-gray-400 font-bold text-sm uppercase hover:text-gray-600 transition-colors">
                                Cancel
                            </button>
                            <button type="submit" className="btn-primary px-10 py-4 text-sm font-black uppercase tracking-widest shadow-xl shadow-primary-200">
                                {newInvoice.status === 'Quotation' ? 'Save Quotation' : 'Confirm & Generate'}
                            </button>
                        </div>
                    </div>
                </form>
            </Modal>

            {/* Premium Invoice Modal */}
            <Modal isOpen={isInvoiceModalOpen} onClose={() => setIsInvoiceModalOpen(false)} title="Tax Invoice" maxWidth="max-w-3xl">
                {selectedOrder && (
                    <div className="bg-white rounded-lg overflow-hidden flex flex-col">
                        <div
                            id="invoice-modal-print"
                            className="bg-white w-full p-12 flex flex-col gap-6 relative"
                            style={{ fontFamily: "'Outfit', sans-serif", fontSize: '12px' }}
                        >
                            <div style={{ border: '1px solid #b0b8cc' }}>
                                {/* TOP TITLE */}
                                <div style={{ textAlign: 'center', padding: '8px', fontWeight: 'bold', fontSize: '16px', background: '#eef2fb', borderBottom: '1px solid #b0b8cc', letterSpacing: '4px' }}>
                                    TAX INVOICE
                                </div>

                                {/* MAIN BOX START */}
                                <div>

                                    {/* HEADER: (Col 1: Company & Bill To) | (Col 2: Inv No, Date, Logo) */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr' }}>
                                        {/* Left Column: Company & Bill To */}
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            {/* Company Info */}
                                            <div style={{ padding: '8px 12px', borderRight: '1px solid #b0b8cc', borderBottom: '1px solid #b0b8cc' }}>
                                                <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#1e3a8a', textAlign: 'center', width: '100%', textTransform: 'uppercase' }}>
                                                    {selectedOrder.companyInfo?.name || 'PVR AQUACULTURE'}
                                                </div>
                                                <div style={{ fontSize: '10.5px', color: '#444', lineHeight: '1.6', textAlign: 'center', whiteSpace: 'pre-line', marginTop: '3px' }}>
                                                    {selectedOrder.companyInfo?.address || '334E, KUMARAN NAGAR, ILLUPUR TALUK,\nPerumanadu, Pudukkottai, Tamil Nadu, 622104'}
                                                </div>
                                                <div style={{ fontSize: '10.5px', color: '#444', textAlign: 'center' }}>
                                                    {selectedOrder.companyInfo?.contact || '+91 9600124725, +91 9003424998'}
                                                </div>
                                                <div style={{ marginTop: '5px', background: '#f0f4ff', padding: '2px 6px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                                    <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#1e3a8a' }}>GSTIN/UIN : </span>
                                                    <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#1e3a8a', marginLeft: '4px' }}>
                                                        {selectedOrder.companyInfo?.gstin || '33CQRPA2571H1ZW'}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* BILL TO */}
                                            <div style={{ borderRight: '1px solid #b0b8cc', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                                <div style={{ background: '#dde5f5', padding: '6px 8px', fontWeight: 'bold', color: '#1e3a8a', textAlign: 'center', borderBottom: '1px solid #b0b8cc', fontSize: '12px' }}>
                                                    BILL TO
                                                </div>
                                                <div style={{ padding: '10px 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                    <div style={{ fontWeight: 'bold', fontSize: '13px', color: '#1e1e1e' }}>
                                                        {selectedOrder.billingInfo?.name || selectedOrder.customerId?.name || 'N/A'}
                                                    </div>
                                                    <div style={{ fontSize: '11px', color: '#555', lineHeight: '1.6', minHeight: '40px' }}>
                                                        {selectedOrder.billingInfo?.address || selectedOrder.customerId?.address || ''}
                                                    </div>
                                                    <div style={{ fontSize: '11px', color: '#444' }}>
                                                        <span style={{ fontWeight: 'bold' }}>Phone:</span> {selectedOrder.billingInfo?.phone || selectedOrder.customerId?.phone || ''}
                                                    </div>
                                                    <div style={{ fontSize: '11px', color: '#444' }}>
                                                        <span style={{ fontWeight: 'bold' }}>GSTIN/UIN:</span> {selectedOrder.billingInfo?.gstNo || selectedOrder.customerId?.gstNo || ''}
                                                    </div>
                                                </div>
                                                {/* Tax Category */}
                                                <div style={{ padding: '6px 12px', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'space-between', background: '#fcfcfc', fontSize: '10px' }}>
                                                    <span style={{ color: '#888', fontWeight: 'bold' }}>TAX CATEGORY:</span>
                                                    <span style={{ fontWeight: 'bold' }}>{selectedOrder.taxPhase || 'Inside TN'}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right Column: Inv Details & Logo */}
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <div style={{ display: 'flex', borderBottom: '1px solid #b0b8cc', height: '35px' }}>
                                                <div style={{ padding: '4px 8px', fontWeight: 'bold', color: '#1e3a8a', fontSize: '11px', flex: 1, borderRight: '1px solid #b0b8cc', display: 'flex', alignItems: 'center' }}>INVOICE NO.</div>
                                                <div style={{ padding: '4px 8px', fontWeight: 'bold', color: '#333', fontSize: '11px', flex: 1.5, display: 'flex', alignItems: 'center' }}>
                                                    #{selectedOrder?._id?.slice(-6).toUpperCase() || 'NEW'}

                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', borderBottom: '1px solid #b0b8cc', height: '35px' }}>
                                                <div style={{ padding: '4px 8px', fontWeight: 'bold', color: '#1e3a8a', fontSize: '11px', flex: 1, borderRight: '1px solid #b0b8cc', display: 'flex', alignItems: 'center' }}>DATE</div>
                                                <div style={{ padding: '4px 8px', fontWeight: 'bold', color: '#333', fontSize: '11px', flex: 1.5, display: 'flex', alignItems: 'center' }}>
                                                    {new Date(selectedOrder.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                </div>
                                            </div>
                                            <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '15px', minHeight: '200px' }}>
                                                <img src="/PVR.png" alt="Logo" style={{ maxHeight: '180px', maxWidth: '260px', objectFit: 'contain' }} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* ITEMS TABLE */}
                                    <table style={{ width: '100%', borderCollapse: 'collapse', borderBottom: '1px solid #b0b8cc' }}>
                                        <thead>
                                            <tr style={{ background: '#1e3a8a', color: 'white' }}>
                                                <th style={{ padding: '8px 6px', textAlign: 'center', fontSize: '11px', fontWeight: 'bold', borderRight: '1px solid #3b5daa', width: '50px' }}>SL.NO</th>
                                                <th style={{ padding: '8px 6px', textAlign: 'center', fontSize: '11px', fontWeight: 'bold', borderRight: '1px solid #3b5daa' }}>PRODUCT</th>
                                                <th style={{ padding: '8px 6px', textAlign: 'center', fontSize: '11px', fontWeight: 'bold', borderRight: '1px solid #3b5daa', width: '80px' }}>HSN/SAC</th>
                                                <th style={{ padding: '8px 6px', textAlign: 'center', fontSize: '11px', fontWeight: 'bold', borderRight: '1px solid #3b5daa', width: '60px' }}>QTY</th>
                                                <th style={{ padding: '8px 6px', textAlign: 'center', fontSize: '11px', fontWeight: 'bold', borderRight: '1px solid #3b5daa', width: '100px' }}>UNIT PRICE</th>
                                                <th style={{ padding: '8px 6px', textAlign: 'center', fontSize: '11px', fontWeight: 'bold', width: '110px' }}>AMOUNT</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedOrder.items && selectedOrder.items.length > 0 ? (
                                                selectedOrder.items.map((item, idx) => (
                                                    <tr key={idx} style={{ borderBottom: '1px solid #eee', height: '30px' }}>
                                                        <td style={{ padding: '2px 6px', textAlign: 'center', fontSize: '11px', borderRight: '1px solid #eee', color: '#888' }}>{idx + 1}</td>
                                                        <td style={{ padding: '2px 6px', fontSize: '11px', fontWeight: 'bold', borderRight: '1px solid #eee', textTransform: 'uppercase' }}>{item.productId?.name || 'Order Item'}</td>
                                                        <td style={{ padding: '2px 6px', textAlign: 'center', fontSize: '11px', borderRight: '1px solid #eee', color: '#666' }}>{item.hsnSac || item.productId?.hsnSac || '-'}</td>
                                                        <td style={{ padding: '2px 6px', textAlign: 'center', fontSize: '11px', fontWeight: 'bold', borderRight: '1px solid #eee' }}>{item.quantity}</td>
                                                        <td style={{ padding: '2px 6px', textAlign: 'right', fontSize: '11px', fontWeight: 'bold', borderRight: '1px solid #eee' }}>₹{item.price?.toLocaleString()}</td>
                                                        <td style={{ padding: '2px 6px', textAlign: 'right', fontSize: '11px', fontWeight: 'bold', color: '#1e1e1e' }}>₹{(item.quantity * item.price).toLocaleString()}</td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr style={{ height: '30px', borderBottom: '1px solid #ddd' }}>
                                                    <td colSpan={6} style={{ padding: '2px 6px', textAlign: 'center', fontSize: '11px', color: '#aaa' }}>No items found</td>
                                                </tr>
                                            )}
                                            {/* Empty rows to fill the table */}
                                            {[...Array(Math.max(0, 10 - (selectedOrder.items?.length || 0)))].map((_, i) => (
                                                <tr key={`empty-${i}`} style={{ height: '24px', borderBottom: '1px solid #f9f9f9' }}>
                                                    <td style={{ borderRight: '1px solid #eee' }}></td>
                                                    <td style={{ borderRight: '1px solid #eee' }}></td>
                                                    <td style={{ borderRight: '1px solid #eee' }}></td>
                                                    <td style={{ borderRight: '1px solid #eee' }}></td>
                                                    <td style={{ borderRight: '1px solid #eee' }}></td>
                                                    <td></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>

                                    {/* TOTALS SECTION */}
                                    {(() => {
                                        const subTotal = selectedOrder.items?.reduce((acc, item) => acc + (item.quantity * item.price), 0) || 0;
                                        const transport = selectedOrder.transportCharges || 0;
                                        const taxBase = subTotal + transport;
                                        const cgst = taxBase * 0.09;
                                        const sgst = taxBase * 0.09;
                                        const igst = taxBase * 0.18;
                                        return (
                                            <div style={{ border: '1px solid #b0b8cc', borderTop: 'none' }}>
                                                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr' }}>
                                                    <div style={{ borderRight: '1px solid #b0b8cc', padding: '12px', display: 'flex', alignItems: 'flex-end' }}>
                                                        <div style={{ fontSize: '10px', color: '#666' }}>
                                                            <span style={{ fontWeight: 'bold', color: '#1e3a8a' }}>Total In Words: </span>
                                                            <span style={{ textTransform: 'capitalize' }}>{numberToWords(selectedOrder.totalAmount)}</span>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 8px', borderBottom: '1px solid #f0f0f0', fontSize: '11px' }}>
                                                            <span style={{ color: '#555', fontWeight: 'bold' }}>TRANSPORT & INSTALLATION</span>
                                                            <span style={{ fontWeight: 'bold' }}>₹{transport.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                                        </div>
                                                        {selectedOrder.taxPhase === 'Outside TN' ? (
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 8px', borderBottom: '1px solid #f0f0f0', fontSize: '11px' }}>
                                                                <span style={{ color: '#555', fontWeight: 'bold' }}>IGST 18%</span>
                                                                <span style={{ fontWeight: 'bold' }}>₹{igst.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 8px', borderBottom: '1px solid #f0f0f0', fontSize: '11px' }}>
                                                                    <span style={{ color: '#555', fontWeight: 'bold' }}>CGST 9%</span>
                                                                    <span style={{ fontWeight: 'bold' }}>₹{cgst.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                                                </div>
                                                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 8px', borderBottom: '1px solid #f0f0f0', fontSize: '11px' }}>
                                                                    <span style={{ color: '#555', fontWeight: 'bold' }}>SGST 9%</span>
                                                                    <span style={{ fontWeight: 'bold' }}>₹{sgst.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                                {/* Total Amount Bar */}
                                                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', background: '#dde5f5', borderTop: '1px solid #b0b8cc', borderBottom: '1px solid #b0b8cc' }}>
                                                    <div style={{ borderRight: '1px solid #b0b8cc' }}></div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', fontSize: '16px', fontWeight: '900', color: '#1e3a8a' }}>
                                                        <span>TOTAL AMOUNT</span>
                                                        <span>₹{(selectedOrder.totalAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })()}

                                    {/* BANK DETAILS + SIGNATURE */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', border: '1px solid #b0b8cc', borderTop: 'none' }}>
                                        {/* Left Section: Bank Details */}
                                        <div style={{ borderRight: '1px solid #b0b8cc' }}>
                                            <div style={{ background: '#dde5f5', color: '#1e3a8a', padding: '6px 8px', fontSize: '11px', fontWeight: 'bold', borderBottom: '1px solid #b0b8cc' }}>BANK DETAILS</div>
                                            <table style={{ width: '100%', fontSize: '11px', borderCollapse: 'collapse' }}>
                                                <tbody>
                                                    {[
                                                        ['ACCOUNT NO', 'accountNo', '7037881010'],
                                                        ['IFSC CODE', 'ifscCode', 'IDIB000N140'],
                                                        ['BANK NAME', 'bankName', 'INDIAN BANK'],
                                                        ['BRANCH', 'branch', 'NATHAMPANNAI']
                                                    ].map(([label, field, defaultValue]) => (
                                                        <tr key={label}>
                                                            <td style={{ padding: '4px 8px', fontWeight: 'bold', color: '#1e3a8a', width: '120px' }}>{label}</td>
                                                            <td style={{ padding: '4px 8px', fontWeight: 'bold', color: '#333' }}>
                                                                {selectedOrder.bankDetails?.[field] || defaultValue}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                        {/* Right Section: Signature */}
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <div style={{ background: '#dde5f5', color: '#1e3a8a', padding: '6px 8px', fontSize: '11px', fontWeight: 'bold', borderBottom: '1px solid #b0b8cc', textAlign: 'center' }}>
                                                for PVR AQUACULTURE
                                            </div>
                                            <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: '15px' }}>
                                                <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#444' }}>Authorized Signature</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* FOOTER */}
                                    <div style={{ textAlign: 'center', padding: '16px', fontSize: '13px', fontWeight: 'bold', color: '#1e3a8a', fontStyle: 'italic' }}>
                                        Thank You For Business!
                                    </div>
                                </div> {/* MAIN BOX END */}
                            </div>
                        </div>

                        {/* Modal Actions */}
                        <div className="p-6 bg-gray-50 border-t-2 border-gray-100 flex justify-center items-center no-print gap-6">
                            <button
                                onClick={() => {
                                    handlePrint('invoice-modal-print');
                                }}
                                className="group relative flex items-center gap-3 px-8 py-3 bg-[#1e3a8a] text-white rounded-xl font-black text-sm hover:bg-[#1e40af] transition-all shadow-2xl shadow-blue-200 uppercase tracking-widest overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                                <Printer size={18} className="relative z-10" /> <span className="relative z-10">Print Record</span>
                            </button>
                            <button
                                onClick={() => {
                                    handleDownloadPDF('invoice-modal-print');
                                }}
                                className="flex items-center gap-3 px-8 py-3 bg-white border-2 border-[#1e3a8a] text-[#1e3a8a] rounded-xl font-black text-sm hover:bg-gray-50 transition-all uppercase tracking-widest shadow-xl shadow-gray-100"
                            >
                                <Download size={18} /> Export PDF
                            </button>
                        </div>
                    </div>
                )}
            </Modal>


            {/* Edit Order Modal */}
            <Modal isOpen={isEditMode} onClose={() => setIsEditMode(false)} title="Update Order Status / Payment" maxWidth="max-w-md">
                <form onSubmit={handleUpdateOrder} className="space-y-6 flex flex-col p-8">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Order Status</label>
                        <select
                            className="input-field"
                            value={editFormData.status}
                            onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                        >
                            <option value="Quotation">Quotation</option>
                            <option value="In Production">In Production</option>
                            <option value="Ready for Dispatch">Ready for Dispatch</option>
                            <option value="Dispatched">Dispatched</option>
                            <option value="Completed">Completed</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Amount</label>
                        <div className="text-lg font-bold text-gray-900 bg-gray-50 p-3 rounded-lg border border-gray-100 italic">
                            ₹{(selectedOrder?.totalAmount || 0).toLocaleString()}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Paid Amount (Current: ₹{(selectedOrder?.paidAmount || 0).toLocaleString()})</label>
                        <input
                            type="number"
                            className="input-field"
                            value={editFormData.paidAmount}
                            onChange={(e) => setEditFormData({ ...editFormData, paidAmount: Number(e.target.value) })}
                        />
                        <p className="text-[10px] text-gray-400 italic">Updating this will overwrite the total paid amount.</p>
                    </div>

                    <div className="pt-4 flex justify-end gap-3 flex-shrink-0 mt-auto">
                        <button type="button" onClick={() => setIsEditMode(false)} className="px-4 py-2 text-gray-400 font-bold text-xs uppercase hover:bg-gray-50 rounded-lg transition-colors">Cancel</button>
                        <button type="submit" className="btn-primary py-2 px-6 text-xs uppercase tracking-widest shadow-lg shadow-primary-100 transition-all hover:scale-105 active:scale-95">Save Changes</button>
                    </div>
                </form>
            </Modal>

            <style>
                {`
                @media print {
                    @page { 
                        margin: 0; 
                    }
                    /* Hide everything by default */
                    body * {
                        visibility: hidden !important;
                        overflow: hidden !important; /* Hide scrollbars if present */
                    }

                    /* Only show the element with 'print-only-element' and its children */
                    .print-only-element, .print-only-element * {
                        visibility: visible !important;
                        -webkit-print-color-adjust: exact !important; /* For Chrome/Safari */
                        color-adjust: exact !important; /* Standard */
                    }

                    /* Position the printable content */
                    .print-only-element {
                        position: absolute !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 100% !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        border: none !important;
                        box-shadow: none !important;
                        transform: scale(1) !important;
                        display: block !important; /* Ensure it's a block element */
                        background: white !important; /* Ensure white background */
                        box-sizing: border-box !important;
                    }

                    /* Hide specific UI elements within the printable area if they are part of the original HTML */
                    .no-print,
                    .no-print button,
                    .no-print-input, /* Inputs/selects in creator mode */
                    .no-print-select,
                    button,
                    .lucide,
                    select:has(option[value=""]) {
                        display: none !important;
                    }

                    /* Force inputs/textareas/selects to display their value as text */
                    input.no-print-input,
                    textarea.no-print-input,
                    select.no-print-select {
                        border: none !important;
                        background: transparent !important;
                        appearance: none !important;
                        -webkit-appearance: none !important;
                        color: black !important;
                        padding: 0 !important;
                        font-family: inherit !important;
                        font-size: inherit !important;
                        font-weight: bold !important;
                        width: auto !important;
                        min-width: 0 !important;
                        text-align: inherit !important; /* Inherit text alignment */
                    }

                    textarea.no-print-input {
                        height: auto !important;
                        overflow: visible !important;
                    }

                    /* Override specific styling for printed input values to ensure readability */
                    input[type="date"].no-print-input {
                        -webkit-appearance: none !important;
                        appearance: none !important;
                        &::-webkit-datetime-edit {
                            display: block !important;
                            visibility: visible !important;
                        }
                    }

                    /* General print styling */
                    body {
                        background: white !important;
                        margin: 0 !important;
                        padding: 0 !important;
                    }

                    .page-break { page-break-after: always; }
                }

                @page {
                    size: A4;
                    margin: 10mm;
                }
                `}
            </style>

            {showSuccess && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-3xl p-10 shadow-2xl flex flex-col items-center gap-4 animate-in zoom-in-95 duration-300 max-w-sm w-full mx-4 border border-gray-100">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-2">
                            <CheckCircle2 size={48} />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 text-center">Success!</h2>
                        <p className="text-gray-500 text-center font-medium">Invoice generated successfully!</p>
                        <div className="w-full h-1.5 bg-gray-100 rounded-full mt-4 overflow-hidden">
                            <div className="h-full bg-green-500 animate-progress origin-left"></div>
                        </div>
                    </div>
                </div>
            )}
        </div >

    );
};

export default Invoices;