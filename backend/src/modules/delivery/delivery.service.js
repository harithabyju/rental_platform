const db = require('../../config/db');

// Haversine formula to calculate distance between two coordinates in km
const haversineDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371; // Earth radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

// Status transition map (valid next states for each current state)
const VALID_TRANSITIONS = {
    pending: ['assigned'],
    assigned: ['picked_up'],
    picked_up: ['out_for_delivery'],
    out_for_delivery: ['delivered', 'failed'],
    delivered: [],
    failed: ['pending'], // allow retry
};

// Simulated delivery agents pool
const AGENTS = [
    { name: 'Ravi Kumar', phone: '+91-98765-01234' },
    { name: 'Priya Sharma', phone: '+91-98765-05678' },
    { name: 'Ankit Singh', phone: '+91-98765-09012' },
    { name: 'Divya Nair', phone: '+91-98765-03456' },
    { name: 'Mohamed Ishaan', phone: '+91-98765-07890' },
];

/**
 * Get delivery options for a shop+location combo
 * Returns available delivery types and estimated fees/ETAs
 */
exports.getDeliveryOptions = async (shopId, customerLat, customerLng) => {
    // Get shop coordinates
    const shopResult = await db.query(
        'SELECT latitude, longitude, city, name FROM shops WHERE id = $1',
        [shopId]
    );
    if (shopResult.rows.length === 0) throw new Error('Shop not found');
    const shop = shopResult.rows[0];

    if (!shop.latitude || !shop.longitude) {
        // Return default options if shop coordinates not set
        return {
            shopCity: shop.city,
            options: [
                {
                    type: 'standard',
                    label: 'Standard Delivery',
                    estimatedHours: 24,
                    fee: 0,
                    available: true,
                    description: 'Delivery within 24 hours',
                },
            ],
            distanceKm: null,
            note: 'Exact fee calculated at checkout',
        };
    }

    const distanceKm = customerLat && customerLng
        ? haversineDistance(shop.latitude, shop.longitude, customerLat, customerLng)
        : null;

    // Base fees per delivery type
    const BASE_FEE_STANDARD = 50;
    const BASE_FEE_EXPRESS = 120;
    const PER_KM_RATE = 8;
    const MAX_DELIVERY_DISTANCE = 100; // km

    if (distanceKm && distanceKm > MAX_DELIVERY_DISTANCE) {
        return {
            shopCity: shop.city,
            distanceKm: Math.round(distanceKm * 10) / 10,
            options: [],
            note: `Sorry, this shop only delivers within ${MAX_DELIVERY_DISTANCE} km. Your location is ${Math.round(distanceKm)} km away.`,
            outOfRange: true,
        };
    }

    const distanceFee = distanceKm ? Math.ceil(distanceKm * PER_KM_RATE) : 0;

    const standardFee = BASE_FEE_STANDARD + distanceFee;
    const expressFee = BASE_FEE_EXPRESS + distanceFee * 1.5;

    return {
        shopCity: shop.city,
        shopName: shop.name,
        distanceKm: distanceKm ? Math.round(distanceKm * 10) / 10 : null,
        options: [
            {
                type: 'standard',
                label: 'Standard Delivery',
                estimatedHours: 24,
                fee: Math.round(standardFee),
                available: true,
                description: `Delivered within 24 hours • ₹${Math.round(standardFee)} flat`,
            },
            {
                type: 'express',
                label: 'Express Delivery',
                estimatedHours: 4,
                fee: Math.round(expressFee),
                available: distanceKm ? distanceKm <= 30 : true,
                description: distanceKm <= 30
                    ? `Priority delivery within 4 hours • ₹${Math.round(expressFee)}`
                    : 'Express delivery not available for your location',
            },
        ],
    };
};

/**
 * Create a delivery order when a booking with delivery is confirmed
 */
exports.createDeliveryOrder = async (bookingId, deliveryAddress, deliveryCity, deliveryLat, deliveryLng, estimatedFee, distanceKm) => {
    // Pick a random agent name for simulation
    const agent = AGENTS[Math.floor(Math.random() * AGENTS.length)];

    // Estimated delivery time: 24 hours from now
    const estimatedDeliveryAt = new Date();
    estimatedDeliveryAt.setHours(estimatedDeliveryAt.getHours() + 24);

    const result = await db.query(
        `INSERT INTO delivery_orders 
         (booking_id, delivery_address, delivery_city, delivery_lat, delivery_lng, 
          estimated_fee_inr, distance_km, estimated_delivery_at, agent_name, agent_phone, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'pending')
         ON CONFLICT (booking_id) DO UPDATE SET
           delivery_address = EXCLUDED.delivery_address,
           updated_at = CURRENT_TIMESTAMP
         RETURNING *`,
        [
            bookingId,
            deliveryAddress,
            deliveryCity || null,
            deliveryLat || null,
            deliveryLng || null,
            estimatedFee || 0,
            distanceKm || null,
            estimatedDeliveryAt,
            agent.name,
            agent.phone,
        ]
    );
    return result.rows[0];
};

/**
 * Get delivery status for a booking (customer view)
 */
