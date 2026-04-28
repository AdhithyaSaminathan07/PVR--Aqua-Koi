import React, { useState, useEffect } from 'react';
import { 
    MessageSquare, 
    Search, 
    Plus, 
    Filter, 
    MoreVertical, 
    Clock, 
    CheckCircle2, 
    AlertCircle, 
    Trash2, 
    Calendar,
    User,
    ArrowRight,
    Loader2,
    FileText,
    ChevronRight,
    MapPin,
    Phone
} from 'lucide-react';
import * as api from '../../services/api';
import Modal from '../../components/Modal';

const Enquiries = () => {
    const [enquiries, setEnquiries] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [isNewCustomer, setIsNewCustomer] = useState(false);
    const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
    const [selectedEnquiry, setSelectedEnquiry] = useState(null);
    const [products, setProducts] = useState([]);
    
    const [formData, setFormData] = useState({
        customerId: '',
        leadName: '',
        leadPhone: '',
        details: '',
        status: 'Pending'
    });

    const [conversionData, setConversionData] = useState({
        items: [{ productId: '', quantity: 1, price: 0 }],
        taxPhase: 'Inside TN',
        transportCharges: 0,
        totalAmount: 0
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [enqRes, custRes, prodRes] = await Promise.all([
                api.getEnquiries(),
                api.getCustomers(),
                api.getProducts()
            ]);
            setEnquiries(enqRes.data);
            setCustomers(custRes.data);
            setProducts(prodRes.data);
        } catch (err) {
            console.error('Error fetching enquiries:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const dataToSubmit = { ...formData };
            if (isNewCustomer) {
                dataToSubmit.customerId = null;
            } else {
                dataToSubmit.leadName = '';
                dataToSubmit.leadPhone = '';
            }
            await api.createEnquiry(dataToSubmit);
            setIsModalOpen(false);
            setFormData({ customerId: '', leadName: '', leadPhone: '', details: '', status: 'Pending' });
            setIsNewCustomer(false);
            fetchData();
        } catch (err) {
            alert('Error creating enquiry');
        }
    };

    const handleStatusUpdate = async (id, status) => {
        try {
            await api.updateEnquiryStatus(id, status);
            fetchData();
        } catch (err) {
            alert('Error updating status');
        }
    };

    const handleConversionSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                enquiryId: selectedEnquiry._id,
                customerId: selectedEnquiry.customerId?._id,
                items: conversionData.items,
                totalAmount: conversionData.totalAmount,
                taxPhase: conversionData.taxPhase,
                transportCharges: conversionData.transportCharges,
                status: 'Quotation'
            };
            await api.createOrder(payload);
            setIsConvertModalOpen(false);
            alert('Enquiry converted to Order successfully!');
            fetchData();
        } catch (err) {
            alert('Error converting enquiry: ' + (err.response?.data?.message || err.message));
        }
    };

    const calculateTotal = (data) => {
        const itemsTotal = data.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
        return itemsTotal + Number(data.transportCharges || 0);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this enquiry?')) return;
        try {
            await api.deleteEnquiry(id);
            fetchData();
        } catch (err) {
            alert('Error deleting enquiry');
        }
    };

    const handleConvertCustomer = async (id) => {
        try {
            await api.convertEnquiryToCustomer(id);
            fetchData();
        } catch (err) {
            alert('Error promoting lead: ' + (err.response?.data?.message || err.message));
        }
    };

    const filteredEnquiries = enquiries.filter(enq => {
        const matchesSearch = 
            (enq.customerId?.name || enq.leadName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            enq.details?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'All' || enq.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'Quotation Sent': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'Converted': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'Closed': return 'bg-slate-100 text-slate-700 border-slate-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <div className="p-2 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-200">
                            <MessageSquare size={24} />
                        </div>
                        Customer Enquiries
                    </h1>
                    <p className="text-slate-500 text-sm font-medium mt-1 italic pl-12">
                        Managing leads and new prospect requests.
                    </p>
                </div>
                <button
                    onClick={() => {
                        setIsNewCustomer(false);
                        setIsModalOpen(true);
                    }}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 group"
                >
                    <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
                    New Enquiry
                </button>
            </div>

            {/* Statistics Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Enquiries', value: enquiries.length, color: 'indigo', icon: MessageSquare },
                    { label: 'Pending', value: enquiries.filter(e => e.status === 'Pending').length, color: 'amber', icon: Clock },
                    { label: 'Quotation Sent', value: enquiries.filter(e => e.status === 'Quotation Sent').length, color: 'blue', icon: FileText },
                    { label: 'Converted', value: enquiries.filter(e => e.status === 'Converted').length, color: 'emerald', icon: CheckCircle2 }
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
                        <div className={`p-3 bg-${stat.color}-50 text-${stat.color}-600 rounded-2xl`}>
                            <stat.icon size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                            <p className="text-xl font-black text-slate-900 leading-none mt-1">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters and Search */}
            <div className="bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4">
                <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Search enquiries by customer or details..."
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-100 text-sm font-semibold transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter className="text-slate-400" size={18} />
                    <select
                        className="bg-slate-50 border-none rounded-xl py-3 px-4 text-xs font-black uppercase tracking-widest text-slate-600 focus:ring-2 focus:ring-indigo-100 outline-none"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="All">All Status</option>
                        <option value="Pending">Pending</option>
                        <option value="Quotation Sent">Quotation Sent</option>
                        <option value="Converted">Converted</option>
                        <option value="Closed">Closed</option>
                    </select>
                </div>
            </div>

            {/* Enquiries Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {loading ? (
                    Array(6).fill(0).map((_, i) => (
                        <div key={i} className="h-64 bg-slate-50 animate-pulse rounded-[2.5rem]"></div>
                    ))
                ) : filteredEnquiries.length === 0 ? (
                    <div className="col-span-full py-20 text-center bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
                        <MessageSquare className="mx-auto text-slate-300 mb-4" size={48} />
                        <p className="text-slate-400 font-black uppercase tracking-widest italic">No enquiries found</p>
                    </div>
                ) : (
                    filteredEnquiries.map((enquiry) => (
                        <div key={enquiry._id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-900/5 transition-all duration-500 overflow-hidden group">
                            <div className="p-6 md:p-8 space-y-6">
                                {/* Top Header */}
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${enquiry.customerId ? 'bg-indigo-50 text-indigo-600' : 'bg-rose-50 text-rose-600'}`}>
                                            <User size={24} />
                                        </div>
                                        <div>
                                            <h3 className="font-black text-slate-900 leading-tight">
                                                {enquiry.customerId?.name || enquiry.leadName || 'New Lead'}
                                            </h3>
                                            <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-tight mt-1">
                                                <Calendar size={12} />
                                                {new Date(enquiry.createdAt).toLocaleDateString()}
                                                {!enquiry.customerId && <span className="text-rose-500 ml-1">• New Prospect</span>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${getStatusColor(enquiry.status)}`}>
                                        {enquiry.status}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100/50">
                                    <p className="text-xs font-semibold text-slate-600 leading-relaxed italic line-clamp-3">
                                        "{enquiry.details}"
                                    </p>
                                </div>

                                {/* Contact Info */}
                                <div className="flex items-center gap-4 text-slate-500">
                                    <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                                        <Phone size={12} />
                                        <span className="text-[10px] font-bold">
                                            {enquiry.customerId?.phone || enquiry.leadPhone || 'No contact'}
                                        </span>
                                    </div>
                                    {enquiry.customerId?.address && (
                                        <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                                            <MapPin size={12} />
                                            <span className="text-[10px] font-bold truncate max-w-[80px]">{enquiry.customerId.address}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="pt-4 border-t border-slate-50 flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-2">
                                        {enquiry.status === 'Pending' && (
                                            <button 
                                                onClick={() => handleStatusUpdate(enquiry._id, 'Quotation Sent')}
                                                className="px-4 py-2 bg-blue-600 text-white rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center gap-2"
                                            >
                                                Send Quotation
                                                <ArrowRight size={12} />
                                            </button>
                                        )}
                                        {enquiry.status === 'Quotation Sent' && (
                                            <button 
                                                onClick={() => {
                                                    setSelectedEnquiry(enquiry);
                                                    setConversionData({
                                                        items: [{ productId: '', quantity: 1, price: 0 }],
                                                        taxPhase: 'Inside TN',
                                                        transportCharges: 0,
                                                        totalAmount: 0
                                                    });
                                                    setIsConvertModalOpen(true);
                                                }}
                                                className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-emerald-700 transition-all flex items-center gap-2"
                                            >
                                                Convert to Order
                                                <CheckCircle2 size={12} />
                                            </button>
                                        )}
                                        {!enquiry.customerId && (
                                            <button 
                                                onClick={() => handleConvertCustomer(enquiry._id)}
                                                className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-indigo-100 transition-all flex items-center gap-2"
                                                title="Create Customer Profile"
                                            >
                                                <User size={12} />
                                                Promote to Client
                                            </button>
                                        )}
                                    </div>
                                    <button 
                                        onClick={() => handleDelete(enquiry._id)}
                                        className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Create Enquiry Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Register New Enquiry"
            >
                <form onSubmit={handleSubmit} className="p-4 space-y-6">
                    <div className="space-y-6">
                        {/* Prospect Type Toggle */}
                        <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-100 rounded-3xl">
                            <button
                                type="button"
                                onClick={() => setIsNewCustomer(false)}
                                className={`py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${!isNewCustomer ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-400'}`}
                            >
                                Existing Client
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsNewCustomer(true)}
                                className={`py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${isNewCustomer ? 'bg-white text-rose-600 shadow-md' : 'text-slate-400'}`}
                            >
                                New Prospect
                            </button>
                        </div>

                        {!isNewCustomer ? (
                            <div className="space-y-2 animate-in slide-in-from-left-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic ml-1">Select Customer</label>
                                <select
                                    required
                                    className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-indigo-100 focus:bg-white outline-none font-bold transition-all text-slate-900 shadow-inner"
                                    value={formData.customerId}
                                    onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                                >
                                    <option value="">Select established client...</option>
                                    {customers.map(c => (
                                        <option key={c._id} value={c._id}>{c.name} ({c.phone})</option>
                                    ))}
                                </select>
                            </div>
                        ) : (
                            <div className="space-y-4 animate-in slide-in-from-right-2">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-rose-400 uppercase tracking-widest italic ml-1">Lead Full Name</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="Enter prospect name..."
                                        className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-rose-100 focus:bg-white outline-none font-bold transition-all text-slate-900 shadow-inner"
                                        value={formData.leadName}
                                        onChange={(e) => setFormData({ ...formData, leadName: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-rose-400 uppercase tracking-widest italic ml-1">Contact Phone</label>
                                    <input
                                        required
                                        type="tel"
                                        placeholder="Mobile number..."
                                        className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-rose-100 focus:bg-white outline-none font-bold transition-all text-slate-900 shadow-inner"
                                        value={formData.leadPhone}
                                        onChange={(e) => setFormData({ ...formData, leadPhone: e.target.value })}
                                    />
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic ml-1">Enquiry Requirements</label>
                            <textarea
                                required
                                placeholder="Describe what the customer is asking for..."
                                className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-indigo-100 focus:bg-white outline-none font-bold transition-all min-h-[120px] text-slate-900 shadow-inner resize-none"
                                value={formData.details}
                                onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl transition-all flex items-center justify-center gap-2 ${isNewCustomer ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-100' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100'}`}
                    >
                        {isNewCustomer ? 'Register New Lead' : 'Create Enquiry Entry'}
                        <ChevronRight size={18} />
                    </button>
                </form>
            </Modal>

            {/* Conversion Modal */}
            <Modal
                isOpen={isConvertModalOpen}
                onClose={() => setIsConvertModalOpen(false)}
                title="Convert Enquiry to Order"
            >
                <form onSubmit={handleConversionSubmit} className="p-4 space-y-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
                    {selectedEnquiry && (
                        <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 mb-6">
                            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1 italic">Enquiry Summary</p>
                            <p className="text-sm font-bold text-slate-800 italic">"{selectedEnquiry.details}"</p>
                            <div className="flex items-center gap-3 mt-4">
                                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-50">
                                    <User size={16} />
                                </div>
                                <span className="font-bold text-slate-600 text-xs">
                                    {selectedEnquiry.customerId?.name || selectedEnquiry.leadName}
                                </span>
                            </div>
                        </div>
                    )}

                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic">Line Items</h4>
                            <button
                                type="button"
                                onClick={() => setConversionData({
                                    ...conversionData,
                                    items: [...conversionData.items, { productId: '', quantity: 1, price: 0 }]
                                })}
                                className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
                            >
                                <Plus size={16} />
                            </button>
                        </div>

                        {conversionData.items.map((item, index) => (
                            <div key={index} className="p-4 bg-slate-50 rounded-3xl border border-slate-100 space-y-4 animate-in slide-in-from-right-2">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Product</label>
                                        <select
                                            required
                                            className="w-full px-4 py-3 bg-white border-none rounded-xl font-bold text-xs shadow-sm outline-none focus:ring-2 focus:ring-indigo-100"
                                            value={item.productId}
                                            onChange={(e) => {
                                                const newItems = [...conversionData.items];
                                                newItems[index].productId = e.target.value;
                                                const prod = products.find(p => p._id === e.target.value);
                                                if (prod) newItems[index].price = prod.price;
                                                const newData = { ...conversionData, items: newItems };
                                                newData.totalAmount = calculateTotal(newData);
                                                setConversionData(newData);
                                            }}
                                        >
                                            <option value="">Select product...</option>
                                            {products.map(p => (
                                                <option key={p._id} value={p._id}>{p.name} - ₹{p.price}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Qty</label>
                                            <input
                                                type="number"
                                                min="1"
                                                className="w-full px-4 py-3 bg-white border-none rounded-xl font-bold text-xs shadow-sm outline-none focus:ring-2 focus:ring-indigo-100"
                                                value={item.quantity}
                                                onChange={(e) => {
                                                    const newItems = [...conversionData.items];
                                                    newItems[index].quantity = Number(e.target.value);
                                                    const newData = { ...conversionData, items: newItems };
                                                    newData.totalAmount = calculateTotal(newData);
                                                    setConversionData(newData);
                                                }}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Price</label>
                                            <input
                                                type="number"
                                                className="w-full px-4 py-3 bg-white border-none rounded-xl font-bold text-xs shadow-sm outline-none focus:ring-2 focus:ring-indigo-100"
                                                value={item.price}
                                                onChange={(e) => {
                                                    const newItems = [...conversionData.items];
                                                    newItems[index].price = Number(e.target.value);
                                                    const newData = { ...conversionData, items: newItems };
                                                    newData.totalAmount = calculateTotal(newData);
                                                    setConversionData(newData);
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                                {conversionData.items.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const newItems = conversionData.items.filter((_, i) => i !== index);
                                            const newData = { ...conversionData, items: newItems };
                                            newData.totalAmount = calculateTotal(newData);
                                            setConversionData(newData);
                                        }}
                                        className="text-[9px] font-black text-rose-400 uppercase tracking-widest hover:text-rose-600 transition-colors ml-1"
                                    >
                                        Remove Item
                                    </button>
                                )}
                            </div>
                        ))}

                        <div className="pt-6 border-t border-slate-100 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Tax Phase</label>
                                    <select
                                        className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl font-bold text-xs shadow-sm outline-none"
                                        value={conversionData.taxPhase}
                                        onChange={(e) => setConversionData({ ...conversionData, taxPhase: e.target.value })}
                                    >
                                        <option value="Inside TN">Inside TN (CGST/SGST)</option>
                                        <option value="Outside TN">Outside TN (IGST)</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Transport</label>
                                    <input
                                        type="number"
                                        className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl font-bold text-xs shadow-sm outline-none"
                                        placeholder="Charges..."
                                        value={conversionData.transportCharges}
                                        onChange={(e) => {
                                            const newData = { ...conversionData, transportCharges: Number(e.target.value) };
                                            newData.totalAmount = calculateTotal(newData);
                                            setConversionData(newData);
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-6 bg-slate-900 rounded-[2rem] text-white">
                                <div className="flex flex-col">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Total Order Value</p>
                                    <p className="text-2xl font-black italic">₹{conversionData.totalAmount.toLocaleString()}</p>
                                </div>
                                <button
                                    type="submit"
                                    className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-600/20 transition-all flex items-center gap-2"
                                >
                                    Finalize Order
                                    <ArrowRight size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Enquiries;
