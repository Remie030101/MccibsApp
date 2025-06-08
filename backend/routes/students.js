const express = require('express');
const router = express.Router();
const multer = require('multer');
const csv = require('csv-parse');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const Student = require('../models/Student');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const path = require('path');

// Configure multer for file upload
const uploadMulter = multer({ dest: 'uploads/' });

// Get current student profile
router.get('/profile', auth, async (req, res) => {
  try {
    console.log('ID reçu du token :', req.user.id);
    const student = await Student.findById(req.user.id).select('-password');
    if (!student) {
      return res.status(404).json({ message: 'Étudiant non trouvé' });
    }
    res.json(student);
  } catch (error) {
    console.error('Error fetching student profile:', error);
    res.status(500).json({ message: "Erreur lors de la récupération de l'étudiant", error: error.message });
  }
});

// Get all students
router.get('/', auth, async (req, res) => {
    try {
        const students = await Student.find().select('-password');
        res.json(students);
    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération des étudiants' });
    }
});

// Get a single student
router.get('/:id', auth, async (req, res) => {
    try {
        const student = await Student.findById(req.params.id).select('-password');
        if (!student) {
            return res.status(404).json({ message: 'Étudiant non trouvé' });
        }
        res.json(student);
    } catch (error) {
        console.error('Error fetching student:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération de l\'étudiant' });
    }
});

// Add a single student
router.post('/', auth, async (req, res) => {
    try {
        const { studentId, firstName, lastName, fullName, email, class: studentClass, password } = req.body;

        // Check if student already exists
        const existingStudent = await Student.findOne({ 
            $or: [
                { email },
                { studentId }
            ]
        });
        
        if (existingStudent) {
            if (existingStudent.email === email) {
                return res.status(400).json({ message: 'Un étudiant avec cet email existe déjà' });
            }
            if (existingStudent.studentId === studentId) {
                return res.status(400).json({ message: 'Un étudiant avec cet ID existe déjà' });
            }
        }

        // Create new student
        const student = new Student({
            studentId,
            firstName,
            lastName,
            fullName,
            email,
            class: studentClass,
            password
        });

        await student.save();
        res.status(201).json({ 
            message: 'Étudiant ajouté avec succès',
            _id: student._id
        });
    } catch (error) {
        console.error('Error adding student:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ 
                message: 'Données invalides',
                errors: Object.values(error.errors).map(err => err.message)
            });
        }
        res.status(500).json({ message: 'Erreur lors de l\'ajout de l\'étudiant' });
    }
});

// Add multiple students via CSV
router.post('/bulk', auth, uploadMulter.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'Aucun fichier n\'a été uploadé' });
    }

    const results = {
        success: 0,
        failed: 0,
        errors: []
    };

    const parser = fs.createReadStream(req.file.path)
        .pipe(csv.parse({
            columns: true,
            skip_empty_lines: true
        }));

    for await (const record of parser) {
        try {
            // Check if student already exists
            const existingStudent = await Student.findOne({ email: record.email });
            if (existingStudent) {
                results.failed++;
                results.errors.push(`Étudiant avec l'email ${record.email} existe déjà`);
                continue;
            }

            // Create new student
            const student = new Student({
                studentId: record.studentId,
                firstName: record.firstName,
                lastName: record.lastName,
                fullName: record.fullName,
                email: record.email,
                class: record.class,
                password: record.password || 'password123' // Default password if not provided
            });

            await student.save();
            results.success++;
        } catch (error) {
            results.failed++;
            results.errors.push(`Erreur pour ${record.email}: ${error.message}`);
        }
    }

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    res.json({
        message: 'Import terminé',
        results
    });
});

// Delete a student
router.delete('/:id', auth, async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (!student) {
            return res.status(404).json({ message: 'Étudiant non trouvé' });
        }

        await Student.findByIdAndDelete(req.params.id);
        res.json({ message: 'Étudiant supprimé avec succès' });
    } catch (error) {
        console.error('Error deleting student:', error);
        res.status(500).json({ message: 'Erreur lors de la suppression de l\'étudiant' });
    }
});