exports.getDeliveryStatus = async (bookingId, userId) => {
    // Verify the user owns this booking
    const bookingCheck = await db.query(
        'SELECT user_id FROM bookings WHERE booking_id = $1',
        [bookingId]
    );
    if (bookingCheck.rows.length === 0) throw new Error('Booking not found');
    if (bookingCheck.rows[0].user_id !== userId) throw new Error('Unauthorized');

    const result = await db.query(
        `SELECT 
            do.*,
            b.start_date, b.end_date, b.delivery_method, b.total_amount,
            i.name as item_name, i.image_url as item_image,
            s.name as shop_name, s.city as shop_city, s.address as shop_address,
            s.phone as shop_phone
         FROM delivery_orders do
         JOIN bookings b ON b.booking_id = do.booking_id
         JOIN items i ON i.id = b.item_id
         JOIN shops s ON s.id = b.shop_id
         WHERE do.booking_id = $1`,
        [bookingId]
    );

    if (result.rows.length === 0) {
        throw new Error('No delivery order found for this booking');
    }

    const order = result.rows[0];

    // Build timeline steps with completion status
    const STEPS = [
        { key: 'confirmed', label: 'Booking Confirmed', description: 'Your booking has been confirmed and payment received', icon: '🎉' },
        { key: 'pending', label: 'Preparing Item', description: 'Shop is preparing your item for delivery', icon: '📦' },
        { key: 'assigned', label: 'Agent Assigned', description: `${order.agent_name} will handle your delivery`, icon: '👤' },
        { key: 'picked_up', label: 'Picked Up', description: 'Your item has been picked up from the shop', icon: '🚗' },
        { key: 'out_for_delivery', label: 'Out for Delivery', description: 'Your item is on the way to your address!', icon: '🛣️' },
        { key: 'delivered', label: 'Delivered', description: 'Your item has been delivered successfully', icon: '✅' },
    ];

    const STATUS_ORDER = ['confirmed', 'pending', 'assigned', 'picked_up', 'out_for_delivery', 'delivered'];
    const currentIndex = STATUS_ORDER.indexOf(order.status);

    const timeline = STEPS.map((step, index) => ({
        ...step,
        completed: index <= currentIndex,
        active: index === currentIndex,
    }));

    return {
        deliveryOrder: order,
        timeline,
        currentStatus: order.status,
        isFailed: order.status === 'failed',
    };
};

/**
 * Update delivery status (shop owner action)
 */
exports.updateDeliveryStatus = async (bookingId, ownerId, newStatus) => {
    // Verify the shop owner owns this booking's shop
    const result = await db.query(
        `SELECT do.*, b.shop_id, s.owner_id
         FROM delivery_orders do
         JOIN bookings b ON b.booking_id = do.booking_id
         JOIN shops s ON s.id = b.shop_id
         WHERE do.booking_id = $1`,
        [bookingId]
    );

    if (result.rows.length === 0) throw new Error('Delivery order not found');
    const order = result.rows[0];

    if (order.owner_id !== ownerId) throw new Error('Unauthorized: You do not own this shop');

    // Validate transition
    const validNext = VALID_TRANSITIONS[order.status] || [];
    if (!validNext.includes(newStatus)) {
        throw new Error(`Invalid status transition: ${order.status} → ${newStatus}. Allowed: ${validNext.join(', ') || 'none'}`);
    }

    const updateFields = ['status = $1', 'status_updated_at = CURRENT_TIMESTAMP', 'updated_at = CURRENT_TIMESTAMP'];
    const params = [newStatus, bookingId];

    // Auto-assign agent when moving to 'assigned', set delivered_at when delivered
    if (newStatus === 'delivered') {
        updateFields.push('delivered_at = CURRENT_TIMESTAMP');
    }

    const updateResult = await db.query(
        `UPDATE delivery_orders SET ${updateFields.join(', ')} WHERE booking_id = $2 RETURNING *`,
        params
    );

    // If delivered, also update booking status to 'active' (rental has started)
    if (newStatus === 'delivered') {
        await db.query(
            `UPDATE bookings SET status = 'active' WHERE booking_id = $1 AND status = 'confirmed'`,
            [bookingId]
        );
    }

    return updateResult.rows[0];
};

/**
 * Get all pending/active delivery orders for a shop owner
 */
exports.getShopDeliveries = async (ownerId, statusFilter) => {
    const validStatuses = ['pending', 'assigned', 'picked_up', 'out_for_delivery', 'delivered', 'failed', 'all'];
    const filter = validStatuses.includes(statusFilter) ? statusFilter : 'all';

    const statusWhere = filter !== 'all' ? `AND do.status = '${filter}'` : `AND do.status NOT IN ('delivered')`;

    const result = await db.query(
        `SELECT 
            do.*,
            b.start_date, b.end_date, b.total_amount, b.delivery_fee,
            i.name as item_name, i.image_url as item_image,
            u.fullname as customer_name, u.email as customer_email, u.phone as customer_phone,
            s.name as shop_name, s.id as shop_id
         FROM delivery_orders do
         JOIN bookings b ON b.booking_id = do.booking_id
         JOIN items i ON i.id = b.item_id
         JOIN users u ON u.id = b.user_id
         JOIN shops s ON s.id = b.shop_id
         WHERE s.owner_id = $1
         ${statusWhere}
         ORDER BY do.created_at DESC`,
        [ownerId]
    );

    return result.rows;
};
