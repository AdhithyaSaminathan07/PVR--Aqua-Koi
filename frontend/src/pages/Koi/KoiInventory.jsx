import React, { useState, useEffect } from 'react';
import {
    Plus,
    Package,
    AlertCircle,
    History,
    Edit3,
    Trash2,
    Info,
    Search,
    IndianRupee,
    Loader2
} from 'lucide-react';
import {
    getKoiStock,
    createKoiFoodItem,
    updateKoiFoodItem,
    deleteKoiFoodItem,
    getKoiTransactionHistory
} from '../../services/api';
import Modal from '../../components/Modal';

const KoiInventory = () => {
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const [modals, setModals] = useState({
        item: false,
        edit: false
    });

    const [selectedItem, setSelectedItem] = useState(null);
    const [itemCategory, setItemCategory] = useState('Food');

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            const stockRes = await getKoiStock();
            setInventory(stockRes.data);
        } catch (err) {
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteItem = async (id) => {
        if (!window.confirm("Are you sure you want to delete this product and its history?")) return;
        try {
            await deleteKoiFoodItem(id);
            fetchAllData();
        } catch (err) {
            alert(err.response?.data?.message || err.message);
        }
    };

    const [isSaving, setIsSaving] = useState(false);

    const handleCreateOrUpdateItem = async (e) => {
        e.preventDefault();
        if (isSaving) return;
        setIsSaving(true);

        const data = {
            itemName: e.target.name.value,
            description: e.target.desc.value,
            category: itemCategory,
            unit: e.target.unit.value,
            sellingPrice: Number(e.target.price.value || 0),
            totalAvailableQuantity: Number(e.target.currentStock.value || 0),
            lowStockThreshold: Number(e.target.reorder.value),
            reorderLevel: Number(e.target.reorder.value)
        };

        try {
            if (modals.edit && selectedItem) {
                await updateKoiFoodItem(selectedItem._id, data);
                setModals({ ...modals, edit: false });
            } else {
                await createKoiFoodItem(data);
                setModals({ ...modals, item: false });
            }
            fetchAllData();
        } catch (err) {
            const msg = err.response?.data?.message || err.message;
            alert(`Product Error: ${msg}`);
        } finally {
            setIsSaving(false);
        }
    };

    const filtered = inventory.filter(item =>
        item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-12">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Food Inventory</h1>
                    <p className="text-gray-500 mt-1">Manage products and stock levels.</p>
                </div>
                <button
                    onClick={() => { setSelectedItem(null); setModals({ ...modals, item: true }); }}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-orange-900/20 active:scale-95"
                >
                    <Plus size={18} />
                    <span>Add New Product</span>
                </button>
            </div>

            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-5 rounded-[1.5rem] border border-gray-100 shadow-sm">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search products by name or category..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-100 transition-all font-medium"
                    />
                </div>
                <div className="flex items-center gap-4 text-sm">
                    <span className="font-bold text-gray-400 uppercase tracking-widest text-[10px]">Total Products</span>
                    <span className="px-3 py-1 bg-orange-50 text-orange-600 rounded-full font-bold">{inventory.length}</span>
                </div>
            </div>

            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[1000px]">
                        <thead className="bg-gray-50/50">
                            <tr className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100">
                                <th className="px-8 py-6">Product Information</th>
                                <th className="px-8 py-6">Category</th>
                                <th className="px-8 py-6">Price</th>
                                <th className="px-8 py-6">Stock Status</th>
                                <th className="px-8 py-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3 text-orange-500">
                                            <Loader2 className="animate-spin" size={32} />
                                            <p className="text-gray-400 font-medium italic">Synchronizing stock records...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filtered.length > 0 ? filtered.map((item) => {
                                const isLow = item.totalAvailableQuantity <= item.reorderLevel;
                                return (
                                    <tr key={item._id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-11 h-11 ${isLow ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'} rounded-2xl flex items-center justify-center`}>
                                                    <Package size={20} />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 leading-tight">{item.itemName}</p>
                                                    <p className="text-[10px] text-gray-400 font-medium mt-0.5 max-w-xs truncate">{item.description}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className="px-3 py-1 bg-gray-50 text-gray-600 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                                {item.category}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="text-lg font-black text-gray-900 flex items-center gap-1 italic tracking-tighter">
                                                <IndianRupee size={16} className="text-gray-300" />
                                                {item.sellingPrice || 0}
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-baseline gap-1.5">
                                                    <span className={`text-xl font-black ${isLow ? 'text-red-600' : 'text-gray-900'}`}>{item.totalAvailableQuantity}</span>
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase">{item.unit}</span>
                                                </div>
                                                {isLow && (
                                                    <span className="text-[9px] font-black text-red-500 uppercase flex items-center gap-1 animate-pulse">
                                                        <AlertCircle size={10} /> Low Stock Alert
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => {
                                                        setSelectedItem(item);
                                                        setItemCategory(item.category || 'Food');
                                                        setModals({ ...modals, edit: true });
                                                    }}
                                                    className="p-2.5 text-orange-600 hover:bg-orange-50 rounded-xl transition-all"
                                                    title="Edit Product"
                                                >
                                                    <Edit3 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteItem(item._id)}
                                                    className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                                    title="Delete Product"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan="5" className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3 text-gray-300">
                                            <Package size={48} className="opacity-20" />
                                            <p className="font-medium italic">No products match your search.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>


            {/* Modal for Create/Edit */}
            <Modal isOpen={modals.item || modals.edit} onClose={() => setModals({ ...modals, item: false, edit: false })} title={modals.edit ? "EDIT PRODUCT" : "NEW PRODUCT"}>
                <form onSubmit={handleCreateOrUpdateItem} className="p-8 space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Product Name</label>
                            <input name="name" defaultValue={selectedItem?.itemName} required className="w-full px-4 py-3 bg-gray-50 rounded-xl font-semibold border-none focus:ring-2 focus:ring-orange-500" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Selling Price (₹)</label>
                            <input name="price" type="number" step="any" defaultValue={selectedItem?.sellingPrice || 0} required className="w-full px-4 py-3 bg-gray-50 rounded-xl font-black text-lg border-none focus:ring-2 focus:ring-orange-500" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Product Type</label>
                            <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
                                {['Fish', 'Food'].map(t => (
                                    <button
                                        key={t}
                                        type="button"
                                        onClick={() => setItemCategory(t)}
                                        className={`flex-1 py-3 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all ${itemCategory === t ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-400'}`}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Unit</label>
                            <select name="unit" defaultValue={selectedItem?.unit || "kg"} className="w-full px-4 py-3 bg-gray-50 rounded-xl font-semibold border-none focus:ring-2 focus:ring-orange-500">
                                <option value="kg">kg</option>
                                <option value="grams">grams</option>
                                <option value="bags">bags</option>
                            </select>
                        </div>
                    </div>

                    <div className="bg-gray-100 p-6 rounded-[2rem] grid grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Available Stock</label>
                            <input name="currentStock" type="number" step="any" defaultValue={selectedItem?.totalAvailableQuantity || 0} className="w-full px-4 py-3 bg-white shadow-sm rounded-xl font-black border-none focus:ring-2 focus:ring-orange-500" />
                            <p className="text-[9px] text-gray-400 font-bold italic">Adjust count here</p>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Minimum Stock</label>
                            <input name="reorder" type="number" defaultValue={selectedItem?.reorderLevel || 10} className="w-full px-4 py-3 bg-white shadow-sm rounded-xl font-black border-none focus:ring-2 focus:ring-orange-500 text-orange-600" />
                            <p className="text-[9px] text-gray-400 font-bold italic">Alert level</p>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Description</label>
                        <textarea name="desc" defaultValue={selectedItem?.description} className="w-full px-4 py-3 bg-gray-50 rounded-xl font-semibold border-none focus:ring-2 focus:ring-orange-500" rows="2" />
                    </div>
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="w-full py-4 bg-orange-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-orange-700 transition-all shadow-xl disabled:opacity-50"
                    >
                        {isSaving ? "SAVING..." : (modals.edit ? "Update Record" : "Save Product")}
                    </button>
                </form>
            </Modal>


        </div>
    );
};

export default KoiInventory;
