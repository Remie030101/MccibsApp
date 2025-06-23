const mongoose = require('mongoose');

const practicalInfoSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        enum: ['pdf', 'text'],
        required: true
    },
    content: {
        type: String,
        required: function() {
            return this.type === 'text';
        }
    },
    filePath: {
        type: String,
        required: function() {
            return this.type === 'pdf';
        }
    },
    fileName: {
        type: String,
        required: function() {
            return this.type === 'pdf';
        }
    },
    category: {
        type: String,
        enum: ['academic', 'administrative', 'student_life', 'other'],
        default: 'other'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt field before saving
practicalInfoSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('PracticalInfo', practicalInfoSchema); 