import React, { useState, useEffect } from 'react';
import * as api from '../../services/api';
import { Users, UserPlus, Trash2, Edit2, Shield, Search, Filter, Mail, Briefcase, MapPin, CheckCircle2, X, Fingerprint, Camera, RefreshCw, Settings2 } from 'lucide-react';
import FaceEnrollment from '../../components/Attendance/FaceEnrollment';
import RoleManagementModal from '../../components/Boss/RoleManagementModal';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({
        name: '', email: '', password: '', role: 'admin', branch: 'Aqua Culture',
        allocatedModules: [],
        employeeId: ''
    });
    const [rfid, setRfid] = useState('');
    const [faceEncodings, setFaceEncodings] = useState([]);
    const [isFaceModalOpen, setIsFaceModalOpen] = useState(false);
    const [selectedBranch, setSelectedBranch] = useState('All Branches');
    const [selectedRole, setSelectedRole] = useState('All Roles');
    const [currentUserRole, setCurrentUserRole] = useState(localStorage.getItem('role'));


    const handleRoleChange = (newRoleKey) => {
        const role = roles.find(r => r.key === newRoleKey);
        const autoModules = role ? role.modules : [];
        let newBranch = formData.branch;

        if (newRoleKey === 'KOI_MANAGER') {
            newBranch = 'Koi Centre';
        } else if (newRoleKey === 'admin') {
            newBranch = 'Aqua Culture';
        }

        setFormData({
            ...formData,
            role: newRoleKey,
            branch: newBranch,
            allocatedModules: autoModules
        });
    };

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [userRes, empRes, roleRes] = await Promise.all([
                api.getUsers(),
                api.getEmployees(),
                api.getRoles()
            ]);
            setUsers(userRes.data);
            setEmployees(empRes.data);
            setRoles(roleRes.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching data:', err);
            setLoading(false);
        }
    };

    const handleOpenModal = (user = null) => {
        if (user) {
            setEditingUser(user);
            // Fetch linked employee if exists to get RFID and Phone
            const linkedEmp = employees.find(e => e._id === user.employeeId);

            setFormData({
                name: user.name,
                email: user.email,
                password: '',
                role: user.role,
                branch: user.branch,
                allocatedModules: user.allocatedModules || [],
                employeeId: user.employeeId || ''
            });

            setRfid(linkedEmp?.rfid || '');
            setFaceEncodings(linkedEmp?.faceEncodings || []);
        } else {
            setEditingUser(null);
            // Use the first role as default if available, otherwise 'admin'
            const defaultRole = roles.length > 0 ? roles[0].key : 'admin';
            setFormData({
                name: '', email: '', password: '', role: defaultRole, branch: 'Aqua Culture',
                allocatedModules: roles.length > 0 ? roles[0].modules : [],
                employeeId: ''
            });
            const prefixes = ['ZO', 'ON', 'TO', 'RE', 'AL', 'PX', 'KV', 'TR'];
            const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
            const autoRfid = `${randomPrefix}${Math.floor(1000 + Math.random() * 9000)}`;
            setRfid(autoRfid);
            setFaceEncodings([]);
        }
        setIsModalOpen(true);
    };

    const handleGenerateRFID = () => {
        const prefixes = ['ZO', 'ON', 'TO', 'RE', 'AL', 'PX', 'KV', 'TR'];
        const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        const newRfid = `${randomPrefix}${Math.floor(1000 + Math.random() * 9000)}`;
        setRfid(newRfid);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let targetEmployeeId = formData.employeeId;

            // Prepare employee data
            const empData = {
                name: formData.name,
                designation: formData.role,
                branch: formData.branch === 'Koi Centre' ? 'Koi' : 'Aqua',
                rfid,
                faceEncodings
            };

            // 1. Create or Update Employee
            if (!targetEmployeeId) {
                const empRes = await api.createEmployee(empData);
                targetEmployeeId = empRes.data._id;
            } else {
                await api.updateEmployee(targetEmployeeId, empData);
            }

            const submissionData = { ...formData, employeeId: targetEmployeeId };

            if (editingUser) {
                await api.updateUser(editingUser._id, submissionData);
            } else {
                await api.createUser(submissionData);
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
            fetchData();
        } catch (err) {
            alert('Error deleting user');
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = (user.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase());
        const matchesBranch = selectedBranch === 'All Branches' || user.branch === selectedBranch;
        const matchesRole = selectedRole === 'All Roles' || user.role === selectedRole;

        return matchesSearch && matchesBranch && matchesRole;
    });

    return (
        <div className="py-4 sm:py-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8 lg:mb-10">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
                            <Shield className="text-indigo-600" size={32} />
                            User Control Matrix
                        </h1>
                        <p className="text-gray-500 mt-1 text-sm sm:text-base">Manage system-wide access for Managers and Employees</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                        <button
                            onClick={() => setIsRoleModalOpen(true)}
                            className="bg-white text-indigo-600 border-2 border-indigo-100 px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-50 transition-all shadow-sm"
                        >
                            <Settings2 size={20} />
                            Manage Roles
                        </button>
                        <button
                            onClick={() => handleOpenModal()}
                            className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                        >
                            <UserPlus size={20} />
                            Register New Officer
                        </button>
                    </div>
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
                    <div className="flex flex-col sm:flex-row gap-4">
                        <select
                            className="w-full sm:w-auto bg-gray-50 border-none rounded-xl px-4 py-3 text-sm font-medium text-gray-600 focus:ring-2 focus:ring-indigo-100"
                            value={selectedBranch}
                            onChange={(e) => setSelectedBranch(e.target.value)}
                        >
                            <option value="All Branches">All Branches</option>
                            <option value="Aqua Culture">Aqua Culture</option>
                            <option value="Koi Centre">Koi Centre</option>
                        </select>
                        <select
                            className="w-full sm:w-auto bg-gray-50 border-none rounded-xl px-4 py-3 text-sm font-medium text-gray-600 focus:ring-2 focus:ring-indigo-100"
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value)}
                        >
                            <option value="All Roles">All Roles</option>
                            {roles.map(role => (
                                <option key={role._id} value={role.key}>{role.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Users Table */}
                <div className="bg-white rounded-2xl sm:rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left min-w-[800px] lg:min-w-full">
                            <thead className="bg-gray-50/50">
                                <tr className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">
                                    <th className="px-6 sm:px-8 py-5">Full Name & Email</th>
                                    <th className="px-6 sm:px-8 py-5">Assigned Role</th>
                                    <th className="px-6 sm:px-8 py-5">Branch / Dept</th>
                                    <th className="px-6 sm:px-8 py-5">Biometrics</th>
                                    <th className="px-6 sm:px-8 py-5 text-right">Admin Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {loading ? (
                                    <tr>
                                        <td colSpan="4" className="px-6 sm:px-8 py-10 text-center text-gray-400 font-medium italic">Scanning network for active officers...</td>
                                    </tr>
                                ) : filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="px-6 sm:px-8 py-10 text-center text-gray-400 font-medium italic">No personnel matches your query.</td>
                                    </tr>
                                ) : filteredUsers.map((user) => (
                                    <tr key={user._id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-6 sm:px-8 py-5">
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
                                        <td className="px-6 sm:px-8 py-5">
                                            <span className={`px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${user.role === 'MANAGER' ? 'bg-purple-100 text-purple-600' :
                                                user.role === 'admin' ? 'bg-indigo-100 text-indigo-600' :
                                                    user.role === 'KOI_MANAGER' ? 'bg-orange-100 text-orange-600' :
                                                        'bg-blue-100 text-blue-600'
                                                }`}>
                                                {roles.find(r => r.key === user.role)?.name || user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 sm:px-8 py-5 text-sm font-medium text-gray-600">
                                            <div className="flex items-center gap-2">
                                                <MapPin size={14} className="text-gray-300" />
                                                {user.branch || 'Aqua Culture'}
                                            </div>
                                        </td>
                                        <td className="px-6 sm:px-8 py-5">
                                            {(() => {
                                                const linkedEmp = employees.find(e => e._id === user.employeeId);
                                                return (
                                                    <div className="flex items-center gap-3">
                                                        <div className={`p-2 rounded-lg flex items-center gap-2 ${linkedEmp?.faceEncodings?.length > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-50 text-gray-300'}`} title={linkedEmp?.faceEncodings?.length > 0 ? 'Face Enrolled' : 'Face Not Enrolled'}>
                                                            <Camera size={14} />
                                                            <span className="text-[10px] font-bold uppercase tracking-wider">Face</span>
                                                        </div>
                                                        <div className={`p-2 rounded-lg flex items-center gap-2 ${linkedEmp?.rfid ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-300'}`} title={linkedEmp?.rfid || 'No RFID Tag'}>
                                                            <Fingerprint size={14} />
                                                            <span className="text-[10px] font-bold uppercase tracking-wider font-mono">{linkedEmp?.rfid || '--'}</span>
                                                        </div>
                                                    </div>
                                                );
                                            })()}
                                        </td>
                                        <td className="px-6 sm:px-8 py-5 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {(user.role !== 'MANAGER' || currentUserRole === 'BOSS') && (
                                                    <>
                                                        <button onClick={() => handleOpenModal(user)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                                                            <Edit2 size={18} />
                                                        </button>
                                                        <button onClick={() => handleDelete(user._id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex justify-center items-start md:items-center bg-black/40 backdrop-blur-sm p-4 sm:p-6 md:p-8 lg:p-12 overflow-y-auto no-scrollbar">
                    <div className="bg-white w-full max-w-2xl rounded-[1.5rem] sm:rounded-[2.5rem] shadow-2xl p-5 sm:p-10 my-4 sm:my-8 relative animate-in fade-in zoom-in duration-300">
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute right-4 top-4 sm:right-8 sm:top-8 p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
                        >
                            <X size={24} />
                        </button>
                        {!isFaceModalOpen && (
                            <h2 className="text-xl sm:text-2xl font-bold mb-6 sm:mb-8 flex items-center gap-3 pr-10">
                                <UserPlus className="text-indigo-600" size={28} />
                                {editingUser ? 'Update Officer' : 'Register New Officer'}
                            </h2>
                        )}

                        {isFaceModalOpen ? (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                                <FaceEnrollment
                                    employee={formData.employeeId ? (employees.find(e => e._id === formData.employeeId) || { name: formData.name, _id: 'temp' }) : { name: formData.name, _id: 'temp' }}
                                    onComplete={(faceDescriptors) => {
                                        setIsFaceModalOpen(false);
                                        setFaceEncodings(faceDescriptors);
                                    }}
                                    onCancel={() => setIsFaceModalOpen(false)}
                                />
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Display Name</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-100"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Email Address</label>
                                        <input
                                            type="email"
                                            required
                                            className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-100"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>
                                </div>

                                {!editingUser && (
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Password</label>
                                        <input
                                            type="password"
                                            required
                                            className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-100"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        />
                                    </div>
                                )}

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">System Role</label>
                                        <select
                                            className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-100"
                                            value={formData.role}
                                            onChange={(e) => handleRoleChange(e.target.value)}
                                        >
                                            {roles.map(role => (
                                                <option key={role._id} value={role.key}>{role.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Assigned Branch</label>
                                        <select
                                            className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-100"
                                            value={formData.branch}
                                            onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                                        >
                                            <option value="Aqua Culture">Aqua Culture</option>
                                            <option value="Koi Centre">Koi Centre</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 space-y-4">
                                    <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-wider border-b border-indigo-100 pb-2 flex items-center gap-2">
                                        <Fingerprint size={14} />
                                        Attendance Setup
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase">RFID Tag ID</label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    placeholder="e.g. ZO2700, ON3612, TO9265"
                                                    className="flex-1 px-3 py-2 bg-white border border-indigo-100 rounded-lg text-sm focus:ring-2 focus:ring-indigo-200 outline-none"
                                                    value={rfid}
                                                    onChange={(e) => setRfid(e.target.value)}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={handleGenerateRFID}
                                                    className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                                                    title="Generate RFID"
                                                >
                                                    <RefreshCw size={18} />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="flex items-end">
                                            <button
                                                type="button"
                                                onClick={() => setIsFaceModalOpen(true)}
                                                className="w-full py-2.5 bg-indigo-50 text-indigo-600 border border-indigo-200 rounded-lg font-bold text-xs flex items-center justify-center gap-2 hover:bg-indigo-100 transition-colors"
                                            >
                                                <Camera size={16} />
                                                {faceEncodings?.length > 0 ? 'Update Face Data (5 Enrolled)' : 'Enroll 5 Faces'}
                                            </button>
                                        </div>
                                    </div>
                                </div>



                                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6 sm:mt-8 pt-4">
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="order-2 sm:order-1 flex-1 px-4 py-3 sm:py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-all">Cancel</button>
                                    <button type="submit" className="order-1 sm:order-2 flex-1 px-4 py-3 sm:py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
                                        {editingUser ? 'Save Changes' : 'Register Officer'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
            <RoleManagementModal
                isOpen={isRoleModalOpen}
                onClose={() => setIsRoleModalOpen(false)}
                onRolesUpdated={fetchData}
            />
        </div>
    );
};

export default UserManagement;
