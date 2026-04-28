import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users,
    Plus,
    Search,
    Phone,
    MapPin,
    ExternalLink,
    ShoppingCart,
    Loader2,
    ChevronDown,
    Trash2,
    Edit3,
    History
} from 'lucide-react';
import { getCustomers, createCustomer, updateCustomer, deleteCustomer } from '../../services/api';
import Modal from '../../components/Modal';


const Customers = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedId, setExpandedId] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        address: '',
        location: { lat: 0, lng: 0, googleMapsLink: '' }
    });

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            setLoading(true);
            const res = await getCustomers();
            setCustomers(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await updateCustomer(editingId, formData);
            } else {
                await createCustomer(formData);
            }
            setIsModalOpen(false);
            setEditingId(null);
            setFormData({ name: '', phone: '', address: '', location: { lat: 0, lng: 0, googleMapsLink: '' } });
            fetchCustomers();
        } catch (err) {
            alert('Error ' + (editingId ? 'updating' : 'creating') + ' customer');
        }
    };

    const handleEdit = (customer) => {
        setFormData({
            name: customer.name,
            phone: customer.phone,
            address: customer.address,
            location: customer.location || { lat: 0, lng: 0, googleMapsLink: '' }
        });
        setEditingId(customer._id);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this customer permanently? This will not affect existing order history but may break references.')) return;
        try {
            await deleteCustomer(id);
            if (expandedId === id) setExpandedId(null);
            fetchCustomers();
        } catch (err) {
            alert('Error deleting customer');
        }
    };

    const filtered = customers.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone.includes(searchTerm)
    );

    return (
        <div className="py-6 space-y-8 lg:space-y-12">

            {/* Stats & Search Section */}
            {/* Actions & Stats Bar */}
            <div className="flex flex-col md:flex-row gap-4 items-stretch justify-between bg-white p-2 rounded-[2rem] border border-gray-100 shadow-sm">
                <div className="relative flex-1 group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#2988FF] transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Search by name, contact, or location..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-14 pr-6 py-4 bg-gray-50/50 border-none rounded-[1.5rem] focus:ring-0 outline-none transition-all font-bold text-gray-900 placeholder:text-gray-400"
                    />
                </div>
                
                <div className="flex items-center gap-2 p-1">
                    <div className="flex items-center gap-3 px-6 py-3 bg-blue-50 text-[#2988FF] rounded-2xl border border-blue-100/50">
                        <Users size={18} />
                        <div className="flex flex-col">
                            <span className="text-[8px] font-black uppercase tracking-[0.2em] opacity-60 leading-none">Database</span>
                            <span className="text-sm font-black leading-none mt-0.5">{customers.length.toString().padStart(2, '0')} Clients</span>
                        </div>
                    </div>
                    
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="h-full px-8 py-4 bg-[#1a365d] text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-900/10 hover:bg-[#1a365d]/90 transition-all active:scale-95 flex items-center gap-3"
                    >
                        <Plus size={20} strokeWidth={3} />
                        Add Client
                    </button>
                </div>
            </div>

            {/* Customer List Container */}
            <div className="space-y-4">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2.5rem] border border-gray-50 shadow-sm">
                        <Loader2 className="animate-spin text-[#2988FF] mb-4" size={40} />
                        <p className="text-gray-400 font-bold text-sm uppercase tracking-widest italic">Syncing secure records...</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <AnimatePresence>
                            {filtered.map((customer, i) => (
                                <motion.div
                                    key={customer._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className={`bg-white border transition-all duration-300 overflow-hidden ${expandedId === customer._id
                                                ? 'rounded-[1.5rem] border-[#2988FF]/30 shadow-xl shadow-blue-500/5 ring-1 ring-[#2988FF]/10 z-10'
                                                : 'rounded-[1rem] border-gray-50 shadow-sm hover:border-blue-100 hover:shadow-md'
                                                }`}
                                >
                                    <div
                                        onClick={() => setExpandedId(expandedId === customer._id ? null : customer._id)}
                                        className="p-5 flex items-center justify-between cursor-pointer group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg transition-all duration-500 ${expandedId === customer._id
                                                ? 'bg-[#1a365d] text-white scale-105 shadow-lg shadow-blue-900/20'
                                                : 'bg-[#F5F9FC] text-[#2988FF]'
                                                }`}>
                                                {customer.name[0].toUpperCase()}
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-black text-gray-900 tracking-tight group-hover:text-[#2988FF] transition-colors truncate max-w-[140px]">
                                                    {customer.name}
                                                </h3>
                                                <p className="flex items-center gap-1.5 text-[9px] font-black text-gray-400 tracking-widest">
                                                    <Phone size={10} className="text-[#2988FF]" />
                                                    {customer.phone}
                                                </p>
                                            </div>
                                        </div>
                                        <div className={`p-2 rounded-xl transition-all duration-300 ${expandedId === customer._id ? 'bg-blue-50 text-[#2988FF] rotate-180' : 'text-gray-300 group-hover:text-blue-200'}`}>
                                            <ChevronDown size={16} />
                                        </div>
                                    </div>

                                    {/* Dropdown Content */}
                                    <AnimatePresence>
                                        {expandedId === customer._id && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <div className="px-5 pb-6 pt-4 border-t border-gray-50 bg-[#F5F9FC]/30">
                                                    <div className="flex flex-col md:flex-row gap-6 items-start justify-between">
                                                        <div className="flex-1 space-y-4">
                                                            <div className="flex items-start gap-4">
                                                                <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-[#2988FF] shrink-0 shadow-sm">
                                                                    <MapPin size={16} />
                                                                </div>
                                                                <div>
                                                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Customer Location</span>
                                                                    <p className="text-sm font-bold text-gray-700 leading-relaxed">
                                                                        {customer.address}
                                                                    </p>
                                                                    {customer.location?.googleMapsLink && (
                                                                        <a
                                                                            href={customer.location.googleMapsLink}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="inline-flex items-center gap-2 text-[10px] font-black text-[#2988FF] uppercase tracking-widest hover:underline mt-2"
                                                                        >
                                                                            Live Navigation <ExternalLink size={12} />
                                                                        </a>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="flex flex-wrap gap-2 md:shrink-0 ml-auto">
                                                            <button 
                                                                onClick={() => handleEdit(customer)}
                                                                className="flex items-center gap-3 px-6 py-4 bg-slate-900 text-white rounded-2xl transition-all font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-900/10 active:scale-95"
                                                            >
                                                                <Edit3 size={16} />
                                                                Manage Account
                                                            </button>
                                                            <button 
                                                                onClick={() => handleDelete(customer._id)}
                                                                className="flex items-center gap-3 px-4 py-4 bg-rose-50 text-rose-500 hover:bg-rose-100 rounded-2xl transition-all font-black text-[10px] uppercase tracking-widest active:scale-95 border border-rose-100"
                                                                title="Delete Client"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
                {(!loading && filtered.length === 0) && (
                    <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[2.5rem] border border-gray-50 shadow-sm border-dashed">
                        <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-200 mb-4 border border-gray-100">
                            <Users size={32} />
                        </div>
                        <p className="text-gray-400 font-bold text-sm italic tracking-wide">No client records found.</p>
                    </div>
                )}
            </div>

            {/* Premium Registration Modal */}
            <Modal 
                isOpen={isModalOpen} 
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingId(null);
                    setFormData({ name: '', phone: '', address: '', location: { lat: 0, lng: 0, googleMapsLink: '' } });
                }} 
                title={editingId ? "Modify Client Data" : "Client Registration"} 
                maxWidth="max-w-xl"
            >
                <form onSubmit={handleSubmit} className="p-8 space-y-8">
                    <div className="flex items-center gap-4 border-b border-gray-50 pb-6">
                        <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#2988FF] flex items-center justify-center shadow-inner">
                            <Plus size={28} />
                        </div>
                        <div>
                            <h4 className="text-xl font-bold text-gray-900">Register Elite Client</h4>
                            <p className="text-xs text-gray-400 font-medium mt-1 uppercase tracking-widest">Digital Aquaculture Profile</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                            <div className="relative">
                                <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                                <input
                                    type="text" placeholder="Adhithya Saminathan" required
                                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent focus:border-blue-500/20 focus:bg-white rounded-2xl outline-none transition-all font-bold text-gray-800 text-sm shadow-inner"
                                    value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Phone Number</label>
                            <div className="relative">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                                <input
                                    type="text" placeholder="+91 XXXXX XXXXX" required
                                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent focus:border-blue-500/20 focus:bg-white rounded-2xl outline-none transition-all font-bold text-gray-800 text-sm shadow-inner"
                                    value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="md:col-span-2 space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Office/Farm Address</label>
                            <div className="relative">
                                <MapPin className="absolute left-4 top-5 text-gray-300" size={18} />
                                <textarea
                                    placeholder="Enter complete physical address details..." required
                                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent focus:border-blue-500/20 focus:bg-white rounded-2xl outline-none transition-all font-bold text-gray-800 text-sm shadow-inner min-h-[100px] resize-none"
                                    value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="md:col-span-2 space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Google Maps Intelligence (Link)</label>
                            <div className="relative">
                                <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                                <input
                                    type="text" placeholder="https://maps.google.com/..."
                                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent focus:border-blue-500/20 focus:bg-white rounded-2xl outline-none transition-all font-bold text-gray-800 text-sm shadow-inner"
                                    value={formData.location.googleMapsLink} onChange={(e) => setFormData({ ...formData, location: { ...formData.location, googleMapsLink: e.target.value } })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 pt-4">
                        <button
                            type="button" onClick={() => setIsModalOpen(false)}
                            className="flex-1 px-4 py-4 text-gray-400 font-bold text-xs uppercase tracking-widest hover:text-gray-600 transition-colors"
                        >
                            Back
                        </button>
                        <button
                            type="submit"
                            className="flex-[2] py-4 bg-[#1a365d] text-white rounded-2xl font-bold text-xs hover:bg-[#1a365d]/90 transition-all shadow-xl shadow-blue-900/20 uppercase tracking-widest active:scale-95"
                        >
                            {editingId ? 'Update Records' : 'Authorize & Save'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

// Internal icon for forms since ExternalLink is used elsewhere
const LinkIcon = ({ size, className }) => (
    <svg
        width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}
    >
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
);


export default Customers;

