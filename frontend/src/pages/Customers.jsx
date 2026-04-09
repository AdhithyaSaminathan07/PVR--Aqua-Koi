import React, { useState, useEffect } from 'react';
import {
    Users,
    Plus,
    Search,
    Phone,
    MapPin,
    ExternalLink,
    MessageSquare,
    History,
    ShoppingCart,
    Loader2
} from 'lucide-react';
import { getCustomers, createCustomer } from '../services/api';
import Modal from '../components/Modal';

const Customers = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
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
            await createCustomer(formData);
            setIsModalOpen(false);
            setFormData({ name: '', phone: '', address: '', location: { lat: 0, lng: 0, googleMapsLink: '' } });
            fetchCustomers();
        } catch (err) {
            alert('Error creating customer');
        }
    };

    const filtered = customers.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone.includes(searchTerm)
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 font-display">Customer Directory</h1>
                    <p className="text-gray-500 mt-1">Manage your customer database and interaction history.</p>
                </div>
                <button onClick={() => setIsModalOpen(true)} className="btn-primary">
                    <Plus size={18} />
                    <span>New Customer</span>
                </button>
            </div>

            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by name or phone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                    />
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="font-medium">Total: {customers.length}</span>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center h-64 gap-3">
                    <Loader2 className="animate-spin text-primary-500" size={32} />
                    <p className="text-gray-400 font-medium italic">Loading customers...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {filtered.map((customer) => (
                        <div key={customer._id} className="card group hover:shadow-md transition-all border-l-4 border-l-primary-500">
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center font-bold text-xl font-display uppercase">
                                        {customer.name[0]}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 font-display transition-colors uppercase tracking-tight">
                                            {customer.name}
                                        </h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Active</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors">
                                        <ExternalLink size={18} />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-3 mb-6">
                                <div className="flex items-center gap-3 text-gray-500 text-sm font-medium">
                                    <Phone size={16} className="text-primary-400" />
                                    <span>{customer.phone}</span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-500 text-sm font-medium">
                                    <MapPin size={16} className="text-primary-400" />
                                    <span className="truncate">{customer.address}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-50">
                                <button className="flex flex-col items-center gap-1 group/btn">
                                    <ShoppingCart size={18} className="text-gray-400 group-hover/btn:text-primary-500 transition-colors" />
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Orders</span>
                                </button>
                                <button className="flex flex-col items-center gap-1 group/btn border-x border-gray-100">
                                    <MessageSquare size={18} className="text-gray-400 group-hover/btn:text-aqua-500 transition-colors" />
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Complaints</span>
                                </button>
                                <button className="flex flex-col items-center gap-1 group/btn">
                                    <History size={18} className="text-gray-400 group-hover/btn:text-purple-500 transition-colors" />
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">History</span>
                                </button>
                            </div>
                        </div>
                    ))}
                    {filtered.length === 0 && <p className="col-span-2 text-center text-gray-400 italic py-12">No customers found.</p>}
                </div>
            )}

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Customer">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="text" placeholder="Customer Name" required className="input-field"
                        value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                    <input
                        type="text" placeholder="Phone Number" required className="input-field"
                        value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                    <textarea
                        placeholder="Address" required className="input-field min-h-[100px]"
                        value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                    <input
                        type="text" placeholder="Google Maps Link (Optional)" className="input-field"
                        value={formData.location.googleMapsLink} onChange={(e) => setFormData({ ...formData, location: { ...formData.location, googleMapsLink: e.target.value } })}
                    />
                    <button type="submit" className="btn-primary w-full py-3 mt-4 text-white">Save Customer</button>
                </form>
            </Modal>
        </div>
    );
};

export default Customers;
