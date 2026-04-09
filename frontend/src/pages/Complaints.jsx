import React, { useState, useEffect } from 'react';
import {
    MessageSquare,
    Plus,
    Search,
    Filter,
    ChevronRight,
    Clock,
    CheckCircle2,
    AlertCircle,
    Loader2
} from 'lucide-react';
import { getComplaints, createComplaint, updateComplaintStatus, getCustomers } from '../services/api';
import Modal from '../components/Modal';

const Complaints = () => {
    const [complaints, setComplaints] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ customerId: '', description: '' });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [compRes, custRes] = await Promise.all([getComplaints(), getCustomers()]);
            setComplaints(compRes.data);
            setCustomers(custRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createComplaint(formData);
            setIsModalOpen(false);
            setFormData({ customerId: '', description: '' });
            fetchData();
        } catch (err) {
            alert('Error creating complaint');
        }
    };

    const handleStatusChange = async (id, status) => {
        try {
            await updateComplaintStatus(id, status);
            fetchData();
        } catch (err) {
            alert('Error updating status');
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Open': return 'bg-orange-100 text-orange-700';
            case 'In Progress': return 'bg-blue-100 text-blue-700';
            case 'Resolved': return 'bg-green-100 text-green-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 font-display">Complaint Box</h1>
                    <p className="text-gray-500 mt-1">Track and resolve customer issues effectively.</p>
                </div>
                <button onClick={() => setIsModalOpen(true)} className="btn-primary">
                    <Plus size={18} />
                    <span>Log Complaint</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card text-center">
                    <p className="text-sm text-gray-500 font-medium">Under Resolution</p>
                    <p className="text-3xl font-bold mt-2 text-blue-600">
                        {complaints.filter(c => c.status === 'In Progress').length + complaints.filter(c => c.status === 'Open').length}
                    </p>
                </div>
                <div className="card text-center">
                    <p className="text-sm text-gray-500 font-medium">Total Resolved</p>
                    <p className="text-3xl font-bold mt-2 text-green-600">
                        {complaints.filter(c => c.status === 'Resolved').length}
                    </p>
                </div>
                <div className="card text-center">
                    <p className="text-sm text-gray-500 font-medium">New Today</p>
                    <p className="text-3xl font-bold mt-2 text-orange-600">
                        {complaints.filter(c => new Date(c.createdAt).toLocaleDateString() === new Date().toLocaleDateString()).length}
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm min-h-[400px]">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-64 gap-3">
                        <Loader2 className="animate-spin text-primary-500" size={32} />
                        <p className="text-gray-400 font-medium italic">Loading complaints...</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-50">
                        {complaints.map((complaint) => (
                            <div key={complaint._id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className={`p-2 rounded-lg ${getStatusStyle(complaint.status)}`}>
                                        {complaint.status === 'Resolved' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900">{complaint.description}</h4>
                                        <p className="text-sm text-gray-500">{complaint.customerId?.name || 'Unknown'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <select
                                        value={complaint.status}
                                        onChange={(e) => handleStatusChange(complaint._id, e.target.value)}
                                        className={`px-3 py-1 rounded-full text-[10px] uppercase font-bold outline-none border-none cursor-pointer ${getStatusStyle(complaint.status)}`}
                                    >
                                        <option value="Open">Open</option>
                                        <option value="In Progress">In Progress</option>
                                        <option value="Resolved">Resolved</option>
                                    </select>
                                </div>
                            </div>
                        ))}
                        {complaints.length === 0 && <p className="text-center py-12 text-gray-400 italic">No complaints logged.</p>}
                    </div>
                )}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Log New Complaint">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <select
                        required className="input-field"
                        value={formData.customerId} onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                    >
                        <option value="">Select Customer</option>
                        {customers.map(c => <option key={c._id} value={c._id}>{c.name} ({c.phone})</option>)}
                    </select>
                    <textarea
                        placeholder="Describe the issue..." required className="input-field min-h-[120px]"
                        value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                    <button type="submit" className="btn-primary w-full py-3 mt-4 text-white font-bold">Log Complaint</button>
                </form>
            </Modal>
        </div>
    );
};

export default Complaints;
