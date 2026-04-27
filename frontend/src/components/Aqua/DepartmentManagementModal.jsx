import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Loader2, X, Briefcase } from 'lucide-react';
import { getDepartments, createDepartment, deleteDepartment } from '../../services/api';
import Modal from '../Modal';

const DepartmentManagementModal = ({ isOpen, onClose, branch = 'Aqua', onUpdate }) => {
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newName, setNewName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchDepartments();
        }
    }, [isOpen]);

    const fetchDepartments = async () => {
        try {
            setLoading(true);
            const res = await getDepartments(branch);
            setDepartments(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!newName.trim()) return;

        try {
            setIsSubmitting(true);
            await createDepartment({ name: newName.trim(), branch });
            setNewName('');
            await fetchDepartments();
            if (onUpdate) onUpdate();
        } catch (err) {
            alert('Error adding department: ' + (err.response?.data?.message || err.message));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this department?')) return;
        try {
            await deleteDepartment(id);
            await fetchDepartments();
            if (onUpdate) onUpdate();
        } catch (err) {
            alert('Error deleting department');
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Manage Departments / Roles">
            <div className="p-6 space-y-6">
                {/* Add New */}
                <form onSubmit={handleAdd} className="flex gap-2">
                    <input
                        type="text"
                        placeholder="New Department or Role Name"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="flex-1 px-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-primary-100 text-sm font-medium"
                        required
                    />
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-4 py-2 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                        {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                        <span>Add</span>
                    </button>
                </form>

                {/* List */}
                <div className="space-y-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="animate-spin text-primary-500" />
                        </div>
                    ) : departments.length === 0 ? (
                        <p className="text-center text-gray-400 text-sm italic py-4">No departments added yet.</p>
                    ) : (
                        departments.map((dept) => (
                            <div key={dept._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl group hover:bg-gray-100 transition-all">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white rounded-lg text-primary-500 shadow-sm">
                                        <Briefcase size={16} />
                                    </div>
                                    <span className="font-bold text-gray-700 text-sm">{dept.name}</span>
                                </div>
                                <button
                                    onClick={() => handleDelete(dept._id)}
                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </Modal>
    );
};

export default DepartmentManagementModal;
