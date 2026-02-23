const penaltiesService = require('./penalties.service');

const calculateFine = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const fine = await penaltiesService.calculateLateFine(bookingId);
        res.status(200).json(fine);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const createDamageReport = async (req, res) => {
    try {
        const { bookingId, description, images } = req.body;
        const shopOwnerId = req.user.id;

        if (!bookingId || !description) {
            return res.status(400).json({ message: 'Booking ID and description are required' });
        }

        const result = await penaltiesService.reportDamage(bookingId, shopOwnerId, description, images);
        res.status(201).json(result);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const approveDamageReport = async (req, res) => {
    try {
        const { reportId, amount } = req.body;
        if (!reportId || !amount) {
            return res.status(400).json({ message: 'Report ID and amount are required' });
        }
        const result = await penaltiesService.approveDamageReport(reportId, amount);
        res.status(200).json(result);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const getMyFines = async (req, res) => {
    try {
        const userId = req.user.id;
        const fines = await penaltiesService.getFinesForCustomer(userId);
        res.status(200).json(fines);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const getAllFines = async (req, res) => {
    try {
        const fines = await penaltiesService.getFinesForAdmin();
        res.status(200).json(fines);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const raiseDispute = async (req, res) => {
    try {
        const { fineId, reason } = req.body;
        const userId = req.user.id;

        if (!fineId || !reason) {
            return res.status(400).json({ message: 'Fine ID and reason are required' });
        }

        const dispute = await penaltiesService.raiseDispute(fineId, userId, reason);
        res.status(201).json(dispute);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const getDisputes = async (req, res) => {
    try {
        const disputes = await penaltiesService.getDisutesForAdmin();
        res.status(200).json(disputes);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const resolveDispute = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, adminResponse } = req.body;

        if (!status || !adminResponse) {
            return res.status(400).json({ message: 'Status and admin response are required' });
        }

        const result = await penaltiesService.resolveDispute(id, status, adminResponse);
        res.status(200).json(result);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

module.exports = {
    calculateFine,
    createDamageReport,
    approveDamageReport,
    getMyFines,
    getAllFines,
    raiseDispute,
    getDisputes,
    resolveDispute
};
