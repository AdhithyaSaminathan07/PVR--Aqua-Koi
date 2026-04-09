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

import { getOrders, getCustomers, getProducts, createOrder, updateOrderStatus, updatePayment } from '../services/api';
import Modal from '../components/Modal';

const Invoices = () => {
    const [orders, setOrders] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('invoices'); // 'invoices' or 'quotations'
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editFormData, setEditFormData] = useState({ status: '', paidAmount: 0 });

    // New Invoice Form State
    const [newInvoice, setNewInvoice] = useState({
        customerId: '',
        items: [{ productId: '', quantity: 1, price: 0 }],
        status: 'Completed',
        paidAmount: 0
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
        e.preventDefault();
        try {
            const totalAmount = newInvoice.items.reduce((acc, item) => acc + (item.quantity * item.price), 0);
            const orderData = {
                ...newInvoice,
                totalAmount,
                // If it's a quotation, we can allow partial paidAmount (advance) or 0
                // If it's a quick invoice, we assume fully paid
                paidAmount: newInvoice.status === 'Quotation' ? (newInvoice.paidAmount || 0) : totalAmount,
                status: newInvoice.status || 'Completed'
            };
            await createOrder(orderData);
            setIsCreateModalOpen(false);
            setNewInvoice({ customerId: '', items: [{ productId: '', quantity: 1, price: 0 }], status: 'Completed', paidAmount: 0 });
            fetchInvoices();
        } catch (err) {
            alert('Error creating invoice');
        }
    };

    const addItem = () => {
        setNewInvoice({ ...newInvoice, items: [...newInvoice.items, { productId: '', quantity: 1, price: 0 }] });
    };

    const updateItem = (index, field, value) => {
        const updatedItems = [...newInvoice.items];
        updatedItems[index][field] = value;

        if (field === 'productId') {
            const product = products.find(p => p._id === value);
            if (product) updatedItems[index].price = product.price;
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
        const matchesSearch = o.customerId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             o._id.toLowerCase().includes(searchTerm.toLowerCase());
        const isQuotation = o.status === 'Quotation';
        
        if (viewMode === 'quotations') return matchesSearch && isQuotation;
        return matchesSearch && !isQuotation;
    });


    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 font-display">Invoice Manager</h1>
                    <p className="text-gray-500 mt-1">Generate, track, and manage customer billing.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex gap-1 p-1 bg-gray-100 rounded-xl mr-4">
                        <button 
                            onClick={() => setViewMode('invoices')}
                            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${viewMode === 'invoices' ? 'bg-white shadow-sm text-primary-600' : 'text-gray-500'}`}
                        >
                            Invoices
                        </button>
                        <button 
                            onClick={() => setViewMode('quotations')}
                            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${viewMode === 'quotations' ? 'bg-white shadow-sm text-primary-600' : 'text-gray-500'}`}
                        >
                            Quotations
                        </button>
                    </div>
                    <div className="hidden md:flex flex-col items-end mr-4">
                        <span className="text-xs font-bold text-gray-400 uppercase">Outstanding</span>
                        <span className="text-xl font-bold text-red-500">
                            ₹{orders.filter(o => o.status !== 'Quotation').reduce((acc, o) => acc + (o.totalAmount - o.paidAmount), 0).toLocaleString()}
                        </span>
                    </div>
                    <button onClick={() => { 
                        setNewInvoice({ ...newInvoice, status: viewMode === 'quotations' ? 'Quotation' : 'Completed' });
                        setIsCreateModalOpen(true); 
                    }} className="btn-primary">
                        <FileText size={18} />
                        <span>{viewMode === 'quotations' ? 'New Quotation' : 'Quick Invoice'}</span>
                    </button>
                </div>

            </div>

            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by customer name or Order ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center h-64 gap-3">
                    <Loader2 className="animate-spin text-primary-500" size={32} />
                    <p className="text-gray-400 font-medium italic">Loading invoices...</p>
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
                                            <span className="text-sm font-bold text-primary-600">#{order._id.slice(-6).toUpperCase()}</span>
                                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tight truncate w-32">
                                                {order.items?.[0]?.productId?.name || 'Service Order'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-bold text-gray-800">{order.customerId?.name}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-gray-900">₹{order.totalAmount.toLocaleString()}</span>
                                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md w-fit mt-1 ${
                                                order.paidAmount >= order.totalAmount ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                                            }`}>
                                                {order.paidAmount >= order.totalAmount ? 'Fully Paid' : `Pending ₹${(order.totalAmount - order.paidAmount).toLocaleString()}`}
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

            {/* Create Quick Invoice Modal */}
            <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Generate Quick Invoice" maxWidth="max-w-3xl">
                <form onSubmit={handleCreateInvoice} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Select Customer</label>
                        <select
                            required className="input-field"
                            value={newInvoice.customerId}
                            onChange={(e) => setNewInvoice({ ...newInvoice, customerId: e.target.value })}
                        >
                            <option value="">-- Choose Customer --</option>
                            {customers.map(c => <option key={c._id} value={c._id}>{c.name} ({c.phone})</option>)}
                        </select>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Product Items</label>
                            <button type="button" onClick={addItem} className="text-xs font-bold text-primary-600 hover:text-primary-700 uppercase flex items-center gap-1">
                                <Plus size={14} /> Add Item
                            </button>
                        </div>
                        
                        <div className="space-y-3">
                            {newInvoice.items.map((item, idx) => (
                                <div key={idx} className="grid grid-cols-12 gap-3 items-end bg-gray-50 p-3 rounded-lg border border-gray-100">
                                    <div className="col-span-6">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase">Product</label>
                                        <select
                                            required className="input-field py-1.5 text-sm"
                                            value={item.productId}
                                            onChange={(e) => updateItem(idx, 'productId', e.target.value)}
                                        >
                                            <option value="">Select Product</option>
                                            {products.map(p => (
                                                <option key={p._id} value={p._id} disabled={p.stock <= 0}>
                                                    {p.name} (Stock: {p.stock}) - ₹{p.price}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="col-span-2">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase">Qty</label>
                                        <input
                                            type="number" required min="1" className="input-field py-1.5 text-sm"
                                            value={item.quantity}
                                            onChange={(e) => updateItem(idx, 'quantity', Number(e.target.value))}
                                        />
                                    </div>
                                    <div className="col-span-3">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase">Unit Price</label>
                                        <input
                                            type="number" required className="input-field py-1.5 text-sm"
                                            value={item.price}
                                            onChange={(e) => updateItem(idx, 'price', Number(e.target.value))}
                                        />
                                    </div>
                                    <div className="col-span-1 flex justify-center pb-2">
                                        <button 
                                            type="button" 
                                            onClick={() => setNewInvoice({ ...newInvoice, items: newInvoice.items.filter((_, i) => i !== idx) })}
                                            className="text-red-400 hover:text-red-600 transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-gray-400 uppercase">Total Amount</span>
                            <span className="text-2xl font-black text-gray-900">₹{newInvoice.items.reduce((acc, item) => acc + (item.quantity * item.price), 0).toLocaleString()}</span>
                        </div>
                        {newInvoice.status === 'Quotation' && (
                            <div className="flex flex-col items-end">
                                <label className="text-[10px] font-bold text-gray-400 uppercase">Advance Paid</label>
                                <input
                                    type="number"
                                    className="input-field py-1 text-sm w-32 text-right"
                                    placeholder="Amount"
                                    value={newInvoice.paidAmount}
                                    onChange={(e) => setNewInvoice({ ...newInvoice, paidAmount: Number(e.target.value) })}
                                />
                            </div>
                        )}
                        <button type="submit" className="btn-primary px-8 py-3 text-sm">
                            {newInvoice.status === 'Quotation' ? 'Save Quotation' : 'Generate & Complete Invoice'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Premium Invoice Modal */}
            <Modal isOpen={isInvoiceModalOpen} onClose={() => setIsInvoiceModalOpen(false)} title="Tax Invoice" maxWidth="max-w-4xl">
                {selectedOrder && (
                    <div className="bg-white rounded-lg overflow-hidden p-8">
                        <div id="printable-invoice" className="p-6 md:p-10 space-y-8 md:space-y-10 bg-white">
                            {/* Header */}
                            <div className="flex flex-col md:flex-row justify-between items-start border-b-2 border-primary-500 pb-8 gap-6">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                                            <CheckCircle2 size={24} />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-black text-gray-900 tracking-tighter">PVR AQUA</h2>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase leading-none">Culture Module</p>
                                        </div>
                                    </div>
                                    <div className="text-[11px] text-gray-500 font-medium leading-relaxed mt-4 max-w-[250px]">
                                        Door No: 4-12, Near Lake Road,<br />
                                        Gachibowli, Hyderabad - 500032<br />
                                        GSTIN: 36AAAAA0000A1Z5<br />
                                        Phone: +91 98765 43210
                                    </div>
                                </div>
                                <div className="md:text-right">
                                    <h1 className="text-4xl md:text-5xl font-black text-gray-300 uppercase leading-none mb-4 -mr-1">
                                        {selectedOrder.status === 'Quotation' ? 'QUOTATION' : 'INVOICE'}
                                    </h1>
                                    <div className="space-y-1">
                                        <p className="text-sm font-bold text-gray-900">{selectedOrder.status === 'Quotation' ? 'Quotation' : 'Invoice'} #: {selectedOrder._id.slice(-6).toUpperCase()}</p>

                                        <p className="text-[12px] text-gray-500 font-medium">Date: {new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
                                        <p className="text-[12px] text-gray-500 font-medium">Due Date: {new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Billing Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16">
                                <div className="space-y-4">
                                    <div className="inline-block px-3 py-1 bg-gray-100 rounded text-[10px] font-black text-gray-400 uppercase tracking-widest">Billed To</div>
                                    <div className="space-y-1">
                                        <h3 className="text-lg font-black text-gray-900 uppercase leading-tight">{selectedOrder.customerId?.name}</h3>
                                        <p className="text-[12px] text-gray-500 font-medium leading-relaxed max-w-[300px]">
                                            {selectedOrder.customerId?.address || 'No Address Provided'}
                                        </p>
                                        <p className="text-[12px] text-primary-600 font-bold mt-2">Ph: {selectedOrder.customerId?.phone}</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                     <div className="inline-block px-3 py-1 bg-gray-100 rounded text-[10px] font-black text-gray-400 uppercase tracking-widest">Payment Info</div>
                                     <div className="grid grid-cols-2 gap-4">
                                         <div>
                                             <p className="text-[10px] font-bold text-gray-400 uppercase">Total Amount</p>
                                             <p className="text-lg font-black text-gray-900 tracking-tight">₹{selectedOrder.totalAmount.toLocaleString()}</p>
                                         </div>
                                         <div>
                                             <p className="text-[10px] font-bold text-gray-400 uppercase">Paid Amount</p>
                                             <p className="text-lg font-black text-green-600 tracking-tight">₹{selectedOrder.paidAmount.toLocaleString()}</p>
                                         </div>
                                         <div className="col-span-2 pt-2 border-t border-gray-50">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase">Status</p>
                                            <span className="text-sm font-bold text-primary-600 uppercase tracking-wide">{selectedOrder.status}</span>
                                         </div>
                                     </div>
                                </div>
                            </div>

                            {/* Items Table */}
                            <div className="pt-2 overflow-x-auto">
                                <table className="w-full text-left min-w-[500px]">
                                    <thead>
                                        <tr className="border-y-2 border-gray-100 italic">
                                            <th className="py-4 text-xs font-black text-gray-400 uppercase">Description</th>
                                            <th className="py-4 text-xs font-black text-gray-400 uppercase text-center">Qty</th>
                                            <th className="py-4 text-xs font-black text-gray-400 uppercase text-right">Unit Price</th>
                                            <th className="py-4 text-xs font-black text-gray-400 uppercase text-right">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {selectedOrder.items && selectedOrder.items.length > 0 ? (
                                            selectedOrder.items.map((item, idx) => (
                                                <tr key={idx}>
                                                    <td className="py-5">
                                                        <p className="font-bold text-gray-900">{item.productId?.name || 'Order Item'}</p>
                                                        <p className="text-[10px] text-gray-400 font-medium">SKU: {item.productId?._id?.slice(-8) || 'N/A'}</p>
                                                    </td>
                                                    <td className="py-5 text-center font-bold text-gray-900">{item.quantity}</td>
                                                    <td className="py-5 text-right font-bold text-gray-900">₹{item.price?.toLocaleString()}</td>
                                                    <td className="py-5 text-right font-black text-gray-900">₹{(item.quantity * item.price).toLocaleString()}</td>
                                                </tr>
                                            ))
                                        ) : (
                                             <tr>
                                                <td className="py-5">
                                                    <p className="font-bold text-gray-900">Service/Custom Order</p>
                                                    <p className="text-[10px] text-gray-400 font-medium tracking-tight">Detailed service description available in project files.</p>
                                                </td>
                                                <td className="py-5 text-center font-bold text-gray-900">1</td>
                                                <td className="py-5 text-right font-bold text-gray-900">₹{selectedOrder.totalAmount.toLocaleString()}</td>
                                                <td className="py-5 text-right font-black text-gray-900">₹{selectedOrder.totalAmount.toLocaleString()}</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Totals */}
                            <div className="flex md:justify-end pt-6">
                                <div className="w-full md:w-64 space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="font-bold text-gray-400">Subtotal</span>
                                        <span className="font-black text-gray-900">₹{selectedOrder.totalAmount.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="font-bold text-gray-400">Tax (IGST 0%)</span>
                                        <span className="font-black text-gray-900">₹0</span>
                                    </div>
                                    <div className="flex justify-between p-3 bg-primary-600 rounded-xl text-white shadow-lg shadow-primary-200">
                                        <span className="text-xs font-black uppercase">Grand Total</span>
                                        <span className="text-xl font-black">₹{selectedOrder.totalAmount.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between py-2 border-t-2 border-dashed border-gray-100 mt-4">
                                        <span className="text-[10px] font-black text-red-500 uppercase">Balance Due</span>
                                        <span className="text-[14px] font-black text-red-500">₹{(selectedOrder.totalAmount - selectedOrder.paidAmount).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="pt-10 md:pt-20">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-4">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-gray-900 uppercase">Terms & Conditions</p>
                                            <ol className="text-[10px] text-gray-500 font-medium list-decimal list-inside space-y-1 leading-tight">
                                                <li>Please process payment within 15 days</li>
                                                <li>Goods once sold will not be taken back</li>
                                                <li>Subject to Hyderabad Jurisdiction</li>
                                            </ol>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-start md:items-center justify-end">
                                        <div className="w-40 border-b-2 border-gray-900"></div>
                                        <p className="text-[10px] font-black text-gray-900 uppercase mt-2">Authorized Signatory</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Actions */}
                        <div className="p-6 bg-gray-50 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center no-print gap-4">
                             <div className="flex gap-2">
                                <button onClick={handlePrint} className="btn-primary py-2 px-4 text-xs uppercase tracking-wider">
                                     <Printer size={16} /> Print {selectedOrder.status === 'Quotation' ? 'Quotation' : 'Invoice'}
                                </button>
                                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-600 font-bold text-xs hover:bg-gray-50">
                                    <Download size={16} /> PDF
                                </button>
                             </div>
                             <button className="flex items-center gap-2 px-4 py-2 bg-aqua-500 text-white rounded-lg font-bold text-xs hover:bg-aqua-600 shadow-lg shadow-aqua-100">
                                <Mail size={16} /> Email Customer
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
                            ₹{selectedOrder?.totalAmount.toLocaleString()}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Paid Amount (Current: ₹{selectedOrder?.paidAmount.toLocaleString()})</label>
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
                    .no-print { display: none !important; }
                    body { background: white !important; }
                    main { padding: 0 !important; }
                    header, aside { display: none !important; }
                    #printable-invoice { padding: 0 !important; width: 100% !important; margin: 0 !important; }
                }
                `}
            </style>
        </div>
    );
};

export default Invoices;
