require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('../models/admin');

async function deleteAdmin() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        // Delete all admins
        await Admin.deleteMany({});
        console.log('Administrateur(s) supprimé(s) avec succès');

    } catch (error) {
        console.error('Erreur lors de la suppression de l\'administrateur:', error);
    } finally {
        await mongoose.disconnect();
    }
}

deleteAdmin(); 