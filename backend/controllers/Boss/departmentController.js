const Department = require('../../models/Boss/Department');

exports.getDepartments = async (req, res) => {
    try {
        const branch = req.query.branch || 'Aqua';
        const departments = await Department.find({ branch }).sort({ name: 1 });
        res.json(departments);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createDepartment = async (req, res) => {
    try {
        const department = await Department.create(req.body);
        res.status(201).json(department);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.deleteDepartment = async (req, res) => {
    try {
        const department = await Department.findByIdAndDelete(req.params.id);
        if (!department) return res.status(404).json({ message: 'Department not found' });
        res.json({ message: 'Department deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
