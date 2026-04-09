const Service = require('../models/Service');
const Customer = require('../models/Customer');

exports.getAllServices = async (req, res) => {
    try {
        const services = await Service.find().populate('customerId');
        res.json(services);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createService = async (req, res) => {
    try {
        const service = new Service(req.body);
        if (req.body.installationDate) {
            // Set expiry to 60 days after installation
            const expiry = new Date(req.body.installationDate);
            expiry.setDate(expiry.getDate() + 60);
            service.serviceExpiryDate = expiry;
        }
        await service.save();
        res.status(201).json(service);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.getNearbyServices = async (req, res) => {
    try {
        const { lat, lng } = req.query;
        const customers = await Customer.find();
        
        // Simple distance calculation (Haversine-like or straight line for demo)
        const nearby = customers.map(c => {
            const distance = Math.sqrt(
                Math.pow((c.location?.lat || 0) - Number(lat), 2) + 
                Math.pow((c.location?.lng || 0) - Number(lng), 2)
            ) * 111; // Approx km
            return {
                ...c._doc,
                distance: distance.toFixed(2)
            };
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
            next.setFullYear(next.getFullYear() + 1); // 1 year lifespan
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

