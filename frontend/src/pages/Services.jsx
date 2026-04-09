import React, { useState, useEffect } from 'react';
import {
    Wrench,
    Calendar,
    Clock,
    Map,
    RefreshCcw,
    Sparkles,
    MapPin,
    Loader2,
    Bell
} from 'lucide-react';
import { getServices, createService, getCustomers, getNearbyServices, updateLifecycle } from '../services/api';
import Modal from '../components/Modal';

const Services = () => {
    const [services, setServices] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [nearbyClients, setNearbyClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [formData, setFormData] = useState({
        customerId: '',
        serviceType: '',
        description: '',
        scheduledDate: '',
        installationDate: ''
    });

    useEffect(() => {
        fetchData();
        loadNearby('13.0827', '80.2707'); // Chennai coordinates as default for demo
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [serRes, custRes] = await Promise.all([getServices(), getCustomers()]);
            setServices(serRes.data);
            setCustomers(custRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const loadNearby = async (lat, lng) => {
        try {
            const res = await getNearbyServices(lat, lng);
            setNearbyClients(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createService(formData);
            setIsModalOpen(false);
            setFormData({ customerId: '', serviceType: '', description: '', scheduledDate: '', installationDate: '' });
            fetchData();
        } catch (err) {
            alert('Error scheduling service');
        }
    };

    const handleUpdateLifecycle = async (serviceId, componentName) => {

        const date = new Date().toISOString().split('T')[0];
        try {
            await updateLifecycle(serviceId, { componentName, lastReplacementDate: date });
            fetchData();
        } catch (err) {
            alert('Error updating lifecycle');
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 font-display">Service & Maintenance</h1>
                    <p className="text-gray-500 mt-1">Automated reminders and location-based planning.</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 border border-blue-200 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 font-bold transition-all text-sm uppercase tracking-wider">
                        <Map size={18} />
                        <span>Map View</span>
                    </button>
                    <button onClick={() => setIsModalOpen(true)} className="btn-primary">
                        <Sparkles size={18} />
                        <span>Schedule New Service</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="card border-none bg-gradient-to-br from-gray-900 to-gray-800 text-white shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-10"><Bell size={120} /></div>
                        <div className="relative z-10">
                            <h3 className="text-xl font-bold font-display italic">Route Planning (Nearby Chennai)</h3>
                            <div className="mt-8 space-y-4">
                                {nearbyClients.slice(0, 3).map((nc, idx) => (
                                    <div key={idx} className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10">
                                        <div className="p-3 bg-blue-500/20 text-blue-400 rounded-xl"><MapPin size={20} /></div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-sm tracking-wide">{nc.name}</h4>
                                            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mt-0.5">{nc.distance}km away • Last: {nc.lastServiceDate ? new Date(nc.lastServiceDate).toLocaleDateString() : 'Never'}</p>
                                        </div>
                                        <button className="px-4 py-2 bg-white text-gray-900 rounded-xl text-[10px] font-black hover:scale-105 transition-transform uppercase">Add to Route</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-gray-900 font-display">Upcoming Visits</h3>
                        {loading ? (
                            <div className="flex justify-center py-10"><Loader2 className="animate-spin text-primary-500" size={32} /></div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {services.map((s, i) => (
                                    <div key={i} className="card hover:shadow-md transition-all border-t-4 border-t-aqua-500 p-5">
                                        <div className="flex justify-between items-start mb-4">
                                            <span className="px-2 py-0.5 bg-gray-100 text-gray-400 rounded text-[10px] font-bold uppercase">Scheduled</span>
                                            <span className="text-xs font-bold text-aqua-600 flex items-center gap-1">
                                                <Clock size={12} /> {new Date(s.scheduledDate).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <h4 className="font-bold text-gray-900 text-lg tracking-tight">{s.customerId?.name}</h4>
                                        <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase tracking-widest">{s.serviceType}</p>
                                        <div className="mt-6 pt-4 border-t border-gray-50 flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 truncate">
                                                <MapPin size={12} /> {s.customerId?.address}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {services.length === 0 && <p className="col-span-2 text-center py-12 text-gray-400 italic font-medium">No scheduled services found.</p>}
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="card">
                        <h3 className="text-lg font-bold text-gray-900 font-display mb-6">Component Lifecycle</h3>
                        <div className="space-y-6">
                            {(services[0]?.componentLifecycles?.length > 0 ? services[0].componentLifecycles : [
                                { componentName: 'UV Light Bulbs', nextReplacementDate: new Date(Date.now() + 15*24*60*60*1000) },
                                { componentName: 'Filtration Mesh', nextReplacementDate: new Date(Date.now() + 45*24*60*60*1000) },
                                { componentName: 'Pump Seals', nextReplacementDate: new Date(Date.now() + 120*24*60*60*1000) },
                            ]).map((comp, i) => {
                                const daysLeft = Math.ceil((new Date(comp.nextReplacementDate) - new Date()) / (1000 * 60 * 60 * 24));
                                const usage = Math.max(0, Math.min(100, 100 - (daysLeft / 3.65))); // 1 year = 365 days
                                return (
                                    <div key={i} className="space-y-2">
                                        <div className="flex justify-between items-end">
                                            <div>
                                                <p className="text-sm font-bold text-gray-900">{comp.componentName}</p>
                                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">{daysLeft} days until replacement</p>
                                            </div>
                                            <button 
                                                onClick={() => handleUpdateLifecycle(services[0]?._id, comp.componentName)}
                                                className="text-[9px] font-black text-primary-600 hover:underline uppercase"
                                            >
                                                RESET
                                            </button>
                                        </div>
                                        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                            <div className={`h-full ${usage > 80 ? 'bg-red-500' : 'bg-aqua-500'} rounded-full`} style={{ width: `${usage}%` }}></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>


            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Schedule Service">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <select
                        required className="input-field"
                        value={formData.customerId} onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                    >
                        <option value="">Select Customer</option>
                        {customers.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                    </select>
                    <input
                        type="text" placeholder="Service Type (e.g., UV Replacement)" required className="input-field"
                        value={formData.serviceType} onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                    />
                    <input
                        type="date" required className="input-field"
                        value={formData.scheduledDate} onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                    />
                    <textarea
                        placeholder="Additional Description..." className="input-field min-h-[100px]"
                        value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                    <button type="submit" className="btn-primary w-full py-3 mt-4 text-white font-bold">SCHEDULE SERVICE</button>
                </form>
            </Modal>
        </div>
    );
};

export default Services;
