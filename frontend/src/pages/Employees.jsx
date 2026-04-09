import React, { useState, useEffect } from 'react';
import {
    Users,
    Plus,
    Search,
    Phone,
    Mail,
    Briefcase,
    Calendar,
    MoreVertical,
    Trash2,
    Edit2,
    Loader2,
    UserCheck,
    UserMinus
} from 'lucide-react';
import { getEmployees, createEmployee, updateEmployee, deleteEmployee } from '../services/api';
import Modal from '../components/Modal';

const Employees = () => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        designation: '',
        phone: '',
        email: '',
        joiningDate: new Date().toISOString().split('T')[0],
        salary: '',
        department: '',
        status: 'Active',
        address: ''
    });

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            setLoading(true);
            const res = await getEmployees();
            setEmployees(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEdit) {
                await updateEmployee(selectedId, formData);
            } else {
                await createEmployee(formData);
            }
            setIsModalOpen(false);
            resetForm();
            fetchEmployees();
        } catch (err) {
            alert('Error saving employee');
        }
    };

    const handleEdit = (employee) => {
        setFormData({
            name: employee.name,
            designation: employee.designation,
            phone: employee.phone,
            email: employee.email || '',
            joiningDate: new Date(employee.joiningDate).toISOString().split('T')[0],
            salary: employee.salary || '',
            department: employee.department || '',
            status: employee.status,
            address: employee.address || ''
        });
        setSelectedId(employee._id);
        setIsEdit(true);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this employee?')) {
            try {
                await deleteEmployee(id);
                fetchEmployees();
            } catch (err) {
                alert('Error deleting employee');
            }
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            designation: '',
            phone: '',
            email: '',
            joiningDate: new Date().toISOString().split('T')[0],
            salary: '',
            department: '',
            status: 'Active',
            address: ''
        });
        setIsEdit(false);
        setSelectedId(null);
    };

    const filtered = employees.filter(e =>
        e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.phone.includes(searchTerm)
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 font-display">Employee Management</h1>
                    <p className="text-gray-500 mt-1">Manage staff, designations, and payroll info.</p>
                </div>
                <button 
                    onClick={() => { resetForm(); setIsModalOpen(true); }} 
                    className="btn-primary"
                >
                    <Plus size={18} />
                    <span>Add Employee</span>
                </button>
            </div>

            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by name, role or phone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                    />
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="font-medium">Total: {employees.length}</span>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center h-64 gap-3">
                    <Loader2 className="animate-spin text-primary-500" size={32} />
                    <p className="text-gray-400 font-medium italic">Loading staff records...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filtered.map((employee) => (
                        <div key={employee._id} className="card group hover:shadow-md transition-all border-t-4 border-t-primary-500">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center font-bold text-lg font-display">
                                        {employee.name[0]}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 leading-none">{employee.name}</h3>
                                        <span className="text-xs text-primary-600 font-semibold uppercase">{employee.designation}</span>
                                    </div>
                                </div>
                                <div className="flex gap-1">
                                    <button onClick={() => handleEdit(employee)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-primary-600 transition-colors">
                                        <Edit2 size={16} />
                                    </button>
                                    <button onClick={() => handleDelete(employee._id)} className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-600 transition-colors">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2 mb-4 text-sm">
                                <div className="flex items-center gap-3 text-gray-500">
                                    <Phone size={14} className="text-gray-400" />
                                    <span>{employee.phone}</span>
                                </div>
                                {employee.email && (
                                    <div className="flex items-center gap-3 text-gray-500">
                                        <Mail size={14} className="text-gray-400" />
                                        <span className="truncate">{employee.email}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-3 text-gray-500">
                                    <Briefcase size={14} className="text-gray-400" />
                                    <span>{employee.department || 'N/A'}</span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-500">
                                    <Calendar size={14} className="text-gray-400" />
                                    <span>Joined: {new Date(employee.joiningDate).toLocaleDateString()}</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                    employee.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                }`}>
                                    {employee.status === 'Active' ? <UserCheck size={12} /> : <UserMinus size={12} />}
                                    {employee.status}
                                </div>
                                <div className="text-sm font-bold text-gray-900">
                                    ₹{employee.salary?.toLocaleString() || '-'}
                                </div>
                            </div>
                        </div>
                    ))}
                    {filtered.length === 0 && <p className="col-span-full text-center text-gray-400 italic py-12">No employee records found.</p>}
                </div>
            )}

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={isEdit ? "Edit Employee" : "Add New Employee"}>
                <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto px-1 custom-scrollbar">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Full Name</label>
                            <input
                                type="text" placeholder="John Doe" required className="input-field"
                                value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Designation</label>
                            <input
                                type="text" placeholder="e.g. Technician" required className="input-field"
                                value={formData.designation} onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Department</label>
                            <input
                                type="text" placeholder="e.g. Service" className="input-field"
                                value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Phone Number</label>
                            <input
                                type="text" placeholder="Phone Number" required className="input-field"
                                value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Email Address</label>
                            <input
                                type="email" placeholder="email@example.com" className="input-field"
                                value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Joining Date</label>
                            <input
                                type="date" required className="input-field"
                                value={formData.joiningDate} onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Monthly Salary</label>
                            <input
                                type="number" placeholder="Salary in ₹" className="input-field"
                                value={formData.salary} onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                            />
                        </div>
                        <div className="col-span-2">
                             <label className="text-xs font-bold text-gray-500 uppercase ml-1">Status</label>
                             <select 
                                className="input-field"
                                value={formData.status}
                                onChange={(e) => setFormData({...formData, status: e.target.value})}
                             >
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                             </select>
                        </div>
                        <div className="col-span-2">
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Residential Address</label>
                            <textarea
                                placeholder="Full Address..." className="input-field min-h-[80px]"
                                value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            />
                        </div>
                    </div>
                    <button type="submit" className="btn-primary w-full py-3 mt-4 text-white">
                        {isEdit ? "Update Employee" : "Register Employee"}
                    </button>
                </form>
            </Modal>
        </div>
    );
};

export default Employees;
