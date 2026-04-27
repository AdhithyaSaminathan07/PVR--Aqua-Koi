const Order = require('../../models/Aqua/Order');
const Customer = require('../../models/Aqua/Customer');
const Complaint = require('../../models/Aqua/Complaint');
const Product = require('../../models/Aqua/Product');
const KoiOrder = require('../../models/Koi/KoiOrder');
const KoiCustomer = require('../../models/Koi/KoiCustomer');
const KoiFoodInventory = require('../../models/Koi/KoiFoodInventory');

exports.getBossStats = async (req, res) => {
    try {
        // Aggregate Aqua Stats
        const [
            aquaOrders,
            aquaCustomers,
            aquaComplaints,
            aquaProducts
        ] = await Promise.all([
            Order.find(),
            Customer.countDocuments(),
            Complaint.find(),
            Product.find()
        ]);

        const aquaRevenue = aquaOrders.reduce((acc, o) => acc + (o.totalAmount || 0), 0);
        const aquaResolvedComplaints = aquaComplaints.filter(c => c.status === 'Resolved').length;

        // Aggregate Koi Stats
        const [
            koiOrders,
            koiCustomers,
            koiFoodInventory
        ] = await Promise.all([
            KoiOrder.find(),
            KoiCustomer.countDocuments(),
            KoiFoodInventory.find()
        ]);

        const koiRevenue = koiOrders.reduce((acc, o) => acc + (o.totalAmount || 0), 0);

        // Combined Stats
        const stats = {
            totalRevenue: aquaRevenue + koiRevenue,
            totalOrders: aquaOrders.length + koiOrders.length,
            totalCustomers: aquaCustomers + koiCustomers,
            resolutionRate: aquaComplaints.length > 0
                ? ((aquaResolvedComplaints / aquaComplaints.length) * 100).toFixed(1)
                : 100,
            branches: {
                aqua: {
                    revenue: aquaRevenue,
                    orders: aquaOrders.length,
                    customers: aquaCustomers,
                    lowStock: aquaProducts.filter(p => (p.stock || 0) <= (p.lowStockThreshold || 5)).length
                },
                koi: {
                    revenue: koiRevenue,
                    orders: koiOrders.length,
                    customers: koiCustomers,
                    lowStock: koiFoodInventory.filter(p => (p.totalAvailableQuantity || 0) <= (p.lowStockThreshold || 5)).length
                }
            },
            recentActivity: [
                ...aquaOrders.slice(0, 3).map(o => ({ title: 'New Aqua Order', val: `₹${o.totalAmount}`, type: 'Aqua' })),
                ...koiOrders.slice(0, 3).map(o => ({ title: 'New Koi Order', val: `₹${o.totalAmount}`, type: 'Koi' }))
            ].sort((a, b) => b.createdAt - a.createdAt).slice(0, 5)
        };

        res.json(stats);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
