const complianceService = require('./compliance.service');

class ComplianceController {
    // Damages
    async reportDamage(req, res) {
        try {
            const report = await complianceService.reportDamage(req.user.id, req.body);
            res.status(201).json(report);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async resolveDamage(req, res) {
        try {
            const { fineAmount, notes } = req.body;
            const report = await complianceService.resolveDamage(req.user.id, req.params.id, fineAmount, notes);
            res.json(report);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    // Disputes
    async raiseDispute(req, res) {
        try {
            const dispute = await complianceService.raiseDispute(req.user.id, req.body);
            res.status(201).json(dispute);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async resolveDispute(req, res) {
        try {
            const { notes, status } = req.body;
            const dispute = await complianceService.resolveDispute(req.user.id, req.params.id, notes, status);
            res.json(dispute);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    // Reviews
    async submitReview(req, res) {
        try {
            const review = await complianceService.submitReview(req.user.id, req.body);
            res.status(201).json(review);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async moderateReview(req, res) {
        try {
            const { status, flagged } = req.body;
            const review = await complianceService.moderateReview(req.user.id, req.params.id, status, flagged);
            res.json(review);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
}

module.exports = new ComplianceController();
