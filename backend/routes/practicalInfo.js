const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const PracticalInfo = require('../models/PracticalInfo');
const auth = require('../middleware/auth');

// Configure multer for PDF uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../uploads/practical-info');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'practical-info-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed'), false);
        }
    },
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

// Error handling middleware for multer
const handleMulterError = (error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ message: 'Le fichier est trop volumineux. Taille maximum : 10MB' });
        }
        return res.status(400).json({ message: 'Erreur lors de l\'upload du fichier' });
    } else if (error) {
        return res.status(400).json({ message: error.message });
    }
    next();
};

// Get all practical info (for students)
router.get('/', async (req, res) => {
    try {
        const practicalInfo = await PracticalInfo.find({ isActive: true })
            .sort({ createdAt: -1 });
        res.json(practicalInfo);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get practical info by category
router.get('/category/:category', async (req, res) => {
    try {
        const { category } = req.params;
        const practicalInfo = await PracticalInfo.find({ 
            category: category, 
            isActive: true 
        }).sort({ createdAt: -1 });
        res.json(practicalInfo);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get all practical info for admin (including inactive) - MUST BE BEFORE /:id
router.get('/admin/all', auth, async (req, res) => {
    try {
        const practicalInfo = await PracticalInfo.find()
            .sort({ createdAt: -1 });
        res.json(practicalInfo);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get single practical info
router.get('/:id', async (req, res) => {
    try {
        const practicalInfo = await PracticalInfo.findById(req.params.id);
        if (!practicalInfo) {
            return res.status(404).json({ message: 'Information pratique non trouvée' });
        }
        res.json(practicalInfo);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create new practical info (admin only)
router.post('/', auth, upload.single('pdfFile'), handleMulterError, async (req, res) => {
    try {
        const { title, description, type, content, category, isActive } = req.body;

        if (!title || !description || !type) {
            return res.status(400).json({ message: 'Titre, description et type sont requis' });
        }

        if (type === 'pdf' && !req.file) {
            return res.status(400).json({ message: 'Fichier PDF requis pour ce type' });
        }

        if (type === 'text' && !content) {
            return res.status(400).json({ message: 'Contenu requis pour le type texte' });
        }

        const practicalInfoData = {
            title,
            description,
            type,
            category: category || 'other',
            createdBy: req.user.id,
            isActive: isActive === 'true' // Correctly handle boolean from FormData
        };

        if (type === 'pdf') {
            practicalInfoData.filePath = `uploads/practical-info/${req.file.filename}`;
            practicalInfoData.fileName = req.file.originalname;
        } else if (type === 'text') {
            practicalInfoData.content = content;
        }

        const practicalInfo = new PracticalInfo(practicalInfoData);
        const savedPracticalInfo = await practicalInfo.save();
        res.status(201).json(savedPracticalInfo);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update practical info (admin only)
router.put('/:id', auth, upload.single('pdfFile'), handleMulterError, async (req, res) => {
    try {
        const { title, description, type, content, category, isActive } = req.body;
        const practicalInfo = await PracticalInfo.findById(req.params.id);

        if (!practicalInfo) {
            return res.status(404).json({ message: 'Information pratique non trouvée' });
        }

        // Update fields
        if (title) practicalInfo.title = title;
        if (description) practicalInfo.description = description;
        if (category) practicalInfo.category = category;
        if (isActive !== undefined) practicalInfo.isActive = (isActive === 'true'); // Correctly handle boolean

        // Handle type change
        if (type && type !== practicalInfo.type) {
            practicalInfo.type = type;
            
            if (type === 'pdf') {
                if (!req.file) {
                    return res.status(400).json({ message: 'Fichier PDF requis pour ce type' });
                }
                // Delete old file if exists
                if (practicalInfo.filePath) {
                    let fileToDelete = practicalInfo.filePath;
                    if (!path.isAbsolute(fileToDelete)) {
                        fileToDelete = path.join(__dirname, '..', fileToDelete);
                    }
                    if (fs.existsSync(fileToDelete)) {
                        fs.unlinkSync(fileToDelete);
                    }
                }
                practicalInfo.filePath = `uploads/practical-info/${req.file.filename}`;
                practicalInfo.fileName = req.file.originalname;
                practicalInfo.content = undefined;
            } else if (type === 'text') {
                if (!content) {
                    return res.status(400).json({ message: 'Contenu requis pour le type texte' });
                }
                // Delete old file if exists
                if (practicalInfo.filePath) {
                    let fileToDelete = practicalInfo.filePath;
                    if (!path.isAbsolute(fileToDelete)) {
                        fileToDelete = path.join(__dirname, '..', fileToDelete);
                    }
                    if (fs.existsSync(fileToDelete)) {
                        fs.unlinkSync(fileToDelete);
                    }
                }
                practicalInfo.content = content;
                practicalInfo.filePath = undefined;
                practicalInfo.fileName = undefined;
            }
        } else if (type === 'text' && content) {
            practicalInfo.content = content;
        }

        const updatedPracticalInfo = await practicalInfo.save();
        res.json(updatedPracticalInfo);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete practical info (admin only)
router.delete('/:id', auth, async (req, res) => {
    try {
        const practicalInfo = await PracticalInfo.findById(req.params.id);
        if (!practicalInfo) {
            return res.status(404).json({ message: 'Information pratique non trouvée' });
        }

        // Delete file if exists
        if (practicalInfo.filePath) {
            let fileToDelete = practicalInfo.filePath;
            if (!path.isAbsolute(fileToDelete)) {
                fileToDelete = path.join(__dirname, '..', fileToDelete);
            }
            if (fs.existsSync(fileToDelete)) {
                fs.unlinkSync(fileToDelete);
            }
        }

        await PracticalInfo.findByIdAndDelete(req.params.id);
        res.json({ message: 'Information pratique supprimée avec succès' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router; 