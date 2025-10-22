const mongoose = require('mongoose');

const documentTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Veuillez fournir un nom pour le type de document'],
    unique: true,
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Veuillez fournir une description'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Veuillez fournir une catégorie'],
    enum: ['Acte', 'Certificat', 'Attestation', 'Autre']
  },
  requiredFields: [{
    type: String,
    trim: true
  }],
  price: {
    type: Number,
    default: 0
  },
  processingTime: {
    type: Number,
    default: 7, // Nombre de jours
    min: 1
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Index pour la recherche
documentTypeSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('DocumentType', documentTypeSchema);
