import React, { useState, useEffect } from 'react';
import {
    Plus,
    Search,
    FileText,
    User,
    Calendar,
    Download,
    Eye,
    Tag,
    IndianRupee,
    Printer,
    Trash2,
    CheckCircle2,
    ChevronRight,
    Loader2
} from 'lucide-react';
import {
    getKoiInvoices,
    createKoiInvoice,
    getKoiOrders,
    getKoiCustomers,
    getKoiStock
} from '../../services/api';
import Modal from '../../components/Modal';

// Helper for Total in Words
const numberToWords = (num) => {
    const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fivey', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    const inWords = (n) => {
        if ((n = n.toString()).length > 9) return 'overflow';
        let nArray = ('000000000' + n).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
        if (!nArray) return '';
        let str = '';
        str += (nArray[1] != 0) ? (a[Number(nArray[1])] || b[nArray[1][0]] + ' ' + a[nArray[1][1]]) + 'Crore ' : '';
        str += (nArray[2] != 0) ? (a[Number(nArray[2])] || b[nArray[2][0]] + ' ' + a[nArray[2][1]]) + 'Lakh ' : '';
        str += (nArray[3] != 0) ? (a[Number(nArray[3])] || b[nArray[3][0]] + ' ' + a[nArray[3][1]]) + 'Thousand ' : '';
        str += (nArray[4] != 0) ? (a[Number(nArray[4])] || b[nArray[4][0]] + ' ' + a[nArray[4][1]]) + 'Hundred ' : '';
        str += (nArray[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(nArray[5])] || b[nArray[5][0]] + ' ' + a[nArray[5][1]]) + 'Only ' : 'Only';
        return str;
    };
    return inWords(Math.floor(num));
};

