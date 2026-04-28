import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus,
    Search,
    ClipboardList,
    Hammer,
    Truck,
    Banknote,
    Loader2,
    ShoppingCart,
    Receipt,
    History,
    Printer,
    Download,
    CheckCircle2,
    Clock,
    Eye,
    Trash2,
    IndianRupee,
    ChevronDown,
    X,
    Pencil,
    Users,
    Package,
    Layers,
    Zap
} from 'lucide-react';
import { 
    getOrders, 
    createOrder, 
    getCustomers, 
    getProducts, 
    updateOrderStatus, 
    updatePayment,
    getAquaInvoices,
    createAquaInvoice,
    deleteAquaInvoice
} from '../../services/api';
import Modal from '../../components/Modal';

// Helper for Total in Words (Indian Format)
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

const Orders = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('orders');
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Master Data
    const [orders, setOrders] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [products, setProducts] = useState([]);
    const [invoices, setInvoices] = useState([]);

    // Order Related
    const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
    const [orderFormData, setOrderFormData] = useState({ 
        customerId: '', 
        items: [{ productId: '', quantity: 1, price: 0 }],
        taxPhase: 'Inside TN',
        totalAmount: 0,
        paidAmount: 0
    });

    // Invoice Creator Related
    const [zoom, setZoom] = useState(1);
    const [isExporting, setIsExporting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);

    const [invoiceFormData, setInvoiceFormData] = useState({
        customer: '',
        order: '',
        invoiceNumber: `INV-AQ-${Date.now().toString().slice(-6).toUpperCase()}`,
        invoiceDate: new Date().toISOString().split('T')[0],
        type: 'Service',
        items: [{ productId: '', name: '', quantity: 1, price: 0, total: 0, hsnSac: '' }],
        taxPhase: 'Inside TN',
        transportCharges: 0,
        totalAmount: 0,
        billingInfo: { name: '', address: '', phone: '', gstNo: '' },
        companyInfo: {
            name: 'PVR AQUACULTURE',
            address: '334E, KUMARAN NAGAR, ILLUPUR TALUK,\nPerumanadu, Pudukkottai, Tamil Nadu, 622104',
            contact: '+91 9600124725, +91 9003424998',
            gstin: '33CQRPA2571H1ZW'
        },
        bankDetails: {
            accountNo: '7037881010',
            ifscCode: 'IDIB000N140',
            bankName: 'INDIAN BANK',
            branch: 'NATHAMPANNAI'
        }
    });

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const [ordRes, custRes, prodRes, invRes] = await Promise.all([
                getOrders(), getCustomers(), getProducts(), getAquaInvoices()
            ]);
            setOrders(ordRes.data);
            setCustomers(custRes.data);
            setProducts(prodRes.data);
            setInvoices(invRes.data);
        } catch (err) {
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    };

    // --- Order Logic ---
    const handleCreateOrder = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                customerId: orderFormData.customerId,
                items: orderFormData.items.map(item => ({
                    productId: item.productId,
                    quantity: Number(item.quantity),
                    price: Number(item.price)
                })),
                totalAmount: Number(orderFormData.totalAmount),
                paidAmount: Number(orderFormData.paidAmount),
                taxPhase: orderFormData.taxPhase,
                status: 'Quotation'
            };
            await createOrder(payload);
            setIsOrderModalOpen(false);
            resetOrderForm();
            fetchInitialData();
        } catch (err) {
            alert('Error creating order: ' + (err.response?.data?.message || err.message));
        }
    };

    const resetOrderForm = () => {
        setOrderFormData({ customerId: '', items: [{ productId: '', quantity: 1, price: 0 }], taxPhase: 'Inside TN', totalAmount: 0, paidAmount: 0 });
    };

    const addOrderItem = () => {
        setOrderFormData(prev => ({
            ...prev,
            items: [...prev.items, { productId: '', quantity: 1, price: 0 }]
        }));
    };

    const removeOrderItem = (index) => {
        if (orderFormData.items.length === 1) return;
        setOrderFormData(prev => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index)
        }));
    };

    const updateOrderItem = (index, field, value) => {
        const newItems = [...orderFormData.items];
        if (field === 'productId') {
            const prod = products.find(p => p._id === value);
            newItems[index] = { ...newItems[index], productId: value, price: prod?.price || 0 };
        } else {
            newItems[index][field] = value;
        }
        setOrderFormData(prev => ({ ...prev, items: newItems }));
    };

    // Auto-calculate Direct Order Total
    useEffect(() => {
        const total = orderFormData.items.reduce((acc, item) => acc + (Number(item.quantity) * Number(item.price)), 0);
        setOrderFormData(prev => ({ ...prev, totalAmount: total }));
    }, [orderFormData.items]);

    const handleUpdateStatus = async (id, status) => {
        try {
            await updateOrderStatus(id, status);
            fetchInitialData();
        } catch (err) {
            alert('Error updating status');
        }
    };

    const handleUpdatePayment = async (id) => {
        const amount = prompt('Enter payment amount:');
        if (amount) {
            try {
                await updatePayment(id, amount);
                fetchInitialData();
            } catch (err) {
                alert('Error updating payment');
            }
        }
    };

    const jumpToInvoice = (order) => {
        setInvoiceFormData({
            ...invoiceFormData,
            customer: order.customerId?._id || order.customerId,
            order: order._id,
            billingInfo: {
                name: order.customerId?.name || '',
                address: order.customerId?.address || '',
                phone: order.customerId?.phone || '',
                gstNo: order.customerId?.gstNo || ''
            },
            items: order.items.map(item => ({
                productId: item.productId?._id || item.productId || '',
                name: item.productId?.name || 'Aqua Product',
                quantity: item.quantity,
                price: item.price,
                total: item.quantity * item.price,
                hsnSac: item.productId?.hsnSac || ''
            })),
            totalAmount: order.totalAmount,
            taxPhase: order.taxPhase || 'Inside TN'
        });
        setActiveTab('creator');
    };

    // --- Invoice Logic ---
    useEffect(() => {
        const subtotal = invoiceFormData.items.reduce((acc, item) => acc + item.total, 0);
        const transportation = Number(invoiceFormData.transportCharges) || 0;
        const taxBase = subtotal + transportation;
        
        // standard 18% tax
        const taxRate = 0.18;
        const tax = taxBase * taxRate;
        const total = taxBase + tax;
        
        setInvoiceFormData(prev => ({ 
            ...prev, 
            totalAmount: total
        }));
    }, [invoiceFormData.items, invoiceFormData.transportCharges, invoiceFormData.taxPhase]);

    const handleDownloadPDF = (targetElementId) => {
        if (typeof window.html2pdf === 'undefined') {
            alert('PDF library is loading... Please try again in a second.');
            return;
        }
        setIsExporting(true);
        setTimeout(() => {
            const element = document.getElementById(targetElementId);
            if (!element) {
                setIsExporting(false);
                return;
            }
            const opt = {
                margin: [10, 10],
                filename: `Invoice_${invoiceFormData.invoiceNumber}.pdf`,
                image: { type: 'jpeg', quality: 1.0 },
                html2canvas: {
                    scale: 3,
                    useCORS: true,
                    letterRendering: true,
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
        const printableElement = document.getElementById(targetElementId);
        if (printableElement) {
            printableElement.classList.add('print-only-element');
        }
        window.print();
        if (printableElement) {
            printableElement.classList.remove('print-only-element');
        }
    };

    const addItem = () => {
        setInvoiceFormData({
            ...invoiceFormData,
            items: [...invoiceFormData.items, { productId: '', name: '', quantity: 1, price: 0, total: 0, hsnSac: '' }]
        });
    };

    const removeItem = (index) => {
        setInvoiceFormData({
            ...invoiceFormData,
            items: invoiceFormData.items.filter((_, i) => i !== index)
        });
    };

    const updateItem = (index, field, value) => {
        const newItems = [...invoiceFormData.items];
        
        if (field === 'productId') {
            const product = products.find(p => p._id === value);
            if (product) {
                newItems[index] = {
                    ...newItems[index],
                    productId: product._id,
                    name: product.name,
                    price: product.price || 0,
                    hsnSac: product.hsnSac || '',
                    total: (newItems[index].quantity || 1) * (product.price || 0)
                };
            } else {
                newItems[index].productId = '';
            }
        } else {
            newItems[index][field] = value;
            if (field === 'quantity' || field === 'price') {
                newItems[index].total = (newItems[index].quantity || 0) * (newItems[index].price || 0);
            }
        }
        setInvoiceFormData({ ...invoiceFormData, items: newItems });
    };

    const handleSaveInvoice = async () => {
        if (!invoiceFormData.customer) return alert('Please select a customer');
        try {
            await createAquaInvoice(invoiceFormData);
            fetchInitialData();
            setActiveTab('history');
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
        } catch (err) {
            console.error('Save failed:', err);
        }
    };

    const handleDeleteInvoice = async (id) => {
        if (!window.confirm('Delete this record?')) return;
        try {
            await deleteAquaInvoice(id);
            fetchInitialData();
        } catch (err) {
            console.error('Delete failed:', err);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <Loader2 className="animate-spin text-primary-600" size={40} />
                <p className="text-gray-400 font-black italic animate-pulse uppercase tracking-widest text-xs">Synchronizing Sales Hub...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Standardized Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 no-print">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 italic tracking-tighter uppercase">Aqua <span className="text-primary-600">Sales Matrix</span></h1>
                    <p className="text-gray-500 mt-1 font-medium italic">Unified production tracking and tax billing station.</p>
                </div>

                <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100">
                    <button
                        onClick={() => setActiveTab('orders')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'orders' ? 'bg-primary-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
                    >
                        <ShoppingCart size={14} /> Orders
                    </button>
                    <button
                        onClick={() => setActiveTab('creator')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'creator' ? 'bg-primary-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
                    >
                        <Receipt size={14} /> Creator
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'history' ? 'bg-primary-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
                    >
                        <History size={14} /> History
                    </button>
                </div>
            </div>

            {/* Orders Tab Content */}
            {activeTab === 'orders' && (
                <div className="space-y-6 animate-in fade-in duration-500">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { label: 'Total Sales', value: orders.length, color: 'blue', icon: ClipboardList },
                            { label: 'In Production', value: orders.filter(o => o.status === 'In Production').length, color: 'yellow', icon: Hammer },
                            { label: 'Dispatched', value: orders.filter(o => o.status === 'Dispatched').length, color: 'purple', icon: Truck },
                            { label: 'Revenue Pending', value: `₹${(orders.reduce((acc, o) => acc + (o.totalAmount - o.paidAmount), 0) / 1000).toFixed(1)}k`, color: 'orange', icon: Banknote }
                        ].map((stat, i) => (
                            <div key={i} className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col items-center text-center group hover:border-primary-100 transition-all">
                                <div className={`p-3 bg-${stat.color}-50 text-${stat.color}-600 rounded-2xl mb-3 group-hover:scale-110 transition-transform`}>
                                    <stat.icon size={20} />
                                </div>
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
                                <p className="text-xl font-black text-gray-900 leading-none">{stat.value}</p>
                            </div>
                        ))}
                    </div>

                    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden min-h-[400px]">
                        <div className="p-6 border-b border-gray-50 bg-gray-50/50 flex flex-col md:flex-row gap-4 justify-between items-center no-print">
                            <div className="relative group w-full md:w-96">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-600 transition-colors" size={18} />
                                <input
                                    type="text"
                                    placeholder="Filter by customer or order index..."
                                    className="w-full pl-12 pr-4 py-3 bg-white border-none rounded-2xl focus:ring-2 focus:ring-primary-100 text-sm font-bold shadow-sm transition-all"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <button onClick={() => setIsOrderModalOpen(true)} className="w-full md:w-auto px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
                                <Plus size={16} /> Record Direct Sale
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50/50 border-b border-gray-100">
                                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Identifier</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Client</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Financials</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {orders.filter(o => 
                                        (o.customerId?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                                        o._id.includes(searchTerm)
                                    ).map(order => {
                                        const hasInvoice = invoices.some(inv => inv.order?._id === order._id || inv.order === order._id);
                                        return (
                                            <tr key={order._id} className="hover:bg-primary-50/30 transition-colors group">
                                                <td className="px-8 py-6">
                                                    <p className="font-black text-gray-900 text-sm italic group-hover:text-primary-600">#{order._id.slice(-6).toUpperCase()}</p>
                                                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-[0.1em] mt-0.5">{new Date(order.createdAt).toLocaleDateString()}</p>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <p className="font-bold text-gray-900 text-sm">{order.customerId?.name}</p>
                                                    <p className="text-[9px] text-gray-400 font-medium italic">{order.customerId?.phone}</p>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <select 
                                                        className={`bg-white border-2 border-gray-100 text-[9px] font-black uppercase tracking-widest rounded-xl px-4 py-2 outline-none cursor-pointer focus:border-primary-600 transition-all shadow-sm ${order.status === 'Completed' ? 'text-emerald-600' : 'text-primary-600'}`}
                                                        value={order.status}
                                                        onChange={(e) => handleUpdateStatus(order._id, e.target.value)}
                                                    >
                                                        <option value="Quotation">Quotation</option>
                                                        <option value="In Production">In Production</option>
                                                        <option value="Ready for Dispatch">Ready for Dispatch</option>
                                                        <option value="Dispatched">Dispatched</option>
                                                        <option value="Completed">Completed</option>
                                                    </select>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-black text-emerald-600 uppercase tracking-tighter">Paid: ₹{order.paidAmount?.toLocaleString()}</span>
                                                        <span className="text-[9px] font-bold text-rose-500 uppercase tracking-tighter mt-0.5 italic">Bal: ₹{(order.totalAmount - order.paidAmount).toLocaleString()}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <div className="flex gap-2 justify-end">
                                                        {hasInvoice ? (
                                                            <button 
                                                                onClick={() => {
                                                                    const inv = invoices.find(i => i.order?._id === order._id || i.order === order._id);
                                                                    setSelectedInvoice(inv);
                                                                    setIsViewModalOpen(true);
                                                                }}
                                                                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-black transition-all flex items-center gap-2 shadow-lg"
                                                            >
                                                                <Eye size={12} /> View Bill
                                                            </button>
                                                        ) : (
                                                            <button 
                                                                onClick={() => jumpToInvoice(order)}
                                                                className="px-4 py-2 bg-primary-100 text-primary-600 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-primary-200 transition-all flex items-center gap-2 shadow-sm"
                                                            >
                                                                <Receipt size={12} /> Bill
                                                            </button>
                                                        )}
                                                        <button 
                                                            onClick={() => handleUpdatePayment(order._id)}
                                                            className="p-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-all flex items-center justify-center shadow-sm"
                                                            title="Record Payment"
                                                        >
                                                            <Banknote size={16} />
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

            {/* Professional Bill Creator Tab */}
            {activeTab === 'creator' && (
                <div className="flex flex-col gap-6 no-print animate-in fade-in duration-500">
                    <div className="flex justify-end gap-3 bg-white p-4 rounded-3xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-2 border-r pr-4 hidden md:flex">
                            <button onClick={() => setZoom(Math.max(0.5, zoom - 0.1))} className="p-2 hover:bg-gray-100 rounded-lg">-</button>
                            <span className="text-xs font-black w-10 text-center">{Math.round(zoom * 100)}%</span>
                            <button onClick={() => setZoom(Math.min(1.5, zoom + 0.1))} className="p-2 hover:bg-gray-100 rounded-lg">+</button>
                        </div>
                        <button onClick={() => handleSaveInvoice()} className="flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-primary-700 transition-all shadow-lg active:scale-95">
                            <CheckCircle2 size={16} /> Save Record
                        </button>
                        <button onClick={() => handlePrint('aqua-invoice-to-print')} className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg active:scale-95">
                            <Printer size={16} /> Print
                        </button>
                        <button onClick={() => handleDownloadPDF('aqua-invoice-to-print')} className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg active:scale-95">
                            <Download size={16} /> Export PDF
                        </button>
                    </div>

                    <div style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }} className="bg-white shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] w-[800px] min-h-[1100px] p-10 flex flex-col gap-6 relative no-shadow-print mx-auto mb-20" id="aqua-invoice-to-print">
                        {/* PROFESSIONAL TAX INVOICE TEMPLATE */}
                        <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: '11px', width: '100%', border: '1px solid #1e3a8a' }}>
                            {/* HEADER SECTION */}
                            <div style={{ textAlign: 'center', padding: '8px', fontWeight: '900', fontSize: '16px', background: '#eef2fb', color: '#1e3a8a', borderBottom: '1px solid #1e3a8a', letterSpacing: '4px' }}>TAX INVOICE</div>
                            
                            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr' }}>
                                <div style={{ borderRight: '1px solid #1e3a8a' }}>
                                    <div style={{ padding: '12px', borderBottom: '1px solid #1e3a8a', textAlign: 'center' }}>
                                        {isExporting ? (
                                            <h2 style={{ fontSize: '22px', fontWeight: '950', color: '#1e3a8a', margin: 0 }}>{invoiceFormData.companyInfo.name}</h2>
                                        ) : (
                                            <input style={{ fontSize: '22px', fontWeight: '950', color: '#1e3a8a', border: 'none', background: 'transparent', width: '100%', textAlign: 'center' }} value={invoiceFormData.companyInfo.name} onChange={(e) => setInvoiceFormData({...invoiceFormData, companyInfo: {...invoiceFormData.companyInfo, name: e.target.value}})} />
                                        )}
                                        {isExporting ? (
                                            <p style={{ fontSize: '10px', color: '#4b5563', fontWeight: '700', margin: '4px 0', whiteSpace: 'pre-line' }}>{invoiceFormData.companyInfo.address}</p>
                                        ) : (
                                            <textarea style={{ fontSize: '10px', color: '#4b5563', fontWeight: '700', border: 'none', background: 'transparent', width: '100%', textAlign: 'center', resize: 'none', height: '40px' }} value={invoiceFormData.companyInfo.address} onChange={(e) => setInvoiceFormData({...invoiceFormData, companyInfo: {...invoiceFormData.companyInfo, address: e.target.value}})} />
                                        )}
                                        <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', background: '#f0f4ff', padding: '4px', marginTop: '4px', fontSize: '11px', fontWeight: '900', color: '#1e3a8a' }}>
                                            GSTIN: {isExporting ? invoiceFormData.companyInfo.gstin : <input style={{ border: 'none', background: 'transparent', width: '120px', color: '#1e3a8a', fontWeight: '900' }} value={invoiceFormData.companyInfo.gstin} onChange={(e) => setInvoiceFormData({...invoiceFormData, companyInfo: {...invoiceFormData.companyInfo, gstin: e.target.value}})} />}
                                        </div>
                                    </div>
                                    <div style={{ background: '#dde5f5', padding: '6px', textAlign: 'center', borderBottom: '1px solid #1e3a8a', fontWeight: '950', color: '#1e3a8a', fontSize: '11px' }}>BILL TO</div>
                                    <div style={{ padding: '10px', minHeight: '120px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        {!isExporting && (
                                            <select className="no-print w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-black mb-2" onChange={(e) => {
                                                const c = customers.find(x => x._id === e.target.value);
                                                if(c) setInvoiceFormData({...invoiceFormData, customer: c._id, billingInfo: { name: c.name, address: c.address, phone: c.phone, gstNo: c.gstNo || '' }});
                                            }}>
                                                <option value="">QUICK CUSTOMER SELECT</option>
                                                {customers.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                            </select>
                                        )}
                                        {isExporting ? (
                                            <p style={{ fontWeight: '900', fontSize: '13px', margin: 0 }}>{invoiceFormData.billingInfo.name}</p>
                                        ) : (
                                            <input style={{ fontWeight: '900', fontSize: '13px', border: 'none', background: 'transparent', width: '100%' }} placeholder="CUSTOMER NAME" value={invoiceFormData.billingInfo.name} onChange={(e) => setInvoiceFormData({...invoiceFormData, billingInfo: {...invoiceFormData.billingInfo, name: e.target.value}})} />
                                        )}
                                        {isExporting ? (
                                            <p style={{ fontSize: '10px', color: '#4b5563', margin: 0, whiteSpace: 'pre-line' }}>{invoiceFormData.billingInfo.address}</p>
                                        ) : (
                                            <textarea style={{ fontSize: '10px', border: 'none', background: 'transparent', width: '100%', resize: 'none', height: '40px' }} placeholder="CUSTOMER ADDRESS" value={invoiceFormData.billingInfo.address} onChange={(e) => setInvoiceFormData({...invoiceFormData, billingInfo: {...invoiceFormData.billingInfo, address: e.target.value}})} />
                                        )}
                                        <div style={{ display: 'flex', gap: '10px', fontSize: '10px', fontWeight: '900' }}>
                                            <span>PH: {isExporting ? invoiceFormData.billingInfo.phone : <input style={{ border: 'none', background: 'transparent', width: '100px' }} value={invoiceFormData.billingInfo.phone} onChange={(e) => setInvoiceFormData({...invoiceFormData, billingInfo: {...invoiceFormData.billingInfo, phone: e.target.value}})} />}</span>
                                            <span>GST: {isExporting ? invoiceFormData.billingInfo.gstNo : <input style={{ border: 'none', background: 'transparent', width: '120px' }} value={invoiceFormData.billingInfo.gstNo} placeholder="N/A" onChange={(e) => setInvoiceFormData({...invoiceFormData, billingInfo: {...invoiceFormData.billingInfo, gstNo: e.target.value}})} />}</span>
                                        </div>
                                        <div style={{ marginTop: 'auto', paddingTop: '4px', borderTop: '1px dashed #e2e8f0', display: 'flex', justifyContent: 'space-between', fontSize: '10px' }}>
                                            <span style={{ color: '#64748b', fontWeight: '800' }}>TAX PH:</span>
                                            {isExporting ? (
                                                <span style={{ fontWeight: '900' }}>{invoiceFormData.taxPhase}</span>
                                            ) : (
                                                <select style={{ border: 'none', background: 'transparent', fontWeight: '900', fontSize: '10px' }} value={invoiceFormData.taxPhase} onChange={(e) => setInvoiceFormData({...invoiceFormData, taxPhase: e.target.value})}>
                                                    <option value="Inside TN">Inside TN</option>
                                                    <option value="Outside TN">Outside TN</option>
                                                </select>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', borderBottom: '1px solid #1e3a8a', height: '40px' }}>
                                        <div style={{ padding: '8px', fontWeight: '900', borderRight: '1px solid #1e3a8a', display: 'flex', alignItems: 'center', background: '#f0f4ff', color: '#1e3a8a', fontSize: '10px' }}>INVOICE #</div>
                                        <div style={{ padding: '8px', display: 'flex', alignItems: 'center', fontWeight: '900' }}>{isExporting ? invoiceFormData.invoiceNumber : <input style={{ border: 'none', background: 'transparent', width: '100%', fontWeight: '900' }} value={invoiceFormData.invoiceNumber} onChange={(e) => setInvoiceFormData({...invoiceFormData, invoiceNumber: e.target.value})} />}</div>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', borderBottom: '1px solid #1e3a8a', height: '40px' }}>
                                        <div style={{ padding: '8px', fontWeight: '900', borderRight: '1px solid #1e3a8a', display: 'flex', alignItems: 'center', background: '#f0f4ff', color: '#1e3a8a', fontSize: '10px' }}>DATE</div>
                                        <div style={{ padding: '8px', display: 'flex', alignItems: 'center' }}>{isExporting ? invoiceFormData.invoiceDate : <input type="date" style={{ border: 'none', background: 'transparent', width: '100%', fontWeight: '900' }} value={invoiceFormData.invoiceDate} onChange={(e) => setInvoiceFormData({...invoiceFormData, invoiceDate: e.target.value})} />}</div>
                                    </div>
                                    <div style={{ padding: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                                        <img src="/PVR.png" alt="Logo" style={{ maxHeight: '100px', maxWidth: '100%', objectFit: 'contain' }} />
                                    </div>
                                </div>
                            </div>

                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ background: '#1e3a8a', color: 'white' }}>
                                        <th style={{ padding: '8px', border: '1px solid #1e3a8a', fontSize: '10px', width: '40px' }}>SL</th>
                                        <th style={{ padding: '8px', border: '1px solid #1e3a8a', textAlign: 'left', fontSize: '10px' }}>DESCRIPTION</th>
                                        <th style={{ padding: '8px', border: '1px solid #1e3a8a', fontSize: '10px', width: '70px' }}>HSN</th>
                                        <th style={{ padding: '8px', border: '1px solid #1e3a8a', fontSize: '10px', width: '50px' }}>QTY</th>
                                        <th style={{ padding: '8px', border: '1px solid #1e3a8a', textAlign: 'right', fontSize: '10px', width: '80px' }}>RATE</th>
                                        <th style={{ padding: '8px', border: '1px solid #1e3a8a', textAlign: 'right', fontSize: '10px', width: '100px' }}>AMOUNT</th>
                                        {!isExporting && <th className="no-print" style={{ border: '1px solid #1e3a8a', width: '30px' }}></th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoiceFormData.items.map((item, i) => (
                                        <tr key={i} style={{ minHeight: '30px' }}>
                                            <td style={{ textAlign: 'center', border: '1px solid #e5e7eb', fontWeight: '800' }}>{i + 1}</td>
                                            <td style={{ padding: '4px 8px', border: '1px solid #e5e7eb' }}>
                                                {isExporting ? (
                                                    <p style={{ margin: 0, fontWeight: '900', textTransform: 'uppercase' }}>{item.name}</p>
                                                ) : (
                                                    <div className="flex flex-col gap-1">
                                                        <select className="no-print w-full p-1 bg-slate-50 border-none text-[8px] font-black uppercase italic" value={item.productId} onChange={(e) => updateItem(i, 'productId', e.target.value)}>
                                                            <option value="">SELECT PRODUCT</option>
                                                            {products.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                                                        </select>
                                                        <input style={{ width: '100%', border: 'none', background: 'transparent', fontWeight: '900', fontSize: '11px' }} value={item.name} onChange={(e) => updateItem(i, 'name', e.target.value)} />
                                                    </div>
                                                )}
                                            </td>
                                            <td style={{ border: '1px solid #e5e7eb', textAlign: 'center' }}>
                                                {isExporting ? item.hsnSac : <input style={{ width: '100%', textAlign: 'center', border: 'none', background: 'transparent', fontSize: '10px', fontWeight: '700' }} value={item.hsnSac} onChange={(e) => updateItem(i, 'hsnSac', e.target.value)} />}
                                            </td>
                                            <td style={{ border: '1px solid #e5e7eb', textAlign: 'center' }}>
                                                {isExporting ? item.quantity : <input type="number" style={{ width: '100%', textAlign: 'center', border: 'none', background: 'transparent', fontSize: '10px', fontWeight: '700' }} value={item.quantity} onChange={(e) => updateItem(i, 'quantity', Number(e.target.value))} />}
                                            </td>
                                            <td style={{ border: '1px solid #e5e7eb', textAlign: 'right', padding: '4px 8px' }}>
                                                {isExporting ? item.price.toLocaleString() : <input type="number" style={{ width: '100%', textAlign: 'right', border: 'none', background: 'transparent', fontSize: '10px', fontWeight: '700' }} value={item.price} onChange={(e) => updateItem(i, 'price', Number(e.target.value))} />}
                                            </td>
                                            <td style={{ border: '1px solid #e5e7eb', textAlign: 'right', padding: '4px 8px', fontWeight: '900' }}>₹{item.total.toLocaleString()}</td>
                                            {!isExporting && (
                                                <td className="no-print" style={{ border: '1px solid #e5e7eb', textAlign: 'center' }}>
                                                    <button onClick={() => removeItem(i)} className="text-red-500 font-black hover:scale-125 transition-transform text-xs">×</button>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                    {!isExporting && (
                                        <tr className="no-print">
                                            <td colSpan={7} style={{ textAlign: 'center', padding: '8px', background: '#f9fafb' }}>
                                                <button onClick={addItem} className="text-[9px] font-black text-primary-600 uppercase tracking-widest">+ Add Row</button>
                                            </td>
                                        </tr>
                                    )}
                                    {[...Array(Math.max(0, 5 - invoiceFormData.items.length))].map((_, i) => (
                                        <tr key={`filler-${i}`} style={{ height: '30px' }}>
                                            <td style={{ border: '1px solid #e5e7eb' }}></td><td style={{ border: '1px solid #e5e7eb' }}></td><td style={{ border: '1px solid #e5e7eb' }}></td><td style={{ border: '1px solid #e5e7eb' }}></td><td style={{ border: '1px solid #e5e7eb' }}></td><td style={{ border: '1px solid #e5e7eb' }}></td>{!isExporting && <td className="no-print border:1px solid #e5e7eb"></td>}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <div style={{ borderTop: '1px solid #1e3a8a' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr' }}>
                                    <div style={{ padding: '15px', borderRight: '1px solid #1e3a8a', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                        <div style={{ fontSize: '10px', fontWeight: '900', color: '#1e3a8a' }}>AMOUNT IN WORDS: <span style={{ color: '#4b5563', marginLeft: '4px', textTransform: 'capitalize' }}>{numberToWords(invoiceFormData.totalAmount)}</span></div>
                                        <div style={{ marginTop: '10px', padding: '6px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '4px' }}>
                                            <p style={{ fontSize: '8px', fontWeight: '900', color: '#64748b', marginBottom: '4px' }}>TERMS & CONDITIONS:</p>
                                            <ol style={{ fontSize: '7px', color: '#94a3b8', margin: 0, paddingLeft: '12px', fontWeight: '700' }}>
                                                <li>Goods once sold will not be taken back or exchanged.</li>
                                                <li>Subject to Pudukkottai Jurisdiction.</li>
                                                <li>Payment should be made immediately.</li>
                                            </ol>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <div style={{ padding: '6px 12px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between' }}>
                                            <span style={{ color: '#64748b', fontWeight: '800', fontSize: '9px' }}>TAXABLE VALUE</span>
                                            <span style={{ fontWeight: '900', fontSize: '11px' }}>₹{(invoiceFormData.items.reduce((a,b)=>a+b.total,0)).toLocaleString()}</span>
                                        </div>
                                        <div style={{ padding: '6px 12px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between' }}>
                                            <span style={{ color: '#64748b', fontWeight: '800', fontSize: '9px' }}>TRANS/HANDLING</span>
                                            {isExporting ? (
                                                <span style={{ fontWeight: '900', fontSize: '11px' }}>₹{invoiceFormData.transportCharges.toLocaleString()}</span>
                                            ) : (
                                                <input type="number" style={{ width: '60px', textAlign: 'right', border: 'none', fontWeight: '900', fontSize: '11px', background: '#f8fafc' }} value={invoiceFormData.transportCharges} onChange={(e) => setInvoiceFormData({...invoiceFormData, transportCharges: Number(e.target.value)})} />
                                            )}
                                        </div>
                                        {invoiceFormData.taxPhase === 'Outside TN' ? (
                                            <div style={{ padding: '6px 12px', borderBottom: '1px solid #e2e8f0', background: '#f0f4ff', display: 'flex', justifyContent: 'space-between' }}>
                                                <span style={{ color: '#1e3a8a', fontWeight: '900', fontSize: '9px' }}>IGST (18%)</span>
                                                <span style={{ fontWeight: '900', fontSize: '11px' }}>₹{(invoiceFormData.totalAmount - (invoiceFormData.items.reduce((a,b)=>a+b.total,0) + invoiceFormData.transportCharges)).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                                            </div>
                                        ) : (
                                            <>
                                                <div style={{ padding: '6px 12px', borderBottom: '1px solid #e2e8f0', background: '#f0f4ff', display: 'flex', justifyContent: 'space-between' }}>
                                                    <span style={{ color: '#1e3a8a', fontWeight: '900', fontSize: '9px' }}>CGST (9%)</span>
                                                    <span style={{ fontWeight: '900', fontSize: '11px' }}>₹{((invoiceFormData.totalAmount - (invoiceFormData.items.reduce((a,b)=>a+b.total,0) + invoiceFormData.transportCharges))/2).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                                                </div>
                                                <div style={{ padding: '6px 12px', borderBottom: '1px solid #e2e8f0', background: '#f0f4ff', display: 'flex', justifyContent: 'space-between' }}>
                                                    <span style={{ color: '#1e3a8a', fontWeight: '900', fontSize: '9px' }}>SGST (9%)</span>
                                                    <span style={{ fontWeight: '900', fontSize: '11px' }}>₹{((invoiceFormData.totalAmount - (invoiceFormData.items.reduce((a,b)=>a+b.total,0) + invoiceFormData.transportCharges))/2).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                                                </div>
                                            </>
                                        )}
                                        <div style={{ padding: '10px 12px', background: '#1e3a8a', color: 'white', display: 'flex', justifyContent: 'space-between' }}>
                                            <span style={{ fontWeight: '900', fontSize: '12px' }}>GRAND TOTAL</span>
                                            <span style={{ fontWeight: '950', fontSize: '16px' }}>₹{invoiceFormData.totalAmount.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', borderTop: '1px solid #1e3a8a' }}>
                                <div style={{ padding: '10px', fontSize: '9px', color: '#4b5563' }}>
                                    <p style={{ fontWeight: '950', color: '#1e3a8a', marginBottom: '4px', letterSpacing: '1px' }}>BANK DETAILS</p>
                                    <div style={{ display: 'grid', gridTemplateColumns: '70px 1fr', gap: '2px', fontWeight: '700' }}>
                                        <span>ACC NO:</span> <span>{invoiceFormData.bankDetails.accountNo}</span>
                                        <span>IFSC:</span> <span>{invoiceFormData.bankDetails.ifscCode}</span>
                                        <span>BANK:</span> <span>{invoiceFormData.bankDetails.bankName}, {invoiceFormData.bankDetails.branch}</span>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', padding: '15px', borderLeft: '1px solid #1e3a8a', background: '#fcfcfc' }}>
                                    <div style={{ textAlign: 'center', width: '100%' }}>
                                        <p style={{ fontSize: '9px', fontWeight: '950', color: '#1e3a8a', marginBottom: '30px' }}>FOR {invoiceFormData.companyInfo.name}</p>
                                        <div style={{ borderBottom: '1px dashed #cbd5e1', width: '80%', margin: '0 auto 4px' }}></div>
                                        <p style={{ fontSize: '8px', fontWeight: '900', color: '#64748b' }}>Authorised Signatory</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* History Tab */}
            {activeTab === 'history' && (
                <div className="space-y-6 animate-in fade-in duration-500">
                    <div className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
                        <div className="relative group w-full md:w-96">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-600 transition-colors" size={18} />
                            <input
                                type="text"
                                placeholder="Search past invoices by customer or number..."
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary-100 text-sm font-bold shadow-sm transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-4 text-sm px-4">
                            <span className="font-black text-gray-400 uppercase tracking-widest text-[10px]">Records Filtered</span>
                            <span className="px-3 py-1 bg-primary-50 text-primary-600 rounded-full font-black text-xs">{invoices.length}</span>
                        </div>
                    </div>

                    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50/50 border-b border-gray-100">
                                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Inv Index</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Billing Recipient</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Net Value</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Captured On</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Data Control</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {invoices.filter(inv =>
                                        (inv.customer?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                                        inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase())
                                    ).map(inv => (
                                        <tr key={inv._id} className="hover:bg-primary-50/20 transition-colors group">
                                            <td className="px-8 py-6">
                                                <p className="font-black text-gray-900 text-sm group-hover:text-primary-600">#{inv.invoiceNumber}</p>
                                            </td>
                                            <td className="px-8 py-6">
                                                <p className="font-bold text-gray-900 text-sm uppercase tracking-tight">{inv.customer?.name}</p>
                                            </td>
                                            <td className="px-8 py-6">
                                                <p className="font-black text-gray-900 text-sm italic">₹{inv.totalAmount?.toLocaleString()}</p>
                                            </td>
                                            <td className="px-8 py-6">
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{new Date(inv.date).toLocaleDateString()}</p>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => { setSelectedInvoice(inv); setIsViewModalOpen(true); }} className="p-2 bg-slate-900 text-white rounded-xl shadow-lg hover:scale-110 transition-transform"><Eye size={14} /></button>
                                                    <button onClick={() => handleDeleteInvoice(inv._id)} className="p-2 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all"><Trash2 size={14} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Refined Direct Order Modal - Elongated & Efficient Layout */}
            <Modal isOpen={isOrderModalOpen} onClose={() => setIsOrderModalOpen(false)} title="Record Sales Transaction" maxWidth="max-w-[640px]">
                <form onSubmit={handleCreateOrder} className="px-8 py-6 space-y-6 animate-in fade-in zoom-in-95 duration-300">
                    <div className="bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100 space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                                    <Users size={12} className="text-primary-600" /> Client Association
                                </label>
                                <select
                                    required className="w-full px-6 py-4 bg-white border-2 border-transparent rounded-[1.5rem] shadow-sm focus:border-primary-100 outline-none font-bold text-sm transition-all text-slate-900"
                                    value={orderFormData.customerId} onChange={(e) => setOrderFormData({ ...orderFormData, customerId: e.target.value })}
                                >
                                    <option value="">Identify established customer...</option>
                                    {customers.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                                    <Zap size={12} className="text-primary-600" /> Tax Phase
                                </label>
                                <select
                                    className="w-full px-6 py-4 bg-white border-2 border-transparent rounded-[1.5rem] shadow-sm focus:border-primary-100 outline-none font-bold text-sm transition-all text-slate-900"
                                    value={orderFormData.taxPhase} onChange={(e) => setOrderFormData({ ...orderFormData, taxPhase: e.target.value })}
                                >
                                    <option value="Inside TN">Inside TN</option>
                                    <option value="Outside TN">Outside TN</option>
                                </select>
                            </div>
                        </div>

                            <div className="bg-white p-6 rounded-[1.5rem] border border-slate-100 space-y-4">
                                <div className="flex justify-between items-center mb-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                        <Package size={12} className="text-primary-600" /> Component Selection
                                    </p>
                                    <button type="button" onClick={addOrderItem} className="text-[10px] font-black text-primary-600 uppercase hover:underline flex items-center gap-1">
                                        <Plus size={10} /> Add Item
                                    </button>
                                </div>
                                <div className="max-h-[180px] overflow-y-auto pr-1.5 custom-scrollbar space-y-3">
                                    {orderFormData.items.map((item, idx) => (
                                        <div key={idx} className="flex gap-4 items-center bg-slate-50/50 p-3 rounded-xl border border-slate-50">
                                            <div className="flex-[4]">
                                                <select
                                                    required className="w-full px-3 py-3 bg-white border-none rounded-xl shadow-sm outline-none font-bold text-xs"
                                                    value={item.productId} onChange={(e) => updateOrderItem(idx, 'productId', e.target.value)}
                                                >
                                                    <option value="">Select Item...</option>
                                                    {products.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                                                </select>
                                            </div>
                                            <div className="w-20">
                                                <input
                                                    type="number" min="1" placeholder="Qty" required className="w-full px-2 py-3 bg-white border-none rounded-xl shadow-sm outline-none font-bold text-xs text-center"
                                                    value={item.quantity} onChange={(e) => updateOrderItem(idx, 'quantity', e.target.value)}
                                                />
                                            </div>
                                            <div className="w-28">
                                                <input
                                                    type="number" placeholder="Price" required className="w-full px-2 py-3 bg-white border-none rounded-xl shadow-sm outline-none font-bold text-xs text-right"
                                                    value={item.price} onChange={(e) => updateOrderItem(idx, 'price', e.target.value)}
                                                />
                                            </div>
                                            {orderFormData.items.length > 1 && (
                                                <button type="button" onClick={() => removeOrderItem(idx)} className="p-2 text-rose-400 hover:text-rose-600 transition-all">
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                    <div className="bg-primary-600 p-8 rounded-[2.5rem] shadow-2xl shadow-primary-200 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl group-hover:bg-white/20 transition-all duration-700"></div>
                        <div className="flex justify-between items-center relative z-10 px-2">
                            <div>
                                <p className="text-[10px] font-black text-primary-100 uppercase tracking-[0.3em] mb-1">Gross Valuation</p>
                                <h3 className="text-3xl font-black text-white italic tracking-tighter">
                                    ₹{orderFormData.totalAmount.toLocaleString()}
                                </h3>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black text-primary-100 uppercase tracking-[0.3em] mb-1">Batch Size</p>
                                <p className="text-xl font-black text-white italic">{orderFormData.items.length} Product(s)</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4">
                         <button type="button" onClick={() => setIsOrderModalOpen(false)} className="flex-1 py-5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest transition-all">
                            Discard
                        </button>
                        <button type="submit" className="flex-[2] py-5 bg-slate-900 hover:bg-black text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3">
                            <CheckCircle2 size={16} /> Authorize Transaction
                        </button>
                    </div>
                </form>
            </Modal>

            {/* View Invoice Modal */}
            <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="Operational Document Viewer" maxWidth="max-w-[850px]">
                {selectedInvoice && (
                    <div className="flex flex-col gap-6 p-8 animate-in zoom-in-95 duration-300">
                        <div className="flex justify-end gap-3 no-print">
                            <button onClick={() => window.print()} className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg active:scale-95">
                                <Printer size={14} /> Print Document
                            </button>
                            <button onClick={() => setIsViewModalOpen(false)} className="px-6 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all">
                                Dismiss
                            </button>
                        </div>

                        <div className="bg-white border-2 border-slate-100 shadow-2xl p-0 print-only-element rounded-sm overflow-hidden" id="aqua-invoice-viewer">
                            {/* PROFESSIONAL TAX INVOICE TEMPLATE - SYNCED WITH CREATOR */}
                            <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: '11px', width: '100%', borderBottom: '1px solid #1e3a8a' }}>
                                {/* HEADER SECTION */}
                                <div style={{ textAlign: 'center', padding: '8px', fontWeight: '900', fontSize: '16px', background: '#eef2fb', color: '#1e3a8a', borderBottom: '1px solid #1e3a8a', letterSpacing: '4px' }}>TAX INVOICE</div>
                                
                                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr' }}>
                                    <div style={{ borderRight: '1px solid #1e3a8a' }}>
                                        <div style={{ padding: '12px', borderBottom: '1px solid #1e3a8a', textAlign: 'center' }}>
                                            <h2 style={{ fontSize: '22px', fontWeight: '950', color: '#1e3a8a', margin: 0 }}>{selectedInvoice.companyInfo?.name || "PVR AQUA SYSTEMS"}</h2>
                                            <p style={{ fontSize: '10px', color: '#4b5563', fontWeight: '700', margin: '4px 0', whiteSpace: 'pre-line' }}>{selectedInvoice.companyInfo?.address}</p>
                                            <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', background: '#f0f4ff', padding: '4px', marginTop: '4px', fontSize: '11px', fontWeight: '900', color: '#1e3a8a' }}>
                                                GSTIN: {selectedInvoice.companyInfo?.gstin}
                                            </div>
                                        </div>
                                        <div style={{ background: '#dde5f5', padding: '6px', textAlign: 'center', borderBottom: '1px solid #1e3a8a', fontWeight: '950', color: '#1e3a8a', fontSize: '11px' }}>BILL TO</div>
                                        <div style={{ padding: '10px', minHeight: '120px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                            <p style={{ fontWeight: '900', fontSize: '13px', margin: 0 }}>{selectedInvoice.billingInfo?.name || selectedInvoice.customer?.name}</p>
                                            <p style={{ fontSize: '10px', color: '#4b5563', margin: 0, whiteSpace: 'pre-line' }}>{selectedInvoice.billingInfo?.address}</p>
                                            <div style={{ display: 'flex', gap: '10px', fontSize: '10px', fontWeight: '900' }}>
                                                <span>PH: {selectedInvoice.billingInfo?.phone}</span>
                                                <span>GST: {selectedInvoice.billingInfo?.gstNo || "N/A"}</span>
                                            </div>
                                            <div style={{ marginTop: 'auto', paddingTop: '4px', borderTop: '1px dashed #e2e8f0', display: 'flex', justifyContent: 'space-between', fontSize: '10px' }}>
                                                <span style={{ color: '#64748b', fontWeight: '800' }}>TAX PH:</span>
                                                <span style={{ fontWeight: '900' }}>{selectedInvoice.taxPhase}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', borderBottom: '1px solid #1e3a8a', height: '40px' }}>
                                            <div style={{ padding: '8px', fontWeight: '900', borderRight: '1px solid #1e3a8a', display: 'flex', alignItems: 'center', background: '#f0f4ff', color: '#1e3a8a', fontSize: '10px' }}>INVOICE #</div>
                                            <div style={{ padding: '8px', display: 'flex', alignItems: 'center', fontWeight: '900' }}>{selectedInvoice.invoiceNumber}</div>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', borderBottom: '1px solid #1e3a8a', height: '40px' }}>
                                            <div style={{ padding: '8px', fontWeight: '900', borderRight: '1px solid #1e3a8a', display: 'flex', alignItems: 'center', background: '#f0f4ff', color: '#1e3a8a', fontSize: '10px' }}>DATE</div>
                                            <div style={{ padding: '8px', display: 'flex', alignItems: 'center', fontWeight: '900' }}>{new Date(selectedInvoice.date).toLocaleDateString()}</div>
                                        </div>
                                        <div style={{ padding: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                                            <img src="/PVR.png" alt="Logo" style={{ maxHeight: '80px', maxWidth: '100%', objectFit: 'contain' }} />
                                        </div>
                                    </div>
                                </div>

                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ background: '#1e3a8a', color: 'white' }}>
                                            <th style={{ padding: '8px', border: '1px solid #1e3a8a', fontSize: '10px', width: '40px' }}>SL</th>
                                            <th style={{ padding: '8px', border: '1px solid #1e3a8a', textAlign: 'left', fontSize: '10px' }}>DESCRIPTION</th>
                                            <th style={{ padding: '8px', border: '1px solid #1e3a8a', fontSize: '10px', width: '70px' }}>HSN</th>
                                            <th style={{ padding: '8px', border: '1px solid #1e3a8a', fontSize: '10px', width: '50px' }}>QTY</th>
                                            <th style={{ padding: '8px', border: '1px solid #1e3a8a', textAlign: 'right', fontSize: '10px', width: '80px' }}>RATE</th>
                                            <th style={{ padding: '8px', border: '1px solid #1e3a8a', textAlign: 'right', fontSize: '10px', width: '100px' }}>AMOUNT</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedInvoice.items?.map((item, i) => (
                                            <tr key={i} style={{ minHeight: '30px' }}>
                                                <td style={{ textAlign: 'center', border: '1px solid #e5e7eb', fontWeight: '800' }}>{i + 1}</td>
                                                <td style={{ padding: '4px 8px', border: '1px solid #e5e7eb' }}>
                                                    <p style={{ margin: 0, fontWeight: '900', textTransform: 'uppercase' }}>{item.name}</p>
                                                </td>
                                                <td style={{ border: '1px solid #e5e7eb', textAlign: 'center' }}>{item.hsnSac || "-"}</td>
                                                <td style={{ border: '1px solid #e5e7eb', textAlign: 'center' }}>{item.quantity}</td>
                                                <td style={{ border: '1px solid #e5e7eb', textAlign: 'right', padding: '4px 8px' }}>{item.price?.toLocaleString()}</td>
                                                <td style={{ border: '1px solid #e5e7eb', textAlign: 'right', padding: '4px 8px', fontWeight: '900' }}>₹{item.total?.toLocaleString()}</td>
                                            </tr>
                                        ))}
                                        {[...Array(Math.max(0, 5 - (selectedInvoice.items?.length || 0)))].map((_, i) => (
                                            <tr key={`filler-${i}`} style={{ height: '30px' }}>
                                                <td style={{ border: '1px solid #e5e7eb' }}></td><td style={{ border: '1px solid #e5e7eb' }}></td><td style={{ border: '1px solid #e5e7eb' }}></td><td style={{ border: '1px solid #e5e7eb' }}></td><td style={{ border: '1px solid #e5e7eb' }}></td><td style={{ border: '1px solid #e5e7eb' }}></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                <div style={{ borderTop: '1px solid #1e3a8a' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr' }}>
                                        <div style={{ padding: '15px', borderRight: '1px solid #1e3a8a', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                            <div style={{ fontSize: '10px', fontWeight: '900', color: '#1e3a8a' }}>AMOUNT IN WORDS: <span style={{ color: '#4b5563', marginLeft: '4px', textTransform: 'capitalize' }}>{numberToWords(selectedInvoice.totalAmount)}</span></div>
                                            <div style={{ marginTop: '10px', padding: '6px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '4px' }}>
                                                <p style={{ fontSize: '8px', fontWeight: '900', color: '#64748b', marginBottom: '4px' }}>TERMS & CONDITIONS:</p>
                                                <ol style={{ fontSize: '7px', color: '#94a3b8', margin: 0, paddingLeft: '12px', fontWeight: '700' }}>
                                                    <li>Goods once sold will not be taken back or exchanged.</li>
                                                    <li>Subject to Pudukkottai Jurisdiction.</li>
                                                    <li>Payment should be made immediately.</li>
                                                </ol>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <div style={{ padding: '6px 12px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between' }}>
                                                <span style={{ color: '#64748b', fontWeight: '800', fontSize: '9px' }}>TAXABLE VALUE</span>
                                                <span style={{ fontWeight: '900', fontSize: '11px' }}>₹{(selectedInvoice.items?.reduce((a,b)=>a+b.total,0) || 0).toLocaleString()}</span>
                                            </div>
                                            <div style={{ padding: '6px 12px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between' }}>
                                                <span style={{ color: '#64748b', fontWeight: '800', fontSize: '9px' }}>TRANS/HANDLING</span>
                                                <span style={{ fontWeight: '900', fontSize: '11px' }}>₹{(selectedInvoice.transportCharges || 0).toLocaleString()}</span>
                                            </div>
                                            {selectedInvoice.taxPhase === 'Outside TN' ? (
                                                <div style={{ padding: '6px 12px', borderBottom: '1px solid #e2e8f0', background: '#f0f4ff', display: 'flex', justifyContent: 'space-between' }}>
                                                    <span style={{ color: '#1e3a8a', fontWeight: '900', fontSize: '9px' }}>IGST (18%)</span>
                                                    <span style={{ fontWeight: '900', fontSize: '11px' }}>₹{((selectedInvoice.totalAmount || 0) - ((selectedInvoice.items?.reduce((a,b)=>a+b.total,0) || 0) + (selectedInvoice.transportCharges || 0))).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                                                </div>
                                            ) : (
                                                <>
                                                    <div style={{ padding: '6px 12px', borderBottom: '1px solid #e2e8f0', background: '#f0f4ff', display: 'flex', justifyContent: 'space-between' }}>
                                                        <span style={{ color: '#1e3a8a', fontWeight: '900', fontSize: '9px' }}>CGST (9%)</span>
                                                        <span style={{ fontWeight: '900', fontSize: '11px' }}>₹{(((selectedInvoice.totalAmount || 0) - ((selectedInvoice.items?.reduce((a,b)=>a+b.total,0) || 0) + (selectedInvoice.transportCharges || 0)))/2).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                                                    </div>
                                                    <div style={{ padding: '6px 12px', borderBottom: '1px solid #e2e8f0', background: '#f0f4ff', display: 'flex', justifyContent: 'space-between' }}>
                                                        <span style={{ color: '#1e3a8a', fontWeight: '900', fontSize: '9px' }}>SGST (9%)</span>
                                                        <span style={{ fontWeight: '900', fontSize: '11px' }}>₹{(((selectedInvoice.totalAmount || 0) - ((selectedInvoice.items?.reduce((a,b)=>a+b.total,0) || 0) + (selectedInvoice.transportCharges || 0)))/2).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                                                    </div>
                                                </>
                                            )}
                                            <div style={{ padding: '10px 12px', background: '#1e3a8a', color: 'white', display: 'flex', justifyContent: 'space-between' }}>
                                                <span style={{ fontWeight: '900', fontSize: '12px' }}>GRAND TOTAL</span>
                                                <span style={{ fontWeight: '950', fontSize: '16px' }}>₹{selectedInvoice.totalAmount?.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', borderTop: '1px solid #1e3a8a' }}>
                                    <div style={{ padding: '10px', fontSize: '9px', color: '#4b5563' }}>
                                        <p style={{ fontWeight: '950', color: '#1e3a8a', marginBottom: '4px', letterSpacing: '1px' }}>BANK DETAILS</p>
                                        <div style={{ display: 'grid', gridTemplateColumns: '70px 1fr', gap: '2px', fontWeight: '700' }}>
                                            <span>ACC NO:</span> <span>{selectedInvoice.bankDetails?.accountNo}</span>
                                            <span>IFSC:</span> <span>{selectedInvoice.bankDetails?.ifscCode}</span>
                                            <span>BANK:</span> <span>{selectedInvoice.bankDetails?.bankName}, {selectedInvoice.bankDetails?.branch}</span>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', padding: '15px', borderLeft: '1px solid #1e3a8a', background: '#fcfcfc' }}>
                                        <div style={{ textAlign: 'center', width: '100%' }}>
                                            <p style={{ fontSize: '9px', fontWeight: '950', color: '#1e3a8a', marginBottom: '30px' }}>FOR {selectedInvoice.companyInfo?.name || "PVR AQUA SYSTEMS"}</p>
                                            <div style={{ borderBottom: '1px dashed #cbd5e1', width: '80%', margin: '0 auto 4px' }}></div>
                                            <p style={{ fontSize: '8px', fontWeight: '900', color: '#64748b' }}>Authorised Signatory</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
            {showSuccess && (
                <div className="fixed bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-emerald-600 text-white px-8 py-4 rounded-[2rem] shadow-2xl animate-in fade-in slide-in-from-bottom-10 duration-500 z-50">
                    <CheckCircle2 size={20} />
                    <p className="text-sm font-black uppercase tracking-widest">Record successfully integrated into system</p>
                </div>
            )}

            <style>
                {`
                @media print {
                    @page { margin: 0; }
                    body * { visibility: hidden !important; overflow: hidden !important; }
                    .print-only-element, .print-only-element * { visibility: visible !important; -webkit-print-color-adjust: exact !important; color-adjust: exact !important; }
                    .print-only-element {
                        position: absolute !important; left: 0 !important; top: 0 !important; width: 100% !important;
                        margin: 0 !important; padding: 0 !important; border: none !important; box-shadow: none !important;
                        transform: scale(1) !important; background: white !important;
                    }
                    .no-print { display: none !important; }
                    .no-shadow-print { box-shadow: none !important; border: none !important; }
                }
                `}
            </style>
        </div>
    );
};

export default Orders;
