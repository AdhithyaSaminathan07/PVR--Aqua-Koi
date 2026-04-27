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
    UserMinus,
    MapPin,
    Fingerprint,
    Camera,
    RefreshCw,
    X,
    CheckCircle2,
    Layers
} from 'lucide-react';
import { getEmployees, createEmployee, updateEmployee, deleteEmployee, getDepartments } from '../../services/api';
import Modal from '../../components/Modal';
import FaceEnrollment from '../../components/Attendance/FaceEnrollment';
import DepartmentManagementModal from '../../components/Aqua/DepartmentManagementModal';

const Employees = () => {
    const [employees, setEmployees] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
    const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const currentBranch = window.location.pathname.includes('/koi') ? 'Koi' : 'Aqua';
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        joiningDate: new Date().toISOString().split('T')[0],
        salary: '',
        department: '',
        branch: currentBranch,
        status: 'Active',
        address: '',
        rfid: '',
        faceEncodings: []
    });
    const [isFaceEnrollMode, setIsFaceEnrollMode] = useState(false);

    useEffect(() => {
        fetchEmployees();
        fetchDepartments();
    }, []);

    const fetchDepartments = async () => {
        try {
            const res = await getDepartments(currentBranch);
            setDepartments(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchEmployees = async () => {
        try {
            setLoading(true);
            const res = await getEmployees(currentBranch);
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
            // Map department to designation for compatibility if needed by backend
            const payload = { ...formData, designation: formData.department };
            if (isEdit) {
                await updateEmployee(selectedId, payload);
            } else {
                await createEmployee(payload);
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
            phone: employee.phone,
            email: employee.email || '',
            joiningDate: new Date(employee.joiningDate).toISOString().split('T')[0],
            salary: employee.salary || '',
            department: employee.department || '',
            branch: employee.branch || 'Aqua',
            status: employee.status,
            address: employee.address || '',
            rfid: employee.rfid || '',
            faceEncodings: employee.faceEncodings || []
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
            phone: '',
            email: '',
            joiningDate: new Date().toISOString().split('T')[0],
            salary: '',
            department: '',
            branch: currentBranch,
            status: 'Active',
            address: '',
            rfid: '',
            faceEncodings: []
        });
        setIsEdit(false);
        setSelectedId(null);
        setIsFaceEnrollMode(false);
    };

    const filtered = employees.filter(e => {
        const matchesSearch = e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (e.department && e.department.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (e.designation && e.designation.toLowerCase().includes(searchTerm.toLowerCase())) ||
            e.phone.includes(searchTerm);

        const matchesBranch = e.branch === currentBranch;
        return matchesSearch && matchesBranch;
    });

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 font-display">Employee Management</h1>
                    <p className="text-gray-500 mt-1 text-sm sm:text-base">Manage staff, designations, and payroll info.</p>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button
                        onClick={() => setIsDeptModalOpen(true)}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-700 border border-gray-200 rounded-xl font-bold hover:bg-gray-50 transition-all shadow-sm"
                    >
                        <Layers size={18} className={currentBranch === 'Koi' ? 'text-orange-500' : 'text-primary-500'} />
                        <span>Manage Departments</span>
                    </button>
                    <button
                        onClick={() => {
                            resetForm();
                            const prefixes = ['ZO', 'ON', 'TO', 'RE', 'AL', 'PX', 'KV', 'TR'];
                            const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
                            const autoRfid = `${randomPrefix}${Math.floor(1000 + Math.random() * 9000)}`;
                            setFormData(prev => ({ ...prev, rfid: autoRfid }));
                            setIsModalOpen(true);
                        }}
                        className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 ${currentBranch === 'Koi' ? 'bg-orange-600 shadow-orange-900/20 hover:bg-orange-700' : 'bg-primary-600 shadow-primary-900/20 hover:bg-primary-700'} text-white rounded-xl font-bold hover:shadow-lg transition-all`}
                    >
                        <Plus size={18} />
                        <span>Add Employee</span>
                    </button>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-5 rounded-[1.5rem] border border-gray-100 shadow-sm">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by name, dept or phone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary-100 placeholder:text-gray-400 transition-all font-medium"
                    />
                </div>
                <div className="flex items-center gap-4 text-sm">
                    <span className="font-bold text-gray-400 uppercase tracking-widest text-[10px]">Total Personnel</span>
                    <span className={`px-3 py-1 ${currentBranch === 'Koi' ? 'bg-orange-50 text-orange-600' : 'bg-primary-50 text-primary-600'} rounded-full font-bold`}>{employees.length}</span>
                </div>
            </div>

            {
                loading ? (
                    <div className="flex flex-col items-center justify-center h-64 gap-3">
                        <Loader2 className="animate-spin text-primary-500" size={32} />
                        <p className="text-gray-400 font-medium italic">Loading staff records...</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left min-w-[1000px]">
                                <thead className="bg-gray-50/50">
                                    <tr className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100">
                                        <th className="px-8 py-6">Full Name & Email</th>
                                        <th className="px-8 py-6">Department / Role</th>
                                        <th className="px-8 py-6">Branch Info</th>
                                        <th className="px-8 py-6">Biometrics</th>
                                        <th className="px-8 py-6 text-right">Admin Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {filtered.map((employee) => (
                                        <tr key={employee._id} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-11 h-11 ${currentBranch === 'Koi' ? 'bg-orange-50 text-orange-600' : 'bg-primary-50 text-primary-600'} rounded-2xl flex items-center justify-center font-bold text-lg font-display`}>
                                                        {employee.name[0]}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900 leading-tight">{employee.name}</p>
                                                        <p className="text-xs text-gray-400 font-medium mt-0.5 flex items-center gap-1.5">
                                                            <Mail size={12} className="text-gray-300" />
                                                            {employee.email || 'No email provided'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex flex-col gap-1">
                                                    <span className={`px-3 py-1 ${currentBranch === 'Koi' ? 'bg-orange-50 text-orange-700' : 'bg-primary-50 text-primary-700'} rounded-full text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1.5 w-fit`}>
                                                        <Briefcase size={12} />
                                                        {employee.department || employee.designation || 'Staff'}
                                                    </span>
                                                    <span className="text-[10px] text-gray-400 font-medium ml-1">
                                                        Joined {new Date(employee.joiningDate).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                                                        <MapPin size={14} className={currentBranch === 'Koi' ? 'text-orange-400' : 'text-primary-400'} />
                                                        {employee.branch || 'Aqua Culture'}
                                                    </div>
                                                    <div className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider ml-5">
                                                        {employee.status}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2.5 rounded-xl flex items-center gap-2 border ${employee.faceEncodings?.length > 0 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-gray-50 text-gray-300 border-gray-100'}`} title={employee.faceEncodings?.length > 0 ? 'Face Data Enrolled' : 'Face Data Missing'}>
                                                        <Camera size={16} />
                                                        <span className="text-[10px] font-black uppercase tracking-tighter">Face</span>
                                                    </div>
                                                    <div className={`p-2.5 rounded-xl flex items-center gap-2 border ${employee.rfid ? 'bg-sky-50 text-sky-600 border-sky-100' : 'bg-gray-50 text-gray-300 border-gray-100'}`} title={employee.rfid || 'No RFID Tag'}>
                                                        <Fingerprint size={16} />
                                                        <span className="text-[10px] font-black uppercase tracking-tighter font-mono">{employee.rfid || 'NONE'}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleEdit(employee)}
                                                        className={`p-2.5 ${currentBranch === 'Koi' ? 'text-orange-600 hover:bg-orange-50' : 'text-primary-600 hover:bg-primary-50'} rounded-xl transition-all hover:scale-110`}
                                                        title="Edit Record"
                                                    >
                                                        <Edit2 size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => { setSelectedEmployee(employee); setIsEnrollModalOpen(true); }}
                                                        className="p-2.5 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all hover:scale-110"
                                                        title="Enroll Biometrics"
                                                    >
                                                        <Camera size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(employee._id)}
                                                        className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-all hover:scale-110"
                                                        title="Delete Record"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {filtered.length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="px-8 py-20 text-center">
                                                <div className="flex flex-col items-center gap-3 text-gray-300">
                                                    <Users size={48} className="opacity-20" />
                                                    <p className="font-medium italic">No personnel matches your query.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )
            }

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={isFaceEnrollMode ? "Face Enrollment" : (isEdit ? "Edit Employee" : "Add New Employee")}>
                {isFaceEnrollMode ? (
                    <div className="p-6">
                        <FaceEnrollment
                            employee={{ name: formData.name || 'New Employee', _id: selectedId || 'temp' }}
                            onComplete={(descriptors) => {
                                setFormData(prev => ({ ...prev, faceEncodings: descriptors }));
                                setIsFaceEnrollMode(false);
                            }}
                            onCancel={() => setIsFaceEnrollMode(false)}
                        />
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="px-6 py-4 space-y-4">
                            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-0.5">Full Name <span className="text-red-400">*</span></label>
                                    <input
                                        type="text" placeholder="e.g. Rajan Kumar" required className="input-field text-sm py-2"
                                        value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-0.5">Department / Role <span className="text-red-400">*</span></label>
                                    <select
                                        required className="input-field text-sm py-2"
                                        value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                    >
                                        <option value="">Select Dept</option>
                                        {departments.map(dept => (
                                            <option key={dept._id} value={dept.name}>{dept.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-0.5">Phone Number <span className="text-red-400">*</span></label>
                                    <input
                                        type="text" placeholder="Phone" required className="input-field text-sm py-2"
                                        value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-0.5">Email Address</label>
                                    <input
                                        type="email" placeholder="Email" className="input-field text-sm py-2"
                                        value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-0.5">Assign Branch</label>
                                    <div className={`p-3 ${currentBranch === 'Koi' ? 'bg-orange-50 text-orange-600' : 'bg-gray-50 text-primary-600'} rounded-xl text-sm font-bold border border-gray-100 flex items-center gap-2`}>
                                        <MapPin size={14} className={currentBranch === 'Koi' ? 'text-orange-400' : 'text-primary-400'} />
                                        {currentBranch === 'Koi' ? 'Koi Centre' : 'Aqua Culture'}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-0.5">Joining Date</label>
                                    <input
                                        type="date" className="input-field text-sm py-2"
                                        value={formData.joiningDate} onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-0.5">Monthly Salary (₹)</label>
                                    <input
                                        type="number" placeholder="15000" className="input-field text-sm py-2"
                                        value={formData.salary} onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-0.5">Work Status</label>
                                    <div className="flex gap-2">
                                        {['Active', 'Inactive'].map(s => (
                                            <button
                                                key={s}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, status: s })}
                                                className={`flex-1 py-2 rounded-lg text-[10px] font-bold border transition-all ${formData.status === s
                                                    ? (s === 'Active' ? 'bg-green-50 text-green-700 border-green-300' : 'bg-red-50 text-red-700 border-red-300')
                                                    : 'bg-gray-50 text-gray-400 border-gray-200 hover:border-gray-300'
                                                    }`}
                                            >
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                {/* Integrated Biometrics */}
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-0.5">RFID Tag ID</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text" placeholder="Scan or type RFID" className="input-field text-sm font-mono py-2"
                                            value={formData.rfid} onChange={(e) => setFormData({ ...formData, rfid: e.target.value })}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const prefixes = ['ZO', 'ON', 'TO', 'RE', 'AL', 'PX', 'KV', 'TR'];
                                                const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
                                                const newRfid = `${randomPrefix}${Math.floor(1000 + Math.random() * 9000)}`;
                                                setFormData({ ...formData, rfid: newRfid });
                                            }}
                                            className="p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                                        >
                                            <RefreshCw size={16} />
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-0.5">Face Enrollment</label>
                                    <button
                                        type="button"
                                        onClick={() => setIsFaceEnrollMode(true)}
                                        className="w-full py-2 bg-primary-50 text-primary-600 border border-primary-100 rounded-lg font-bold text-xs flex items-center justify-center gap-2 hover:bg-primary-100 transition-colors"
                                    >
                                        <Camera size={14} />
                                        {formData.faceEncodings?.length > 0 ? "Face Enrolled (5)" : "Enroll 5 Faces"}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-8 py-5 border-t border-gray-100 bg-gray-50/60">
                            <button
                                type="submit"
                                className={`w-full py-3 rounded-xl ${currentBranch === 'Koi' ? 'bg-gradient-to-r from-orange-500 to-orange-700 hover:from-orange-600 hover:to-orange-800' : 'bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700'} text-white font-bold text-sm shadow-md hover:shadow-lg active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2`}
                            >
                                {isEdit ? <CheckCircle2 size={16} /> : <Users size={16} />}
                                {isEdit ? "Save Changes" : "Add Employee"}
                            </button>
                        </div>
                    </form>
                )}
            </Modal>

            <Modal isOpen={isEnrollModalOpen} onClose={() => setIsEnrollModalOpen(false)} title="Face Enrollment">
                {selectedEmployee && (
                    <FaceEnrollment
                        employee={selectedEmployee}
                        onComplete={() => {
                            setIsEnrollModalOpen(false);
                            fetchEmployees();
                        }}
                    />
                )}
            </Modal>

            <DepartmentManagementModal
                isOpen={isDeptModalOpen}
                onClose={() => setIsDeptModalOpen(false)}
                branch={currentBranch}
                onUpdate={fetchDepartments}
            />
        </div>
    );
};

export default Employees;
