import React, { useState, useEffect } from 'react';
import {
    Package,
    Plus,
    Search,
    Edit2,
    Trash2,
    AlertCircle,
    Loader2,
    ChevronDown,
    ChevronUp,
    ListChecks,
    X
} from 'lucide-react';

import { getProducts, createProduct, updateProduct, deleteProduct } from '../../services/api';
import Modal from '../../components/Modal';

const emptyForm = {
    name: '',
    category: '',
    price: '',
    stock: '',
    minStock: 5,
    unit: 'pcs',
    description: '',
    specifications: []
};

const Stock = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedRow, setExpandedRow] = useState(null);
    const [formData, setFormData] = useState(emptyForm);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const res = await getProducts();
            setProducts(res.data);
        } catch (err) {
            console.error('Error fetching products:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingProduct) {
                await updateProduct(editingProduct._id, formData);
            } else {
                await createProduct(formData);
            }
            setIsModalOpen(false);
            setEditingProduct(null);
            setFormData(emptyForm);
            fetchProducts();
        } catch (err) {
            alert('Error saving product');
        }
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            category: product.category,
            price: product.price,
            stock: product.stock,
            minStock: product.minStock || 5,
            unit: product.unit,
            description: product.description || '',
            specifications: product.specifications ? [...product.specifications] : []
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await deleteProduct(id);
                fetchProducts();
            } catch (err) {
                alert('Error deleting product');
            }
        }
    };

    // Specification helpers
    const addSpec = () => {
        setFormData(prev => ({
            ...prev,
            specifications: [...prev.specifications, { label: '', value: '' }]
        }));
    };

    const updateSpec = (index, field, val) => {
        setFormData(prev => {
            const specs = [...prev.specifications];
            specs[index] = { ...specs[index], [field]: val };
            return { ...prev, specifications: specs };
        });
    };

    const removeSpec = (index) => {
        setFormData(prev => ({
            ...prev,
            specifications: prev.specifications.filter((_, i) => i !== index)
        }));
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 font-display">Inventory Management</h1>
                    <p className="text-gray-500 mt-1">Manage your products, track stock and low stock alerts.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => { setEditingProduct(null); setFormData(emptyForm); setIsModalOpen(true); }}
                        className="btn-primary"
                    >
                        <Plus size={18} />
                        <span>Add Product</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card flex items-center gap-4 py-4">
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                        <Package size={20} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Total Products</p>
                        <p className="text-xl font-bold">{loading ? '...' : products.length}</p>
                    </div>
                </div>
                <div className="card flex items-center gap-4 py-4">
                    <div className="p-3 bg-red-100 text-red-600 rounded-xl">
                        <AlertCircle size={20} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Low Stock Items</p>
                        <p className="text-xl font-bold">{products.filter(p => p.stock <= p.minStock).length}</p>
                    </div>
                </div>
                <div className="card flex items-center gap-4 py-4">
                    <div className="p-3 bg-green-100 text-green-600 rounded-xl">
                        <Plus size={20} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Stock Value</p>
                        <p className="text-xl font-bold">₹{products.reduce((acc, p) => acc + ((p.price || 0) * (p.stock || 0)), 0).toLocaleString()}</p>
                    </div>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl border border-gray-100">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                    />
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden min-h-[300px]">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-64 gap-3">
                        <Loader2 className="animate-spin text-primary-500" size={32} />
                        <p className="text-gray-400 font-medium italic">Loading inventory...</p>
                    </div>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase w-6"></th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Product Name</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Category</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Min. Stock</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Current Stock</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Price (INR)</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredProducts.map((product) => (
                                <React.Fragment key={product._id}>
                                    <tr className="hover:bg-gray-50 group">
                                        <td className="px-4 py-4">
                                            {(product.specifications?.length > 0 || product.description) && (
                                                <button
                                                    onClick={() => setExpandedRow(expandedRow === product._id ? null : product._id)}
                                                    className="text-gray-400 hover:text-primary-600 transition-all"
                                                >
                                                    {expandedRow === product._id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                                </button>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 font-semibold text-gray-900">
                                            <div className="flex items-center gap-2">
                                                {product.name}
                                                {product.specifications?.length > 0 && (
                                                    <span className="text-[10px] bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">
                                                        {product.specifications.length} specs
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{product.category}</td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-medium text-gray-500 italic">{product.minStock || 0} {product.unit}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-sm font-black ${product.stock <= product.minStock ? 'text-red-600' : 'text-gray-700'}`}>{product.stock} {product.unit}</span>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-bold text-gray-900">₹{(product.price || 0).toLocaleString()}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => handleEdit(product)} className="p-1.5 text-gray-400 hover:text-primary-600 transition-all"><Edit2 size={16} /></button>
                                                <button onClick={() => handleDelete(product._id)} className="p-1.5 text-gray-400 hover:text-red-600 transition-all"><Trash2 size={16} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                    {expandedRow === product._id && (
                                        <tr className="bg-blue-50/40">
                                            <td colSpan={7} className="px-8 pb-5 pt-3">
                                                {product.description && (
                                                    <p className="text-sm text-gray-600 mb-3 italic">{product.description}</p>
                                                )}
                                                {product.specifications?.length > 0 && (
                                                    <div>
                                                        <p className="text-[10px] font-bold text-gray-400 uppercase mb-2 flex items-center gap-1.5">
                                                            <ListChecks size={12} /> Technical Specifications
                                                        </p>
                                                        <div className="flex flex-wrap gap-2">
                                                            {product.specifications.map((spec, i) => (
                                                                <div key={i} className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs shadow-sm">
                                                                    <span className="font-bold text-gray-500 uppercase tracking-wide">{spec.label}:</span>
                                                                    <span className="font-semibold text-gray-800">{spec.value}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                            {filteredProducts.length === 0 && (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center text-gray-400 font-medium italic">No products found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setFormData(emptyForm); }}
                title={editingProduct ? 'Edit Product' : 'Add New Product'}
                maxWidth="max-w-2xl"
            >
                <form onSubmit={handleSubmit}>
                    <div className="px-8 py-6 space-y-6">

                        {/* ── Section 1: Product Identity ── */}
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-1 h-5 rounded-full bg-gradient-to-b from-sky-500 to-blue-600"></div>
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Product Identity</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-gray-600 ml-0.5">Product Name <span className="text-red-400">*</span></label>
                                    <input
                                        type="text" placeholder="e.g. SUMI 15 Rotary Drum Filter" required
                                        className="input-field text-sm"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-gray-600 ml-0.5">Category <span className="text-red-400">*</span></label>
                                    <input
                                        type="text" placeholder="e.g. Filtration Systems" required
                                        className="input-field text-sm"
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <hr className="border-gray-100" />

                        {/* ── Section 2: Description ── */}
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-1 h-5 rounded-full bg-gradient-to-b from-violet-500 to-purple-600"></div>
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Product Description</p>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-gray-600 ml-0.5">Description</label>
                                <textarea
                                    placeholder="Describe the product — what it does, how it works, key features..."
                                    className="input-field text-sm min-h-[80px] resize-none leading-relaxed"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                        </div>

                        <hr className="border-gray-100" />

                        {/* ── Section 3: Pricing & Stock ── */}
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-1 h-5 rounded-full bg-gradient-to-b from-emerald-500 to-green-600"></div>
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Pricing & Stock</p>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-gray-600 ml-0.5">Price (₹) <span className="text-red-400">*</span></label>
                                    <input
                                        type="number" placeholder="0.00" required
                                        className="input-field text-sm"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-gray-600 ml-0.5">Current Stock <span className="text-red-400">*</span></label>
                                    <input
                                        type="number" placeholder="0" required
                                        className="input-field text-sm"
                                        value={formData.stock}
                                        onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-gray-600 ml-0.5">Min. Stock Alert</label>
                                    <input
                                        type="number" placeholder="5" required
                                        className="input-field text-sm"
                                        value={formData.minStock}
                                        onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <hr className="border-gray-100" />

                        {/* ── Section 4: Technical Specifications ── */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-1 h-5 rounded-full bg-gradient-to-b from-amber-500 to-orange-500"></div>
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Technical Specifications</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={addSpec}
                                    className="flex items-center gap-1.5 text-xs font-bold text-sky-600 hover:text-sky-800 bg-sky-50 hover:bg-sky-100 border border-sky-200 px-3 py-1.5 rounded-lg transition-all"
                                >
                                    <Plus size={13} /> Add Specification
                                </button>
                            </div>

                            {formData.specifications.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-6 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 text-center">
                                    <ListChecks size={22} className="text-gray-300 mb-2" />
                                    <p className="text-sm font-semibold text-gray-400">No specifications yet</p>
                                    <p className="text-xs text-gray-400 mt-0.5">Click "Add Specification" to add details like Flow Rate, Power, Dimensions, etc.</p>
                                </div>
                            ) : (
                                <div className="space-y-2.5">
                                    <div className="grid grid-cols-[1fr_1fr_32px] gap-2 px-1">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Specification Label</p>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Value</p>
                                    </div>
                                    {formData.specifications.map((spec, index) => (
                                        <div key={index} className="grid grid-cols-[1fr_1fr_32px] gap-2 items-center bg-gray-50/80 border border-gray-100 rounded-xl px-3 py-2">
                                            <input
                                                type="text"
                                                placeholder="e.g. Flow Rate"
                                                className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 transition-all"
                                                value={spec.label}
                                                onChange={(e) => updateSpec(index, 'label', e.target.value)}
                                                required
                                            />
                                            <input
                                                type="text"
                                                placeholder="e.g. 15 m³/hr"
                                                className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 transition-all"
                                                value={spec.value}
                                                onChange={(e) => updateSpec(index, 'value', e.target.value)}
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeSpec(index)}
                                                className="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                            >
                                                <X size={15} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── Footer ── */}
                    <div className="px-8 py-5 border-t border-gray-100 bg-gray-50/60">
                        <button
                            type="submit"
                            className="w-full py-3 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-bold text-sm shadow-md hover:shadow-lg active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2"
                        >
                            <Package size={16} />
                            {editingProduct ? 'Save Changes' : 'Add Product to Inventory'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Stock;
