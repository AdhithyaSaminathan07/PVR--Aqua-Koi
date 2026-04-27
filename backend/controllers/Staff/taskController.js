const Task = require('../../models/Staff/Task');
const Product = require('../../models/Aqua/Product');

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

        await task.save();
        res.json(task);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};
