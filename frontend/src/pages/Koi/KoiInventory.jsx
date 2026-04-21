import React, { useState, useEffect } from 'react';
import { 
    Plus, 
    Package, 
    AlertCircle, 
    History,
    Edit3,
    Trash2,
    Info
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

    const [modals, setModals] = useState({
        item: false,
        edit: false
    });

    const [selectedItem, setSelectedItem] = useState(null);
    const [itemHistory, setItemHistory] = useState([]);

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

    const handleCreateOrUpdateItem = async (e) => {
        e.preventDefault();
        const data = {
            itemName: e.target.name.value,
            description: e.target.desc.value,
            category: e.target.category.value,
            unit: e.target.unit.value,
            sellingPrice: Number(e.target.price.value || 0),
            totalAvailableQuantity: Number(e.target.currentStock.value || 0),
            lowStockThreshold: Number(e.target.reorder.value), // Using one threshold for simplicity
            reorderLevel: Number(e.target.reorder.value)
        };

        try {
            if (modals.edit && selectedItem) {
                await updateKoiFoodItem(selectedItem._id, data);
                setModals({...modals, edit: false});
            } else {
                await createKoiFoodItem(data);
                setModals({...modals, item: false});
            }
            fetchAllData();
        } catch (err) { 
            alert(`Error: ${err.response?.status} - ${err.response?.data?.message || err.message}`); 
        }
    };

    const InventoryTable = () => (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest italic border-b border-gray-100">Product Name</th>
                            <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest italic border-b border-gray-100">Category</th>
                            <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest italic border-b border-gray-100 text-center">Selling Price</th>
                            <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest italic border-b border-gray-100 text-center">In Stock</th>
                            <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest italic border-b border-gray-100 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {inventory.map((item) => {
                            const isLow = item.totalAvailableQuantity <= item.reorderLevel;
                            return (
                                <tr key={item._id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isLow ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'}`}>
                                                <Package size={18} />
                                            </div>
                                            <div>
                                                <div className="text-sm font-black text-gray-900 uppercase tracking-tight">{item.itemName}</div>
                                                <div className="text-[10px] font-bold text-gray-400 italic mt-0.5 max-w-[200px] truncate">{item.description}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className="px-3 py-1 bg-gray-100 text-[10px] font-black text-gray-500 uppercase tracking-widest rounded-full">{item.category}</span>
                                    </td>
                                    <td className="px-8 py-5 text-center">
                                        <div className="text-sm font-black text-gray-900 italic tracking-tighter">₹{item.sellingPrice || 0}</div>
                                    </td>
                                    <td className="px-8 py-5 text-center">
                                        <div className="flex flex-col items-center">
                                            <div className="flex items-baseline gap-1">
                                                <span className={`text-xl font-black ${isLow ? 'text-red-600' : 'text-gray-900'}`}>{item.totalAvailableQuantity}</span>
                                                <span className="text-[10px] font-black text-gray-400 uppercase">{item.unit}</span>
                                            </div>
                                            {isLow && <span className="text-[9px] font-black text-red-500 uppercase flex items-center gap-0.5 mt-0.5"><AlertCircle size={10} /> LOW STOCK</span>}
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button 
                                                onClick={() => { setSelectedItem(item); setModals({ ...modals, edit: true }); }}
                                                className="px-4 py-2 bg-gray-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all flex items-center gap-2"
                                            >
                                                <Edit3 size={14} /> Edit
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteItem(item._id)}
                                                className="p-2 border border-red-100 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all"
                                            >
                                                <Trash2 size={16} />
                                            </button>

                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            {inventory.length === 0 && !loading && (
                <div className="p-20 text-center text-gray-400 italic">No products registered yet.</div>
            )}
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-[1200px] mx-auto pb-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 font-display italic uppercase tracking-tighter leading-none">
                        Koi Food <span className="text-orange-600 italic">Inventory</span>
                    </h1>
                    <p className="text-gray-400 font-medium mt-2">Manage products and stock levels.</p>
                </div>
                <button 
                    onClick={() => { setSelectedItem(null); setModals({ ...modals, item: true }); }}
                    className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl"
                >
                    <Plus size={18} />
                    <span>Add New Product</span>
                </button>
            </div>

            <InventoryTable />

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
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Category</label>
                            <input name="category" defaultValue={selectedItem?.category || "General"} className="w-full px-4 py-3 bg-gray-50 rounded-xl font-semibold border-none focus:ring-2 focus:ring-orange-500" />
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
                    <button type="submit" className="w-full py-4 bg-orange-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-orange-700 transition-all shadow-xl">{modals.edit ? "Update Record" : "Save Product"}</button>
                </form>
            </Modal>


        </div>
    );
};

export default KoiInventory;
