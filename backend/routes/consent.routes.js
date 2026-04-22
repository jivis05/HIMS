const express = require('express');
const router = express.Router();
const { grantConsent, getMyConsents, revokeConsent } = require('../controllers/consent.controller');
const { protect, requireRole, requireOrgScope } = require('../middleware/auth.middleware');

router.use(protect);

router.post('/', requireRole(['PATIENT']), grantConsent);
router.get('/my-consents', requireRole(['PATIENT']), getMyConsents);
router.patch('/:id/revoke', requireRole(['PATIENT']), revokeConsent);

module.exports = router;
