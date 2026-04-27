import React, { useState, useEffect } from 'react';
import {
    Plus,
    Search,
    CreditCard,
    User,
    Calendar,
    ArrowUpCircle,
    CheckCircle2,
    Clock,
    IndianRupee,
    Wallet,
    Loader2
} from 'lucide-react';
import { getKoiPayments, createKoiPayment, getPendingKoiPayments } from '../../services/api';
import Modal from '../../components/Modal';

const KoiPayments = () => {
    const [payments, setPayments] = useState([]);
    const [pendingOrders, setPendingOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({
        order: '',
        customer: '',
        amount: '',
        paymentMethod: 'UPI',
        status: 'Completed'
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [paymentsRes, pendingRes] = await Promise.all([
                getKoiPayments(),
                getPendingKoiPayments()
            ]);
            setPayments(paymentsRes.data);
            setPendingOrders(pendingRes.data);
        } catch (err) {
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createKoiPayment(formData);
            fetchData();
            setIsModalOpen(false);
            setFormData({ order: '', customer: '', amount: '', paymentMethod: 'UPI', status: 'Completed' });
        } catch (err) {
            console.error('Error creating payment:', err);
        }
    };

    const filtered = payments.filter(pay =>
        (pay.customer?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        pay.paymentMethod.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (pay.order?._id || '').includes(searchTerm)
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Payments</h1>
                    <p className="text-gray-500 mt-1">Track payments and manage pending balances</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-900/20 active:scale-95"
                >
                    <Plus size={18} />
                    <span>Record Payment</span>
                </button>
            </div>

            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-5 rounded-[1.5rem] border border-gray-100 shadow-sm">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by customer, method or order ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-100 transition-all font-medium"
                    />
                </div>
                <div className="flex items-center gap-4 text-sm">
                    <span className="font-bold text-gray-400 uppercase tracking-widest text-[10px]">Total Payments</span>
                    <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full font-bold">{payments.length}</span>
                </div>
            </div>

            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[1000px]">
                        <thead className="bg-gray-50/50">
                            <tr className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100">
                                <th className="px-8 py-6">Customer & Order</th>
                                <th className="px-8 py-6">Payment Method</th>
                                <th className="px-8 py-6">Amount Collected</th>
                                <th className="px-8 py-6">Date</th>
                                <th className="px-8 py-6">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <Loader2 className="animate-spin text-primary-500" size={32} />
                                            <p className="text-gray-400 font-medium italic">Loading payments...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filtered.length > 0 ? filtered.map((payment) => (
                                <tr key={payment._id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-11 h-11 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-bold text-lg">
                                                {payment.customer?.name?.[0] || 'C'}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 leading-tight">{payment.customer?.name}</p>
                                                <p className="text-[10px] font-black text-blue-600 mt-0.5 uppercase tracking-tighter italic">
                                                    Order #{payment.order?._id?.slice(-6).toUpperCase()}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1.5 w-fit">
                                            <CreditCard size={12} />
                                            {payment.paymentMethod}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="text-lg font-black text-gray-900 flex items-center gap-1">
                                            <IndianRupee size={16} className="text-gray-400" />
                                            {payment.amount}
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-gray-700">{new Date(payment.paymentDate).toLocaleDateString()}</span>
                                            <span className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">{new Date(payment.paymentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1.5 w-fit">
                                            <CheckCircle2 size={12} />
                                            {payment.status}
                                        </span>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3 text-gray-300">
                                            <Wallet size={48} className="opacity-20" />
                                            <p className="font-medium italic">No payments match your search.</p>
                                        </div>
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
                title="RECORD PAYMENT"
                maxWidth="max-w-xl"
            >
                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 italic">Pending Order</label>
                        <select
                            required
                            value={formData.order}
                            onChange={(e) => {
                                const ord = pendingOrders.find(o => o._id === e.target.value);
                                setFormData({ ...formData, order: e.target.value, customer: ord?.customer?._id, amount: ord?.totalAmount });
                            }}
                            className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 transition-all font-semibold appearance-none"
                        >
                            <option value="">Select Order</option>
                            {pendingOrders.map(o => <option key={o._id} value={o._id}>#{o._id.slice(-6).toUpperCase()} - {o.customer?.name} (₹{o.totalAmount})</option>)}
                        </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 italic">Amount Collected (₹)</label>
                            <input
                                type="number"
                                required
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 transition-all font-semibold"
                                placeholder="0.00"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 italic">Payment Method</label>
                            <select
                                required
                                value={formData.paymentMethod}
                                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                                className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 transition-all font-semibold appearance-none"
                            >
                                <option value="UPI">UPI / GPay</option>
                                <option value="Cash">Cash</option>
                                <option value="Bank Transfer">Bank Transfer</option>
                                <option value="Card">Card</option>
                            </select>
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
                            Save Record
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default KoiPayments;
