const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Student = require('../models/Student');
const Admin = require('../models/admin');
const auth = require('../middleware/auth');

// Student login route
router.post('/student/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const student = await Student.findOne({ email });

    if (!student) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: student._id },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      token,
      student: {
        id: student._id,
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email,
        studentId: student.studentId,
        class: student.class
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin login route
router.post('/admin/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if admin exists
        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
        }

        // Check password
        const isMatch = await admin.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: admin._id, role: admin.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            admin: {
                id: admin._id,
                fullName: admin.fullName,
                email: admin.email,
                role: admin.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Erreur lors de la connexion' });
    }
});

// Get current admin
router.get('/me', auth, async (req, res) => {
    try {
        const admin = await Admin.findById(req.user.id).select('-password');
        if (!admin) {
            return res.status(404).json({ message: 'Administrateur non trouvé' });
        }
        res.json(admin);
    } catch (error) {
        console.error('Get admin error:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// Create first admin (only if no admin exists)
router.post('/setup', async (req, res) => {
    try {
        const adminCount = await Admin.countDocuments();
        if (adminCount > 0) {
            return res.status(403).json({ message: 'Un administrateur existe déjà' });
        }

        const { fullName, email, password } = req.body;
        const admin = new Admin({
            fullName,
            email,
            password,
            role: 'super_admin'
        });

        await admin.save();

        res.status(201).json({ message: 'Administrateur créé avec succès' });
    } catch (error) {
        console.error('Setup error:', error);
        res.status(500).json({ message: 'Erreur lors de la création de l\'administrateur' });
    }
});

// Logout
router.post('/logout', auth, (req, res) => {
    res.json({ message: 'Déconnexion réussie' });
});

module.exports = router; 