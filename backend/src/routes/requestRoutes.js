const express = require('express');
const router = express.Router();
const { protect, isCitizen, isAgent, isAdmin } = require('../middleware/auth');
const { upload, handleUploadError } = require('../middleware/upload');
const Request = require('../models/Request');
const {
  createRequest,
  getRequests,
  getRequest,
  updateRequest,
  deleteRequest,
  getAgentRequests,
  getUserRequests,
  updateRequestStatus,
  getStatistics,
  processRequest,
  initializePayment,
  updatePaymentStatus,
  generateDocument,
  approveRequest
} = require('../controllers/requestController');

// Toutes les routes sont protégées
router.use(protect);

// Route pour les statistiques du citoyen
router.get('/statistics', isCitizen, getStatistics);

// Routes pour les citoyens
router.post('/', isCitizen, upload.single('identityDocument'), handleUploadError, createRequest);
router.get('/', isCitizen, getRequests);
router.get('/:id', getRequest);
router.put('/:id', isCitizen, updateRequest);
router.delete('/:id', isCitizen, deleteRequest);
router.post('/:id/payment', isCitizen, initializePayment);
router.post('/:id/payment-status', updatePaymentStatus);

// Routes pour les agents
router.get('/agent/requests', isAgent, getAgentRequests);
router.put('/:id/status', isAgent, updateRequestStatus);
router.put('/:id/process', isAgent, processRequest);
router.put("/:id/approve", isAgent, approveRequest);

// Route pour générer le document
router.post('/:id/generate-document', isAgent, generateDocument);

// Route pour télécharger le document
router.get('/:id/document', isCitizen, async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Demande non trouvée'
      });
    }

    // Vérifier si l'utilisateur est le propriétaire de la demande
    if (request.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Non autorisé à accéder à ce document'
      });
    }

    // Vérifier si le document existe et a été généré
    if (!request.generatedDocument || !request.generatedDocument.url) {
      return res.status(404).json({
        success: false,
        message: 'Document non disponible ou non encore généré'
      });
    }

    // Rediriger vers l'URL du document
    res.redirect(request.generatedDocument.url);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router; 