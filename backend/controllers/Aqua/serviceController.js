const Service = require('../../models/Aqua/Service');
const Customer = require('../../models/Aqua/Customer');

exports.getAllServices = async (req, res) => {
    try {
        const services = await Service.find()
            .populate('customerId')
            .populate('logs.visitedBy')
            .populate('logs.replacedItems.productId');
        res.json(services);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createService = async (req, res) => {
    try {
        const service = new Service(req.body);
        if (req.body.installationDate) {
            const expiry = new Date(req.body.installationDate);
            expiry.setDate(expiry.getDate() + 60);
            service.serviceExpiryDate = expiry;
        }
        // Seed default components if none provided
        if (!service.componentLifecycles || service.componentLifecycles.length === 0) {
            const installDate = new Date(req.body.installationDate || Date.now());
            service.componentLifecycles = [
                { componentName: 'UV Light Bulb', lifespanYears: 1, lastReplacementDate: installDate, nextReplacementDate: new Date(installDate.getFullYear() + 1, installDate.getMonth(), installDate.getDate()) },
                { componentName: 'Filtration Mesh', lifespanYears: 1, lastReplacementDate: installDate, nextReplacementDate: new Date(installDate.getFullYear() + 1, installDate.getMonth(), installDate.getDate()) },
                { componentName: 'Pump Seals', lifespanYears: 1, lastReplacementDate: installDate, nextReplacementDate: new Date(installDate.getFullYear() + 1, installDate.getMonth(), installDate.getDate()) },
            ];
        }
        await service.save();

        // Update customer's lastServiceDate
        if (req.body.customerId) {
            await Customer.findByIdAndUpdate(req.body.customerId, {
                lastServiceDate: req.body.installationDate || new Date(),
                nextServiceDate: service.serviceExpiryDate
            });
        }

        res.status(201).json(service);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Get service reminders — overdue + upcoming within 7 days
exports.getReminders = async (req, res) => {
    try {
        const now = new Date();
        const in7Days = new Date();
        in7Days.setDate(in7Days.getDate() + 7);

        const services = await Service.find().populate('customerId');

        const overdue = [];
        const upcoming = [];
        const componentAlerts = [];

        services.forEach(s => {
            const customerName = s.customerId?.name || 'Unknown';
            const customerPhone = s.customerId?.phone || '';

            // 60-day service expiry check
            if (s.serviceExpiryDate) {
                const expiry = new Date(s.serviceExpiryDate);
                if (expiry < now) {
                    overdue.push({ serviceId: s._id, customer: customerName, phone: customerPhone, expiryDate: s.serviceExpiryDate, type: 'service', daysOverdue: Math.ceil((now - expiry) / (1000*60*60*24)) });
                } else if (expiry <= in7Days) {
                    const daysLeft = Math.ceil((expiry - now) / (1000*60*60*24));
                    upcoming.push({ serviceId: s._id, customer: customerName, phone: customerPhone, expiryDate: s.serviceExpiryDate, type: 'service', daysLeft });
                }
            }

            // Component lifecycle alerts
            (s.componentLifecycles || []).forEach(comp => {
                if (comp.nextReplacementDate) {
                    const nextDate = new Date(comp.nextReplacementDate);
                    const daysLeft = Math.ceil((nextDate - now) / (1000*60*60*24));
                    if (daysLeft <= 30) {
                        componentAlerts.push({
                            serviceId: s._id,
                            customer: customerName,
                            component: comp.componentName,
                            nextReplacementDate: comp.nextReplacementDate,
                            daysLeft,
                            overdue: daysLeft < 0
                        });
                    }
                }
            });
        });

        res.json({ overdue, upcoming, componentAlerts });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Add a service visit log
exports.addServiceLog = async (req, res) => {
    try {
        const { id } = req.params;
        const { visitDate, notes, visitedBy, replacedItems } = req.body;
        const service = await Service.findById(id);
        if (!service) return res.status(404).json({ message: 'Service not found' });

        service.logs.push({ visitDate: visitDate || new Date(), notes, visitedBy, replacedItems: replacedItems || [] });

        // Reset the 60-day cycle from this visit
        const newExpiry = new Date(visitDate || Date.now());
        newExpiry.setDate(newExpiry.getDate() + 60);
        service.serviceExpiryDate = newExpiry;

        await service.save();

        // Update customer dates
        if (service.customerId) {
            await Customer.findByIdAndUpdate(service.customerId, {
                lastServiceDate: visitDate || new Date(),
                nextServiceDate: newExpiry
            });
        }

        res.json(service);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.getNearbyServices = async (req, res) => {
    try {
        const { lat, lng } = req.query;
        const customers = await Customer.find();
        const nearby = customers.map(c => {
            const distance = Math.sqrt(
                Math.pow((c.location?.lat || 0) - Number(lat), 2) +
                Math.pow((c.location?.lng || 0) - Number(lng), 2)
            ) * 111;
            return { ...c._doc, distance: distance.toFixed(2) };
        }).sort((a, b) => a.distance - b.distance);
        res.json(nearby.slice(0, 10));
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateLifecycle = async (req, res) => {
    try {
        const { id } = req.params;
        const { componentName, lastReplacementDate } = req.body;
        const service = await Service.findById(id);

        const index = service.componentLifecycles.findIndex(c => c.componentName === componentName);
        if (index > -1) {
            service.componentLifecycles[index].lastReplacementDate = lastReplacementDate;
            const next = new Date(lastReplacementDate);
            next.setFullYear(next.getFullYear() + 1);
            service.componentLifecycles[index].nextReplacementDate = next;
        } else {
            const next = new Date(lastReplacementDate);
            next.setFullYear(next.getFullYear() + 1);
            service.componentLifecycles.push({
                componentName,
                lifespanYears: 1,
                lastReplacementDate,
                nextReplacementDate: next
            });
        }

        await service.save();
        res.json(service);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};
