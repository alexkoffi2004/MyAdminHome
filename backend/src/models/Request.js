const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  reference: {
    type: String,
    unique: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  agent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  documentType: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DocumentType',
    required: [true, 'Le type de document est requis']
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'rejected'],
    default: 'pending'
  },
  commune: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Commune',
    required: [true, 'La commune est requise']
  },
  // Informations personnelles (anciennes - compatibilité)
  fullName: {
    type: String
  },
  birthDate: {
    type: Date
  },
  birthPlace: {
    type: String
  },
  fatherName: {
    type: String
  },
  motherName: {
    type: String
  },
  fatherProfession: {
    type: String
  },
  fatherDomicile: {
    type: String
  },
  motherProfession: {
    type: String
  },
  motherDomicile: {
    type: String
  },
  // Nouvelles informations - Enfant
  childLastName: {
    type: String
  },
  childFirstName: {
    type: String
  },
  childBirthDate: {
    type: Date
  },
  childBirthPlace: {
    type: String
  },
  childBirthTime: {
    type: String
  },
  childMaternity: {
    type: String
  },
  childGender: {
    type: String,
    enum: ['M', 'F']
  },
  // Nouvelles informations - Parents
  fatherFullName: {
    type: String
  },
  fatherNationality: {
    type: String
  },
  fatherAddress: {
    type: String
  },
  motherFullName: {
    type: String
  },
  motherNationality: {
    type: String
  },
  motherAddress: {
    type: String
  },
  emailCitoyen: {
    type: String
  },
  anneeRegistre: {
    type: String
  },
  numeroRegistre: {
    type: String
  },
  // Informations de contact
  phoneNumber: {
    type: String
  },
  address: {
    type: String
  },
  statut: {
    type: String,
    default: 'pending'
  },
  // Méthode de livraison
  deliveryMethod: {
    type: String,
    enum: ['download', 'pickup', 'delivery'],
    required: [true, 'La méthode de livraison est requise']
  },
  // Document d'identité (ancien - compatibilité)
  identityDocument: {
    type: String
  },
  // Nouveaux documents
  documents: {
    birthCertificate: String,
    fatherIdCard: String,
    motherIdCard: String,
    familyBook: String,
    marriageCertificate: String
  },
  // Prix et paiement
  price: {
    type: Number,
    required: true
  },
  paymentIntentId: {
    type: String
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  payment: {
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending'
    },
    amount: {
      type: Number,
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    },
    method: {
      type: String,
      enum: ['card', 'mobile_money', 'bank_transfer'],
      default: 'card'
    },
    transactionId: String
  },
  // URL publique du document généré (ex: Cloudinary)
  documentUrl: {
    type: String
  },
  // Métadonnées du document généré
  generatedDocument: {
    url: { type: String },
    fileName: { type: String },
    generatedAt: { type: Date },
    generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  // Suivi de la demande
  tracking: {
    submittedAt: {
      type: Date,
      default: Date.now
    },
    processedAt: Date,
    completedAt: Date,
    rejectedAt: Date,
    rejectionReason: String
  },
  // Notes et commentaires
  notes: [{
    content: String,
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Index pour la recherche
requestSchema.index({ user: 1, status: 1 });
requestSchema.index({ documentType: 1, status: 1 });
requestSchema.index({ commune: 1, status: 1 });
requestSchema.index({ 'tracking.submittedAt': -1 });
requestSchema.index({ reference: 1 });

// Générer automatiquement la référence avant la sauvegarde
requestSchema.pre('save', async function(next) {
  if (!this.reference) {
    const year = new Date().getFullYear();
    
    // Compter le nombre de demandes créées cette année
    const count = await mongoose.model('Request').countDocuments({
      reference: new RegExp(`^REQ-${year}-`)
    });
    
    // Générer le numéro avec padding (001, 002, etc.)
    const number = String(count + 1).padStart(3, '0');
    
    // Format: REQ-2024-001
    this.reference = `REQ-${year}-${number}`;
  }
  next();
});

module.exports = mongoose.model('Request', requestSchema); 