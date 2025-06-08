const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// Get Firebase configuration
router.get('/firebase', auth, async (req, res) => {
    try {
        // In a real application, you would store these in a database
        const config = {
            apiKey: process.env.FIREBASE_API_KEY,
            projectId: process.env.FIREBASE_PROJECT_ID
        };
        res.json(config);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching Firebase configuration' });
    }
});

// Update Firebase configuration
router.post('/firebase', auth, async (req, res) => {
    try {
        const { apiKey, projectId } = req.body;
        
        // In a real application, you would update these in a database
        process.env.FIREBASE_API_KEY = apiKey;
        process.env.FIREBASE_PROJECT_ID = projectId;

        res.json({ message: 'Firebase configuration updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating Firebase configuration' });
    }
});

module.exports = router; 