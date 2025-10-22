const express = require('express');
const router = express.Router();
const { getDocumentTypes } = require('../controllers/documentTypeController');

// Route publique pour obtenir les types de documents actifs
// Accessible sans authentification pour les citoyens
router.get('/', getDocumentTypes);

module.exports = router;
