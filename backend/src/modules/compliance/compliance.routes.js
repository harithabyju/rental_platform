const express = require('express');
const router = express.Router();
const complianceController = require('./compliance.controller');
const { protect } = require('../../middlewares/authMiddleware');
const { authorize } = require('../../middlewares/roleMiddleware');

// Damage Reporting (Customers & Owners)
router.post('/compliance/damages', protect, complianceController.reportDamage);
router.post('/compliance/damages/:id/resolve', protect, authorize('admin'), complianceController.resolveDamage);

// Disputes (Customers & Owners)
router.post('/compliance/disputes', protect, complianceController.raiseDispute);
router.post('/compliance/disputes/:id/resolve', protect, authorize('admin'), complianceController.resolveDispute);

// Reviews (Customers & Admin)
router.post('/compliance/reviews', protect, authorize('customer'), complianceController.submitReview);
router.post('/compliance/reviews/:id/moderate', protect, authorize('admin'), complianceController.moderateReview);

module.exports = router;
