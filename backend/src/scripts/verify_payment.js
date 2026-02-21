const axios = require('axios');
const crypto = require('crypto');

const API_URL = 'http://localhost:5000';
const RAZORPAY_KEY_SECRET = 'your_key_secret'; // Must match .env

const verifyPaymentFlow = async () => {
    try {
        console.log('--- Verifying Payment Verification Logic ---');

        // 1. Login
        console.log('Logging in...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'admin@example.com',
            password: 'admin123'
        });
        const token = loginRes.data.token;
        const config = { headers: { Authorization: `Bearer ${token}` } };
        console.log('Login successful.');

        // 2. Create a booking (manually or via service)
        // For testing, we'll use an existing shop_item_id or fetch one
        console.log('\nFetching a shop item...');
        const searchRes = await axios.get(`${API_URL}/search/items`, {
            ...config,
            params: {
                category: 'vehicles',
                lat: 28.6315,
                lng: 77.2167,
                radius: 10,
                start_date: '2026-04-01',
                end_date: '2026-04-05'
            }
        });

        if (searchRes.data.items.length === 0) {
            console.log('No items found to test booking.');
            return;
        }
        const item = searchRes.data.items[0];
        console.log(`Using item: ${item.name} (ID: ${item.id})`);

        // 3. Create Booking
        console.log('\nCreating booking (pending status)...');
        const bookingRes = await axios.post(`${API_URL}/bookings`, {
            itemId: item.id,
            startDate: '2026-04-01',
            endDate: '2026-04-05',
            totalAmount: 500,
            deliveryMethod: 'pickup',
            deliveryFee: 0
        }, config);
        const bookingId = bookingRes.data.booking_id;
        console.log(`Booking created. ID: ${bookingId}, Status: ${bookingRes.data.status}`);

        // 4. Create Razorpay Order
        console.log('\nCreating Razorpay Order...');
        const orderRes = await axios.post(`${API_URL}/payments/create-order`, {
            bookingId: bookingId,
            amount: 500
        }, config);
        const razorpayOrderId = orderRes.data.id;
        console.log(`Razorpay Order created. ID: ${razorpayOrderId}`);

        // 5. Simulate Payment Verification (Mocking Razorpay response)
        console.log('\nSimulating Payment Verification...');
        const razorpayPaymentId = 'pay_mock_12345';

        // Generate Mock Signature
        const signature = crypto
            .createHmac('sha256', RAZORPAY_KEY_SECRET)
            .update(`${razorpayOrderId}|${razorpayPaymentId}`)
            .digest('hex');

        const verifyRes = await axios.post(`${API_URL}/payments/verify`, {
            razorpay_order_id: razorpayOrderId,
            razorpay_payment_id: razorpayPaymentId,
            razorpay_signature: signature,
            bookingId: bookingId,
            amount: 500
        }, config);

        console.log(`Verification Response: ${verifyRes.data.message}`);

        // 6. Check final booking status
        const myBookings = await axios.get(`${API_URL}/bookings/my`, config);
        const updatedBooking = myBookings.data.find(b => b.booking_id === bookingId);
        console.log(`Final Booking Status: ${updatedBooking.status}`);

        if (updatedBooking.status === 'confirmed') {
            console.log('\n✅ VERIFICATION SUCCESSFUL');
        } else {
            console.log('\n❌ VERIFICATION FAILED');
        }

    } catch (error) {
        console.error('Verification failed:', error.response?.data || error.message);
    }
};

verifyPaymentFlow();
