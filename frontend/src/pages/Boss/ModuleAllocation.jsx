import React, { useState, useEffect } from 'react';
import * as api from '../../services/api';
import { Shield, Search, Droplets, Fish, Save, Users, ChevronRight, Check } from 'lucide-react';

const ModuleAllocation = () => {
    const [users, setUsers] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [allocatedModules, setAllocatedModules] = useState([]);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchAll();
    }, []);

    const fetchAll = async () => {
        try {
            setLoading(true);
            const [userRes, empRes] = await Promise.all([
                api.getUsers(),
                api.getEmployees('All')
            ]);
            setUsers(userRes.data);
            setEmployees(empRes.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching data:', err);
            setLoading(false);
        }
    };


    const [isUsersExpanded, setIsUsersExpanded] = useState(false);

    const handleSelectUser = (user) => {
        setSelectedUser(user);
        setAllocatedModules(user.allocatedModules || []);
        setIsUsersExpanded(false); // Close dropdown after selection
    };

    const handleToggleModule = (moduleName) => {
        setAllocatedModules(prev =>
            prev.includes(moduleName)
                ? prev.filter(m => m !== moduleName)
                : [...prev, moduleName]
        );
    };

    const handleSave = async () => {
        if (!selectedUser) return;
        try {
            setSaving(true);

            if (selectedUser.isPotentialUser) {
                // Create new user account for this employee
                if (selectedUser.email === 'N/A') {
                    alert('Employee must have an email address to create a user account.');
                    setSaving(false);
                    return;
                }

                await api.createUser({
                    name: selectedUser.name,
                    email: selectedUser.email,
                    password: 'pvr' + Math.floor(1000 + Math.random() * 9000), // Secure random default
                    role: 'STAFF',
                    branch: selectedUser.branch,
                    allocatedModules,
                    employeeId: selectedUser.originalEmployee._id
                });
                alert('System user account created and modules allocated successfully! Default password starts with "pvr"');
                setSelectedUser(null);
            } else {
                // Update existing user
                await api.updateUser(selectedUser._id, {
                    ...selectedUser,
                    allocatedModules
                });
                alert('Module allocation updated successfully!');
            }

            fetchAll();
            setSaving(false);
        } catch (err) {
            alert(err.response?.data?.message || 'Error updating modules');
            setSaving(false);
        }
    };

    // Combine users and employees for the list
    // If an employee has a user account, use the user account (it has permissions)
    // If an employee doesn't have a user account, show them as "Potential User"
    const combinedList = [...users];

    // Add employees who don't have a linked user account
    employees.forEach(emp => {
        const alreadyInList = users.some(u =>
            (u.employeeId?.toString() === emp._id?.toString()) ||
            (u.email?.toLowerCase() === emp.email?.toLowerCase() && emp.email && emp.email !== 'N/A')
        );
        if (!alreadyInList) {
            combinedList.push({
                _id: `emp_${emp._id}`,
                name: emp.name,
                email: emp.email || 'N/A',
                role: 'STAFF',
                branch: emp.branch === 'Koi' ? 'Koi Centre' : 'Aqua Culture',
                allocatedModules: [],
                isPotentialUser: true,
                originalEmployee: emp
            });
        }
    });

    const filteredUsers = combinedList.filter(user =>
        (user.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );

    const aquaModules = ['Dashboard', 'Attendance', 'Employees', 'Customers', 'Inventory', 'Complaints', 'Orders', 'Tasks', 'Services', 'Invoices'];
    const koiModules = ['Dashboard', 'Attendance', 'Employees', 'Enquiries', 'Sales & Billing', 'Payments', 'Inventory', 'Customers', 'Invoices'];

    return (
        <div className="py-6 min-h-screen bg-[#F0F7FF]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                            <Shield className="text-[#2988FF]" size={36} />
                            Module Allocation Matrix
                        </h1>
                        <p className="text-gray-500 mt-2 font-medium">Provision system access and feature sets for regional managers</p>
                    </div>
                    {selectedUser && (
                        <div className="flex items-center gap-4 bg-white px-6 py-3 rounded-2xl shadow-sm border border-blue-100">
                            <div className="w-10 h-10 rounded-full bg-[#2988FF] text-white flex items-center justify-center font-bold">
                                {selectedUser.name?.[0] || '?'}
                            </div>
                            <div>
                                <p className="text-sm font-black text-gray-900">{selectedUser.name}</p>
                                <p className="text-[10px] uppercase font-black text-[#2988FF] tracking-widest">{selectedUser.role} • {selectedUser.branch}</p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="space-y-8">
                    {/* Top: User Selection (Collapsible) */}
                    <div className="bg-white rounded-[2.5rem] p-6 shadow-xl shadow-blue-900/5 border border-gray-100 transition-all duration-500">
                        <div className="flex items-center gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search officers to manage access..."
                                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#2988FF]/20 text-sm font-bold placeholder:text-gray-400"
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        if (!isUsersExpanded) setIsUsersExpanded(true);
                                    }}
                                    onClick={() => setIsUsersExpanded(!isUsersExpanded)}
                                />
                            </div>
                            <button
                                onClick={() => setIsUsersExpanded(!isUsersExpanded)}
                                className={`p-4 rounded-2xl transition-all ${isUsersExpanded ? 'bg-[#2988FF] text-white rotate-180' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                            >
                                <ChevronRight size={24} className="rotate-90" />
                            </button>
                        </div>

                        {/* Collapsible User List */}
                        <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isUsersExpanded ? 'max-h-[500px] mt-6 opacity-100' : 'max-h-0 opacity-0'}`}>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 overflow-y-auto custom-scrollbar pr-2 py-2">
                                {loading ? (
                                    <div className="col-span-full text-center py-10 text-gray-400 font-medium">Scanning network...</div>
                                ) : filteredUsers.length === 0 ? (
                                    <div className="col-span-full text-center py-10 text-gray-400 font-medium">No officers found</div>
                                ) : filteredUsers.map(user => (
                                    <button
                                        key={user._id}
                                        onClick={() => handleSelectUser(user)}
                                        className={`w-full flex items-center gap-4 p-4 rounded-3xl transition-all duration-300 border-2 ${selectedUser?._id === user._id
                                            ? 'bg-[#2988FF] border-[#2988FF] text-white shadow-lg shadow-blue-200 scale-[1.02]'
                                            : 'bg-white border-gray-50 hover:bg-gray-50 text-gray-700'}`}
                                    >
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shrink-0 ${selectedUser?._id === user._id ? 'bg-white/20' : 'bg-[#F0F7FF] text-[#2988FF]'}`}>
                                            {user.name?.[0] || '?'}
                                        </div>
                                        <div className="text-left overflow-hidden flex-1">
                                            <p className={`font-bold truncate text-sm ${selectedUser?._id === user._id ? 'text-white' : 'text-gray-900'}`}>{user.name}</p>
                                            <div className="flex items-center gap-2">
                                                <p className={`text-[9px] uppercase font-black tracking-widest ${selectedUser?._id === user._id ? 'text-white/70' : 'text-gray-400'}`}>{user.role}</p>
                                                <span className="text-[8px] text-gray-300">•</span>
                                                <p className={`text-[9px] font-bold ${selectedUser?._id === user._id ? 'text-white/60' : (user.branch?.includes('Koi') ? 'text-orange-500' : 'text-blue-500')}`}>
                                                    {user.branch?.includes('Koi') ? 'KOI' : 'AQUA'}
                                                </p>
                                            </div>
                                        </div>
                                        <Check size={18} className={`ml-auto shrink-0 ${selectedUser?._id === user._id ? 'text-white' : 'opacity-0'}`} />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Bottom: Module Allocation Area */}
                    <div className="w-full">
                        {selectedUser ? (
                            <div className="bg-white rounded-[2.5rem] shadow-xl shadow-blue-900/5 border border-gray-100 overflow-hidden flex flex-col">
                                <div className="p-8 border-b border-gray-50 bg-gray-50/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                    <div>
                                        <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                                            Manage Access: {selectedUser.name}
                                        </h2>
                                        <p className="text-[#2988FF] text-[10px] font-black uppercase tracking-[0.2em] mt-2 flex items-center gap-2">
                                            <span className="px-3 py-1 bg-blue-50 rounded-lg border border-blue-100">{selectedUser.role}</span>
                                            <span className="text-gray-300">|</span>
                                            <span className="px-3 py-1 bg-gray-100 rounded-lg text-gray-600">{selectedUser.branch}</span>
                                        </p>
                                    </div>
                                    <button
                                        onClick={handleSave}
                                        disabled={saving}
                                        className={`flex items-center gap-3 px-10 py-5 rounded-2xl font-black shadow-xl transition-all active:scale-95 ${saving ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#2988FF] hover:bg-blue-600 text-white shadow-blue-200'}`}
                                    >
                                        {saving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={20} />}
                                        {selectedUser.isPotentialUser ? 'CREATE & SAVE' : 'SAVE PERMISSIONS'}
                                    </button>
                                </div>

                                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-12">
                                    {/* Dynamically order hubs based on user branch */}
                                    {selectedUser.branch === 'Koi Centre' ? (
                                        <>
                                            {/* Koi Centre Block First */}
                                            <div className="space-y-6">
                                                <div className="flex items-center gap-3 pb-4 border-b-2 border-orange-500/10">
                                                    <div className="p-2.5 bg-orange-50 rounded-2xl">
                                                        <Fish className="text-orange-500" size={24} />
                                                    </div>
                                                    <h3 className="text-sm font-black text-orange-500 uppercase tracking-[0.3em]">Koi Centre Hub</h3>
                                                </div>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    {koiModules.map(mod => {
                                                        const modId = `Koi:${mod}`;
                                                        const isChecked = allocatedModules.includes(modId);
                                                        return (
                                                            <label key={modId} className={`group flex items-center justify-between p-5 rounded-3xl cursor-pointer transition-all border-2 ${isChecked ? 'bg-orange-50/50 border-orange-500/20 shadow-sm' : 'bg-gray-50/50 border-transparent hover:bg-gray-100'}`}>
                                                                <div className="flex items-center gap-4">
                                                                    <div className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all ${isChecked ? 'bg-orange-500 text-white' : 'bg-white border-2 border-gray-200'}`}>
                                                                        {isChecked && <Check size={16} strokeWidth={4} />}
                                                                    </div>
                                                                    <span className={`text-[11px] font-black uppercase tracking-wider transition-colors ${isChecked ? 'text-orange-700' : 'text-gray-500'}`}>{mod}</span>
                                                                </div>
                                                                <input
                                                                    type="checkbox"
                                                                    className="hidden"
                                                                    checked={isChecked}
                                                                    onChange={() => handleToggleModule(modId)}
                                                                />
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            {/* Aqua Culture Block Second */}
                                            <div className="space-y-6">
                                                <div className="flex items-center gap-3 pb-4 border-b-2 border-[#2988FF]/10">
                                                    <div className="p-2.5 bg-blue-50 rounded-2xl">
                                                        <Droplets className="text-[#2988FF]" size={24} />
                                                    </div>
                                                    <h3 className="text-sm font-black text-[#2988FF] uppercase tracking-[0.3em]">Aqua Culture Hub</h3>
                                                </div>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    {aquaModules.map(mod => {
                                                        const modId = `Aqua:${mod}`;
                                                        const isChecked = allocatedModules.includes(modId);
                                                        return (
                                                            <label key={modId} className={`group flex items-center justify-between p-5 rounded-3xl cursor-pointer transition-all border-2 ${isChecked ? 'bg-blue-50/50 border-[#2988FF]/20 shadow-sm' : 'bg-gray-50/50 border-transparent hover:bg-gray-100'}`}>
                                                                <div className="flex items-center gap-4">
                                                                    <div className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all ${isChecked ? 'bg-[#2988FF] text-white' : 'bg-white border-2 border-gray-200'}`}>
                                                                        {isChecked && <Check size={16} strokeWidth={4} />}
                                                                    </div>
                                                                    <span className={`text-[11px] font-black uppercase tracking-wider transition-colors ${isChecked ? 'text-[#2988FF]' : 'text-gray-500'}`}>{mod}</span>
                                                                </div>
                                                                <input
                                                                    type="checkbox"
                                                                    className="hidden"
                                                                    checked={isChecked}
                                                                    onChange={() => handleToggleModule(modId)}
                                                                />
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            {/* Aqua Culture Block First (Default) */}
                                            <div className="space-y-6">
                                                <div className="flex items-center gap-3 pb-4 border-b-2 border-[#2988FF]/10">
                                                    <div className="p-2.5 bg-blue-50 rounded-2xl">
                                                        <Droplets className="text-[#2988FF]" size={24} />
                                                    </div>
                                                    <h3 className="text-sm font-black text-[#2988FF] uppercase tracking-[0.3em]">Aqua Culture Hub</h3>
                                                </div>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    {aquaModules.map(mod => {
                                                        const modId = `Aqua:${mod}`;
                                                        const isChecked = allocatedModules.includes(modId);
                                                        return (
                                                            <label key={modId} className={`group flex items-center justify-between p-5 rounded-3xl cursor-pointer transition-all border-2 ${isChecked ? 'bg-blue-50/50 border-[#2988FF]/20 shadow-sm' : 'bg-gray-50/50 border-transparent hover:bg-gray-100'}`}>
                                                                <div className="flex items-center gap-4">
                                                                    <div className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all ${isChecked ? 'bg-[#2988FF] text-white' : 'bg-white border-2 border-gray-200'}`}>
                                                                        {isChecked && <Check size={16} strokeWidth={4} />}
                                                                    </div>
                                                                    <span className={`text-[11px] font-black uppercase tracking-wider transition-colors ${isChecked ? 'text-[#2988FF]' : 'text-gray-500'}`}>{mod}</span>
                                                                </div>
                                                                <input
                                                                    type="checkbox"
                                                                    className="hidden"
                                                                    checked={isChecked}
                                                                    onChange={() => handleToggleModule(modId)}
                                                                />
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            {/* Koi Centre Block Second */}
                                            <div className="space-y-6">
                                                <div className="flex items-center gap-3 pb-4 border-b-2 border-orange-500/10">
                                                    <div className="p-2.5 bg-orange-50 rounded-2xl">
                                                        <Fish className="text-orange-500" size={24} />
                                                    </div>
                                                    <h3 className="text-sm font-black text-orange-500 uppercase tracking-[0.3em]">Koi Centre Hub</h3>
                                                </div>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    {koiModules.map(mod => {
                                                        const modId = `Koi:${mod}`;
                                                        const isChecked = allocatedModules.includes(modId);
                                                        return (
                                                            <label key={modId} className={`group flex items-center justify-between p-5 rounded-3xl cursor-pointer transition-all border-2 ${isChecked ? 'bg-orange-50/50 border-orange-500/20 shadow-sm' : 'bg-gray-50/50 border-transparent hover:bg-gray-100'}`}>
                                                                <div className="flex items-center gap-4">
                                                                    <div className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all ${isChecked ? 'bg-orange-500 text-white' : 'bg-white border-2 border-gray-200'}`}>
                                                                        {isChecked && <Check size={16} strokeWidth={4} />}
                                                                    </div>
                                                                    <span className={`text-[11px] font-black uppercase tracking-wider transition-colors ${isChecked ? 'text-orange-700' : 'text-gray-500'}`}>{mod}</span>
                                                                </div>
                                                                <input
                                                                    type="checkbox"
                                                                    className="hidden"
                                                                    checked={isChecked}
                                                                    onChange={() => handleToggleModule(modId)}
                                                                />
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="min-h-[400px] bg-white rounded-[2.5rem] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center p-12 text-center text-gray-400">
                                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                                    <Shield size={48} className="text-gray-200" />
                                </div>
                                <h3 className="text-2xl font-black text-gray-400 uppercase tracking-widest">Awaiting Selection</h3>
                                <p className="max-w-xs mt-4 font-medium leading-relaxed">Search and select an officer from the dropdown above to begin managing their system access levels.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ModuleAllocation;
