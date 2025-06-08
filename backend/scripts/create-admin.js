require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('../models/admin');

async function createAdmin() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        // Check if admin already exists
        const adminCount = await Admin.countDocuments();
        if (adminCount > 0) {
            console.log('Un administrateur existe déjà');
            process.exit(0);
        }

        // Create admin
        const admin = new Admin({
            fullName: 'Admin Test',
            email: 'test@mccibs.com',
            password: 'test123',
            role: 'super_admin'
        });

        await admin.save();
        console.log('Administrateur créé avec succès');
        console.log('Email:', admin.email);
        console.log('Mot de passe: admin123');

    } catch (error) {
        console.error('Erreur lors de la création de l\'administrateur:', error);
    } finally {
        await mongoose.disconnect();
    }
}

createAdmin(); 