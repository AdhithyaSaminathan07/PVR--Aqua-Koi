import React, { useState, useEffect } from 'react';
import * as api from '../../services/api';
import { Users, UserPlus, Trash2, Edit2, Shield, Search, Filter, Mail, Briefcase, MapPin, CheckCircle2 } from 'lucide-react';
const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({
        name: '', email: '', password: '', role: 'admin', branch: 'Aqua Culture',
        allocatedModules: [],
        employeeId: ''
    });
    const [currentUserRole, setCurrentUserRole] = useState(localStorage.getItem('role'));

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [userRes, empRes] = await Promise.all([api.getUsers(), api.getEmployees()]);
            setUsers(userRes.data);
            setEmployees(empRes.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching data:', err);
            setLoading(false);
        }
    };

    const handleOpenModal = (user = null) => {
        if (user) {
            setEditingUser(user);
            setFormData({ 
                name: user.name, 
                email: user.email, 
                password: '', 
                role: user.role, 
                branch: user.branch,
                allocatedModules: user.allocatedModules || [],
                employeeId: user.employeeId || ''
            });
        } else {
            setEditingUser(null);
            setFormData({ 
                name: '', 
                email: '', 
                password: '', 
                role: 'admin', 
                branch: 'Aqua Culture',
                allocatedModules: [],
                employeeId: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingUser) {
                await api.updateUser(editingUser._id, formData);
            } else {
                await api.createUser(formData);
            }
            setIsModalOpen(false);
            fetchData();
        } catch (err) {
            alert(err.response?.data?.message || 'Error saving user');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;
        try {
            await api.deleteUser(id);
            fetchUsers();
        } catch (err) {
            alert('Error deleting user');
        }
    };

    const filteredUsers = users.filter(user => 
        (user.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
        (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                            <Shield className="text-indigo-600" size={32} />
                            User Control Matrix
                        </h1>
                        <p className="text-gray-500 mt-1">Manage system-wide access for Managers and Employees</p>
                    </div>
                    <button 
                        onClick={() => handleOpenModal()}
                        className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                    >
                        <UserPlus size={20} />
                        Register New Officer
                    </button>
                </div>

                {/* Filters */}
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search by name or email..." 
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-100 placeholder:text-gray-400"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-4">
                        <select className="bg-gray-50 border-none rounded-xl px-4 py-3 text-sm font-medium text-gray-600 focus:ring-2 focus:ring-indigo-100">
                            <option>All Branches</option>
                            <option>Aqua Culture</option>
                            <option>Koi Centre</option>
                        </select>
                        <select className="bg-gray-50 border-none rounded-xl px-4 py-3 text-sm font-medium text-gray-600 focus:ring-2 focus:ring-indigo-100">
                            <option>All Roles</option>
                            <option>Admin</option>
                            <option>Manager</option>
                            <option>Staff</option>
                        </select>
                    </div>
                </div>

                {/* Users Table */}
                <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50">
                            <tr className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">
                                <th className="px-8 py-5">Full Name & Email</th>
                                <th className="px-8 py-5">Assigned Role</th>
                                <th className="px-8 py-5">Branch / Dept</th>
                                <th className="px-8 py-5 text-right">Admin Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="px-8 py-10 text-center text-gray-400 font-medium italic">Scanning network for active officers...</td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-8 py-10 text-center text-gray-400 font-medium italic">No personnel matches your query.</td>
                                </tr>
                            ) : filteredUsers.map((user) => (
                                <tr key={user._id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 font-bold">
                                                {user.name?.[0] || '?'}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 leading-tight">{user.name}</p>
                                                <p className="text-xs text-gray-400 font-medium">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className={`px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                                            user.role === 'MANAGER' ? 'bg-purple-100 text-purple-600' :
                                            user.role === 'admin' ? 'bg-indigo-100 text-indigo-600' :
                                            user.role === 'KOI_MANAGER' ? 'bg-orange-100 text-orange-600' :
                                            'bg-blue-100 text-blue-600'
                                        }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-sm font-medium text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <MapPin size={14} className="text-gray-300" />
                                            {user.branch || 'Aqua Culture'}
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => handleOpenModal(user)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                                                <Edit2 size={18} />
                                            </button>
                                            <button onClick={() => handleDelete(user._id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-10">
                        <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
                            <UserPlus className="text-indigo-600" />
                            {editingUser ? 'Update Officer' : 'Register New Officer'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Display Name</label>
                                <input 
                                    type="text" 
                                    required
                                    className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-100 py-4"
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Email Address</label>
                                <input 
                                    type="email" 
                                    required
                                    className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-100 py-4"
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                />
                            </div>
                            {!editingUser && (
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Password</label>
                                    <input 
                                        type="password" 
                                        required
                                        className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-100 py-4"
                                        value={formData.password}
                                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                                    />
                                </div>
                            )}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">System Role</label>
                                    <select 
                                        className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-100"
                                        value={formData.role}
                                        onChange={(e) => setFormData({...formData, role: e.target.value})}
                                    >
                                        {currentUserRole === 'BOSS' && (
                                            <option value="MANAGER">General Manager (GM)</option>
                                        )}
                                        <option value="admin">Aqua Branch Manager</option>
                                        <option value="KOI_MANAGER">Koi Branch Manager</option>
                                        <option value="BRANCH_MANAGER">Generic Branch Manager</option>
                                        <option value="STAFF">General Staff</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Assigned Branch</label>
                                    <select 
                                        className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-100"
                                        value={formData.branch}
                                        onChange={(e) => setFormData({...formData, branch: e.target.value})}
                                    >
                                        <option value="Aqua Culture">Aqua Culture</option>
                                        <option value="Koi Centre">Koi Centre</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Linked Employee (Required for Staff)</label>
                                <select 
                                    className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-100"
                                    value={formData.employeeId}
                                    onChange={(e) => setFormData({...formData, employeeId: e.target.value})}
                                >
                                    <option value="">Select Employee</option>
                                    {employees.map(emp => (
                                        <option key={emp._id} value={emp._id}>{emp.name} ({emp.designation})</option>
                                    ))}
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Module Allocation</label>
                                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-6 rounded-2xl max-h-48 overflow-y-auto">
                                    <div className="space-y-3">
                                        <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider mb-2">Aqua Culture</p>
                                        {['Dashboard', 'Customers', 'Inventory', 'Complaints', 'Enquiry & Orders', 'Tasks', 'Services', 'Employees', 'Invoices'].map(mod => (
                                            <label key={`aqua-${mod}`} className="flex items-center gap-3 cursor-pointer group">
                                                <input 
                                                    type="checkbox" 
                                                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-100 border-gray-300"
                                                    checked={formData.allocatedModules.includes(`Aqua:${mod}`)}
                                                    onChange={(e) => {
                                                        const modName = `Aqua:${mod}`;
                                                        const newMods = e.target.checked 
                                                            ? [...formData.allocatedModules, modName]
                                                            : formData.allocatedModules.filter(m => m !== modName);
                                                        setFormData({...formData, allocatedModules: newMods});
                                                    }}
                                                />
                                                <span className="text-xs font-medium text-gray-600 group-hover:text-gray-900">{mod}</span>
                                            </label>
                                        ))}
                                    </div>
                                    <div className="space-y-3">
                                        <p className="text-[10px] font-bold text-orange-600 uppercase tracking-wider mb-2">Koi Centre</p>
                                        {['Dashboard', 'Enquiries', 'Orders', 'Invoices', 'Payments', 'Inventory', 'Customers'].map(mod => (
                                            <label key={`koi-${mod}`} className="flex items-center gap-3 cursor-pointer group">
                                                <input 
                                                    type="checkbox" 
                                                    className="w-4 h-4 rounded text-orange-600 focus:ring-orange-100 border-gray-300"
                                                    checked={formData.allocatedModules.includes(`Koi:${mod}`)}
                                                    onChange={(e) => {
                                                        const modName = `Koi:${mod}`;
                                                        const newMods = e.target.checked 
                                                            ? [...formData.allocatedModules, modName]
                                                            : formData.allocatedModules.filter(m => m !== modName);
                                                        setFormData({...formData, allocatedModules: newMods});
                                                    }}
                                                />
                                                <span className="text-xs font-medium text-gray-600 group-hover:text-gray-900">{mod}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 mt-8 pt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-all">Cancel</button>
                                <button type="submit" className="flex-1 px-4 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
                                    {editingUser ? 'Save Changes' : 'Register Officer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;
