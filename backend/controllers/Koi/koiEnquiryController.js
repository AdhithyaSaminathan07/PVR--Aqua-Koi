const KoiEnquiry = require('../../models/Koi/KoiEnquiry');

exports.createEnquiry = async (req, res) => {
    try {
        const enquiry = await KoiEnquiry.create(req.body);
        res.status(201).json(enquiry);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.getEnquiries = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const enquiries = await KoiEnquiry.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await KoiEnquiry.countDocuments();

        res.json({
            enquiries,
            page,
            pages: Math.ceil(total / limit),
            total
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateEnquiryStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const enquiry = await KoiEnquiry.findByIdAndUpdate(req.params.id, { status }, { new: true });
        res.json(enquiry);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.deleteEnquiry = async (req, res) => {
    try {
        await KoiEnquiry.findByIdAndDelete(req.params.id);
        res.json({ message: 'Enquiry deleted' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};
