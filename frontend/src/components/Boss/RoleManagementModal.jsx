import React, { useState, useEffect } from 'react';
import * as api from '../../services/api';
import { X, Plus, Trash2, Edit2, Shield, Check, Info } from 'lucide-react';

const RoleManagementModal = ({ isOpen, onClose, onRolesUpdated }) => {
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [currentRole, setCurrentRole] = useState({ name: '', modules: [], description: '' });

    const availableModules = [
        'Aqua:Dashboard', 'Aqua:Customers', 'Aqua:Inventory', 'Aqua:Complaints', 'Aqua:Enquiry & Orders', 'Aqua:Tasks', 'Aqua:Services', 'Aqua:Employees', 'Aqua:Invoices',
        'Koi:Dashboard', 'Koi:Enquiries', 'Koi:Orders', 'Koi:Invoices', 'Koi:Payments', 'Koi:Inventory', 'Koi:Customers'
    ];

    useEffect(() => {
        if (isOpen) {
            fetchRoles();
        }
    }, [isOpen]);

    const fetchRoles = async () => {
        try {
            setLoading(true);
            const res = await api.getRoles();
            setRoles(res.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching roles:', err);
            setLoading(false);
        }
    };

    const handleSaveRole = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await api.updateRole(currentRole._id, currentRole);
            } else {
                await api.createRole(currentRole);
            }
            setCurrentRole({ name: '', key: '', modules: [], description: '' });
            setIsEditing(false);
            fetchRoles();
            onRolesUpdated();
        } catch (err) {
            alert(err.response?.data?.message || 'Error saving role');
        }
    };

    const handleEdit = (role) => {
        setCurrentRole(role);
        setIsEditing(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this role?')) return;
        try {
            await api.deleteRole(id);
            fetchRoles();
            onRolesUpdated();
        } catch (err) {
            alert('Error deleting role');
        }
    };

    const toggleModule = (module) => {
        const newModules = currentRole.modules.includes(module)
            ? currentRole.modules.filter(m => m !== module)
            : [...currentRole.modules, module];
        setCurrentRole({ ...currentRole, modules: newModules });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] flex justify-center items-center bg-black/50 backdrop-blur-md p-4 overflow-y-auto no-scrollbar">
            <div className="bg-white w-full max-w-4xl rounded-[2rem] shadow-2xl p-6 sm:p-10 relative animate-in fade-in zoom-in duration-300">
                <button onClick={onClose} className="absolute right-6 top-6 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all">
                    <X size={24} />
                </button>

                <div className="flex items-center gap-3 mb-8">
                    <Shield className="text-indigo-600" size={32} />
                    <h2 className="text-2xl font-bold text-gray-900">System Role Management</h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    {/* Role Form */}
                    <div className="space-y-6">
                        <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                {isEditing ? <Edit2 size={18} /> : <Plus size={18} />}
                                {isEditing ? 'Edit Role' : 'Create New Role'}
                            </h3>
                            <form onSubmit={handleSaveRole} className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Role Name</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Sales Manager"
                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                                        value={currentRole.name}
                                        onChange={(e) => setCurrentRole({ ...currentRole, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Allocated Modules</label>
                                    <div className="grid grid-cols-2 gap-4 mt-2 max-h-[300px] overflow-y-auto p-4 bg-white border border-gray-200 rounded-xl no-scrollbar">
                                        {/* Aqua Column */}
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 mb-3">
                                                <div className="w-1.5 h-4 bg-blue-600 rounded-full" />
                                                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Aqua Modules</span>
                                            </div>
                                            {availableModules.filter(m => m.startsWith('Aqua:')).map(module => (
                                                <button
                                                    key={module}
                                                    type="button"
                                                    onClick={() => toggleModule(module)}
                                                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[10px] font-bold transition-all border ${currentRole.modules.includes(module)
                                                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                                        : 'bg-white text-gray-500 border-gray-100 hover:border-blue-200 hover:bg-blue-50/30'
                                                        }`}
                                                >
                                                    {currentRole.modules.includes(module) ? <Check size={12} /> : <div className="w-3" />}
                                                    {module.replace('Aqua:', '')}
                                                </button>
                                            ))}
                                        </div>

                                        {/* Koi Column */}
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 mb-3">
                                                <div className="w-1.5 h-4 bg-orange-500 rounded-full" />
                                                <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Koi Modules</span>
                                            </div>
                                            {availableModules.filter(m => m.startsWith('Koi:')).map(module => (
                                                <button
                                                    key={module}
                                                    type="button"
                                                    onClick={() => toggleModule(module)}
                                                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[10px] font-bold transition-all border ${currentRole.modules.includes(module)
                                                        ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                                                        : 'bg-white text-gray-500 border-gray-100 hover:border-orange-200 hover:bg-orange-50/30'
                                                        }`}
                                                >
                                                    {currentRole.modules.includes(module) ? <Check size={12} /> : <div className="w-3" />}
                                                    {module.replace('Koi:', '')}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="submit"
                                        className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                                    >
                                        {isEditing ? 'Update Role' : 'Create Role'}
                                    </button>
                                    {isEditing && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsEditing(false);
                                                setCurrentRole({ name: '', modules: [], description: '' });
                                            }}
                                            className="px-4 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-all"
                                        >
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Roles List */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="text-lg font-bold text-gray-800">Existing Roles</h3>
                            <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">{roles.length} Roles</span>
                        </div>
                        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 no-scrollbar">
                            {loading ? (
                                <div className="p-4 text-center text-gray-400 italic">Loading system roles...</div>
                            ) : roles.map(role => (
                                <div key={role._id} className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:border-indigo-100 transition-all group">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{role.name}</h4>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">{role.key}</p>
                                        </div>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => handleEdit(role)} className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg">
                                                <Edit2 size={16} />
                                            </button>
                                            <button onClick={() => handleDelete(role._id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="mt-3 flex flex-wrap gap-1.5">
                                        {role.modules.slice(0, 3).map(m => (
                                            <span key={m} className="px-2 py-0.5 bg-gray-50 text-gray-500 text-[9px] font-bold rounded-md">{m}</span>
                                        ))}
                                        {role.modules.length > 3 && (
                                            <span className="px-2 py-0.5 bg-gray-50 text-gray-500 text-[9px] font-bold rounded-md">+{role.modules.length - 3} more</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RoleManagementModal;
