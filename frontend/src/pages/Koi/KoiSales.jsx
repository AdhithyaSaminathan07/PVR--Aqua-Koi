import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Plus,
    Search,
    Filter,
    ShoppingCart,
    User,
    Calendar,
    ArrowRightCircle,
    CheckCircle2,
    Clock,
    Tag,
    IndianRupee,
    ChevronDown,
    X,
    FileText,
    Printer,
    Download,
    Eye,
    History,
    Receipt,
    Loader2,
    Pencil,
    Trash2
} from 'lucide-react';
import {
    getKoiOrders, createKoiOrder, updateKoiOrder, deleteKoiOrder, updateKoiOrderStatus,
    getKoiCustomers, getKoiEnquiries, getKoiInvoices,
    createKoiInvoice, getKoiStock, createKoiCustomer
} from '../../services/api';
import Modal from '../../components/Modal';

const KoiSales = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState(
        location.pathname.includes('invoices') ? 'history' : 'orders'
    );
    const [loading, setLoading] = useState(true);

    // Shared State
    const [customers, setCustomers] = useState([]);
    const [orders, setOrders] = useState([]);
    const [enquiries, setEnquiries] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const [inventory, setInventory] = useState([]);

    // Order Related State
    const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [justCreatedOrder, setJustCreatedOrder] = useState(null);
    const [editingOrderId, setEditingOrderId] = useState(null);
    const [isEditOrderMode, setIsEditOrderMode] = useState(false);
    const [orderFormData, setOrderFormData] = useState({
        customer: '',
        enquiry: '',
        orderType: 'Fish',
        fishType: '',
        quantity: 1,
        price: '',
        totalAmount: 0
    });

    // Invoice Creator State
    const [zoom, setZoom] = useState(1);
    const [showSuccess, setShowSuccess] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    const [invoiceFormData, setInvoiceFormData] = useState({
        customer: '',
        order: '',
        invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
        invoiceDate: new Date().toISOString().split('T')[0],
        type: 'Fish',
        items: [{ name: '', quantity: 1, price: 0, total: 0 }],
        taxPhase: 'Inside TN',
        transportCharges: 0,
        totalAmount: 0,
        billingInfo: { name: '', address: '', phone: '', gstNo: '' },
        companyInfo: {
            name: 'PVR KOI CENTRE',
            address: '123 Aqua Street, Chennai, TN\nContact: +91 90000 00000',
            contact: 'pvrkoi@gmail.com | www.pvrkoi.com',
            gstin: '33AAAAA0000A1Z5'
        },
        bankDetails: {
            accountNo: '9876543210',
            ifscCode: 'HDFC0001234',
            bankName: 'HDFC BANK - CHENNAI'
        }
    });

    // Invoice History State
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);

    // Customer Creation State
    const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
    const [customerFormData, setCustomerFormData] = useState({
        name: '',
        phone: '',
        email: '',
        address: '',
        gstNo: ''
    });

    const handleCreateCustomer = async (e) => {
        e.preventDefault();
        try {
            const res = await createKoiCustomer(customerFormData);
            setCustomers([...customers, res.data]);
            setOrderFormData({ ...orderFormData, customer: res.data._id });
            setIsCustomerModalOpen(false);
            setCustomerFormData({ name: '', phone: '', email: '', address: '', gstNo: '' });
            alert('Customer added and selected!');
        } catch (err) {
            alert('Error adding customer');
        }
    };

    const handleEditOrderClick = (order) => {
        setOrderFormData({
            customer: order.customer?._id || order.customer,
            enquiry: order.enquiry?._id || order.enquiry || '',
            orderType: order.orderType || 'Fish',
            fishType: order.fishType,
            quantity: order.quantity,
            price: order.price,
            totalAmount: order.totalAmount
        });
        setEditingOrderId(order._id);
        setIsEditOrderMode(true);
        setIsOrderModalOpen(true);
    };

    const handleDeleteOrder = async (id) => {
        if (!window.confirm('Are you sure you want to delete this order?')) return;
        try {
            await deleteKoiOrder(id);
            fetchInitialData();
            alert('Order deleted successfully');
        } catch (err) {
            alert('Error deleting order');
        }
    };

    const handleStatusUpdate = async (id, status) => {
        try {
            await updateKoiOrderStatus(id, { status });
            fetchInitialData();
        } catch (err) {
            alert('Status update failed');
        }
    };

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const [ordRes, custRes, enqRes, invRes, stockRes] = await Promise.all([
                getKoiOrders(), getKoiCustomers(), getKoiEnquiries(), getKoiInvoices(), getKoiStock()
            ]);
            setOrders(ordRes.data);
            setCustomers(custRes.data);
            setEnquiries(enqRes.data);
            setInvoices(invRes.data);
            setInventory(stockRes.data);
        } catch (err) {
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInitialData();
    }, []);

    const [isSaving, setIsSaving] = useState(false);

    const resetOrderForm = () => {
        setOrderFormData({
            customer: '',
            enquiry: '',
            orderType: 'Fish',
            fishType: '',
            quantity: 1,
            price: '',
            totalAmount: 0
        });
        setIsEditOrderMode(false);
        setEditingOrderId(null);
    };

    // --- Order Logic ---
    const handleCreateOrder = async (e) => {
        e.preventDefault();
        if (isSaving) return;
        setIsSaving(true);
        try {
            const payload = {
                ...orderFormData,
                quantity: Number(orderFormData.quantity),
                price: Number(orderFormData.price),
                totalAmount: Number(orderFormData.totalAmount)
            };
            if (!payload.enquiry) delete payload.enquiry;
            if (!payload.fishType) {
                setIsSaving(false);
                return alert(payload.orderType === 'Food' ? 'Please select a food product from stock' : 'Please enter the fish specification');
            }
            if (!payload.customer) {
                setIsSaving(false);
                return alert('Please select a customer');
            }

            let res;
            if (isEditOrderMode) {
                res = await updateKoiOrder(editingOrderId, payload);
                setIsOrderModalOpen(false);
                alert('Order updated successfully!');
            } else {
                res = await createKoiOrder(payload);
                setIsOrderModalOpen(false);
                setJustCreatedOrder(res.data);
                setIsSuccessModalOpen(true);
            }
            fetchInitialData();
            resetOrderForm();
        } catch (err) {
            console.error('Submit Error:', err);
            const serverMsg = err.response?.data?.message;
            const errorDump = err.response?.data ? JSON.stringify(err.response.data, null, 2) : err.message;
            alert(`ORDER FAILED:\n${serverMsg || 'Generic Error'}\n\nTechnical Details:\n${errorDump}`);
        } finally {
            setIsSaving(false);
        }
    };

    const jumpToInvoice = (order) => {
        const type = order.orderType || 'Fish';
        setInvoiceFormData({
            ...invoiceFormData,
            type: type, // Category first
            customer: order.customer?._id || order.customer,
            order: order._id,
            billingInfo: {
                name: order.customer?.name || '',
                address: order.customer?.address || '',
                phone: order.customer?.phone || '',
                gstNo: order.customer?.gstNo || ''
            },
            items: [{
                name: order.fishType || (type === 'Fish' ? 'Koi Fish' : 'Koi Food'),
                quantity: order.quantity || 1,
                price: order.price || 0,
                total: order.totalAmount || 0
            }],
            totalAmount: order.totalAmount
        });
        setActiveTab('creator');
    };

    // --- Invoice Logic ---
    useEffect(() => {
        const subtotal = invoiceFormData.items.reduce((acc, item) => acc + item.total, 0);
        const transportation = Number(invoiceFormData.transportCharges) || 0;
        const total = subtotal + transportation;
        setInvoiceFormData(prev => ({ ...prev, totalAmount: total }));
    }, [invoiceFormData.items, invoiceFormData.transportCharges]);

    const addItem = () => {
        setInvoiceFormData({
            ...invoiceFormData,
            items: [...invoiceFormData.items, { name: '', quantity: 1, price: 0, total: 0 }]
        });
    };

    const updateItem = (index, field, value) => {
        const newItems = [...invoiceFormData.items];
        newItems[index][field] = value;
        if (field === 'quantity' || field === 'price') {
            newItems[index].total = newItems[index].quantity * newItems[index].price;
        }
        setInvoiceFormData({ ...invoiceFormData, items: newItems });
    };

    const handleCreateInvoice = async () => {
        if (!invoiceFormData.customer) return alert('Please select a customer');
        try {
            await createKoiInvoice(invoiceFormData);

            // Auto-complete linked order
            if (invoiceFormData.order) await updateKoiOrderStatus(invoiceFormData.order, { status: 'Completed' });

            fetchInitialData();
            setActiveTab('history');
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);

        } catch (err) {
            console.error('Save failed:', err);
        }
    };

    const numberToWords = (num) => {
        const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
        const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
        const n = ('0000000' + num).slice(-7).match(/^(\d{2})(\d{2})(\d{1})(\d{2})$/);
        if (!n) return '';
        let str = '';
        str += (Number(n[1]) !== 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'Lakh ' : '';
        str += (Number(n[2]) !== 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'Thousand ' : '';
        str += (Number(n[3]) !== 0) ? a[Number(n[3])] + 'Hundred ' : '';
        str += (Number(n[4]) !== 0) ? ((str !== '') ? 'and ' : '') + (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'Only' : 'Only';
        return str;
    };

    const handlePrint = () => window.print();

    const handleDownloadPDF = (targetId = 'koi-invoice-to-print', fileName = 'Invoice.pdf') => {
        if (typeof window.html2pdf === 'undefined') return alert('PDF library is loading...');
        setIsExporting(true);
        setTimeout(() => {
            const element = document.getElementById(targetId);
            const opt = {
                margin: [10, 10],
                filename: fileName,
                image: { type: 'jpeg', quality: 1.0 },
                html2canvas: { scale: 3, useCORS: true },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };
            window.html2pdf().set(opt).from(element).save().then(() => setIsExporting(false));
        }, 300);
    };

    const handleViewInvoice = (inv) => {
        setSelectedInvoice(inv);
        setIsViewModalOpen(true);
    };

    const handlePrintHistory = (inv) => {
        setSelectedInvoice(inv);
        setTimeout(() => window.print(), 300);
    };

    const filteredInvoices = invoices.filter(inv =>
        (inv.customer?.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (inv.invoiceNumber?.toLowerCase() || "").includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <Loader2 className="animate-spin text-blue-600" size={40} />
                <p className="text-gray-400 font-bold italic animate-pulse">Synchronizing Sales Data...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Standardized Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 no-print">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Sales & Billing</h1>
                    <p className="text-gray-500 mt-1">Unified module for orders, quotations, and tax invoices</p>
                </div>

                <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100">
                    <button
                        onClick={() => setActiveTab('orders')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${activeTab === 'orders' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
                    >
                        <ShoppingCart size={14} /> Orders
                    </button>
                    <button
                        onClick={() => setActiveTab('creator')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${activeTab === 'creator' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
                    >
                        <Receipt size={14} /> Creator
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${activeTab === 'history' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
                    >
                        <History size={14} /> History
                    </button>
                </div>
            </div>

            {/* Content Tabs */}
            {activeTab === 'orders' && (
                <div className="space-y-6">
                    <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-5 rounded-[1.5rem] border border-gray-100 shadow-sm no-print">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search by customer or order details..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-100 transition-all font-medium"
                            />
                        </div>
                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <div className="flex items-center gap-4 text-sm px-4">
                                <span className="font-bold text-gray-400 uppercase tracking-widest text-[10px]">Total Sales</span>
                                <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full font-bold">{orders.length}</span>
                            </div>
                            <button
                                onClick={() => { resetOrderForm(); setIsOrderModalOpen(true); }}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-900/20 active:scale-95"
                            >
                                <Plus size={18} />
                                <span>Record Sale</span>
                            </button>
                        </div>
                    </div>

                    <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left min-w-[1000px]">
                                <thead className="bg-gray-50/50">
                                    <tr className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100">
                                        <th className="px-8 py-6">Order Info</th>
                                        <th className="px-8 py-6">Customer</th>
                                        <th className="px-8 py-6">Item / Qty</th>
                                        <th className="px-8 py-6">Total Amount</th>
                                        <th className="px-8 py-6">Status</th>
                                        <th className="px-8 py-6 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {orders.filter(o =>
                                        (o.customer?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                                        (o.fishType || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                                        (o._id || '').includes(searchTerm)
                                    ).map(order => {
                                        const linkedInvoice = invoices.find(inv => inv.order === order._id || (inv.order?._id === order._id));
                                        return (
                                            <tr key={order._id} className="hover:bg-gray-50/50 transition-colors group">
                                                <td className="px-8 py-5">
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-gray-900 italic tracking-tighter capitalize">#{order?._id?.slice(-6).toUpperCase()}</span>
                                                        <span className={`text-[9px] font-black w-fit px-1.5 py-0.5 rounded mt-1 uppercase tracking-tighter ${order.orderType === 'Food' ? 'bg-blue-50 text-blue-600' : 'bg-blue-50 text-blue-600'}`}>
                                                            {order.orderType || 'Fish'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-bold text-sm">
                                                            {order.customer?.name?.[0] || 'C'}
                                                        </div>
                                                        <span className="font-bold text-gray-700 uppercase tracking-tight text-sm">{order.customer?.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-gray-900 text-sm">{order.fishType}</span>
                                                        <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-0.5">{order.quantity} Units</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <div className="text-lg font-black text-gray-900 flex items-center gap-1">
                                                        <IndianRupee size={16} className="text-gray-300" />
                                                        {order.totalAmount}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <div className="flex flex-col gap-1.5">
                                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider w-fit ${order.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                                                            {order.status === 'Completed' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                                                            {order.status}
                                                        </span>
                                                        {linkedInvoice && (
                                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[9px] font-black uppercase tracking-widest w-fit">
                                                                <Receipt size={10} /> Bill Generated
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5 text-right">
                                                    <div className="flex gap-2 justify-end">
                                                        {linkedInvoice ? (
                                                            <button
                                                                onClick={() => handleViewInvoice(linkedInvoice)}
                                                                className="p-2.5 bg-gray-900 text-white rounded-xl hover:bg-black transition-all shadow-sm"
                                                                title="View Invoice"
                                                            >
                                                                <Eye size={16} />
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={() => jumpToInvoice(order)}
                                                                className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-all font-bold text-[10px] uppercase tracking-widest flex items-center gap-2"
                                                                title="Generate Bill"
                                                            >
                                                                <Receipt size={16} />
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => handleEditOrderClick(order)}
                                                            className="p-2.5 bg-gray-50 text-gray-400 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                                        >
                                                            <Pencil size={14} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteOrder(order._id)}
                                                            className="p-2.5 bg-gray-50 text-gray-400 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}


            {activeTab === 'creator' && (
                <div className="flex flex-col gap-6 no-print">
                    <div className="flex justify-end gap-3 bg-white p-4 rounded-3xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-2 border-r pr-4 hidden md:flex">
                            <button onClick={() => setZoom(Math.max(0.5, zoom - 0.1))} className="p-2 hover:bg-gray-100 rounded-lg">-</button>
                            <span className="text-xs font-black w-10 text-center">{Math.round(zoom * 100)}%</span>
                            <button onClick={() => setZoom(Math.min(1.5, zoom + 0.1))} className="p-2 hover:bg-gray-100 rounded-lg">+</button>
                        </div>
                        <button onClick={handleCreateInvoice} className="flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-black transition-all">
                            <CheckCircle2 size={16} /> Save Record
                        </button>
                        <button onClick={handlePrint} className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-emerald-700 transition-all">
                            <Printer size={16} /> Print
                        </button>
                        <button onClick={() => handleDownloadPDF()} className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all">
                            <Download size={16} /> PDF
                        </button>
                    </div>

                    <div className="flex justify-center bg-gray-100 rounded-[3rem] p-12 min-h-[1000px] overflow-auto shadow-inner border-4 border-white">
                        <div
                            style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}
                            className="bg-white shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] w-[800px] min-h-[1100px] p-12 flex flex-col gap-6 relative"
                            id="koi-invoice-to-print"
                        >
                            {/* PROFESSIONAL TAX INVOICE TEMPLATE */}
                            <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: '12px', width: '100%', border: '1px solid #b0b8cc' }}>
                                {/* TITLE BAR */}
                                <div style={{ textAlign: 'center', padding: '8px', fontWeight: 'bold', fontSize: '16px', background: '#eef2fb', color: '#1e3a8a', borderBottom: '1px solid #b0b8cc', letterSpacing: '4px' }}>
                                    TAX INVOICE
                                </div>

                                {/* HEADER GRID */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr' }}>
                                    {/* Left Section: Company & Bill To */}
                                    <div style={{ borderRight: '1px solid #b0b8cc' }}>
                                        {/* Company Info */}
                                        <div style={{ padding: '12px', borderBottom: '1px solid #b0b8cc', textAlign: 'center' }}>
                                            <input
                                                style={{ fontSize: '24px', fontWeight: '900', color: '#1e3a8a', margin: 0, textAlign: 'center', border: 'none', width: '100%' }}
                                                value={invoiceFormData.companyInfo.name}
                                                onChange={(e) => setInvoiceFormData({ ...invoiceFormData, companyInfo: { ...invoiceFormData.companyInfo, name: e.target.value } })}
                                            />
                                            <textarea
                                                style={{ fontSize: '10px', color: '#666', margin: '4px 0', whiteSpace: 'pre-line', textAlign: 'center', border: 'none', width: '100%', resize: 'none' }}
                                                value={invoiceFormData.companyInfo.address}
                                                onChange={(e) => setInvoiceFormData({ ...invoiceFormData, companyInfo: { ...invoiceFormData.companyInfo, address: e.target.value } })}
                                            />
                                            <input
                                                style={{ fontSize: '10px', color: '#666', margin: 0, textAlign: 'center', border: 'none', width: '100%' }}
                                                value={invoiceFormData.companyInfo.contact}
                                                onChange={(e) => setInvoiceFormData({ ...invoiceFormData, companyInfo: { ...invoiceFormData.companyInfo, contact: e.target.value } })}
                                            />
                                            <div style={{ background: '#f0f4ff', padding: '4px', marginTop: '8px', fontSize: '11px', fontWeight: 'bold', color: '#1e3a8a', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                                                GSTIN:
                                                <input
                                                    style={{ background: 'transparent', border: 'none', fontWeight: 'bold', color: '#1e3a8a', width: '120px' }}
                                                    value={invoiceFormData.companyInfo.gstin}
                                                    onChange={(e) => setInvoiceFormData({ ...invoiceFormData, companyInfo: { ...invoiceFormData.companyInfo, gstin: e.target.value } })}
                                                />
                                            </div>
                                        </div>

                                        {/* BILL TO */}
                                        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                                            <div style={{ background: '#dde5f5', padding: '6px', textAlign: 'center', borderBottom: '1px solid #b0b8cc', fontWeight: 'bold', color: '#1e3a8a' }}>BILL TO</div>

                                            <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                                                <select
                                                    className="no-print"
                                                    style={{ width: '100%', padding: '6px', border: '1px solid #eee' }}
                                                    onChange={(e) => {
                                                        const c = customers.find(x => x._id === e.target.value);
                                                        if (c) setInvoiceFormData({ ...invoiceFormData, customer: c._id, billingInfo: { name: c.name, address: c.address, phone: c.phone, gstNo: c.gstNo || '' } });
                                                    }}
                                                >
                                                    <option value="">Choose Customer</option>
                                                    {customers.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                                </select>
                                                <input
                                                    style={{ fontWeight: 'bold', fontSize: '14px', border: 'none', color: '#111', width: '100%' }}
                                                    placeholder="Customer Name"
                                                    value={invoiceFormData.billingInfo.name}
                                                    onChange={(e) => setInvoiceFormData({ ...invoiceFormData, billingInfo: { ...invoiceFormData.billingInfo, name: e.target.value } })}
                                                />
                                                <textarea
                                                    style={{ fontSize: '11px', border: 'none', resize: 'none', height: '40px', color: '#555', width: '100%' }}
                                                    placeholder="Address"
                                                    value={invoiceFormData.billingInfo.address}
                                                    onChange={(e) => setInvoiceFormData({ ...invoiceFormData, billingInfo: { ...invoiceFormData.billingInfo, address: e.target.value } })}
                                                />
                                                <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                                                    <b style={{ fontSize: '11px' }}>Phone:</b>
                                                    <input
                                                        style={{ fontSize: '11px', border: 'none', color: '#333', flex: 1 }}
                                                        value={invoiceFormData.billingInfo.phone}
                                                        onChange={(e) => setInvoiceFormData({ ...invoiceFormData, billingInfo: { ...invoiceFormData.billingInfo, phone: e.target.value } })}
                                                    />
                                                </div>
                                                <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                                                    <b style={{ fontSize: '11px' }}>GSTIN:</b>
                                                    <input
                                                        style={{ fontSize: '11px', border: 'none', color: '#333', flex: 1 }}
                                                        value={invoiceFormData.billingInfo.gstNo}
                                                        placeholder="N/A"
                                                        onChange={(e) => setInvoiceFormData({ ...invoiceFormData, billingInfo: { ...invoiceFormData.billingInfo, gstNo: e.target.value } })}
                                                    />
                                                </div>
                                            </div>
                                            {/* Sales & Tax */}
                                            <div style={{ padding: '4px 10px', borderTop: '1px solid #eee', display: 'flex', flexDirection: 'column', gap: '3px', background: '#fcfcfc' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px' }}>
                                                    <span style={{ color: '#888', fontWeight: 'bold' }}>TAX CATEGORY:</span>
                                                    <select
                                                        style={{ border: 'none', fontSize: '10px', fontWeight: 'bold', background: 'transparent' }}
                                                        value={invoiceFormData.taxPhase}
                                                        onChange={(e) => setInvoiceFormData({ ...invoiceFormData, taxPhase: e.target.value })}
                                                        className="no-print-select"
                                                    >
                                                        <option value="Inside TN">Inside TN (CGST/SGST)</option>
                                                        <option value="Outside TN">Outside TN (IGST)</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Section: Invoice Info & Logo */}
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <div style={{ display: 'flex', borderBottom: '1px solid #b0b8cc', height: '40px' }}>
                                            <div style={{ flex: 1, padding: '8px', fontWeight: 'bold', borderRight: '1px solid #b0b8cc', display: 'flex', alignItems: 'center', color: '#1e3a8a' }}>INVOICE NO.</div>
                                            <div style={{ flex: 1, padding: '8px', display: 'flex', alignItems: 'center' }}>
                                                <input
                                                    style={{ border: 'none', fontWeight: 'bold', width: '100%' }}
                                                    value={invoiceFormData.invoiceNumber}
                                                    onChange={(e) => setInvoiceFormData({ ...invoiceFormData, invoiceNumber: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', borderBottom: '1px solid #b0b8cc', height: '40px' }}>
                                            <div style={{ flex: 1, padding: '8px', fontWeight: 'bold', borderRight: '1px solid #b0b8cc', display: 'flex', alignItems: 'center', color: '#1e3a8a' }}>DATE</div>
                                            <div style={{ flex: 1, padding: '8px', display: 'flex', alignItems: 'center' }}>
                                                <input type="date" style={{ border: 'none', fontWeight: 'bold' }} value={invoiceFormData.invoiceDate} onChange={(e) => setInvoiceFormData({ ...invoiceFormData, invoiceDate: e.target.value })} />
                                            </div>
                                        </div>

                                        <div style={{ padding: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1, minHeight: '200px' }}>
                                            <img src="/PVR.png" alt="Logo" style={{ maxHeight: '180px', maxWidth: '100%', objectFit: 'contain' }} />
                                        </div>

                                        <div style={{ borderTop: '1px solid #b0b8cc', padding: '4px 10px' }} className="no-print">
                                            <p style={{ fontSize: '9px', fontWeight: 'bold', color: '#666', margin: '0 0 4px 0', textAlign: 'center', letterSpacing: '0.5px', opacity: 0.8 }}>INVOICE TYPE</p>
                                            <div style={{ display: 'flex', gap: '4px' }}>
                                                {['Fish', 'Food'].map(t => (
                                                    <button
                                                        key={t}
                                                        type="button"
                                                        onClick={() => setInvoiceFormData({ ...invoiceFormData, type: t, items: [{ name: '', quantity: 1, price: 0, total: 0 }] })}
                                                        style={{ flex: 1, padding: '3px 5px', fontSize: '10px', fontWeight: '800', border: '1px solid #eee', background: invoiceFormData.type === t ? '#1e3a8a' : 'white', color: invoiceFormData.type === t ? 'white' : '#666', borderRadius: '4px', transition: 'all 0.2s', textTransform: 'uppercase' }}
                                                    >
                                                        {t}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* ITEMS TABLE */}
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ background: '#1e3a8a', color: 'white' }}>
                                            <th style={{ padding: '10px', border: '1px solid #3b5daa' }}>SL</th>
                                            <th style={{ padding: '10px', border: '1px solid #3b5daa', textAlign: 'left' }}>ITEM DESCRIPTION</th>
                                            <th style={{ padding: '10px', border: '1px solid #3b5daa' }}>QTY</th>
                                            <th style={{ padding: '10px', border: '1px solid #3b5daa', textAlign: 'right' }}>PRICE</th>
                                            <th style={{ padding: '10px', border: '1px solid #3b5daa', textAlign: 'right' }}>TOTAL</th>
                                            <th style={{ padding: '10px', border: '1px solid #3b5daa' }} className="no-print"></th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {invoiceFormData.items.map((item, i) => (
                                            <tr key={i} style={{ height: '35px' }}>
                                                <td style={{ textAlign: 'center', border: '1px solid #eee' }}>{i + 1}</td>
                                                <td style={{ padding: '0 10px', border: '1px solid #eee' }}>
                                                    {invoiceFormData.type === 'Food' ? (
                                                        <select
                                                            style={{ width: '100%', border: 'none', fontWeight: 'bold' }}
                                                            value={item.name}
                                                            onChange={(e) => updateItem(i, 'name', e.target.value)}
                                                        >
                                                            <option value="">Select Product</option>
                                                            {inventory.map(prod => <option key={prod._id} value={prod.itemName}>{prod.itemName}</option>)}
                                                        </select>
                                                    ) : (
                                                        <input
                                                            style={{ width: '100%', border: 'none', fontWeight: 'bold' }}
                                                            placeholder="Description"
                                                            value={item.name}
                                                            onChange={(e) => updateItem(i, 'name', e.target.value)}
                                                        />
                                                    )}
                                                </td>
                                                <td style={{ border: '1px solid #eee', textAlign: 'center' }}>
                                                    <input type="number" style={{ width: '50px', textAlign: 'center', border: 'none' }} value={item.quantity} onChange={(e) => updateItem(i, 'quantity', Number(e.target.value))} />
                                                </td>
                                                <td style={{ border: '1px solid #eee', textAlign: 'right', paddingRight: '10px' }}>
                                                    <input type="number" style={{ width: '80px', textAlign: 'right', border: 'none' }} value={item.price} onChange={(e) => updateItem(i, 'price', Number(e.target.value))} />
                                                </td>
                                                <td style={{ border: '1px solid #eee', textAlign: 'right', paddingRight: '10px', fontWeight: 'bold' }}>
                                                    ₹{item.total.toLocaleString()}
                                                </td>
                                                <td style={{ border: '1px solid #eee', textAlign: 'center' }} className="no-print">
                                                    <button onClick={() => removeItem(i)} style={{ color: '#ef4444', fontWeight: 'bold', padding: '4px' }}>✕</button>
                                                </td>
                                            </tr>
                                        ))}
                                        <tr className="no-print">
                                            <td colSpan={6} style={{ textAlign: 'center', padding: '10px' }}>
                                                <button onClick={addItem} style={{ fontSize: '10px', fontWeight: 'bold', color: '#1e3a8a' }}>+ ADD ITEM</button>
                                            </td>
                                        </tr>
                                        {/* Empty rows to maintain height */}
                                        {[...Array(Math.max(0, 5 - invoiceFormData.items.length))].map((_, i) => (
                                            <tr key={i} style={{ height: '35px' }}><td style={{ border: '1px solid #eee' }}></td><td style={{ border: '1px solid #eee' }}></td><td style={{ border: '1px solid #eee' }}></td><td style={{ border: '1px solid #eee' }}></td><td style={{ border: '1px solid #eee' }}></td><td style={{ border: '1px solid #eee' }} className="no-print"></td></tr>
                                        ))}
                                    </tbody>
                                </table>

                                <div style={{ borderTop: '1px solid #b0b8cc' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr' }}>
                                        <div style={{ padding: '15px', borderRight: '1px solid #b0b8cc' }}>
                                            <p style={{ margin: 0, fontSize: '10px', color: '#888' }}>TOTAL IN WORDS</p>
                                            <p style={{ margin: '5px 0 0 0', fontWeight: 'bold', color: '#1e3a8a' }}>{numberToWords(invoiceFormData.totalAmount)}</p>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <div style={{ padding: '8px 15px', display: 'flex', justifyItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #eee' }}>
                                                <span style={{ color: '#555', fontWeight: 'bold' }}>TRANSPORT</span>
                                                <input type="number" style={{ width: '80px', textAlign: 'right', border: 'none', fontWeight: 'bold' }} value={invoiceFormData.transportCharges} onChange={(e) => setInvoiceFormData({ ...invoiceFormData, transportCharges: Number(e.target.value) })} />
                                            </div>
                                            {invoiceFormData.taxPhase === 'Outside TN' ? (
                                                <div style={{ padding: '8px 15px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f0f0f0' }}>
                                                    <span style={{ color: '#555', fontWeight: 'bold' }}>IGST (18%)</span>
                                                    <span style={{ fontWeight: 'bold', color: '#333' }}>₹{(invoiceFormData.totalAmount - (invoiceFormData.items.reduce((a, c) => a + c.total, 0) + invoiceFormData.transportCharges)).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                                </div>
                                            ) : (
                                                <>
                                                    <div style={{ padding: '8px 15px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee' }}>
                                                        <span style={{ color: '#555', fontWeight: 'bold' }}>CGST (9%)</span>
                                                        <span style={{ fontWeight: 'bold', color: '#333' }}>₹{((invoiceFormData.totalAmount - (invoiceFormData.items.reduce((a, c) => a + c.total, 0) + invoiceFormData.transportCharges)) / 2).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                                    </div>
                                                    <div style={{ padding: '8px 15px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f0f0f0' }}>
                                                        <span style={{ color: '#555', fontWeight: 'bold' }}>SGST (9%)</span>
                                                        <span style={{ fontWeight: 'bold', color: '#333' }}>₹{((invoiceFormData.totalAmount - (invoiceFormData.items.reduce((a, c) => a + c.total, 0) + invoiceFormData.transportCharges)) / 2).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                                    </div>
                                                </>
                                            )}
                                            <div style={{ padding: '15px', display: 'flex', justifyContent: 'space-between', background: '#dde5f5', fontWeight: '900', color: '#1e3a8a', fontSize: '16px' }}>
                                                <span>GRAND TOTAL</span>
                                                <span>₹{invoiceFormData.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* FOOTER: BANK & SIGNATURE */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', borderTop: '1px solid #b0b8cc' }}>
                                    <div style={{ padding: '15px', borderRight: '1px solid #b0b8cc' }}>
                                        <div style={{ background: '#dde5f5', padding: '5px 10px', fontSize: '10px', fontWeight: 'bold', color: '#1e3a8a', marginBottom: '10px' }}>BANK DETAILS</div>

                                        <div style={{ display: 'flex', gap: '4px', alignItems: 'center', margin: '2px 0' }}>
                                            <b style={{ fontSize: '11px' }}>Account:</b>
                                            <input
                                                style={{ fontSize: '11px', border: 'none', color: '#333', flex: 1 }}
                                                value={invoiceFormData.bankDetails.accountNo}
                                                onChange={(e) => setInvoiceFormData({ ...invoiceFormData, bankDetails: { ...invoiceFormData.bankDetails, accountNo: e.target.value } })}
                                            />
                                        </div>
                                        <div style={{ display: 'flex', gap: '4px', alignItems: 'center', margin: '2px 0' }}>
                                            <b style={{ fontSize: '11px' }}>IFSC:</b>
                                            <input
                                                style={{ fontSize: '11px', border: 'none', color: '#333', flex: 1 }}
                                                value={invoiceFormData.bankDetails.ifscCode}
                                                onChange={(e) => setInvoiceFormData({ ...invoiceFormData, bankDetails: { ...invoiceFormData.bankDetails, ifscCode: e.target.value } })}
                                            />
                                        </div>
                                        <div style={{ display: 'flex', gap: '4px', alignItems: 'center', margin: '2px 0' }}>
                                            <b style={{ fontSize: '11px' }}>Bank:</b>
                                            <input
                                                style={{ fontSize: '11px', border: 'none', color: '#333', flex: 1 }}
                                                value={invoiceFormData.bankDetails.bankName}
                                                onChange={(e) => setInvoiceFormData({ ...invoiceFormData, bankDetails: { ...invoiceFormData.bankDetails, bankName: e.target.value } })}
                                            />
                                        </div>
                                    </div>
                                    <div style={{ height: '120px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '15px', textAlign: 'center' }}>
                                        <p style={{ margin: 0, fontWeight: 'bold', color: '#111' }}>for {invoiceFormData.companyInfo.name}</p>
                                        <p style={{ margin: 0, fontSize: '10px', color: '#999' }}>Authorized Signature</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'history' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 no-print">
                    <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search invoices..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-semibold"
                            />
                        </div>
                    </div>

                    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50/50">
                                <tr>
                                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Invoice No</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Customer</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Type</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Amount</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 text-sm">
                                {filteredInvoices.length > 0 ? filteredInvoices.map((inv) => (
                                    <tr key={inv._id} className="hover:bg-gray-50/50 transition-all group">
                                        <td className="px-8 py-6 font-bold text-gray-600">{new Date(inv.date).toLocaleDateString()}</td>
                                        <td className="px-8 py-6">
                                            <div className="font-black text-gray-900 italic tracking-tighter text-lg">#{inv.invoiceNumber}</div>
                                            {inv.order && (
                                                <div className="text-[9px] font-black text-blue-500 uppercase tracking-widest mt-1 bg-blue-50 px-1 rounded w-fit">Ref Order: #{inv?.order?._id?.slice(-6).toUpperCase() || inv?.order?.toString()?.slice(-6).toUpperCase() || 'N/A'}</div>

                                            )}
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="font-black text-gray-900 uppercase tracking-tight">{inv.customer?.name}</div>
                                            <div className="text-[10px] text-gray-400 font-black italic mt-0.5">{inv.customer?.phone}</div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${inv.type === 'Fish' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-blue-50 text-blue-600 border border-blue-100'}`}>
                                                {inv.type}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 font-black text-gray-900 text-xl tracking-tighter">
                                            <div className="flex items-center gap-1">
                                                <IndianRupee size={18} className="text-gray-400" />
                                                {inv.totalAmount.toLocaleString()}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex gap-2 justify-end no-print">
                                                <button
                                                    onClick={() => handleViewInvoice(inv)}
                                                    className="p-3 bg-gray-50 hover:bg-blue-50 hover:text-blue-600 text-gray-400 rounded-2xl transition-all shadow-sm"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handlePrintHistory(inv)}
                                                    className="p-3 bg-gray-50 hover:bg-emerald-50 hover:text-emerald-600 text-gray-400 rounded-2xl transition-all shadow-sm"
                                                >
                                                    <Printer size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={6} className="py-32 text-center flex flex-col items-center justify-center gap-4">
                                            <div className="p-6 bg-gray-50 rounded-full text-gray-200"><Receipt size={60} /></div>
                                            <p className="text-gray-400 font-black uppercase tracking-widest text-xs italic">No invoice records identified</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modals */}
            <Modal
                isOpen={isOrderModalOpen}
                onClose={() => setIsOrderModalOpen(false)}
                title="CREATE NEW KOI ORDER"
                maxWidth="max-w-2xl"
            >
                <form onSubmit={handleCreateOrder} className="p-10 space-y-6">
                    <div className="flex gap-2 p-1 bg-gray-100 rounded-2xl w-fit mb-4">
                        {['Fish', 'Food'].map(t => (
                            <button
                                key={t}
                                type="button"
                                onClick={() => setOrderFormData({ ...orderFormData, orderType: t, fishType: '', price: 0, totalAmount: 0 })}
                                className={`px-6 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all ${orderFormData.orderType === t ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:text-gray-600'
                                    }`}
                            >
                                {t.toUpperCase()}
                            </button>
                        ))}
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 italic">Start from Enquiry (Optional)</label>
                        <select
                            value={orderFormData.enquiry}
                            disabled={orderFormData.orderType === 'Food'}
                            onChange={(e) => {
                                const enq = enquiries.find(eq => eq._id === e.target.value);
                                if (enq) {
                                    const invItem = inventory.find(i => i.itemName.toLowerCase() === (enq.requirement || '').toLowerCase());
                                    setOrderFormData({
                                        ...orderFormData,
                                        enquiry: e.target.value,
                                        customer: enq.customerId?._id || '',
                                        fishType: enq.requirement || '',
                                        price: invItem ? invItem.sellingPrice : 0,
                                        totalAmount: orderFormData.quantity * (invItem ? invItem.sellingPrice : 0)
                                    });
                                } else {
                                    setOrderFormData({ ...orderFormData, enquiry: '', customer: '', fishType: '', price: 0, totalAmount: 0 });
                                }
                            }}
                            className="w-full px-6 py-4 bg-blue-50/50 border-2 border-blue-100 border-dashed rounded-3xl focus:ring-4 focus:ring-blue-500/20 transition-all font-bold text-xs uppercase tracking-widest appearance-none disabled:opacity-50"
                        >
                            <option value="">{orderFormData.orderType === 'Food' ? 'N/A for Food' : 'New Direct Order (No Enquiry)'}</option>
                            {enquiries.filter(e => e.status !== 'Converted').map(enq => (
                                <option key={enq._id} value={enq._id}>{enq.customerId?.name} - {enq.requirement}</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <div className="flex justify-between items-center px-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Customer</label>
                                <button
                                    type="button"
                                    onClick={() => setIsCustomerModalOpen(true)}
                                    className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline"
                                >
                                    + New Customer
                                </button>
                            </div>
                            <select
                                required
                                value={orderFormData.customer}
                                onChange={(e) => setOrderFormData({ ...orderFormData, customer: e.target.value })}
                                className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-bold text-sm"
                            >
                                <option value="">Select Customer</option>
                                {customers.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 italic">
                                {orderFormData.orderType === 'Fish' ? 'Fish Specification' : 'Food Product'}
                            </label>
                            {orderFormData.orderType === 'Food' ? (
                                <select
                                    required
                                    value={orderFormData.fishType}
                                    onChange={(e) => {
                                        const item = inventory.find(i => i.itemName === e.target.value);
                                        setOrderFormData({
                                            ...orderFormData,
                                            fishType: e.target.value,
                                            price: item?.sellingPrice || 0,
                                            totalAmount: orderFormData.quantity * (item?.sellingPrice || 0)
                                        });
                                    }}
                                    className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-bold text-sm"
                                >
                                    <option value="">Select from Stock</option>
                                    {inventory.filter(i => i.category !== 'Fish').map(item => (
                                        <option key={item._id} value={item.itemName}>{item.itemName} (₹{item.sellingPrice || 0})</option>
                                    ))}
                                </select>
                            ) : (
                                <div className="relative">
                                    <input
                                        list="order-inventory-list"
                                        type="text"
                                        required
                                        value={orderFormData.fishType}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            const invItem = inventory.filter(i => i.category === 'Fish').find(i => i.itemName === val);
                                            setOrderFormData({
                                                ...orderFormData,
                                                fishType: val,
                                                price: invItem ? invItem.sellingPrice : orderFormData.price,
                                                totalAmount: orderFormData.quantity * (invItem ? invItem.sellingPrice : orderFormData.price)
                                            });
                                        }}
                                        className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-bold text-sm uppercase"
                                        placeholder="Enter Specification..."
                                    />
                                    <datalist id="order-inventory-list">
                                        {inventory.filter(i => i.category === 'Fish').map(item => (
                                            <option key={item._id} value={item.itemName}>{item.itemName}</option>
                                        ))}
                                    </datalist>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 italic">Quantity</label>
                            <input
                                type="number"
                                required
                                value={orderFormData.quantity}
                                onChange={(e) => setOrderFormData({ ...orderFormData, quantity: e.target.value, totalAmount: e.target.value * orderFormData.price })}
                                className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 text-center font-bold"
                                placeholder="0"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 italic">Unit Price</label>
                            <input
                                type="number"
                                required
                                value={orderFormData.price}
                                onChange={(e) => setOrderFormData({ ...orderFormData, price: e.target.value, totalAmount: orderFormData.quantity * e.target.value })}
                                className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 text-center font-bold"
                                placeholder="0.00"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 italic">Total Amount</label>
                            <div className="w-full px-6 py-4 bg-blue-600 text-white rounded-2xl text-center font-black text-lg shadow-lg">
                                ₹{orderFormData.totalAmount || 0}
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-6 pt-4">
                        <button type="button" onClick={() => setIsOrderModalOpen(false)} className="flex-1 py-5 bg-gray-100 text-gray-500 rounded-[2rem] font-black uppercase tracking-[0.3em] text-[10px] hover:bg-gray-200 transition-all">Cancel</button>
                        <button type="submit" className="flex-1 py-5 bg-gray-900 text-white rounded-[2rem] font-black uppercase tracking-[0.3em] text-[10px] hover:shadow-2xl hover:shadow-blue-200 transition-all active:scale-95">Verify & Create</button>
                    </div>
                </form>
            </Modal>

            {/* Quick Customer Modal */}
            <Modal
                isOpen={isCustomerModalOpen}
                onClose={() => setIsCustomerModalOpen(false)}
                title="REGISTER NEW CUSTOMER"
                maxWidth="max-w-xl"
            >
                <form onSubmit={handleCreateCustomer} className="p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Full Name</label>
                            <input
                                type="text"
                                required
                                value={customerFormData.name}
                                onChange={(e) => setCustomerFormData({ ...customerFormData, name: e.target.value })}
                                className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 font-bold"
                                placeholder="Enter Name"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Phone Number</label>
                            <input
                                type="text"
                                required
                                value={customerFormData.phone}
                                onChange={(e) => setCustomerFormData({ ...customerFormData, phone: e.target.value })}
                                className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 font-bold"
                                placeholder="Contact Number"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">GST Number (Optional)</label>
                        <input
                            type="text"
                            value={customerFormData.gstNo}
                            onChange={(e) => setCustomerFormData({ ...customerFormData, gstNo: e.target.value })}
                            className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 font-bold uppercase"
                            placeholder="GSTIN"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Address</label>
                        <textarea
                            value={customerFormData.address}
                            onChange={(e) => setCustomerFormData({ ...customerFormData, address: e.target.value })}
                            className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 font-bold min-h-[100px]"
                            placeholder="Complete Address"
                        />
                    </div>
                    <div className="flex gap-4 pt-4">
                        <button type="button" onClick={() => setIsCustomerModalOpen(false)} className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black uppercase text-[10px] tracking-widest">Cancel</button>
                        <button type="submit" className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-blue-100">Add & Select</button>
                    </div>
                </form>
            </Modal>

            <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="INVOICE VAULT | PREVIEW" maxWidth="max-w-4xl">
                <div className="flex flex-col gap-6">
                    <div className="flex justify-end gap-3 no-print mb-4">
                        <button onClick={() => window.print()} className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100"><Printer size={14} /> Print</button>
                        <button onClick={() => handleDownloadPDF('view-invoice-to-print', `Koi_Inv_${selectedInvoice?.invoiceNumber}.pdf`)} className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"><Download size={14} /> PDF</button>
                    </div>

                    <div className="overflow-auto bg-gray-50 border-4 border-white p-12 rounded-[3.5rem] flex justify-center shadow-inner">
                        {selectedInvoice && (
                            <div className="bg-white shadow-2xl w-[800px] min-h-[1100px] p-12 flex flex-col gap-6 relative" id="view-invoice-to-print">
                                {/* PROFESSIONAL TAX INVOICE TEMPLATE (READ ONLY) */}
                                <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: '12px', width: '100%', border: '1px solid #b0b8cc' }}>
                                    <div style={{ textAlign: 'center', padding: '8px', fontWeight: 'bold', fontSize: '16px', background: '#eef2fb', color: '#1e3a8a', borderBottom: '1px solid #b0b8cc', letterSpacing: '4px' }}>
                                        TAX INVOICE
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr' }}>
                                        <div style={{ borderRight: '1px solid #b0b8cc' }}>
                                            <div style={{ padding: '12px', borderBottom: '1px solid #b0b8cc', textAlign: 'center' }}>
                                                <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#1e3a8a', margin: 0 }}>{selectedInvoice.companyInfo?.name}</h2>
                                                <p style={{ fontSize: '10px', color: '#666', margin: '4px 0', whiteSpace: 'pre-line' }}>{selectedInvoice.companyInfo?.address}</p>
                                                <p style={{ fontSize: '10px', color: '#666', margin: 0 }}>{selectedInvoice.companyInfo?.contact}</p>
                                                <div style={{ background: '#f0f4ff', padding: '4px', marginTop: '8px', fontSize: '11px', fontWeight: 'bold', color: '#1e3a8a' }}>
                                                    GSTIN: {selectedInvoice.companyInfo?.gstin}
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                                                <div style={{ background: '#dde5f5', padding: '6px', textAlign: 'center', borderBottom: '1px solid #b0b8cc', fontWeight: 'bold', color: '#1e3a8a' }}>BILL TO</div>

                                                <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                                                    <p style={{ fontWeight: 'bold', fontSize: '14px', margin: 0, color: '#111' }}>{selectedInvoice.billingInfo?.name}</p>
                                                    <p style={{ fontSize: '11px', color: '#555', margin: 0 }}>{selectedInvoice.billingInfo?.address}</p>
                                                    <p style={{ margin: 0, color: '#333' }}><b>Phone:</b> {selectedInvoice.billingInfo?.phone}</p>
                                                    <p style={{ margin: 0, color: '#333' }}><b>GSTIN:</b> {selectedInvoice.billingInfo?.gstNo || 'N/A'}</p>
                                                </div>
                                                {/* Sales & Tax */}
                                                <div style={{ padding: '4px 10px', borderTop: '1px solid #eee', display: 'flex', flexDirection: 'column', gap: '3px', background: '#fcfcfc' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px' }}>
                                                        <span style={{ color: '#888', fontWeight: 'bold' }}>TAX CATEGORY:</span>
                                                        <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#333' }}>
                                                            {selectedInvoice.taxPhase === 'Outside TN' ? 'Outside TN (IGST)' : 'Inside TN (CGST/SGST)'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <div style={{ display: 'flex', borderBottom: '1px solid #b0b8cc', height: '40px' }}>
                                                <div style={{ flex: 1, padding: '8px', fontWeight: 'bold', borderRight: '1px solid #b0b8cc', display: 'flex', alignItems: 'center', color: '#1e3a8a' }}>INVOICE NO.</div>
                                                <div style={{ flex: 1, padding: '8px', display: 'flex', alignItems: 'center', fontWeight: 'bold' }}>{selectedInvoice.invoiceNumber}</div>
                                            </div>
                                            <div style={{ display: 'flex', borderBottom: '1px solid #b0b8cc', height: '40px' }}>
                                                <div style={{ flex: 1, padding: '8px', fontWeight: 'bold', borderRight: '1px solid #b0b8cc', display: 'flex', alignItems: 'center', color: '#1e3a8a' }}>DATE</div>

                                                <div style={{ flex: 1, padding: '8px', display: 'flex', alignItems: 'center' }}>{new Date(selectedInvoice.date).toLocaleDateString()}</div>
                                            </div>
                                            <div style={{ padding: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1, minHeight: '200px' }}>
                                                <img src="/PVR.png" alt="Logo" style={{ maxHeight: '180px', maxWidth: '100%', objectFit: 'contain' }} />
                                            </div>
                                            <div style={{ borderTop: '1px solid #b0b8cc', padding: '4px 10px', textAlign: 'center' }}>
                                                <span style={{ fontSize: '9px', fontWeight: 'bold', color: '#1e3a8a', textTransform: 'uppercase', letterSpacing: '1px' }}>TYPE: {selectedInvoice.type}</span>
                                            </div>

                                        </div>
                                    </div>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr style={{ background: '#1e3a8a', color: 'white' }}>
                                                <th style={{ padding: '10px', border: '1px solid #3b5daa' }}>SL</th>

                                                <th style={{ padding: '10px', border: '1px solid #3b5daa', textAlign: 'left' }}>ITEM DESCRIPTION</th>
                                                <th style={{ padding: '10px', border: '1px solid #3b5daa' }}>QTY</th>
                                                <th style={{ padding: '10px', border: '1px solid #3b5daa', textAlign: 'right' }}>PRICE</th>
                                                <th style={{ padding: '10px', border: '1px solid #3b5daa', textAlign: 'right' }}>TOTAL</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {selectedInvoice.items?.map((item, i) => (
                                                <tr key={i} style={{ height: '35px' }}>
                                                    <td style={{ textAlign: 'center', border: '1px solid #eee' }}>{i + 1}</td>
                                                    <td style={{ padding: '0 10px', border: '1px solid #eee', fontWeight: 'bold' }}>{item.name}</td>
                                                    <td style={{ border: '1px solid #eee', textAlign: 'center' }}>{item.quantity}</td>
                                                    <td style={{ border: '1px solid #eee', textAlign: 'right', paddingRight: '10px' }}>₹{item.price.toLocaleString()}</td>
                                                    <td style={{ border: '1px solid #eee', textAlign: 'right', paddingRight: '10px', fontWeight: 'bold' }}>₹{item.total.toLocaleString()}</td>
                                                </tr>
                                            ))}
                                            {[...Array(Math.max(0, 8 - (selectedInvoice.items?.length || 0)))].map((_, i) => (
                                                <tr key={i} style={{ height: '35px' }}><td style={{ border: '1px solid #eee' }}></td><td style={{ border: '1px solid #eee' }}></td><td style={{ border: '1px solid #eee' }}></td><td style={{ border: '1px solid #eee' }}></td><td style={{ border: '1px solid #eee' }}></td></tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    <div style={{ borderTop: '1px solid #b0b8cc' }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr' }}>
                                            <div style={{ padding: '15px', borderRight: '1px solid #b0b8cc' }}>
                                                <p style={{ margin: 0, fontSize: '10px', color: '#888' }}>TOTAL IN WORDS</p>
                                                <p style={{ margin: '5px 0 0 0', fontWeight: 'bold', color: '#1e3a8a' }}>{numberToWords(selectedInvoice.totalAmount)}</p>
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <div style={{ padding: '8px 15px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee' }}>
                                                    <span style={{ color: '#555', fontWeight: 'bold' }}>TRANSPORT</span>
                                                    <span style={{ fontWeight: 'bold' }}>₹{(selectedInvoice.transportCharges || 0).toLocaleString()}</span>
                                                </div>
                                                {selectedInvoice.taxPhase === 'Outside TN' ? (
                                                    <div style={{ padding: '8px 15px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f0f0f0' }}>
                                                        <span style={{ color: '#555', fontWeight: 'bold' }}>IGST (18%)</span>
                                                        <span style={{ fontWeight: 'bold', color: '#333' }}>₹{(selectedInvoice.totalAmount - ((selectedInvoice.items?.reduce((a, c) => a + c.total, 0) || 0) + (selectedInvoice.transportCharges || 0))).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div style={{ padding: '8px 15px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee' }}>
                                                            <span style={{ color: '#555', fontWeight: 'bold' }}>CGST (9%)</span>
                                                            <span style={{ fontWeight: 'bold', color: '#333' }}>₹{((selectedInvoice.totalAmount - ((selectedInvoice.items?.reduce((a, c) => a + c.total, 0) || 0) + (selectedInvoice.transportCharges || 0))) / 2).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                                        </div>
                                                        <div style={{ padding: '8px 15px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f0f0f0' }}>
                                                            <span style={{ color: '#555', fontWeight: 'bold' }}>SGST (9%)</span>
                                                            <span style={{ fontWeight: 'bold', color: '#333' }}>₹{((selectedInvoice.totalAmount - ((selectedInvoice.items?.reduce((a, c) => a + c.total, 0) || 0) + (selectedInvoice.transportCharges || 0))) / 2).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                                        </div>
                                                    </>
                                                )}
                                                <div style={{ padding: '15px', display: 'flex', justifyContent: 'space-between', background: '#dde5f5', fontWeight: '900', color: '#1e3a8a', fontSize: '16px' }}>
                                                    <span>GRAND TOTAL</span>
                                                    <span>₹{selectedInvoice.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', borderTop: '1px solid #b0b8cc' }}>
                                        <div style={{ padding: '15px', borderRight: '1px solid #b0b8cc' }}>
                                            <div style={{ background: '#dde5f5', padding: '5px 10px', fontSize: '10px', fontWeight: 'bold', color: '#1e3a8a', marginBottom: '10px' }}>BANK DETAILS</div>

                                            <p style={{ margin: '2px 0', color: '#333' }}><b>Account:</b> {selectedInvoice.bankDetails?.accountNo}</p>
                                            <p style={{ margin: '2px 0', color: '#333' }}><b>IFSC:</b> {selectedInvoice.bankDetails?.ifscCode}</p>
                                            <p style={{ margin: '2px 0', color: '#333' }}><b>Bank:</b> {selectedInvoice.bankDetails?.bankName}</p>
                                        </div>
                                        <div style={{ height: '120px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '15px', textAlign: 'center' }}>
                                            <p style={{ margin: 0, fontWeight: 'bold', color: '#111' }}>for {selectedInvoice.companyInfo?.name}</p>
                                            <p style={{ margin: 0, fontSize: '10px', color: '#999' }}>Authorized Signature</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </Modal>
            {/* Success Feedback Modal */}
            <Modal
                isOpen={isSuccessModalOpen}
                onClose={() => setIsSuccessModalOpen(false)}
                title="ORDER REGISTERED"
                maxWidth="max-w-md"
            >
                <div className="p-10 flex flex-col items-center text-center gap-6">
                    <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center animate-bounce shadow-inner shadow-emerald-100">
                        <CheckCircle2 size={50} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 uppercase italic tracking-tighter">Sale Confirmed!</h2>
                        <p className="text-gray-400 font-bold text-sm mt-1 uppercase tracking-widest">Order ID: #{justCreatedOrder?._id?.slice(-6).toUpperCase()}</p>
                    </div>
                    <div className="w-full space-y-3 pt-4">
                        <button
                            onClick={() => {
                                jumpToInvoice(justCreatedOrder);
                                setIsSuccessModalOpen(false);
                            }}
                            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs tracking-[0.3em] shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all"
                        >
                            Generate Invoice
                        </button>
                        <button
                            onClick={() => setIsSuccessModalOpen(false)}
                            className="w-full py-4 bg-gray-100 text-gray-500 rounded-2xl font-black uppercase text-xs tracking-[0.3em] hover:bg-gray-200 transition-all"
                        >
                            Back to Dashboard
                        </button>
                    </div>
                </div>
            </Modal>

            {showSuccess && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-300 no-print">
                    <div className="bg-white rounded-3xl p-10 shadow-2xl flex flex-col items-center gap-4 animate-in zoom-in-95 duration-300 max-w-sm w-full mx-4 border border-gray-100">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-2">
                            <CheckCircle2 size={48} />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 text-center uppercase tracking-tight italic">Success!</h2>
                        <p className="text-gray-500 text-center font-medium">Invoice generated successfully!</p>
                        <div className="w-full h-1.5 bg-gray-100 rounded-full mt-4 overflow-hidden">
                            <div className="h-full bg-green-500 animate-progress origin-left"></div>
                        </div>
                    </div>
                </div>
            )}
        </div>

    );
};

export default KoiSales;
