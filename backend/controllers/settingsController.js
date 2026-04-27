const Settings = require('../models/Settings');

// @desc    Get settings by branch
// @route   GET /api/settings?branch=Aqua
// @access  Private/Admin
const getSettings = async (req, res) => {
    try {
        const branch = req.query.branch || 'Aqua';
        console.log('Fetching settings for branch:', branch);

        // Use findOneAndUpdate with upsert to avoid race conditions and handle creation in one step
        let settings = await Settings.findOneAndUpdate(
            { branch },
            {
                $setOnInsert: {
                    branch,
                    locationRestriction: {
                        isEnabled: false,
                        latitude: 0,
                        longitude: 0,
                        radius: 150
                    }
                }
            },
            { new: true, upsert: true, runValidators: true }
        );

        res.json(settings);
    } catch (error) {
        console.error('SERVER ERROR in getSettings:', error);
        res.status(500).json({ message: 'Failed to fetch settings', error: error.message });
    }
};

// @desc    Update settings by branch
// @route   PUT /api/settings?branch=Aqua
// @access  Private/Admin
const updateSettings = async (req, res) => {
    try {
        const branch = req.query.branch || 'Aqua';
        let settings = await Settings.findOne({ branch });

        if (!settings) {
            settings = new Settings({ ...req.body, branch });
        } else {
            // Update only provided fields
            if (req.body.locationRestriction) {
                settings.locationRestriction = {
                    ...settings.locationRestriction,
                    ...req.body.locationRestriction
                };
            }
        }
        const updatedSettings = await settings.save();
        res.json(updatedSettings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getSettings,
    updateSettings
};
