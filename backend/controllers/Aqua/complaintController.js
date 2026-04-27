const Complaint = require('../../models/Aqua/Complaint');
const Task = require('../../models/Staff/Task');
const Customer = require('../../models/Aqua/Customer');
const Employee = require('../../models/Boss/Employee');

exports.createComplaint = async (req, res) => {
    try {
        const { customerId, description, category, priority, assignedTo: manualAssignedTo } = req.body;
        const complaint = await Complaint.create({ customerId, description, category, priority });
        
        // Auto-create task for the complaint
        const customer = await Customer.findById(customerId);
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        // Assignment logic: use manual selection if provided, otherwise find first available General staff/employee
        let assignedTo = manualAssignedTo || null;
        
        if (!assignedTo) {
            const employee = await Employee.findOne({ 
                branch: 'Aqua', 
                designation: { $regex: /general (employee|staff)/i } 
            });
            if (employee) {
                assignedTo = employee._id;
            }
        }

        const taskData = {
            title: `Complaint: ${category || 'General'} — ${customer.name}`,
            description: description,
            type: 'Client Issue',
            customerId: customerId,
            priority: priority || 'Medium',
            status: 'In Progress'
        };

        // Only add assignedTo if we found an employee
        if (assignedTo) {
            taskData.assignedTo = assignedTo;
        }

        try {
            const task = await Task.create(taskData);
            complaint.taskId = task._id;
            await complaint.save();
        } catch (taskErr) {
            console.error('Task auto-creation failed (non-critical):', taskErr.message);
            // Complaint is still created even if task creation fails
        }

        const populated = await Complaint.findById(complaint._id).populate('customerId').populate('taskId');
        res.status(201).json(populated);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};


exports.getComplaints = async (req, res) => {
    try {
        const complaints = await Complaint.find()
            .populate('customerId')
            .populate('taskId')
            .sort({ createdAt: -1 });
        res.json(complaints);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateComplaintStatus = async (req, res) => {
    try {
        const complaint = await Complaint.findByIdAndUpdate(
            req.params.id, 
            { status: req.body.status }, 
            { new: true }
        ).populate('customerId').populate('taskId');

        // Sync task status with complaint status
        if (complaint.taskId) {
            let taskStatus = 'In Progress';
            if (req.body.status === 'Resolved') taskStatus = 'Completed';
            await Task.findByIdAndUpdate(complaint.taskId, { status: taskStatus });
        }

        res.json(complaint);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.updateComplaint = async (req, res) => {
    try {
        const complaint = await Complaint.findByIdAndUpdate(req.params.id, req.body, { new: true })
            .populate('customerId').populate('taskId');
        res.json(complaint);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.deleteComplaint = async (req, res) => {
    try {
        const complaint = await Complaint.findById(req.params.id);
        // Also delete the linked task
        if (complaint?.taskId) {
            await Task.findByIdAndDelete(complaint.taskId);
        }
        await Complaint.findByIdAndDelete(req.params.id);
        res.json({ message: 'Complaint deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.convertToTask = async (req, res) => {
    try {
        const { assignedTo } = req.body;
        const complaint = await Complaint.findById(req.params.id).populate('customerId');
        
        if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
        if (complaint.taskId) return res.status(400).json({ message: 'Complaint already has a task' });

        const task = await Task.create({
            title: `Complaint: ${complaint.category || 'General'} — ${complaint.customerId?.name || 'Unknown'}`,
            description: complaint.description,
            type: 'Client Issue',
            customerId: complaint.customerId?._id,
            priority: complaint.priority || 'Medium',
            status: 'In Progress',
            assignedTo: assignedTo || null
        });

        complaint.taskId = task._id;
        await complaint.save();

        const populated = await Complaint.findById(complaint._id).populate('customerId').populate('taskId');
        res.json(populated);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};
