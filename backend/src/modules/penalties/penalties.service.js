const penaltiesRepository = require('./penalties.repository');
const { sendEmail } = require('../../utils/email');

const calculateLateFine = async (bookingId) => {
    const booking = await penaltiesRepository.getBookingForFine(bookingId);
    if (!booking) throw new Error('Booking not found');

    const endDate = new Date(booking.end_date);
    const today = new Date();

    // Reset hours to compare only dates
    endDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    if (today <= endDate) {
        return { message: 'No late fine applicable yet', amount: 0 };
    }

    const diffTime = Math.abs(today - endDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // fine = days_late × daily_rate
    const fineAmount = diffDays * parseFloat(booking.price_per_day);

    const description = `Item returned ${diffDays} days late.`;

    // Check if fine already exists
    const existingFine = await penaltiesRepository.getFineByBookingId(bookingId, 'late');
    if (existingFine) {
        return existingFine;
    }

    const fine = await penaltiesRepository.createFine({
        booking_id: bookingId,
        user_id: booking.customer_id,
        amount: fineAmount,
        description,
        fine_type: 'late',
        status: 'pending'
    });

    // Send warning email
    await sendEmail(
        booking.customer_email,
        'Late Return Fine Notification',
        `Dear ${booking.customer_name},\n\nYou have been charged a late return fine of $${fineAmount} for booking #${bookingId} (${booking.item_name}).\nReason: ${description}\n\nPlease pay the fine through your dashboard.`
    );

    return fine;
};

const reportDamage = async (bookingId, shopOwnerId, description, images) => {
    const booking = await penaltiesRepository.getBookingForFine(bookingId);
    if (!booking) throw new Error('Booking not found');

    if (booking.shop_owner_id !== shopOwnerId) {
        throw new Error('Unauthorized to report damage for this booking');
    }

    const report = await penaltiesRepository.createDamageReport({
        booking_id: bookingId,
        reported_by: shopOwnerId,
        description,
        images
    });

    // Notify Admin (mock notification or console log for now)
    console.log(`Notification: Damage report #${report.id} created for booking #${bookingId}. Admin review required.`);

    return report;
};

const approveDamageReport = async (reportId, amount) => {
    const report = await penaltiesRepository.getDamageReportById(reportId);
    if (!report) throw new Error('Damage report not found');

    const booking = await penaltiesRepository.getBookingForFine(report.booking_id);

    await penaltiesRepository.updateDamageReportStatus(reportId, 'approved');

    const fine = await penaltiesRepository.createFine({
        booking_id: report.booking_id,
        user_id: booking.customer_id,
        amount,
        description: `Damage Penalty: ${report.description}`,
        fine_type: 'damage',
        status: 'pending'
    });

    // Send warning email
    await sendEmail(
        booking.customer_email,
        'Damage Penalty Notification',
        `Dear ${booking.customer_name},\n\nYou have been charged a damage penalty of $${amount} for booking #${report.booking_id} (${booking.item_name}).\nDescription: ${report.description}\n\nPlease pay the fine through your dashboard.`
    );

    return { report, fine };
};

const getFinesForCustomer = async (userId) => {
    return await penaltiesRepository.getCustomerFines(userId);
};

const getFinesForAdmin = async () => {
    return await penaltiesRepository.getAllFinesAdmin();
};

const raiseDispute = async (fineId, userId, reason) => {
    const dispute = await penaltiesRepository.createDispute({
        fine_id: fineId,
        user_id: userId,
        reason
    });

    await penaltiesRepository.updateFineStatus(fineId, 'disputed');

    // Notify Admin
    console.log(`Notification: Dispute raised for fine #${fineId}.`);

    return dispute;
};

const getDisutesForAdmin = async () => {
    return await penaltiesRepository.getAllDisputesAdmin();
};

const resolveDispute = async (disputeId, status, response) => {
    const dispute = await penaltiesRepository.getDisputeById(disputeId);
    if (!dispute) throw new Error('Dispute not found');

    const booking = await penaltiesRepository.getBookingForFine(dispute.fine_id); // Wait, this is actually fine_id. We need the booking from fine.
    // Let's get fine first to get user/booking details
    const result = await db.query('SELECT f.*, u.email, u.fullname FROM fines f JOIN users u ON f.user_id = u.id WHERE f.id = $1', [dispute.fine_id]);
    const fineData = result.rows[0];

    const updatedDispute = await penaltiesRepository.updateDispute(disputeId, status, response);

    if (status === 'resolved') {
        await penaltiesRepository.updateFineStatus(dispute.fine_id, 'resolved');
    } else if (status === 'rejected') {
        await penaltiesRepository.updateFineStatus(dispute.fine_id, 'pending');
    }

    // Send resolution email
    if (fineData) {
        await sendEmail(
            fineData.email,
            'Dispute Resolution Notification',
            `Dear ${fineData.fullname},\n\nYour dispute for fine #${dispute.fine_id} has been ${status}.\nAdmin Response: ${response}\n\nThank you.`
        );
    }

    return updatedDispute;
};

module.exports = {
    calculateLateFine,
    reportDamage,
    approveDamageReport,
    getFinesForCustomer,
    getFinesForAdmin,
    raiseDispute,
    getDisutesForAdmin,
    resolveDispute
};
