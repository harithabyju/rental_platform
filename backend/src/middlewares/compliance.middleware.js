const db = require('../config/db');

/**
 * Middleware to check if a user is blocked or has a high fraud score
 * before allowing sensitive actions like booking.
 */
const checkCompliance = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const query = `SELECT blocked, fraud_score FROM users WHERE id = $1;`;
        const { rows } = await db.query(query, [userId]);
        const user = rows[0];

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.blocked) {
            return res.status(403).json({
                message: 'Your account is suspended due to compliance violations or suspicious activity.'
            });
        }

        // Scenario 4: Suspicious activity score check
        if (user.fraud_score >= 80) {
            return res.status(403).json({
                message: 'Booking restricted. Please complete additional identity verification (OTP) to continue.'
            });
        }

        next();
    } catch (error) {
        console.error('Compliance middleware error:', error);
        res.status(500).json({ message: 'Internal Server error checking compliance' });
    }
};

module.exports = { checkCompliance };
