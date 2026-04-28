const Task = require('../../models/Staff/Task');
const Product = require('../../models/Aqua/Product');
const Service = require('../../models/Aqua/Service');
const Customer = require('../../models/Aqua/Customer');

exports.createTask = async (req, res) => {
    try {
        const task = await Task.create(req.body);
        res.status(201).json(task);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.getTasks = async (req, res) => {
    try {
        const tasks = await Task.find().populate('customerId').populate('assignedTo');
        res.json(tasks);
    } catch (err) {

        res.status(500).json({ message: err.message });
    }
};

exports.getAssignedTasks = async (req, res) => {
    try {
        const { employeeId } = req.user;
        if (!employeeId) {
            return res.status(400).json({ message: 'User is not linked to an employee record' });
        }
        const tasks = await Task.find({ assignedTo: employeeId }).populate('customerId').populate('assignedTo');
        res.json(tasks);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateTaskStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const task = await Task.findById(id);
        task.status = status;
        task.timeline.push({ status });

        if ((status === 'Completed' || status === 'Work completed') && task.materialsUsed.length > 0) {
            // Auto stock deduction
            for (let material of task.materialsUsed) {
                await Product.findByIdAndUpdate(material.productId, {
                    $inc: { stock: -material.quantity }
                });
            }
        }

        // AUTO SERVICE RESET: If this was a service task, reset the cycle in the Service module
        if ((status === 'Completed' || status === 'Work completed') && task.type === 'Service' && task.customerId) {
            const service = await Service.findOne({ customerId: task.customerId });
            if (service) {
                const visitDate = new Date();
                const newExpiry = new Date();
                newExpiry.setDate(newExpiry.getDate() + 60);

                // Add log entry
                service.logs.push({
                    visitDate,
                    notes: `Automatically reset from Task Management: ${task.description}`,
                    visitedBy: task.assignedTo,
                    replacedItems: task.materialsUsed || []
                });

                service.serviceExpiryDate = newExpiry;
                await service.save();

                // Update customer dates
                await Customer.findByIdAndUpdate(task.customerId, {
                    lastServiceDate: visitDate,
                    nextServiceDate: newExpiry
                });
            }
        }

        await task.save();
        res.json(task);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.updateTask = async (req, res) => {
    try {
        const { id } = req.params;
        const task = await Task.findByIdAndUpdate(id, req.body, { new: true })
            .populate('customerId')
            .populate('assignedTo');
        res.json(task);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};
