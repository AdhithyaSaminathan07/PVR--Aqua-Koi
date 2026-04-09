import React, { useState, useEffect } from 'react';
import {
    Package,
    Plus,
    Search,
    Filter,
    ArrowDown,
    Edit2,
    Trash2,
    AlertCircle,
    Loader2
} from 'lucide-react';

import { getProducts, createProduct, updateProduct, deleteProduct } from '../services/api';
import Modal from '../components/Modal';

const Stock = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        category: '',
        price: '',
        stock: '',
        minStock: 5,
        unit: 'pcs'
    });


    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const res = await getProducts();
            setProducts(res.data);
        } catch (err) {
            console.error('Error fetching pulse:', err);
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
            setFormData({ name: '', category: '', price: '', stock: '', minStock: 5, unit: 'pcs' });
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
            unit: product.unit
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
                        onClick={() => { setEditingProduct(null); setIsModalOpen(true); }}
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
                                <tr key={product._id} className="hover:bg-gray-50 group">
                                    <td className="px-6 py-4 font-semibold text-gray-900">{product.name}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{product.category}</td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm font-medium text-gray-500 italic">{product.minStock || 0} {product.unit}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <span className={`text-sm font-black ${product.stock <= product.minStock ? 'text-red-600' : 'text-gray-700'}`}>{product.stock} {product.unit}</span>
                                        </div>
                                    </td>

                                    <td className="px-6 py-4 text-sm font-bold text-gray-900">₹{(product.price || 0).toLocaleString()}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => handleEdit(product)} className="p-1.5 text-gray-400 hover:text-primary-600 transition-all"><Edit2 size={16} /></button>
                                            <button onClick={() => handleDelete(product._id)} className="p-1.5 text-gray-400 hover:text-red-600 transition-all"><Trash2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredProducts.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-400 font-medium italic">No products found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingProduct ? 'Edit Product' : 'Add New Product'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="text" placeholder="Product Name" required className="input-field"
                        value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                    <input
                        type="text" placeholder="Category" required className="input-field"
                        value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <input
                            type="number" placeholder="Price" required className="input-field"
                            value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        />
                        <input
                            type="number" placeholder="Stock" required className="input-field"
                            value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Minimum Stock Alert Level</label>
                        <input
                            type="number" placeholder="Min. Stock" required className="input-field"
                            value={formData.minStock} onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                        />
                    </div>

                    <button type="submit" className="btn-primary w-full py-3 mt-4">
                        {editingProduct ? 'Update Product' : 'Add Product'}
                    </button>
                </form>
            </Modal>
        </div>
    );
};

export default Stock;