// Update a student
router.put('/:id', auth, async (req, res) => {
    try {
        const { studentId, firstName, lastName, fullName, email, class: studentClass, password } = req.body;
        
        // Check if email is already taken by another student
        const existingStudent = await Student.findOne({ 
            email, 
            _id: { $ne: req.params.id } 
        });
        if (existingStudent) {
            return res.status(400).json({ message: 'Un étudiant avec cet email existe déjà' });
        }

        // Check if studentId is already taken by another student
        const existingStudentId = await Student.findOne({ 
            studentId, 
            _id: { $ne: req.params.id } 
        });
        if (existingStudentId) {
            return res.status(400).json({ message: 'Un étudiant avec cet ID existe déjà' });
        }

        const student = await Student.findById(req.params.id);
        if (!student) {
            return res.status(404).json({ message: 'Étudiant non trouvé' });
        }

        // Si la classe change et qu'il y a une photo, déplacer la photo
        if (student.class !== studentClass && student.photo) {
            const oldPath = path.join(__dirname, '..', student.photo);
            const newDir = path.join(__dirname, '..', 'uploads', 'student-photos', studentClass.replace(/\s+/g, '_'));
            const newPath = path.join(newDir, path.basename(student.photo));

            // Créer le nouveau dossier de classe si nécessaire
            if (!fs.existsSync(newDir)) {
                fs.mkdirSync(newDir, { recursive: true });
            }

            // Déplacer la photo
            if (fs.existsSync(oldPath)) {
                fs.renameSync(oldPath, newPath);
                student.photo = path.relative(path.join(__dirname, '..'), newPath).replace(/\\/g, '/');
            }
        }

        // Update student fields
        student.studentId = studentId;
        student.firstName = firstName;
        student.lastName = lastName;
        student.fullName = fullName;
        student.email = email;
        student.class = studentClass;
        if (password) {
            student.password = password;
        }

        await student.save();
        res.json({ message: 'Étudiant mis à jour avec succès' });
    } catch (error) {
        console.error('Error updating student:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ 
                message: 'Données invalides',
                errors: Object.values(error.errors).map(err => err.message)
            });
        }
        res.status(500).json({ message: 'Erreur lors de la mise à jour de l\'étudiant' });
    }
});

// Upload student photo
router.post('/:id/photo', auth, upload.single('photo'), async (req, res) => {
  try {
    console.log('Début de l\'upload de photo');
    console.log('Fichier reçu:', req.file);
    console.log('ID étudiant:', req.params.id);

    if (!req.file) {
      console.log('Aucun fichier reçu');
      return res.status(400).json({ message: 'Aucune photo n\'a été uploadée' });
    }

    const student = await Student.findById(req.params.id);
    if (!student) {
      console.log('Étudiant non trouvé');
      // Supprimer le fichier uploadé si l'étudiant n'existe pas
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ message: 'Étudiant non trouvé' });
    }

    console.log('Étudiant trouvé:', student._id);

    // Supprimer l'ancienne photo si elle existe
    if (student.photo) {
      console.log('Suppression de l\'ancienne photo:', student.photo);
      const oldPhotoPath = path.join(__dirname, '..', student.photo);
      if (fs.existsSync(oldPhotoPath)) {
        fs.unlinkSync(oldPhotoPath);
      }
    }

    // Mettre à jour le chemin de la photo
    const relativePath = path.relative(path.join(__dirname, '..'), req.file.path);
    console.log('Nouveau chemin de photo:', relativePath);
    
    student.photo = relativePath.replace(/\\/g, '/');
    await student.save();

    console.log('Photo sauvegardée avec succès');

    res.json({ 
      message: 'Photo mise à jour avec succès',
      photoPath: student.photo
    });
  } catch (error) {
    console.error('Erreur détaillée lors de l\'upload de photo:', error);
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('Erreur lors de la suppression du fichier temporaire:', unlinkError);
      }
    }
    res.status(500).json({ message: 'Erreur lors de l\'upload de la photo: ' + error.message });
  }
});

// Get student photo
router.get('/:id/photo', async (req, res) => {
  try {
    console.log('Récupération de la photo pour l\'étudiant:', req.params.id);
    
    const student = await Student.findById(req.params.id);
    if (!student || !student.photo) {
      console.log('Photo non trouvée pour l\'étudiant');
      return res.status(404).json({ message: 'Photo non trouvée' });
    }

    const photoPath = path.join(__dirname, '..', student.photo);
    console.log('Chemin de la photo:', photoPath);

    if (!fs.existsSync(photoPath)) {
      console.log('Le fichier photo n\'existe pas sur le disque');
      return res.status(404).json({ message: 'Photo non trouvée' });
    }

    res.sendFile(photoPath);
  } catch (error) {
    console.error('Erreur lors de la récupération de la photo:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération de la photo: ' + error.message });
    }
});

module.exports = router; 