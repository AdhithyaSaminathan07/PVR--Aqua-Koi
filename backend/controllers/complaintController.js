const Complaint = require('../models/Complaint');
const Task = require('../models/Task');
const Customer = require('../models/Customer');

exports.createComplaint = async (req, res) => {
    try {
        const complaint = await Complaint.create(req.body);
        
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
