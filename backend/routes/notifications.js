const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');

// Configuration de multer pour le stockage des images
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/notifications');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'notification-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // Limite de 5MB
    },
    fileFilter: function (req, file, cb) {
        // Accepter uniquement les images
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
            return cb(new Error('Seules les images sont autorisées!'), false);
        }
        cb(null, true);
    }
});

// Route pour l'upload d'image
router.post('/upload-image', auth, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Aucune image n\'a été uploadée' });
        }

        // Construire l'URL de l'image
        const imageUrl = `/uploads/notifications/${req.file.filename}`;
        
        res.json({ imageUrl });
    } catch (error) {
        console.error('Erreur lors de l\'upload de l\'image:', error);
        res.status(500).json({ message: 'Erreur lors de l\'upload de l\'image' });
    }
});

// Get all notifications (protected route)
router.get('/', auth, async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 });
    // Renvoyer directement les notifications sans modifier imageUrl
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new notification (protected route)
router.post('/', auth, async (req, res) => {
  try {
    const { title, message, type, imageUrl } = req.body;
    const notification = new Notification({
      title,
      message,
      type,
      imageUrl
    });

    await notification.save();
    res.status(201).json({ message: 'Notification created successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get notification by ID (protected route)
router.get('/:id', auth, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    res.json(notification);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update notification status (protected route)
router.put('/:id', auth, async (req, res) => {
  try {
    const { isActive } = req.body;
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    notification.isActive = isActive;
    await notification.save();
    res.json({ message: 'Notification updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete notification (protected route)
router.delete('/:id', auth, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    await Notification.findByIdAndDelete(req.params.id);
    res.json({ message: 'Notification deleted successfully' });
  } catch (err) {
    console.error('Error deleting notification:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 