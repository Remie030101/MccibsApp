const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const auth = require('../middleware/auth');

// Get all upcoming events (for students)
router.get('/', async (req, res) => {
    try {
        const events = await Event.find({ startDate: { $gte: new Date() } })
            .sort({ startDate: 1 });
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get all events (for admin)
router.get('/all', auth, async (req, res) => {
    try {
        const events = await Event.find().sort({ startDate: -1 });
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create new event (admin only)
router.post('/', auth, async (req, res) => {
    const { title, description, startDate, endDate, location, category } = req.body;

    if (!title || !description || !startDate || !endDate) {
        return res.status(400).json({ message: 'Title, description, start date, and end date are required.' });
    }

    try {
        const newEvent = new Event({
            title,
            description,
            startDate,
            endDate,
            location,
            category,
            createdBy: req.user.id
        });

        const savedEvent = await newEvent.save();
        res.status(201).json(savedEvent);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update event (admin only)
router.put('/:id', auth, async (req, res) => {
    try {
        const updatedEvent = await Event.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        if (!updatedEvent) {
            return res.status(404).json({ message: 'Event not found.' });
        }

        res.json(updatedEvent);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete event (admin only)
router.delete('/:id', auth, async (req, res) => {
    try {
        const event = await Event.findByIdAndDelete(req.params.id);

        if (!event) {
            return res.status(404).json({ message: 'Event not found.' });
        }

        res.json({ message: 'Event deleted successfully.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router; 