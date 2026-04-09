import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus,


    Search,
    ArrowRight,
    ClipboardList,
    Hammer,
    Truck,
    Banknote,
    Loader2
} from 'lucide-react';
import { getEnquiries, createEnquiry, getOrders, createOrder, getCustomers, getProducts, updateOrderStatus, updatePayment } from '../services/api';
import Modal from '../components/Modal';

const Orders = () => {
    const navigate = useNavigate();
    const [view, setView] = useState('enquiries');

    const [enquiries, setEnquiries] = useState([]);
    const [orders, setOrders] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
    const [selectedEnquiry, setSelectedEnquiry] = useState(null);

    const [enqFormData, setEnqFormData] = useState({ customerId: '', details: '' });
    const [convertFormData, setConvertFormData] = useState({ totalAmount: '', paidAmount: '' });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [enqRes, ordRes, custRes, prodRes] = await Promise.all([
                getEnquiries(), getOrders(), getCustomers(), getProducts()
            ]);
            setEnquiries(enqRes.data);
            setOrders(ordRes.data);
            setCustomers(custRes.data);
            setProducts(prodRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateEnquiry = async (e) => {
        e.preventDefault();
        try {
            await createEnquiry(enqFormData);
            setIsModalOpen(false);
            setEnqFormData({ customerId: '', details: '' });
            fetchData();
        } catch (err) {
            alert('Error creating enquiry');
        }
    };

    const handleConvertClick = (enq) => {
        setSelectedEnquiry(enq);
        setConvertFormData({ totalAmount: '', paidAmount: '' });
        setIsConvertModalOpen(true);
    };

    const handleConvertSubmit = async (e) => {
        e.preventDefault();
        try {
            const orderData = {
                customerId: selectedEnquiry.customerId._id,
                enquiryId: selectedEnquiry._id,
                totalAmount: Number(convertFormData.totalAmount),
                paidAmount: Number(convertFormData.paidAmount),
                status: 'Quotation',
                items: [{ productId: products[0]?._id, quantity: 1, price: Number(convertFormData.totalAmount) }] // Dummy item for schema
            };
            await createOrder(orderData);
            setIsConvertModalOpen(false);
            fetchData();
            setView('orders');
        } catch (err) {
            alert('Error converting enquiry: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleUpdateStatus = async (id, status) => {
        try {
            await updateOrderStatus(id, status);
            fetchData();
        } catch (err) {
            alert('Error updating status');
        }
    };

    const handleUpdatePayment = async (id) => {
        const amount = prompt('Enter payment amount:');
        if (amount) {
            try {
                await updatePayment(id, amount);
                fetchData();
            } catch (err) {
                alert('Error updating payment');
            }
        }
    };


    const handleViewInvoice = (order) => {
        navigate('/invoices');
    };


    return (

        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 font-display">Enquiry & Orders</h1>
                    <p className="text-gray-500 mt-1">Manage process from Lead to Dispatch.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={() => setIsModalOpen(true)} className="btn-primary">
                        <Plus size={18} />
                        <span>New Enquiry</span>
                    </button>
                    <div className="flex gap-2 p-1 bg-gray-100 rounded-xl w-fit">
                        <button
                            onClick={() => setView('enquiries')}
                            className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${view === 'enquiries' ? 'bg-white shadow-sm text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Enquiries
                        </button>
                        <button
                            onClick={() => setView('orders')}
                            className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${view === 'orders' ? 'bg-white shadow-sm text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Orders
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="card text-center flex flex-col items-center">
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-full mb-3"><ClipboardList size={20} /></div>
                    <p className="text-[10px] lowercase font-bold text-gray-400">Total Enquiries</p>
                    <p className="text-2xl font-bold mt-1">{enquiries.length}</p>
                </div>
                <div className="card text-center flex flex-col items-center">
                    <div className="p-3 bg-yellow-100 text-yellow-600 rounded-full mb-3"><Hammer size={20} /></div>
                    <p className="text-[10px] lowercase font-bold text-gray-400">In Production</p>
                    <p className="text-2xl font-bold mt-1">{orders.filter(o => o.status === 'In Production').length}</p>
                </div>
                <div className="card text-center flex flex-col items-center">
                    <div className="p-3 bg-purple-100 text-purple-600 rounded-full mb-3"><Truck size={20} /></div>
                    <p className="text-[10px] lowercase font-bold text-gray-400">Dispatched</p>
                    <p className="text-2xl font-bold mt-1">{orders.filter(o => o.status === 'Dispatched').length}</p>
                </div>
                <div className="card text-center flex flex-col items-center">
                    <div className="p-3 bg-orange-100 text-orange-600 rounded-full mb-3"><Banknote size={20} /></div>
                    <p className="text-[10px] lowercase font-bold text-gray-400">Pending Value</p>
                    <p className="text-2xl font-bold mt-1">₹{(orders.reduce((acc, o) => acc + (o.totalAmount - o.paidAmount), 0) / 1000).toFixed(1)}K</p>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden min-h-[400px]">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-64 gap-3">
                        <Loader2 className="animate-spin text-primary-500" size={32} />
                        <p className="text-gray-400 font-medium italic">Loading records...</p>
                    </div>
                ) : (
                    view === 'enquiries' ? (
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100 italic">
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Customer</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Details</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Status</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {enquiries.map(enq => (
                                    <tr key={enq._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 font-bold text-gray-900">{enq.customerId?.name}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{enq.details}</td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-[10px] font-bold uppercase">{enq.status}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button 
                                                onClick={() => handleConvertClick(enq)}
                                                className="text-primary-600 hover:text-primary-800 font-bold flex items-center gap-1 justify-end ml-auto"
                                            >
                                                Convert <ArrowRight size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {enquiries.length === 0 && <tr><td colSpan="4" className="p-12 text-center text-gray-400 italic">No enquiries.</td></tr>}
                            </tbody>
                        </table>
                    ) : (
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100 italic">
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Order Details</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Customer</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Status</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Adv Paid</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Balance</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {orders.map(order => (
                                    <tr key={order._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-gray-900 text-sm italic">#{order._id.slice(-6)}</p>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{order.items?.[0]?.productId?.name || 'Service Project'}</p>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-gray-900">{order.customerId?.name}</td>
                                        <td className="px-6 py-4">
                                            <select 
                                                className="bg-gray-50 border-none text-[10px] font-bold uppercase rounded p-1 outline-none cursor-pointer"
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
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-bold text-green-600">₹{order.paidAmount?.toLocaleString()}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-bold text-red-500">₹{(order.totalAmount - order.paidAmount).toLocaleString()}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right flex gap-2 justify-end">
                                            <button 
                                                onClick={() => handleViewInvoice(order)}
                                                className="px-3 py-1 bg-gray-50 text-gray-600 rounded text-[10px] font-bold hover:bg-gray-100"
                                            >
                                                INVOICE
                                            </button>
                                            <button 
                                                onClick={() => handleUpdatePayment(order._id)}
                                                className="px-3 py-1 bg-blue-50 text-blue-600 rounded text-[10px] font-bold hover:bg-blue-100"
                                            >
                                                PAYMENT
                                            </button>
                                        </td>

                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )
                )}
            </div>


            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Lead Enquiry">
                <form onSubmit={handleCreateEnquiry} className="space-y-4">
                    <select
                        required className="input-field"
                        value={enqFormData.customerId} onChange={(e) => setEnqFormData({ ...enqFormData, customerId: e.target.value })}
                    >
                        <option value="">Select Existing Customer</option>
                        {customers.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                    </select>
                    <textarea
                        placeholder="Enquiry Details (e.g., 20k Ltr Pond Filtration)" required className="input-field min-h-[100px]"
                        value={enqFormData.details} onChange={(e) => setEnqFormData({ ...enqFormData, details: e.target.value })}
                    />
                    <button type="submit" className="btn-primary w-full py-4 text-white font-bold text-sm tracking-wide">SUBMIT ENQUIRY</button>
                </form>
            </Modal>

            <Modal isOpen={isConvertModalOpen} onClose={() => setIsConvertModalOpen(false)} title="Convert Enquiry to Order">
                <div className="mb-4 p-4 bg-primary-50 rounded-xl">
                    <p className="text-xs font-bold text-primary-600 uppercase italic">Customer</p>
                    <p className="text-sm font-bold text-gray-900">{selectedEnquiry?.customerId?.name}</p>
                    <p className="text-xs text-gray-500 mt-1">{selectedEnquiry?.details}</p>
                </div>
                <form onSubmit={handleConvertSubmit} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase ml-1 italic">Total Project Value</label>
                        <input
                            type="number" placeholder="Enter Total Amount" required className="input-field"
                            value={convertFormData.totalAmount} onChange={(e) => setConvertFormData({ ...convertFormData, totalAmount: e.target.value })}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase ml-1 italic">Advance Paid Amount</label>
                        <input
                            type="number" placeholder="Enter Advance Amount" required className="input-field"
                            value={convertFormData.paidAmount} onChange={(e) => setConvertFormData({ ...convertFormData, paidAmount: e.target.value })}
                        />
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <span className="text-xs font-bold text-gray-500 uppercase italic">Pending Balance</span>
                        <span className="text-lg font-bold text-primary-600">
                            ₹{( (Number(convertFormData.totalAmount) || 0) - (Number(convertFormData.paidAmount) || 0) ).toLocaleString()}
                        </span>
                    </div>

                    <button type="submit" className="btn-primary w-full py-4 text-white font-bold text-sm tracking-wide">GENERATE QUOTATION</button>
                    <p className="text-[10px] text-center text-gray-400 italic">This will move the enquiry to the Orders list with status 'Quotation'</p>
                </form>
            </Modal>
        </div>
    );
};

export default Orders;
