import React, { useState, useEffect } from 'react';
import { 
    LayoutDashboard, 
    Users, 
    Wrench, 
    ClipboardList, 
    LogOut, 
    MapPin, 
    TrendingUp, 
    AlertCircle, 
    ArrowRight, 
    Navigation, 
    Clock, 
    CheckCircle2, 
    Calendar,
    Search,
    Plus,
    Play,
    StopCircle,
    Map as MapIcon,
    Bell
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- MOCK DATA ---
const MOCK_CUSTOMERS = [
    { id: 1, name: 'Crystal Clear Ponds', location: 'Chennai North', address: '123 Beach Rd', lastService: '2026-03-20', nextService: '2026-04-12', lat: 13.0827, lng: 80.2707 },
    { id: 2, name: 'Deep Blue Aqua', location: 'Oasis Area', address: '45 Lake View', lastService: '2026-03-25', nextService: '2026-04-05', lat: 13.0600, lng: 80.2300 },
    { id: 3, name: 'Zen Koi Haven', location: 'Heritage Colony', address: '88 Temple St', lastService: '2026-02-15', nextService: '2026-05-15', lat: 13.0400, lng: 80.2500 },
    { id: 4, name: 'Aqua Tech Solutions', location: 'Tech Park', address: 'B4 Cyber City', lastService: '2026-03-10', nextService: '2026-04-18', lat: 13.1000, lng: 80.2000 },
    { id: 5, name: 'Grand Pond Resorts', location: 'Coastal Marina', address: 'S1 Marina Dr', lastService: '2026-04-01', nextService: '2026-04-10', lat: 13.0500, lng: 80.2800 },
];

const MOCK_TASKS = [
    { id: 101, customer: 'Crystal Clear Ponds', type: 'UV Replacement', status: 'Pending', staff: 'Arun', priority: 'High' },
    { id: 102, customer: 'Deep Blue Aqua', type: 'Annual Maintenance', status: 'Completed', staff: 'Malik', priority: 'Medium' },
    { id: 103, customer: 'Aqua Tech Solutions', type: 'Leakage Repair', status: 'Pending', staff: 'Suresh', priority: 'Urgent' },
];

const AquaDemo = () => {
    const [activeTab, setActiveTab] = useState('Dashboard');
    const [tasks, setTasks] = useState(MOCK_TASKS);
    const [customers, setCustomers] = useState(MOCK_CUSTOMERS);
    const [attendance, setAttendance] = useState({ isWorking: false, startTime: null, location: 'Fetching...' });
    const [currentTime, setCurrentTime] = useState(new Date());
    const [smartSuggestions, setSmartSuggestions] = useState([]);
    const [currentTask, setCurrentTask] = useState(null);

    // Update time
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Smart Routing Logic
    const calculateSmartRouting = (referenceDate = new Date()) => {
        const ref = new Date(referenceDate);
        const suggestionRange = 10; // days before/after

        const filtered = customers.filter(c => {
            const nextDate = new Date(c.nextService);
            const diffTime = nextDate - ref;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return Math.abs(diffDays) <= suggestionRange;
        }).map(c => {
            const nextDate = new Date(c.nextService);
            const diffDays = Math.ceil((nextDate - ref) / (1000 * 60 * 60 * 24));
            
            let status = 'Planned';
            if (diffDays < 0) status = 'Overdue';
            else if (diffDays <= 3) status = 'Upcoming';

            return {
                ...c,
                distance: (Math.random() * 5 + 1).toFixed(1), // Mock distance
                dueDays: diffDays,
                displayStatus: status
            };
        });

        setSmartSuggestions(filtered);
    };

    const handleTaskAction = (task, newStatus) => {
        const updated = tasks.map(t => t.id === task.id ? { ...t, status: newStatus } : t);
        setTasks(updated);
        
        if (newStatus === 'Travelling') {
            setCurrentTask(task);
            calculateSmartRouting();
        } else if (newStatus === 'Completed') {
            setCurrentTask(null);
            setSmartSuggestions([]);
        }
    };

    const toggleAttendance = () => {
        if (!attendance.isWorking) {
            setAttendance({
                isWorking: true,
                startTime: new Date().toLocaleTimeString(),
                location: 'Main Office Gate'
            });
        } else {
            setAttendance({ isWorking: false, startTime: null, location: 'Logged Out' });
        }
    };

    // --- SUB-COMPONENTS ---

    const SidebarItem = ({ name, icon: Icon }) => (
        <button 
            onClick={() => setActiveTab(name)}
            className={`w-full flex items-center gap-4 px-6 py-4 transition-all duration-300 ${activeTab === name ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
        >
            <Icon size={20} />
            <span className="font-semibold text-sm tracking-wide">{name}</span>
            {activeTab === name && <motion.div layoutId="activePill" className="ml-auto w-1 h-6 bg-white rounded-full" />}
        </button>
    );

    const DashboardView = () => (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col gap-2">
                    <div className="p-3 bg-indigo-50 text-indigo-600 w-fit rounded-2xl"><Users size={20} /></div>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-2">Customers</p>
                    <p className="text-3xl font-black text-slate-800">{customers.length}</p>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col gap-2">
                    <div className="p-3 bg-emerald-50 text-emerald-600 w-fit rounded-2xl"><CheckCircle2 size={20} /></div>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-2">Completed</p>
                    <p className="text-3xl font-black text-slate-800">12</p>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col gap-2 text-rose-600">
                    <div className="p-3 bg-rose-50 text-rose-600 w-fit rounded-2xl"><AlertCircle size={20} /></div>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">Low Stock</p>
                    <p className="text-3xl font-black">4</p>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col gap-2">
                    <div className="p-3 bg-amber-50 text-amber-600 w-fit rounded-2xl"><ClipboardList size={20} /></div>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-2">Pending</p>
                    <p className="text-3xl font-black text-slate-800">{tasks.filter(t => t.status !== 'Completed').length}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-indigo-600 p-8 rounded-[40px] text-white shadow-2xl shadow-indigo-200 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-12 opacity-10"><Navigation size={120} /></div>
                        <div className="relative z-10">
                            <h2 className="text-2xl font-bold font-display italic tracking-tight">Active Operation</h2>
                            <p className="mt-2 text-indigo-100 opacity-80">Track employee movement and efficiency.</p>
                            <div className="mt-8 flex gap-4">
                                <div className="p-4 bg-white/10 rounded-3xl backdrop-blur-md flex-1 text-center">
                                    <p className="text-2xl font-black">4</p>
                                    <p className="text-[10px] uppercase font-bold text-white/60">Staff On Field</p>
                                </div>
                                <div className="p-4 bg-white/10 rounded-3xl backdrop-blur-md flex-1 text-center">
                                    <p className="text-2xl font-black text-emerald-300">85%</p>
                                    <p className="text-[10px] uppercase font-bold text-white/60">Success Rate</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
                     <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <TrendingUp className="text-indigo-600" size={18} />
                        Efficiency Index
                     </h3>
                     <div className="space-y-6">
                        {[
                            { name: 'Service Speed', value: 92, color: 'bg-emerald-500' },
                            { name: 'Route Optim.', value: 74, color: 'bg-indigo-500' },
                            { name: 'Client Satisf.', value: 81, color: 'bg-amber-500' },
                        ].map((stat, i) => (
                            <div key={i} className="space-y-2">
                                <div className="flex justify-between text-xs font-bold uppercase text-slate-500 tracking-wider">
                                    <span>{stat.name}</span>
                                    <span>{stat.value}%</span>
                                </div>
                                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${stat.value}%` }}
                                        transition={{ duration: 1.5, delay: i * 0.2 }}
                                        className={`h-full ${stat.color}`} 
                                    />
                                </div>
                            </div>
                        ))}
                     </div>
                </div>
            </div>
        </div>
    );

    const CustomersView = () => (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-black text-slate-800 italic">Global Customers</h2>
                <button className="bg-indigo-600 text-white px-6 py-2 rounded-2xl hover:bg-indigo-700 transition flex items-center gap-2 font-bold text-sm">
                    <Plus size={18} />
                    ADD CUSTOMER
                </button>
            </div>
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-100">
                            <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Client Name</th>
                            <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Location</th>
                            <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Next Service</th>
                            <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {customers.map(c => (
                            <tr key={c.id} className="hover:bg-slate-50 transition">
                                <td className="px-8 py-6">
                                    <p className="font-bold text-slate-800">{c.name}</p>
                                    <p className="text-xs text-slate-400">{c.address}</p>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                        <MapPin size={14} className="text-indigo-400" />
                                        {c.location}
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                                        <Calendar size={14} className="text-slate-400" />
                                        {new Date(c.nextService).toLocaleDateString()}
                                    </div>
                                </td>
                                <td className="px-8 py-6 text-right">
                                    <button className="text-indigo-600 hover:text-indigo-800 transition"><ArrowRight size={18} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const TasksView = () => (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black text-slate-800 italic">Operations Console</h2>
                <p className="text-sm text-slate-400 italic">Managing {tasks.length} active work orders.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Task Queue</h3>
                    {tasks.map(t => (
                        <div key={t.id} className={`p-6 bg-white rounded-[32px] border transition shadow-sm ${currentTask?.id === t.id ? 'border-indigo-600 ring-4 ring-indigo-50' : 'border-slate-100 hover:border-slate-200'}`}>
                            <div className="flex justify-between items-start">
                                <div>
                                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter ${t.priority === 'Urgent' ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-500'}`}>
                                        {t.priority} priority
                                    </span>
                                    <h4 className="mt-3 text-lg font-bold text-slate-800">{t.customer}</h4>
                                    <p className="text-sm text-slate-400 font-medium tracking-tight italic">{t.type}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black uppercase text-slate-300">Status</p>
                                    <p className={`text-xs font-bold py-1 ${t.status === 'Completed' ? 'text-emerald-500' : 'text-amber-500'}`}>{t.status}</p>
                                </div>
                            </div>
                            
                            <div className="mt-8 flex gap-3">
                                {t.status === 'Pending' && (
                                    <button 
                                        onClick={() => handleTaskAction(t, 'Travelling')}
                                        className="flex-1 bg-indigo-600 text-white py-3 rounded-2xl text-[11px] font-black tracking-widest hover:bg-indigo-700 active:scale-95 transition flex items-center justify-center gap-2"
                                    >
                                        <Navigation size={14} /> START TRAVELLING
                                    </button>
                                )}
                                {t.status === 'Travelling' && (
                                    <button 
                                        onClick={() => handleTaskAction(t, 'Arrived')}
                                        className="flex-1 bg-amber-500 text-white py-3 rounded-2xl text-[11px] font-black tracking-widest hover:bg-amber-600 active:scale-95 transition flex items-center justify-center gap-2"
                                    >
                                        <MapIcon size={14} /> ARRIVED AT SITE
                                    </button>
                                )}
                                {t.status === 'Arrived' && (
                                    <button 
                                        onClick={() => handleTaskAction(t, 'Completed')}
                                        className="flex-1 bg-emerald-500 text-white py-3 rounded-2xl text-[11px] font-black tracking-widest hover:bg-emerald-600 active:scale-95 transition flex items-center justify-center gap-2"
                                    >
                                        <CheckCircle2 size={14} /> COMPLETE WORK
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="relative">
                    <AnimatePresence mode="wait">
                        {currentTask && smartSuggestions.length > 0 ? (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="sticky top-0 bg-slate-900 rounded-[40px] p-8 text-white shadow-2xl overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-8 opacity-5 ring-offset-indigo-500 border-4 border-white/10 rounded-full scale-150"><TrendingUp size={100} /></div>
                                <div className="relative z-10">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-indigo-500 rounded-xl animate-pulse"><Navigation size={18} /></div>
                                        <h3 className="text-xl font-black italic tracking-tight">Smart Routing Suggestions</h3>
                                    </div>
                                    <p className="mt-2 text-slate-400 text-xs font-medium italic">While you travel to {currentTask.customer}, consider these nearby clients with upcoming service needs:</p>
                                    
                                    <div className="mt-8 space-y-4">
                                        {smartSuggestions.map((nc, idx) => (
                                            <div key={idx} className="p-5 bg-white/10 rounded-3xl border border-white/10 hover:bg-white/15 transition group">
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <h4 className="font-bold text-sm tracking-wide">{nc.name}</h4>
                                                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-tighter mt-1">
                                                            {nc.distance}km away • Due in {nc.dueDays} days
                                                        </p>
                                                    </div>
                                                    <div className={`px-2 py-1 rounded-md text-[9px] font-black uppercase ${nc.displayStatus === 'Overdue' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'}`}>
                                                        {nc.displayStatus}
                                                    </div>
                                                </div>
                                                <button className="mt-4 w-full py-2 bg-indigo-500/80 rounded-xl text-[9px] font-black tracking-widest opacity-0 group-hover:opacity-100 transition-all uppercase">Add to My Route</button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-center p-12 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[40px]">
                                <Navigation size={40} className="text-slate-200" />
                                <h3 className="mt-4 font-bold text-slate-400">Start travelling on a task to see smart suggestions.</h3>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );

    const AttendanceView = () => (
        <div className="max-w-md mx-auto space-y-8 py-12">
            <div className="text-center space-y-2">
                <h1 className="text-4xl font-black tracking-tight text-slate-800 tabular-nums">
                    {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </h1>
                <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em]">{currentTime.toDateString()}</p>
            </div>

            <div className={`p-8 rounded-[48px] shadow-2xl transition-all duration-500 ${attendance.isWorking ? 'bg-emerald-600 shadow-emerald-100' : 'bg-white border border-slate-100 shadow-slate-100'}`}>
                <div className="flex flex-col items-center gap-8">
                    <div className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${attendance.isWorking ? 'bg-white/20 text-white scale-110' : 'bg-slate-50 text-indigo-600'}`}>
                        <Clock size={48} />
                    </div>
                    
                    <div className="text-center">
                        <h3 className={`text-2xl font-black italic tracking-tight ${attendance.isWorking ? 'text-white' : 'text-slate-800'}`}>
                            {attendance.isWorking ? 'On Duty' : 'Ready to Start?'}
                        </h3>
                        <div className="mt-4 flex flex-col gap-2">
                            <div className={`flex items-center justify-center gap-2 text-xs font-bold ${attendance.isWorking ? 'text-white/80' : 'text-slate-400'}`}>
                                <MapPin size={14} />
                                {attendance.location}
                            </div>
                            {attendance.isWorking && (
                                <div className="text-white/70 text-[10px] uppercase font-black tracking-widest animate-pulse">
                                    Started at {attendance.startTime}
                                </div>
                            )}
                        </div>
                    </div>

                    <button 
                        onClick={toggleAttendance}
                        className={`w-full py-4 rounded-3xl text-sm font-black tracking-[0.2em] transition-all active:scale-95 shadow-lg ${attendance.isWorking ? 'bg-white text-emerald-600 hover:bg-slate-50' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200'}`}
                    >
                        {attendance.isWorking ? (
                            <div className="flex items-center justify-center gap-2"><StopCircle size={20} /> END WORK</div>
                        ) : (
                            <div className="flex items-center justify-center gap-2"><Play size={20} /> START WORK</div>
                        )}
                    </button>
                </div>
            </div>
            
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-4">
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Log History (Demo)</h4>
                <div className="space-y-3">
                    <div className="flex justify-between text-xs font-bold text-slate-500">
                        <span>Yesterday</span>
                        <span>09:00 AM - 06:15 PM</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold text-slate-500">
                        <span>April 07</span>
                        <span>08:55 AM - 06:00 PM</span>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="flex min-h-screen bg-slate-50 font-sans selection:bg-indigo-100">
            {/* Sidebar */}
            <aside className="w-80 bg-slate-900 overflow-hidden flex flex-col fixed h-full z-30">
                <div className="p-8 pb-12">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-xl shadow-indigo-900/40">
                            <Navigation size={22} className="rotate-45" />
                        </div>
                        <div>
                            <h1 className="text-xl font-black text-white italic tracking-tighter uppercase">Aqua<span className="text-indigo-500">Culture</span></h1>
                            <p className="text-[9px] text-slate-500 font-bold tracking-widest uppercase">Admin Operations v2.0</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 space-y-2">
                    <SidebarItem name="Dashboard" icon={LayoutDashboard} />
                    <SidebarItem name="Customers" icon={Users} />
                    <SidebarItem name="Tasks" icon={ClipboardList} />
                    <SidebarItem name="Attendance" icon={Clock} />
                </nav>

                <div className="p-8 border-t border-slate-800">
                    <div className="bg-slate-800/50 p-4 rounded-3xl flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center font-black text-white">A</div>
                        <div>
                            <p className="text-xs font-bold text-white tracking-wide">Arun Kumar</p>
                            <p className="text-[10px] font-bold text-slate-500 uppercase">Manager</p>
                        </div>
                    </div>
                    <button className="flex items-center gap-3 text-slate-400 hover:text-rose-400 transition font-bold text-xs uppercase tracking-widest pl-2">
                        <LogOut size={16} />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-80 overflow-y-auto min-h-screen">
                <header className="px-12 py-8 flex items-center justify-between sticky top-0 z-20 bg-slate-50/80 backdrop-blur-xl">
                    <div className="relative group flex-1 max-w-xl">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={18} />
                        <input 
                            type="text" 
                            placeholder="Find records, clients or tasks..."
                            className="w-full bg-white border border-slate-100 rounded-2xl py-3 pl-14 pr-6 text-sm font-medium focus:ring-4 focus:ring-indigo-50 focus:border-indigo-200 outline-none transition-all"
                        />
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="relative cursor-pointer hover:scale-110 transition active:scale-95">
                            <Bell className="text-slate-400" size={24} />
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center ring-2 ring-slate-50">3</span>
                        </div>
                        <div className="h-10 w-[1px] bg-slate-200" />
                        <div className="text-right flex flex-col">
                            <span className="text-xs font-black text-slate-800 uppercase tracking-tighter">Current Locale</span>
                            <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">Chennai, India</span>
                        </div>
                    </div>
                </header>

                <div className="px-12 pb-12">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.4, ease: "circOut" }}
                        >
                            {activeTab === 'Dashboard' && <DashboardView />}
                            {activeTab === 'Customers' && <CustomersView />}
                            {activeTab === 'Tasks' && <TasksView />}
                            {activeTab === 'Attendance' && <AttendanceView />}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
};

export default AquaDemo;
