const Complaint = require('../../models/Aqua/Complaint');
const Task = require('../../models/Staff/Task');
const Customer = require('../../models/Aqua/Customer');

exports.createComplaint = async (req, res) => {
    try {
        const { customerId, description, siteImages } = req.body;
        const complaint = await Complaint.create({ customerId, description, siteImages });
        
        // Auto-create task for the complaint
        const customer = await Customer.findById(req.body.customerId);
        const task = await Task.create({
            title: `Complaint from ${customer.name}`,
            description: req.body.description,
            type: 'Client Issue',
            customerId: req.body.customerId,
            status: 'In Progress'
        });

        complaint.taskId = task._id;
        await complaint.save();

        res.status(201).json(complaint);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};


exports.getComplaints = async (req, res) => {
    try {
        const complaints = await Complaint.find().populate('customerId');
        res.json(complaints);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateComplaintStatus = async (req, res) => {
    try {
        const complaint = await Complaint.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
        res.json(complaint);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.updateComplaint = async (req, res) => {
    try {
        const complaint = await Complaint.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(complaint);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.deleteComplaint = async (req, res) => {
    try {
        await Complaint.findByIdAndDelete(req.params.id);
        res.json({ message: 'Complaint deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
