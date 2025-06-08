const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Liste des classes disponibles
const CLASSES = [
    'BTS SIO 1', 'BTS SIO 2',
    'BTS GPME 1', 'BTS GPME 2',
    'BTS COM 1', 'BTS COM 2',
    'BTS MCO 1', 'BTS MCO 2',
    'Licence Gestion', 'Licence Com',
    'Licence Tourisme', 'Licence Informatique',
    'Master MCI 1', 'Master MCI 2',
    'Master Tourisme 1', 'Master Tourisme 2'
];

// Créer le dossier d'upload et les sous-dossiers par classe s'ils n'existent pas
const uploadDir = path.join(__dirname, '..', 'uploads', 'student-photos');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Créer les sous-dossiers pour chaque classe
CLASSES.forEach(className => {
    const classDir = path.join(uploadDir, className.replace(/\s+/g, '_'));
    if (!fs.existsSync(classDir)) {
        fs.mkdirSync(classDir, { recursive: true });
    }
});

// Configuration du stockage
const storage = multer.diskStorage({
    destination: async function (req, file, cb) {
        try {
            // Récupérer la classe de l'étudiant depuis la base de données
            const Student = require('../models/Student');
            const student = await Student.findById(req.params.id);
            
            if (!student) {
                return cb(new Error('Étudiant non trouvé'));
            }

            // Créer le chemin du dossier de la classe
            const classDir = path.join(uploadDir, student.class.replace(/\s+/g, '_'));
            
            // Vérifier/créer le dossier si nécessaire
            if (!fs.existsSync(classDir)) {
                fs.mkdirSync(classDir, { recursive: true });
            }
            
            cb(null, classDir);
        } catch (error) {
            cb(error);
        }
    },
    filename: async function (req, file, cb) {
        try {
            const Student = require('../models/Student');
            const student = await Student.findById(req.params.id);
            if (!student) {
                return cb(new Error('Étudiant non trouvé'));
            }
            const ext = path.extname(file.originalname);
            const prenom = (student.firstName || '').toLowerCase().replace(/\s+/g, '_');
            const nom = (student.lastName || '').toLowerCase().replace(/\s+/g, '_');
            const fileName = `student-${prenom}-${nom}${ext}`;
            cb(null, fileName);
        } catch (error) {
            cb(error);
        }
    }
});

// Filtre pour n'accepter que les images
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Le fichier doit être une image.'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // Limite de 5MB
    }
});

module.exports = upload; 