const KoiInvoices = () => {
    const [invoices, setInvoices] = useState([]);
    const [orders, setOrders] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('creator'); // 'creator' or 'history'
    const [searchTerm, setSearchTerm] = useState('');
    const [zoom, setZoom] = useState(1);
    const [showSuccess, setShowSuccess] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);

    // New Advanced Invoice State
    const [formData, setFormData] = useState({
        order: '',
        customer: '',
        invoiceNumber: `KOI-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        type: 'Fish',
        items: [{ name: '', quantity: 1, price: 0, total: 0 }],
        taxPhase: 'Inside TN',
        transportCharges: 0,
        totalAmount: 0,
        invoiceDate: new Date().toISOString().split('T')[0],
        companyInfo: {
            name: 'PVR KOI CENTRE',
            address: '334E, KUMARAN NAGAR, ILLUPUR TALUK,\nPerumanadu, Pudukkottai, Tamil Nadu, 622104',
            contact: '+91 9600124725, +91 9003424998',
            gstin: '33CQRPA2571H1ZW'
        },
        billingInfo: { name: '', address: '', phone: '', gstNo: '' },
        bankDetails: {
            accountNo: '7037881010',
            ifscCode: 'IDIB000N140',
            bankName: 'INDIAN BANK',
            branch: 'NATHAMPANNAI'
        }
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [invoicesRes, ordersRes, customersRes, stockRes] = await Promise.all([
                getKoiInvoices(),
                getKoiOrders(),
                getKoiCustomers(),
                getKoiStock()
            ]);
            setInvoices(invoicesRes.data);
            setOrders(ordersRes.data);
            setCustomers(customersRes.data);
            setInventory(stockRes.data);
        } catch (err) {
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    };

    const addItem = () => {
        setFormData({
            ...formData,
            items: [...formData.items, { name: '', quantity: 1, price: 0, total: 0 }]
        });
    };

    const removeItem = (idx) => {
        const newItems = formData.items.filter((_, i) => i !== idx);
        recalculateTotals(newItems);
    };

    const updateItem = (idx, field, val) => {
        const newItems = [...formData.items];
        newItems[idx][field] = val;

        if (field === 'name' && formData.type === 'Food') {
            const product = inventory.find(i => i.itemName === val);
            if (product) newItems[idx].price = product.sellingPrice || 0;
        }

        newItems[idx].total = (newItems[idx].quantity || 0) * (newItems[idx].price || 0);
        recalculateTotals(newItems);
    };

    const recalculateTotals = (items = formData.items) => {
        const subTotal = items.reduce((acc, curr) => acc + (curr.total || 0), 0);
        const transport = formData.transportCharges || 0;
        const taxBase = subTotal + transport;
        const taxAmount = taxBase * 0.18; // Standard 18% tax
        const total = taxBase + taxAmount;

        setFormData({
            ...formData,
            items,
            totalAmount: total
        });
    };

    useEffect(() => {
        recalculateTotals();
    }, [formData.transportCharges]);

    const handleCreateInvoice = async (e) => {
        if (e) e.preventDefault();
        try {
            const dataToSubmit = { ...formData };
            if (!dataToSubmit.order) delete dataToSubmit.order;

            await createKoiInvoice(dataToSubmit);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
            fetchData();

            setViewMode('history');

            // Reset form
            setFormData({
                order: '',
                customer: '',
                invoiceNumber: `KOI-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
                type: 'Fish',
                items: [{ name: '', quantity: 1, price: 0, total: 0 }],
                taxPhase: 'Inside TN',
                transportCharges: 0,
                totalAmount: 0,
                invoiceDate: new Date().toISOString().split('T')[0],
                companyInfo: formData.companyInfo,
                billingInfo: { name: '', address: '', phone: '', gstNo: '' },
                bankDetails: formData.bankDetails
            });
        } catch (err) {
            console.error('Error creating invoice:', err);
            alert('Error creating invoice');
        }
    };

    const handleDownloadPDF = () => {
        if (typeof window.html2pdf === 'undefined') {
            alert('PDF library is loading...');
            return;
        }
        setIsExporting(true);
        setTimeout(() => {
            const element = document.getElementById('koi-invoice-to-print');
            const opt = {
                margin: [10, 10],
                filename: `Koi_Invoice_${formData.invoiceNumber}.pdf`,
                image: { type: 'jpeg', quality: 1.0 },
                html2canvas: { scale: 3, useCORS: true },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };
            window.html2pdf().set(opt).from(element).save().then(() => setIsExporting(false));
        }, 300);
    };

    const handlePrint = () => {
        window.print();
    };

    const handleViewInvoice = (inv) => {
        setSelectedInvoice(inv);
        setIsViewModalOpen(true);
    };

    const handlePrintHistory = (inv) => {
        setSelectedInvoice(inv);
        setTimeout(() => {
            window.print();
        }, 300);
    };

    const filtered = invoices.filter(inv =>
        (inv.customer?.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (inv.invoiceNumber?.toLowerCase() || "").includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header section identical to Aqua */}
            <div className="flex items-center justify-between no-print">
                <div>
                    <h1 className="text-4xl font-bold text-gray-900 font-display">Invoice Management</h1>
                    <p className="text-gray-500 mt-1 text-lg">Generate, track, and manage customer billing.</p>
                </div>

                {viewMode === 'creator' && (
                    <div className="flex items-center gap-4 bg-white p-2 rounded-xl border border-gray-100 shadow-sm flex-wrap justify-end">
                        <div className="flex items-center gap-2 px-3 border-r border-gray-100 hidden md:flex">
                            <span className="text-xs font-bold text-gray-400 uppercase">{Math.round(zoom * 100)}%</span>
                            <div className="flex gap-1">
                                <button onClick={() => setZoom(Math.max(0.5, zoom - 0.1))} className="p-1 hover:bg-gray-100 rounded text-gray-500">-</button>
                                <button onClick={() => setZoom(Math.min(1.5, zoom + 0.1))} className="p-1 hover:bg-gray-100 rounded text-gray-500">+</button>
                                <button onClick={() => setZoom(1)} className="px-2 py-1 hover:bg-gray-100 rounded text-[10px] font-bold text-gray-500 uppercase">Reset</button>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button onClick={handleCreateInvoice} className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-black transition-all">
                                <CheckCircle2 size={14} /> Save Invoice
                            </button>
                            <button onClick={handlePrint} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-green-700 transition-all">
                                <Printer size={14} /> Print
                            </button>
                            <button onClick={handleDownloadPDF} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-blue-700 transition-all">
                                <Download size={14} /> Download PDF
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-8 border-b border-gray-100 no-print">
                <button
                    onClick={() => setViewMode('creator')}
                    className={`pb-4 text-sm font-bold transition-all relative ${viewMode === 'creator' ? 'text-primary-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    Advanced Invoice
                    {viewMode === 'creator' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-600 rounded-full" />}
                </button>
                <button
                    onClick={() => setViewMode('history')}
                    className={`pb-4 text-sm font-bold transition-all relative ${viewMode === 'history' ? 'text-primary-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    Invoice History
                    {viewMode === 'history' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-600 rounded-full" />}
                </button>
                <button
                    onClick={() => setViewMode('delete_history')}
                    className={`pb-4 text-sm font-bold transition-all relative ${viewMode === 'delete_history' ? 'text-primary-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    Delete History
                    {viewMode === 'delete_history' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-600 rounded-full" />}
                </button>
            </div>


            {viewMode === 'creator' ? (
                <div className="flex justify-center bg-gray-50 rounded-3xl p-4 md:p-8 min-h-[1000px] overflow-x-auto shadow-inner border border-gray-200">
                    <div
                        style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}
                        className="bg-white shadow-2xl w-[800px] min-h-[1100px] p-12 flex flex-col gap-6 relative"
                        id="koi-invoice-to-print"
                    >
                        {/* THE PROFESSIONAL TAX INVOICE TEMPLATE (Mirroring Aqua) */}
                        <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: '12px', width: '100%', border: '1px solid #b0b8cc' }}>
                            {/* TITLE BAR */}
                            <div style={{ textAlign: 'center', padding: '8px', fontWeight: 'bold', fontSize: '16px', background: '#eef2fb', color: '#1e3a8a', borderBottom: '1px solid #b0b8cc', letterSpacing: '4px' }}>
                                TAX INVOICE
                            </div>

                            {/* HEADER GRID */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr' }}>
                                {/* Left Section: Company & Bill To */}
                                <div style={{ borderRight: '1px solid #b0b8cc' }}>
                                    {/* Company Info */}
                                    <div style={{ padding: '12px', borderBottom: '1px solid #b0b8cc', textAlign: 'center' }}>
                                        <input
                                            style={{ fontSize: '24px', fontWeight: '900', color: '#1e3a8a', margin: 0, textAlign: 'center', border: 'none', width: '100%' }}
                                            value={formData.companyInfo.name}
                                            onChange={(e) => setFormData({ ...formData, companyInfo: { ...formData.companyInfo, name: e.target.value } })}
                                        />
                                        <textarea
                                            style={{ fontSize: '10px', color: '#666', margin: '4px 0', whiteSpace: 'pre-line', textAlign: 'center', border: 'none', width: '100%', resize: 'none' }}
                                            value={formData.companyInfo.address}
                                            onChange={(e) => setFormData({ ...formData, companyInfo: { ...formData.companyInfo, address: e.target.value } })}
                                        />
                                        <input
                                            style={{ fontSize: '10px', color: '#666', margin: 0, textAlign: 'center', border: 'none', width: '100%' }}
                                            value={formData.companyInfo.contact}
                                            onChange={(e) => setFormData({ ...formData, companyInfo: { ...formData.companyInfo, contact: e.target.value } })}
                                        />
                                        <div style={{ background: '#eef2fb', padding: '4px', marginTop: '8px', fontSize: '11px', fontWeight: 'bold', color: '#1e3a8a', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                                            GSTIN:
                                            <input
                                                style={{ background: 'transparent', border: 'none', fontWeight: 'bold', color: '#1e3a8a', width: '120px' }}
                                                value={formData.companyInfo.gstin}
                                                onChange={(e) => setFormData({ ...formData, companyInfo: { ...formData.companyInfo, gstin: e.target.value } })}
                                            />
                                        </div>
                                    </div>

                                    {/* BILL TO */}
                                    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                                        <div style={{ background: '#dde5f5', padding: '6px', textAlign: 'center', borderBottom: '1px solid #b0b8cc', fontWeight: 'bold', color: '#1e3a8a' }}>BILL TO</div>

                                        <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                                            <select
                                                className="no-print"
                                                style={{ width: '100%', padding: '6px', border: '1px solid #eee' }}
                                                onChange={(e) => {
                                                    const c = customers.find(x => x._id === e.target.value);
                                                    if (c) setFormData({ ...formData, customer: c._id, billingInfo: { name: c.name, address: c.address, phone: c.phone, gstNo: c.gstNo || '' } });
                                                }}
                                            >
                                                <option value="">Choose Customer</option>
                                                {customers.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                            </select>
                                            <input
                                                style={{ fontWeight: 'bold', fontSize: '14px', border: 'none', color: '#111', width: '100%' }}
                                                placeholder="Customer Name"
                                                value={formData.billingInfo.name}
                                                onChange={(e) => setFormData({ ...formData, billingInfo: { ...formData.billingInfo, name: e.target.value } })}
                                            />
                                            <textarea
                                                style={{ fontSize: '11px', border: 'none', resize: 'none', height: '40px', color: '#555', width: '100%' }}
                                                placeholder="Address"
                                                value={formData.billingInfo.address}
                                                onChange={(e) => setFormData({ ...formData, billingInfo: { ...formData.billingInfo, address: e.target.value } })}
                                            />
                                            <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                                                <b style={{ fontSize: '11px' }}>Phone:</b>
                                                <input
                                                    style={{ fontSize: '11px', border: 'none', color: '#333', flex: 1 }}
                                                    value={formData.billingInfo.phone}
                                                    onChange={(e) => setFormData({ ...formData, billingInfo: { ...formData.billingInfo, phone: e.target.value } })}
                                                />
                                            </div>
                                            <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                                                <b style={{ fontSize: '11px' }}>GSTIN:</b>
                                                <input
                                                    style={{ fontSize: '11px', border: 'none', color: '#333', flex: 1 }}
                                                    value={formData.billingInfo.gstNo}
                                                    placeholder="N/A"
                                                    onChange={(e) => setFormData({ ...formData, billingInfo: { ...formData.billingInfo, gstNo: e.target.value } })}
                                                />
                                            </div>
                                        </div>
                                        {/* Sales & Tax */}
                                        <div style={{ padding: '4px 10px', borderTop: '1px solid #eee', display: 'flex', flexDirection: 'column', gap: '3px', background: '#fcfcfc' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px' }}>
                                                <span style={{ color: '#888', fontWeight: 'bold' }}>TAX CATEGORY:</span>
                                                <select
                                                    style={{ border: 'none', fontSize: '10px', fontWeight: 'bold', background: 'transparent' }}
                                                    value={formData.taxPhase}
                                                    onChange={(e) => setFormData({ ...formData, taxPhase: e.target.value })}
                                                    className="no-print-select"
                                                >
                                                    <option value="Inside TN">Inside TN (CGST/SGST)</option>
                                                    <option value="Outside TN">Outside TN (IGST)</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Section: Invoice Info & Logo */}
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ display: 'flex', borderBottom: '1px solid #b0b8cc', height: '40px' }}>
                                        <div style={{ flex: 1, padding: '8px', fontWeight: 'bold', borderRight: '1px solid #b0b8cc', display: 'flex', alignItems: 'center', color: '#1e3a8a' }}>INVOICE NO.</div>
                                        <div style={{ flex: 1, padding: '8px', display: 'flex', alignItems: 'center' }}>
                                            <input
                                                style={{ border: 'none', fontWeight: 'bold', width: '100%' }}
                                                value={formData.invoiceNumber}
                                                onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', borderBottom: '1px solid #b0b8cc', height: '40px' }}>
                                        <div style={{ flex: 1, padding: '8px', fontWeight: 'bold', borderRight: '1px solid #b0b8cc', display: 'flex', alignItems: 'center', color: '#1e3a8a' }}>DATE</div>
                                        <div style={{ flex: 1, padding: '8px', display: 'flex', alignItems: 'center' }}>
                                            <input type="date" style={{ border: 'none', fontWeight: 'bold' }} value={formData.invoiceDate} onChange={(e) => setFormData({ ...formData, invoiceDate: e.target.value })} />
                                        </div>
                                    </div>

                                    <div style={{ padding: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1, minHeight: '200px' }}>
                                        <img src="/PVR.png" alt="Logo" style={{ maxHeight: '180px', maxWidth: '100%', objectFit: 'contain' }} />
                                    </div>

                                    <div style={{ borderTop: '1px solid #b0b8cc', padding: '4px 10px' }} className="no-print">
                                        <p style={{ fontSize: '9px', fontWeight: 'bold', color: '#666', margin: '0 0 4px 0', textAlign: 'center', letterSpacing: '0.5px', opacity: 0.8 }}>INVOICE TYPE</p>
                                        <div style={{ display: 'flex', gap: '4px' }}>
                                            {['Fish', 'Food'].map(t => (
                                                <button
                                                    key={t}
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, type: t, items: [{ name: '', quantity: 1, price: 0, total: 0 }] })}
                                                    style={{ flex: 1, padding: '3px 5px', fontSize: '10px', fontWeight: '800', border: '1px solid #eee', background: formData.type === t ? '#1e3a8a' : 'white', color: formData.type === t ? 'white' : '#666', borderRadius: '4px', transition: 'all 0.2s', textTransform: 'uppercase' }}
                                                >
                                                    {t}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* ITEMS TABLE */}
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ background: '#1e3a8a', color: 'white' }}>
                                        <th style={{ padding: '10px', border: '1px solid #3b5daa' }}>SL</th>
                                        <th style={{ padding: '10px', border: '1px solid #3b5daa', textAlign: 'left' }}>ITEM DESCRIPTION</th>
                                        <th style={{ padding: '10px', border: '1px solid #3b5daa' }}>QTY</th>
                                        <th style={{ padding: '10px', border: '1px solid #3b5daa', textAlign: 'right' }}>PRICE</th>
                                        <th style={{ padding: '10px', border: '1px solid #3b5daa', textAlign: 'right' }}>TOTAL</th>
                                        <th style={{ padding: '10px', border: '1px solid #3b5daa' }} className="no-print"></th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {formData.items.map((item, i) => (
                                        <tr key={i} style={{ height: '35px' }}>
                                            <td style={{ textAlign: 'center', border: '1px solid #eee' }}>{i + 1}</td>
                                            <td style={{ padding: '0 10px', border: '1px solid #eee' }}>
                                                {formData.type === 'Food' ? (
                                                    <select
                                                        style={{ width: '100%', border: 'none', fontWeight: 'bold' }}
                                                        value={item.name}
                                                        onChange={(e) => updateItem(i, 'name', e.target.value)}
                                                    >
                                                        <option value="">Select Product</option>
                                                        {inventory.map(prod => <option key={prod._id} value={prod.itemName}>{prod.itemName}</option>)}
                                                    </select>
                                                ) : (
                                                    <input
                                                        style={{ width: '100%', border: 'none', fontWeight: 'bold' }}
                                                        placeholder="Description"
                                                        value={item.name}
                                                        onChange={(e) => updateItem(i, 'name', e.target.value)}
                                                    />
                                                )}
                                            </td>
                                            <td style={{ border: '1px solid #eee', textAlign: 'center' }}>
                                                <input type="number" style={{ width: '50px', textAlign: 'center', border: 'none' }} value={item.quantity} onChange={(e) => updateItem(i, 'quantity', Number(e.target.value))} />
                                            </td>
                                            <td style={{ border: '1px solid #eee', textAlign: 'right', paddingRight: '10px' }}>
                                                <input type="number" style={{ width: '80px', textAlign: 'right', border: 'none' }} value={item.price} onChange={(e) => updateItem(i, 'price', Number(e.target.value))} />
                                            </td>
                                            <td style={{ border: '1px solid #eee', textAlign: 'right', paddingRight: '10px', fontWeight: 'bold' }}>
                                                ₹{item.total.toLocaleString()}
                                            </td>
                                            <td style={{ border: '1px solid #eee', textAlign: 'center' }} className="no-print">
                                                <button onClick={() => removeItem(i)} style={{ color: '#ef4444', fontWeight: 'bold', padding: '4px' }}>✕</button>
                                            </td>
                                        </tr>
                                    ))}
                                    <tr className="no-print">
                                        <td colSpan={6} style={{ textAlign: 'center', padding: '10px' }}>
                                            <button onClick={addItem} style={{ fontSize: '10px', fontWeight: 'bold', color: '#1e3a8a' }}>+ ADD ITEM</button>
                                        </td>
                                    </tr>
                                    {/* Empty rows to maintain height */}
                                    {[...Array(Math.max(0, 5 - formData.items.length))].map((_, i) => (
                                        <tr key={i} style={{ height: '35px' }}><td style={{ border: '1px solid #eee' }}></td><td style={{ border: '1px solid #eee' }}></td><td style={{ border: '1px solid #eee' }}></td><td style={{ border: '1px solid #eee' }}></td><td style={{ border: '1px solid #eee' }}></td><td style={{ border: '1px solid #eee' }} className="no-print"></td></tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* FOOTER SECTION */}
                            <div style={{ borderTop: '1px solid #b0b8cc' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr' }}>
                                    {/* Left: Total in Words */}
                                    <div style={{ padding: '15px', borderRight: '1px solid #b0b8cc', display: 'flex', alignItems: 'flex-end', minHeight: '100px' }}>
                                        <div style={{ display: 'flex', gap: '4px', alignItems: 'baseline' }}>
                                            <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#1e3a8a' }}>Total In Words:</span>
                                            <span style={{ fontSize: '10px', color: '#666', fontWeight: 'bold' }}>{numberToWords(formData.totalAmount)}</span>
                                        </div>
                                    </div>

                                    {/* Right: Calculations */}
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <div style={{ padding: '8px 15px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee' }}>
                                            <span style={{ color: '#1e3a8a', fontWeight: 'bold', fontSize: '10px' }}>TRANSPORT & INSTALLATION</span>
                                            <input type="number" style={{ width: '80px', textAlign: 'right', border: 'none', fontWeight: 'bold', fontSize: '12px' }} value={formData.transportCharges} onChange={(e) => setFormData({ ...formData, transportCharges: Number(e.target.value) })} />
                                        </div>
                                        {formData.taxPhase === 'Outside TN' ? (
                                            <div style={{ padding: '8px 15px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee' }}>
                                                <span style={{ color: '#1e3a8a', fontWeight: 'bold', fontSize: '10px' }}>IGST 18%</span>
                                                <span style={{ fontWeight: 'bold', color: '#333', fontSize: '12px' }}>₹{(formData.totalAmount - (formData.items.reduce((a, b) => a + (b.total || 0), 0) + formData.transportCharges)).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                            </div>
                                        ) : (
                                            <>
                                                <div style={{ padding: '8px 15px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee' }}>
                                                    <span style={{ color: '#1e3a8a', fontWeight: 'bold', fontSize: '10px' }}>CGST 9%</span>
                                                    <span style={{ fontWeight: 'bold', color: '#333', fontSize: '12px' }}>₹{((formData.totalAmount - (formData.items.reduce((a, b) => a + (b.total || 0), 0) + formData.transportCharges)) / 2).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                                </div>
                                                <div style={{ padding: '8px 15px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee' }}>
                                                    <span style={{ color: '#1e3a8a', fontWeight: 'bold', fontSize: '10px' }}>SGST 9%</span>
                                                    <span style={{ fontWeight: 'bold', color: '#333', fontSize: '12px' }}>₹{((formData.totalAmount - (formData.items.reduce((a, b) => a + (b.total || 0), 0) + formData.transportCharges)) / 2).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                                </div>
                                            </>
                                        )}
                                        <div style={{ padding: '15px', display: 'flex', justifyContent: 'space-between', background: '#dde5f5', color: '#1e3a8a', borderTop: '1px solid #b0b8cc' }}>
                                            <span style={{ fontWeight: 'bold', fontSize: '14px' }}>TOTAL AMOUNT</span>
                                            <span style={{ fontWeight: '900', fontSize: '18px' }}>₹{formData.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* BANK & SIGNATURE HEADERS */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', borderTop: '1px solid #b0b8cc', borderBottom: '1px solid #b0b8cc' }}>
                                <div style={{ background: '#dde5f5', color: '#1e3a8a', padding: '8px 15px', fontSize: '11px', fontWeight: 'bold', borderRight: '1px solid #b0b8cc' }}>BANK DETAILS</div>
                                <div style={{ background: '#dde5f5', color: '#1e3a8a', padding: '8px 15px', fontSize: '11px', fontWeight: 'bold', textAlign: 'center' }}>for PVR AQUACULTURE</div>
                            </div>

                            {/* BANK & SIGNATURE CONTENT */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', minHeight: '120px' }}>
                                <div style={{ borderRight: '1px solid #b0b8cc' }}>
                                    <table style={{ width: '100%', fontSize: '11px', borderCollapse: 'collapse' }}>
                                        <tbody>
                                            {[
                                                ['ACCOUNT NO', 'accountNo'],
                                                ['IFSC CODE', 'ifscCode'],
                                                ['BANK NAME', 'bankName'],
                                                ['BRANCH', 'branch']
                                            ].map(([label, field]) => (
                                                <tr key={label}>
                                                    <td style={{ padding: '6px 15px', fontWeight: 'bold', color: '#1e3a8a', width: '140px' }}>{label}</td>
                                                    <td style={{ padding: '6px 15px' }}>
                                                        <input
                                                            type="text"
                                                            style={{ width: '100%', border: 'none', outline: 'none', fontSize: '11px', background: 'transparent', color: '#333', fontWeight: 'bold' }}
                                                            value={formData.bankDetails[field]}
                                                            onChange={(e) => setFormData({
                                                                ...formData,
                                                                bankDetails: { ...formData.bankDetails, [field]: e.target.value }
                                                            })}
                                                        />
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '15px', textAlign: 'center' }}>
                                    <p style={{ margin: 0, fontSize: '11px', color: '#1e3a8a', fontWeight: 'bold' }}>Authorized Signature</p>
                                </div>
                            </div>

                            {/* THANK YOU BAR */}
                            <div style={{ borderTop: '1px solid #b0b8cc', padding: '12px', textAlign: 'center', background: 'white' }}>
                                <p style={{ margin: 0, fontSize: '14px', fontWeight: 'bold', color: '#1e3a8a', fontStyle: 'italic' }}>Thank You For Business!</p>
                            </div>


                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm no-print">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search invoices..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-lg focus:ring-1 focus:ring-gray-300 outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Date</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Invoice No</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Customer</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Type</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Amount</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 text-sm">
                                {filtered.length > 0 ? filtered.map((inv) => (
                                    <tr key={inv._id} className="hover:bg-gray-50/50 transition-all group">
                                        <td className="px-8 py-6 font-medium text-gray-600">{new Date(inv.date).toLocaleDateString()}</td>
                                        <td className="px-8 py-6 font-black text-gray-900 italic tracking-tighter">#{inv.invoiceNumber}</td>
                                        <td className="px-8 py-6">
                                            <div className="font-bold text-gray-900 tracking-tight">{inv.customer?.name}</div>
                                            <div className="text-[10px] text-gray-400 font-medium italic">{inv.customer?.phone}</div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${inv.type === 'Fish' ? 'bg-orange-50 text-orange-600 border border-orange-100' : 'bg-orange-50 text-orange-600 border border-orange-100'}`}>
                                                {inv.type}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 font-black text-gray-900 tracking-tight text-lg">
                                            <div className="flex items-center gap-0.5">
                                                <IndianRupee size={16} className="text-gray-400" />
                                                {inv.totalAmount.toLocaleString()}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex gap-2 justify-end no-print">
                                                <button
                                                    onClick={() => handleViewInvoice(inv)}
                                                    className="p-3 bg-gray-50 hover:bg-gray-100 text-gray-400 rounded-xl transition-all"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handlePrintHistory(inv)}
                                                    className="p-3 bg-gray-50 hover:bg-gray-100 text-gray-400 rounded-xl transition-all"
                                                >
                                                    <Printer size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={6} className="py-20 text-center text-gray-400 font-medium italic uppercase tracking-widest text-xs">No records found</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* View Modal */}
            <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="Invoice Preview" maxWidth="max-w-4xl">
                <div className="flex flex-col gap-6">
                    <div className="flex justify-end gap-3 no-print mb-4">
                        <button
                            onClick={handlePrint}
                            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-green-700 transition-all"
                        >
                            <Printer size={14} /> Print
                        </button>
                        <button
                            onClick={() => {
                                // Re-use the existing download logic but for the selected invoice
                                if (typeof window.html2pdf === 'undefined') {
                                    alert('PDF library is loading...');
                                    return;
                                }
                                setIsExporting(true);
                                setTimeout(() => {
                                    const element = document.getElementById('view-invoice-to-print');
                                    const opt = {
                                        margin: [10, 10],
                                        filename: `Koi_Invoice_${selectedInvoice?.invoiceNumber}.pdf`,
                                        image: { type: 'jpeg', quality: 1.0 },
                                        html2canvas: { scale: 3, useCORS: true },
                                        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
                                    };
                                    window.html2pdf().set(opt).from(element).save().then(() => setIsExporting(false));
                                }, 300);
                            }}
                            className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-orange-700 transition-all"
                        >
                            <Download size={14} /> Download PDF
                        </button>
                    </div>

                    <div className="overflow-auto bg-gray-100 p-8 rounded-2xl flex justify-center shadow-inner">
                        {selectedInvoice && (
                            <div className="bg-white shadow-2xl w-[800px] min-h-[1100px] p-12 flex flex-col gap-6 relative" id="view-invoice-to-print">
                                {/* PROFESSIONAL TAX INVOICE TEMPLATE (READ ONLY) */}
                                <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: '12px', width: '100%', border: '1px solid #b0b8cc' }}>
                                    <div style={{ textAlign: 'center', padding: '8px', fontWeight: 'bold', fontSize: '16px', background: '#eef2fb', color: '#1e3a8a', borderBottom: '1px solid #b0b8cc', letterSpacing: '4px' }}>
                                        TAX INVOICE
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr' }}>
                                        <div style={{ borderRight: '1px solid #b0b8cc' }}>
                                            <div style={{ padding: '12px', borderBottom: '1px solid #b0b8cc', textAlign: 'center' }}>
                                                <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#1e3a8a', margin: 0 }}>{selectedInvoice.companyInfo?.name}</h2>
                                                <p style={{ fontSize: '10px', color: '#666', margin: '4px 0', whiteSpace: 'pre-line' }}>{selectedInvoice.companyInfo?.address}</p>
                                                <p style={{ fontSize: '10px', color: '#666', margin: 0 }}>{selectedInvoice.companyInfo?.contact}</p>
                                                <div style={{ background: '#eef2fb', padding: '4px', marginTop: '8px', fontSize: '11px', fontWeight: 'bold', color: '#1e3a8a' }}>
                                                    GSTIN: {selectedInvoice.companyInfo?.gstin}
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                                                <div style={{ background: '#dde5f5', padding: '6px', textAlign: 'center', borderBottom: '1px solid #b0b8cc', fontWeight: 'bold', color: '#1e3a8a' }}>BILL TO</div>

                                                <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                                                    <p style={{ fontWeight: 'bold', fontSize: '14px', margin: 0, color: '#111' }}>{selectedInvoice.billingInfo?.name}</p>
                                                    <p style={{ fontSize: '11px', color: '#555', margin: 0 }}>{selectedInvoice.billingInfo?.address}</p>
                                                    <p style={{ margin: 0, color: '#333' }}><b>Phone:</b> {selectedInvoice.billingInfo?.phone}</p>
                                                    <p style={{ margin: 0, color: '#333' }}><b>GSTIN:</b> {selectedInvoice.billingInfo?.gstNo || 'N/A'}</p>
                                                </div>
                                                {/* Sales & Tax */}
                                                <div style={{ padding: '4px 10px', borderTop: '1px solid #eee', display: 'flex', flexDirection: 'column', gap: '3px', background: '#fcfcfc' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px' }}>
                                                        <span style={{ color: '#888', fontWeight: 'bold' }}>TAX CATEGORY:</span>
                                                        <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#333' }}>
                                                            {selectedInvoice.taxPhase === 'Outside TN' ? 'Outside TN (IGST)' : 'Inside TN (CGST/SGST)'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <div style={{ display: 'flex', borderBottom: '1px solid #b0b8cc', height: '40px' }}>
                                                <div style={{ flex: 1, padding: '8px', fontWeight: 'bold', borderRight: '1px solid #b0b8cc', display: 'flex', alignItems: 'center', color: '#1e3a8a' }}>INVOICE NO.</div>
                                                <div style={{ flex: 1, padding: '8px', display: 'flex', alignItems: 'center', fontWeight: 'bold' }}>{selectedInvoice.invoiceNumber}</div>
                                            </div>
                                            <div style={{ display: 'flex', borderBottom: '1px solid #b0b8cc', height: '40px' }}>
                                                <div style={{ flex: 1, padding: '8px', fontWeight: 'bold', borderRight: '1px solid #b0b8cc', display: 'flex', alignItems: 'center', color: '#1e3a8a' }}>DATE</div>

                                                <div style={{ flex: 1, padding: '8px', display: 'flex', alignItems: 'center' }}>{new Date(selectedInvoice.date).toLocaleDateString()}</div>
                                            </div>
                                            <div style={{ padding: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1, minHeight: '200px' }}>
                                                <img src="/PVR.png" alt="Logo" style={{ maxHeight: '180px', maxWidth: '100%', objectFit: 'contain' }} />
                                            </div>
                                            <div style={{ borderTop: '1px solid #b0b8cc', padding: '4px 10px', textAlign: 'center' }}>
                                                <span style={{ fontSize: '9px', fontWeight: 'bold', color: '#1e3a8a', textTransform: 'uppercase', letterSpacing: '1px' }}>TYPE: {selectedInvoice.type}</span>
                                            </div>

                                        </div>
                                    </div>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr style={{ background: '#1e3a8a', color: 'white' }}>
                                                <th style={{ padding: '10px', border: '1px solid #3b5daa' }}>SL</th>
                                                <th style={{ padding: '10px', border: '1px solid #3b5daa', textAlign: 'left' }}>ITEM DESCRIPTION</th>
                                                <th style={{ padding: '10px', border: '1px solid #3b5daa' }}>QTY</th>
                                                <th style={{ padding: '10px', border: '1px solid #3b5daa', textAlign: 'right' }}>PRICE</th>
                                                <th style={{ padding: '10px', border: '1px solid #3b5daa', textAlign: 'right' }}>TOTAL</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {selectedInvoice.items?.map((item, i) => (
                                                <tr key={i} style={{ height: '35px' }}>
                                                    <td style={{ textAlign: 'center', border: '1px solid #eee' }}>{i + 1}</td>
                                                    <td style={{ padding: '0 10px', border: '1px solid #eee', fontWeight: 'bold' }}>{item.name}</td>
                                                    <td style={{ border: '1px solid #eee', textAlign: 'center' }}>{item.quantity}</td>
                                                    <td style={{ border: '1px solid #eee', textAlign: 'right', paddingRight: '10px' }}>₹{item.price.toLocaleString()}</td>
                                                    <td style={{ border: '1px solid #eee', textAlign: 'right', paddingRight: '10px', fontWeight: 'bold' }}>₹{item.total.toLocaleString()}</td>
                                                </tr>
                                            ))}
                                            {[...Array(Math.max(0, 8 - (selectedInvoice.items?.length || 0)))].map((_, i) => (
                                                <tr key={i} style={{ height: '35px' }}><td style={{ border: '1px solid #eee' }}></td><td style={{ border: '1px solid #eee' }}></td><td style={{ border: '1px solid #eee' }}></td><td style={{ border: '1px solid #eee' }}></td><td style={{ border: '1px solid #eee' }}></td></tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {/* FOOTER SECTION */}
                                    <div style={{ borderTop: '1px solid #b0b8cc' }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr' }}>
                                            {/* Left: Total in Words */}
                                            <div style={{ padding: '15px', borderRight: '1px solid #b0b8cc', display: 'flex', alignItems: 'flex-end', minHeight: '100px' }}>
                                                <div style={{ display: 'flex', gap: '4px', alignItems: 'baseline' }}>
                                                    <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#1e3a8a' }}>Total In Words:</span>
                                                    <span style={{ fontSize: '10px', color: '#666', fontWeight: 'bold' }}>{numberToWords(selectedInvoice.totalAmount)}</span>
                                                </div>
                                            </div>

                                            {/* Right: Calculations */}
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <div style={{ padding: '8px 15px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee' }}>
                                                    <span style={{ color: '#1e3a8a', fontWeight: 'bold', fontSize: '10px' }}>TRANSPORT & INSTALLATION</span>
                                                    <span style={{ fontWeight: 'bold', fontSize: '12px' }}>₹{(selectedInvoice.transportCharges || 0).toLocaleString()}</span>
                                                </div>
                                                {selectedInvoice.taxPhase === 'Outside TN' ? (
                                                    <div style={{ padding: '8px 15px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee' }}>
                                                        <span style={{ color: '#1e3a8a', fontWeight: 'bold', fontSize: '10px' }}>IGST 18%</span>
                                                        <span style={{ fontWeight: 'bold', color: '#333', fontSize: '12px' }}>₹{(selectedInvoice.totalAmount - ((selectedInvoice.items?.reduce((a, c) => a + (c.total || 0), 0) || 0) + (selectedInvoice.transportCharges || 0))).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div style={{ padding: '8px 15px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee' }}>
                                                            <span style={{ color: '#1e3a8a', fontWeight: 'bold', fontSize: '10px' }}>CGST 9%</span>
                                                            <span style={{ fontWeight: 'bold', color: '#333', fontSize: '12px' }}>₹{((selectedInvoice.totalAmount - ((selectedInvoice.items?.reduce((a, c) => a + (c.total || 0), 0) || 0) + (selectedInvoice.transportCharges || 0))) / 2).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                                        </div>
                                                        <div style={{ padding: '8px 15px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee' }}>
                                                            <span style={{ color: '#1e3a8a', fontWeight: 'bold', fontSize: '10px' }}>SGST 9%</span>
                                                            <span style={{ fontWeight: 'bold', color: '#333', fontSize: '12px' }}>₹{((selectedInvoice.totalAmount - ((selectedInvoice.items?.reduce((a, c) => a + (c.total || 0), 0) || 0) + (selectedInvoice.transportCharges || 0))) / 2).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                                        </div>
                                                    </>
                                                )}
                                                <div style={{ padding: '15px', display: 'flex', justifyContent: 'space-between', background: '#dde5f5', color: '#1e3a8a', borderTop: '1px solid #b0b8cc' }}>
                                                    <span style={{ fontWeight: 'bold', fontSize: '14px' }}>TOTAL AMOUNT</span>
                                                    <span style={{ fontWeight: '900', fontSize: '18px' }}>₹{selectedInvoice.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* BANK & SIGNATURE HEADERS */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', borderTop: '1px solid #b0b8cc', borderBottom: '1px solid #b0b8cc' }}>
                                        <div style={{ background: '#dde5f5', color: '#1e3a8a', padding: '8px 15px', fontSize: '11px', fontWeight: 'bold', borderRight: '1px solid #b0b8cc' }}>BANK DETAILS</div>
                                        <div style={{ background: '#dde5f5', color: '#1e3a8a', padding: '8px 15px', fontSize: '11px', fontWeight: 'bold', textAlign: 'center' }}>for PVR AQUACULTURE</div>
                                    </div>

                                    {/* BANK & SIGNATURE CONTENT */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', minHeight: '120px' }}>
                                        <div style={{ borderRight: '1px solid #b0b8cc' }}>
                                            <table style={{ width: '100%', fontSize: '11px', borderCollapse: 'collapse' }}>
                                                <tbody>
                                                    {[
                                                        ['ACCOUNT NO', selectedInvoice.bankDetails?.accountNo],
                                                        ['IFSC CODE', selectedInvoice.bankDetails?.ifscCode],
                                                        ['BANK NAME', selectedInvoice.bankDetails?.bankName],
                                                        ['BRANCH', selectedInvoice.bankDetails?.branch]
                                                    ].map(([label, value]) => (
                                                        <tr key={label}>
                                                            <td style={{ padding: '6px 15px', fontWeight: 'bold', color: '#1e3a8a', width: '140px' }}>{label}</td>
                                                            <td style={{ padding: '6px 15px', color: '#333', fontWeight: 'bold' }}>{value}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '15px', textAlign: 'center' }}>
                                            <p style={{ margin: 0, fontSize: '11px', color: '#1e3a8a', fontWeight: 'bold' }}>Authorized Signature</p>
                                        </div>
                                    </div>

                                    {/* THANK YOU BAR */}
                                    <div style={{ borderTop: '1px solid #b0b8cc', padding: '12px', textAlign: 'center', background: 'white' }}>
                                        <p style={{ margin: 0, fontSize: '14px', fontWeight: 'bold', color: '#1e3a8a', fontStyle: 'italic' }}>Thank You For Business!</p>
                                    </div>


                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </Modal>

            {showSuccess && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-300 no-print">
                    <div className="bg-white rounded-3xl p-10 shadow-2xl flex flex-col items-center gap-4 animate-in zoom-in-95 duration-300 max-w-sm w-full mx-4 border border-gray-100">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-2">
                            <CheckCircle2 size={48} />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 text-center uppercase tracking-tight italic">Success!</h2>
                        <p className="text-gray-500 text-center font-medium">Invoice generated successfully!</p>
                        <div className="w-full h-1.5 bg-gray-100 rounded-full mt-4 overflow-hidden">
                            <div className="h-full bg-green-500 animate-progress origin-left"></div>
                        </div>
                    </div>
                </div>
            )}
        </div>

    );
};

export default KoiInvoices;
