const DocumentType = require('../models/DocumentType');
const { catchAsync } = require('../utils/errorHandler');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Obtenir tous les types de documents
// @route   GET /api/admin/document-types
// @access  Private/Admin
exports.getDocumentTypes = catchAsync(async (req, res) => {
  const { category, status, search } = req.query;
  
  let query = {};
  
  // Filtrer par catégorie
  if (category && category !== 'all') {
    query.category = category;
  }
  
  // Filtrer par statut
  if (status && status !== 'all') {
    query.status = status;
  }
  
  // Recherche textuelle
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }
  
  const documentTypes = await DocumentType.find(query).sort({ createdAt: -1 });
  
  res.status(200).json({
    success: true,
    count: documentTypes.length,
    data: documentTypes
  });
});

// @desc    Obtenir un type de document par ID
// @route   GET /api/admin/document-types/:id
// @access  Private/Admin
exports.getDocumentType = catchAsync(async (req, res, next) => {
  const documentType = await DocumentType.findById(req.params.id);
  
  if (!documentType) {
    return next(new ErrorResponse('Type de document non trouvé', 404));
  }
  
  res.status(200).json({
    success: true,
    data: documentType
  });
});

// @desc    Créer un nouveau type de document
// @route   POST /api/admin/document-types
// @access  Private/Admin
exports.createDocumentType = catchAsync(async (req, res, next) => {
  // Vérifier si un type de document avec le même nom existe déjà
  const existingDocType = await DocumentType.findOne({ name: req.body.name });
  
  if (existingDocType) {
    return next(new ErrorResponse('Un type de document avec ce nom existe déjà', 400));
  }
  
  const documentType = await DocumentType.create(req.body);
  
  res.status(201).json({
    success: true,
    data: documentType
  });
});

// @desc    Mettre à jour un type de document
// @route   PUT /api/admin/document-types/:id
// @access  Private/Admin
exports.updateDocumentType = catchAsync(async (req, res, next) => {
  let documentType = await DocumentType.findById(req.params.id);
  
  if (!documentType) {
    return next(new ErrorResponse('Type de document non trouvé', 404));
  }
  
  // Vérifier si le nouveau nom existe déjà (si le nom est modifié)
  if (req.body.name && req.body.name !== documentType.name) {
    const existingDocType = await DocumentType.findOne({ name: req.body.name });
    if (existingDocType) {
      return next(new ErrorResponse('Un type de document avec ce nom existe déjà', 400));
    }
  }
  
  documentType = await DocumentType.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  );
  
  res.status(200).json({
    success: true,
    data: documentType
  });
});

// @desc    Supprimer un type de document
// @route   DELETE /api/admin/document-types/:id
// @access  Private/Admin
exports.deleteDocumentType = catchAsync(async (req, res, next) => {
  const documentType = await DocumentType.findById(req.params.id);
  
  if (!documentType) {
    return next(new ErrorResponse('Type de document non trouvé', 404));
  }
  
  await documentType.deleteOne();
  
  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Activer/Désactiver un type de document
// @route   PATCH /api/admin/document-types/:id/toggle-status
// @access  Private/Admin
exports.toggleDocumentTypeStatus = catchAsync(async (req, res, next) => {
  const documentType = await DocumentType.findById(req.params.id);
  
  if (!documentType) {
    return next(new ErrorResponse('Type de document non trouvé', 404));
  }
  
  documentType.status = documentType.status === 'active' ? 'inactive' : 'active';
  await documentType.save();
  
  res.status(200).json({
    success: true,
    data: documentType
  });
});
