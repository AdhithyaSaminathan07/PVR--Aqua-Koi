import React, { useState, useEffect } from 'react';
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
    X
} from 'lucide-react';
import { getKoiOrders, createKoiOrder, updateKoiOrderStatus, getKoiCustomers, getKoiEnquiries } from '../../services/api';
import Modal from '../../components/Modal';

const KoiOrders = () => {
    const [orders, setOrders] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [enquiries, setEnquiries] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        customer: '',
        enquiry: '',
        fishType: '',
        quantity: '',
        price: '',
        totalAmount: '',
        foodItems: []
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [ordersRes, customersRes, enquiriesRes] = await Promise.all([
                getKoiOrders(),
                getKoiCustomers(),
                getKoiEnquiries()
            ]);
            setOrders(ordersRes.data);
            setCustomers(customersRes.data);
            setEnquiries(enquiriesRes.data.filter(e => e.status !== 'Converted'));
        } catch (err) {
            console.error('Error fetching data:', err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const totalAmount = formData.quantity * formData.price;
            await createKoiOrder({ ...formData, totalAmount });
            fetchData();
            setIsModalOpen(false);
            resetForm();
        } catch (err) {
            console.error('Error creating order:', err);
        }
    };

    const resetForm = () => {
        setFormData({
            customer: '',
            enquiry: '',
            fishType: '',
            quantity: '',
            price: '',
            totalAmount: '',
            foodItems: []
        });
    };

    const handleStatusUpdate = async (id, status) => {
        try {
            await updateKoiOrderStatus(id, { status });
            fetchData();
        } catch (err) {
            console.error('Error updating status:', err);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 font-display italic uppercase tracking-tight">Order Management</h1>
                    <p className="text-gray-400 font-medium mt-1">Track customer orders and convert enquiries</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-4 rounded-2xl font-bold transition-all shadow-xl shadow-blue-100 hover:-translate-y-1 active:scale-95"
                >
                    <Plus size={20} />
                    <span>CREATE ORDER</span>
                </button>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Show:</span>
                            <div className="flex bg-gray-50 p-1 rounded-xl">
                                <button className="px-4 py-2 bg-white text-gray-900 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm">All</button>
                                <button className="px-4 py-2 text-gray-400 hover:text-gray-600 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all">Pending</button>
                                <button className="px-4 py-2 text-gray-400 hover:text-gray-600 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all">Completed</button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest italic border-b border-gray-100">Order Detail</th>
                                <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest italic border-b border-gray-100">Customer</th>
                                <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest italic border-b border-gray-100">Financials</th>
                                <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest italic border-b border-gray-100">Status</th>
                                <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest italic border-b border-gray-100 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {orders.length > 0 ? orders.map((order) => (
                                <tr key={order._id} className="hover:bg-gray-50/30 transition-all group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shadow-sm group-hover:bg-primary-600 group-hover:text-white transition-all duration-300">
                                                <ShoppingCart size={22} />
                                            </div>
                                            <div>
                                                <div className="text-sm font-black text-gray-900 font-display">#{order._id.slice(-6).toUpperCase()}</div>
                                                <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400 mt-1 uppercase tracking-tight">
                                                    <Tag size={12} className="text-blue-400" />
                                                    {order.fishType} ({order.quantity} qty)
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-gray-700">{order.customer?.name}</span>
                                            <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400 mt-0.5 tracking-tighter">
                                                <Calendar size={12} />
                                                Ordered {new Date(order.orderDate).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-black text-gray-900">₹{order.totalAmount}</span>
                                            <span className={`text-[10px] font-black uppercase tracking-widest mt-0.5 ${order.paymentStatus === 'Completed' ? 'text-emerald-500' : 'text-red-500'
                                                }`}>
                                                {order.paymentStatus}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${order.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                            order.status === 'Cancelled' ? 'bg-red-50 text-red-600 border border-red-100' :
                                                'bg-blue-50 text-blue-600 border border-blue-100'
                                            }`}>
                                            {order.status === 'Completed' ? <CheckCircle2 size={12} /> :
                                                order.status === 'Cancelled' ? <X size={12} /> : <Clock size={12} />}
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        {order.status === 'Pending' && (
                                            <button
                                                onClick={() => handleStatusUpdate(order._id, 'Completed')}
                                                className="px-4 py-2 bg-gray-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-md active:scale-95"
                                            >
                                                Mark Complete
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="px-8 py-20 text-center flex flex-col items-center">
                                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-4">
                                            <ShoppingCart size={40} />
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-400 uppercase italic tracking-widest">No orders found</h3>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="CREATE NEW KOI ORDER"
                maxWidth="max-w-2xl"
            >
                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 italic">Customer</label>
                            <select
                                required
                                value={formData.customer}
                                onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                                className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 transition-all font-semibold appearance-none"
                            >
                                <option value="">Select Customer</option>
                                {customers.map(c => <option key={c._id} value={c._id}>{c.name} - {c.phone}</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 italic">Link Enquiry (Optional)</label>
                            <select
                                value={formData.enquiry}
                                onChange={(e) => {
                                    const enq = enquiries.find(eq => eq._id === e.target.value);
                                    if (enq) {
                                        setFormData({ ...formData, enquiry: e.target.value, fishType: enq.requirement });
                                    } else {
                                        setFormData({ ...formData, enquiry: e.target.value });
                                    }
                                }}
                                className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 transition-all font-semibold appearance-none"
                            >
                                <option value="">Independent Order</option>
                                {enquiries.map(e => <option key={e._id} value={e._id}>{e.customerName} - {e.requirement}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 italic">Fish / Food Type</label>
                        <input
                            type="text"
                            required
                            value={formData.fishType}
                            onChange={(e) => setFormData({ ...formData, fishType: e.target.value })}
                            className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 transition-all font-semibold"
                            placeholder="e.g. Kohaku Koi, Sinking Food"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 italic">Quantity</label>
                            <input
                                type="number"
                                required
                                value={formData.quantity}
                                onChange={(e) => setFormData({ ...formData, quantity: e.target.value, totalAmount: e.target.value * formData.price })}
                                className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 transition-all font-semibold"
                                placeholder="0"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 italic">Price per Unit (₹)</label>
                            <input
                                type="number"
                                required
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: e.target.value, totalAmount: formData.quantity * e.target.value })}
                                className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 transition-all font-semibold"
                                placeholder="0.00"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 italic">Total Amount</label>
                            <div className="w-full px-5 py-4 bg-blue-50 text-blue-600 rounded-2xl font-black text-xl flex items-center gap-2">
                                <IndianRupee size={20} />
                                {formData.quantity * formData.price || 0}
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-bold uppercase tracking-widest hover:bg-gray-200 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 py-4 bg-primary-600 text-white rounded-2xl font-bold uppercase tracking-widest hover:bg-primary-700 transition-all shadow-lg shadow-blue-100"
                        >
                            Confirm Order
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default KoiOrders;
