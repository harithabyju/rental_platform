const paymentService = require('./payment.service');
const db = require('../../config/db');
const PDFDocument = require('pdfkit');

exports.createOrder = async (req, res, next) => {
    try {
        const { bookingId, amount } = req.body;

        if (!bookingId || !amount) {
            return res.status(400).json({ message: 'Booking ID and Amount are required' });
        }

        const order = await paymentService.createOrder(amount, bookingId);

        // Update booking with razorpay_order_id
        await db.query(
            'UPDATE bookings SET status = $1 WHERE booking_id = $2',
            ['pending', bookingId]
        );

        res.status(201).json(order);
    } catch (err) {
        next(err);
    }
};

exports.verifyPayment = async (req, res, next) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            bookingId,
            amount
        } = req.body;

        const isValid = paymentService.verifySignature(
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        );

        if (!isValid) {
            return res.status(400).json({ message: 'Invalid payment signature' });
        }

        // Update Booking Status
        await db.query(
            "UPDATE bookings SET status = 'confirmed' WHERE booking_id = $1",
            [bookingId]
        );

        // Update shop_items availability if necessary (or quantities)
        // For now assuming quantity 1 and marking confirmed is enough.

        // Record Payment
        await paymentService.recordPayment({
            booking_id: bookingId,
            user_id: req.user.id,
            amount_inr: amount,
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            status: 'completed'
        });

        res.json({ message: 'Payment verified successfully', success: true });
    } catch (err) {
        next(err);
    }
};

exports.getMyPayments = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const result = await db.query(
            'SELECT p.*, b.item_id, b.start_date, b.end_date FROM payments p JOIN bookings b ON p.booking_id = b.booking_id WHERE p.user_id = $1 ORDER BY p.created_at DESC',
            [userId]
        );
        res.json({ payments: result.rows });
    } catch (err) {
        next(err);
    }
};

exports.downloadInvoice = async (req, res, next) => {
    try {
        const paymentId = req.params.id;
        const userId = req.user.id;

        // Fetch payment and booking details
        const result = await db.query(
            `SELECT p.*, b.item_id, b.start_date, b.end_date, u.fullname, u.email 
             FROM payments p 
             JOIN bookings b ON p.booking_id = b.booking_id 
             JOIN users u ON p.user_id = u.id 
             WHERE p.id = $1 AND p.user_id = $2`,
            [paymentId, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Payment not found or unauthorized' });
        }

        const paymentInfo = result.rows[0];

        // Generate PDF
        const doc = new PDFDocument({ margin: 50 });
        
        const filename = `Invoice_${paymentInfo.razorpay_payment_id || paymentInfo.id}.pdf`;
        res.setHeader('Content-disposition', 'attachment; filename="' + filename + '"');
        res.setHeader('Content-type', 'application/pdf');

        doc.pipe(res);

        // Header
        doc.fontSize(20).text('INVOICE', { align: 'center' });
        doc.moveDown();

        // Platform info (Mock)
        doc.fontSize(10).text('Rental Platform Inc.', { align: 'right' });
        doc.text('123 Rental Street, Bangalore', { align: 'right' });
        doc.moveDown(2);

        // Customer Info
        doc.fontSize(12).text(`Bill To: ${paymentInfo.fullname}`);
        doc.fontSize(10).text(`Email: ${paymentInfo.email}`);
        doc.moveDown();

        // Invoice Details
        doc.text(`Invoice Number: ${paymentInfo.razorpay_payment_id || paymentInfo.id}`);
        doc.text(`Date: ${new Date(paymentInfo.created_at).toLocaleDateString()}`);
        doc.text(`Booking ID: ${paymentInfo.booking_id}`);
        doc.moveDown(2);

        // Line Items Header
        doc.fontSize(12).text('Description', 50, doc.y, { continued: true });
        doc.text('Amount (INR)', 400, doc.y);
        doc.moveTo(50, doc.y + 5).lineTo(500, doc.y + 5).stroke();
        doc.moveDown(0.5);

        // Line Items
        doc.fontSize(10).text(`Rental Booking for Item #${paymentInfo.item_id}`, 50, doc.y, { continued: true });
        doc.text(`${paymentInfo.amount_inr}`, 400, doc.y);
        doc.moveDown();
        
        doc.text(`Duration: ${new Date(paymentInfo.start_date).toLocaleDateString()} to ${new Date(paymentInfo.end_date).toLocaleDateString()}`, 50, doc.y);
        doc.moveDown(2);

        // Total
        doc.moveTo(50, doc.y).lineTo(500, doc.y).stroke();
        doc.moveDown(0.5);
        doc.fontSize(12).text('Total Paid:', 300, doc.y, { continued: true });
        doc.text(`${paymentInfo.amount_inr} INR`, 400, doc.y);
        
        doc.moveDown(2);
        doc.fontSize(10).text('Thank you for your business!', { align: 'center' });

        doc.end();

    } catch (err) {
        next(err);
    }
};
