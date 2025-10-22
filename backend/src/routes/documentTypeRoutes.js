const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getDocumentTypes,
  getDocumentType,
  createDocumentType,
  updateDocumentType,
  deleteDocumentType,
  toggleDocumentTypeStatus
} = require('../controllers/documentTypeController');

// Toutes les routes nécessitent d'être authentifié et d'être admin
router.use(protect);
router.use(authorize('admin'));

// Routes CRUD
router.route('/')
  .get(getDocumentTypes)
  .post(createDocumentType);

router.route('/:id')
  .get(getDocumentType)
  .put(updateDocumentType)
  .delete(deleteDocumentType);

router.patch('/:id/toggle-status', toggleDocumentTypeStatus);

module.exports = router;
