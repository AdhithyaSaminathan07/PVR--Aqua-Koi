import React, { useState, useEffect } from 'react';
import { 
    Plus, 
    Search, 
    User, 
    Phone, 
    MapPin, 
    History, 
    ChevronDown,
    ChevronUp,
    PhoneCall,
    Mail,
    Users,
    ChevronRight,
    ShoppingBag,
    Pencil,
    Trash2
} from 'lucide-react';
import { 
    getKoiCustomers, 
    createKoiCustomer, 
    getKoiCustomerById,
    updateKoiCustomer,
    deleteKoiCustomer
} from '../../services/api';
import Modal from '../../components/Modal';

const KoiCustomers = () => {
    const [customers, setCustomers] = useState([]);
    const [expandedIds, setExpandedIds] = useState(new Set());
    const [customerDetails, setCustomerDetails] = useState({});
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        address: ''
    });

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            const res = await getKoiCustomers();
            setCustomers(res.data);
        } catch (err) {
            console.error('Error fetching customers:', err);
        }
    };

    const toggleExpand = async (id) => {
        const newExpandedIds = new Set(expandedIds);
        if (newExpandedIds.has(id)) {
            newExpandedIds.delete(id);
        } else {
            newExpandedIds.add(id);
            if (!customerDetails[id]) {
                try {
                    const res = await getKoiCustomerById(id);
                    setCustomerDetails(prev => ({ ...prev, [id]: res.data }));
                } catch (err) {
                    console.error('Error fetching customer details:', err);
                }
            }
        }
        setExpandedIds(newExpandedIds);
    };

    const handleSaveCustomer = async (e) => {
        e.preventDefault();
        try {
            if (isEditMode) {
                await updateKoiCustomer(editingId, formData);
            } else {
                await createKoiCustomer(formData);
            }
            fetchCustomers();
            handleCloseModal();
        } catch (err) {
            console.error('Error saving customer:', err);
            alert('Error saving customer');
        }
    };

    const handleEditClick = (customer, e) => {
        if (e) e.stopPropagation();
        setFormData({
            name: customer.name,
            phone: customer.phone,
            address: customer.address || ''
        });
        setEditingId(customer._id);
        setIsEditMode(true);
        setIsAddModalOpen(true);
    };

    const handleDeleteClick = async (id, e) => {
        if (e) e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this customer record?')) {
            try {
                await deleteKoiCustomer(id);
                fetchCustomers();
            } catch (err) {
                console.error('Error deleting customer:', err);
                alert('Error deleting customer');
            }
        }
    };

    const handleCloseModal = () => {
        setIsAddModalOpen(false);
        setIsEditMode(false);
        setEditingId(null);
        setFormData({ name: '', phone: '', address: '' });
    };

    const CustomerRow = ({ customer }) => {
        const isExpanded = expandedIds.has(customer._id);
        const details = customerDetails[customer._id];

        return (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden mb-4 transition-all duration-300">
                <div 
                    onClick={() => toggleExpand(customer._id)}
                    className="p-6 cursor-pointer hover:bg-gray-50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center font-black text-xl uppercase tracking-tighter">
                            {customer.name[0]}
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">{customer.name}</h3>
                            <div className="flex items-center gap-3 mt-1">
                                <span className="text-[11px] font-bold text-gray-400 flex items-center gap-1"><Phone size={12} /> {customer.phone}</span>
                                <span className="text-[11px] font-bold text-orange-600 uppercase italic tracking-widest bg-orange-50 px-2 py-0.5 rounded-full">{customer.purchaseFrequency || 0} Orders</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2 self-end md:self-auto">
                        <button
                            onClick={(e) => handleEditClick(customer, e)}
                            className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-gray-900 hover:text-white transition-all"
                        >
                            <Pencil size={18} />
                        </button>
                        <button
                            onClick={(e) => handleDeleteClick(customer._id, e)}
                            className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-red-600 hover:text-white transition-all"
                        >
                            <Trash2 size={18} />
                        </button>
                        <div className={`p-2 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                            <ChevronDown size={20} className="text-gray-400" />
                        </div>
                    </div>
                </div>

                {isExpanded && (
                    <div className="px-8 pb-8 pt-2 border-t border-gray-50 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4">
                            <div className="space-y-3">
                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2"><MapPin size={12} /> Billing Address</h4>
                                <div className="p-4 bg-gray-50 rounded-2xl text-sm font-medium text-gray-600 leading-relaxed italic border border-gray-100">
                                    {customer.address || 'No address provided'}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2"><ShoppingBag size={12} /> Order History</h4>
                                <div className="space-y-2">
                                    {details?.orderHistory && details.orderHistory.length > 0 ? details.orderHistory.map((order, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100 hover:border-orange-200 transition-colors">
                                            <div className="flex flex-col">
                                                <span className="text-[11px] font-black text-gray-900 uppercase">#{order._id?.slice(-6).toUpperCase() || 'ID-ERR'}</span>
                                                <span className="text-[10px] text-gray-400 font-bold uppercase">{order.fishType || 'Unknown'} ({order.quantity || 1} units)</span>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-xs font-black text-gray-900">₹{order.totalAmount}</div>
                                                <div className="text-[9px] font-black text-emerald-500 uppercase tracking-tighter italic">{new Date(order.createdAt).toLocaleDateString()}</div>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="text-center py-6 text-gray-400 italic text-xs bg-gray-50 rounded-2xl">No orders found for this customer.</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-[1000px] mx-auto pb-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-5xl font-black text-gray-900 font-display italic uppercase tracking-tighter leading-none">
                        Customer <span className="text-orange-600 italic">Directory</span>
                    </h1>
                    <p className="text-gray-400 font-medium mt-2">Manage your clientele and track purchase histories.</p>
                </div>
                <button 
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center gap-2 bg-gray-900 hover:bg-black text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl hover:-translate-y-1 active:scale-95"
                >
                    <Plus size={18} />
                    <span>Add New Client</span>
                </button>
            </div>

            <div className="mt-8">
                {customers.length > 0 ? (
                    <div className="animate-in fade-in duration-700">
                        {customers.map(customer => (
                            <CustomerRow key={customer._id} customer={customer} />
                        ))}
                    </div>
                ) : (
                    <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-gray-200">
                        <Users size={48} className="mx-auto text-gray-200 mb-4" />
                        <h3 className="text-lg font-bold text-gray-300 uppercase tracking-widest">No customers to display</h3>
                        <p className="text-sm text-gray-400 mt-2 italic">Start by adding your first client above.</p>
                    </div>
                )}
            </div>

            <Modal 
                isOpen={isAddModalOpen} 
                onClose={handleCloseModal} 
                title={isEditMode ? "EDIT CLIENT RECORD" : "REGISTER NEW CLIENT"}
                maxWidth="max-w-xl"
            >
                <form onSubmit={handleSaveCustomer} className="p-8 space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 italic">Full Name</label>
                        <input 
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 transition-all font-semibold"
                            placeholder="Customer Name"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 italic">Phone Number</label>
                        <input 
                            required
                            value={formData.phone}
                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                            className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 transition-all font-semibold"
                            placeholder="+91..."
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 italic">Address</label>
                        <textarea 
                            rows="2"
                            value={formData.address}
                            onChange={(e) => setFormData({...formData, address: e.target.value})}
                            className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 transition-all font-semibold resize-none"
                            placeholder="Billing address details..."
                        />
                    </div>
                    <button type="submit" className="w-full py-4 bg-orange-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-orange-700 transition-all shadow-xl">
                        {isEditMode ? 'Update Record' : 'Save Record'}
                    </button>
                </form>
            </Modal>
        </div>
    );
};

export default KoiCustomers;
