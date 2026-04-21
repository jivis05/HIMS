const express = require('express');
const { grantConsent, getMyConsents, revokeConsent } = require('../controllers/consent.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect);

router.post('/', grantConsent);
router.get('/my-consents', getMyConsents);
router.patch('/:id/revoke', revokeConsent);

module.exports = router;
