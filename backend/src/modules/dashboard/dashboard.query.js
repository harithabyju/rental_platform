const db = require('../../config/db');

// ─── Dashboard Summary ───────────────────────────────────────────────────────
exports.getDashboardSummary = async (userId) => {
    const result = await db.query(
        `SELECT
            COUNT(*) FILTER (WHERE status IN ('confirmed', 'active'))           AS "activeRentals",
            COUNT(*) FILTER (WHERE status = 'completed')                        AS "completedRentals",
            COUNT(*) FILTER (WHERE status = 'cancelled')                        AS "cancelledRentals",
            COUNT(*)                                                             AS "totalBookings",
            COALESCE(SUM(total_amount) FILTER (WHERE status != 'cancelled'), 0) AS "totalSpent"
        FROM bookings
        WHERE user_id = $1`,
        [userId]
    );
    return result.rows[0];
};

// ─── Categories ──────────────────────────────────────────────────────────────
exports.getAllCategories = async () => {
    const result = await db.query(
        `SELECT id, name, description, slug, icon_url
         FROM categories
         WHERE is_active = true
         ORDER BY name ASC`
    );
    return result.rows;
};

// ─── Items by Category ───────────────────────────────────────────────────────
exports.getItemsByCategory = async (categoryId, limit, offset) => {
    const result = await db.query(
        `SELECT
            i.id,
            i.name,
            i.description,
            i.image_url,
            i.price_unit,
            i.avg_rating,
            i.total_reviews,
            c.name AS category_name,
            c.slug AS category_slug,
            MIN(si.price_per_day_inr) AS min_price_inr,
            COUNT(DISTINCT si.shop_id) AS shop_count,
            BOOL_OR(si.delivery_available) AS delivery_available,
            BOOL_OR(si.pickup_available) AS pickup_available,
            BOOL_OR(si.is_available) AS is_available
        FROM items i
        JOIN categories c ON i.category_id = c.id
        JOIN shop_items si ON si.item_id = i.id AND si.is_available = true
        JOIN shops s ON s.id = si.shop_id AND s.status = 'approved'
        WHERE i.category_id = $1
          AND i.is_active = true
        GROUP BY i.id, i.name, i.description, i.image_url, i.price_unit,
                 i.avg_rating, i.total_reviews, c.name, c.slug
        HAVING COUNT(DISTINCT si.shop_id) > 0
        ORDER BY i.avg_rating DESC, i.name ASC
        LIMIT $2 OFFSET $3`,
        [categoryId, limit, offset]
    );
    return result.rows;
};

exports.countItemsByCategory = async (categoryId) => {
    const result = await db.query(
        `SELECT COUNT(DISTINCT i.id) AS total
         FROM items i
         JOIN shop_items si ON si.item_id = i.id AND si.is_available = true
         JOIN shops s ON s.id = si.shop_id AND s.status = 'approved'
         WHERE i.category_id = $1 AND i.is_active = true`,
        [categoryId]
    );
    return parseInt(result.rows[0].total, 10);
};

// ─── Shop Availability for an Item ───────────────────────────────────────────
exports.getShopsForItem = async (itemId, dates = {}) => {
    const result = await db.query(
        `SELECT
            si.id AS shop_item_id,
            s.id AS shop_id,
            s.name AS shop_name,
            s.address,
            s.city,
            s.state,
            s.pincode,
            s.phone,
            s.latitude::float,
            s.longitude::float,
            s.rating AS shop_rating,
            s.total_reviews AS shop_reviews,
            s.working_hours,
            s.location_restrictions,
            si.price_per_day_inr,
            si.quantity_available AS total_quantity,
            si.quantity_available - (
                SELECT COUNT(*) FROM bookings b 
                WHERE b.item_id = si.item_id 
                  AND b.shop_id = si.shop_id 
                  AND b.status IN ('confirmed', 'active', 'pending_payment')
                  AND (b.start_date, b.end_date) OVERLAPS (
                      COALESCE($2::date, CURRENT_DATE), 
                      COALESCE($3::date, CURRENT_DATE + interval '1 day')
                  )
            ) AS available_quantity,
            si.is_available,
            si.delivery_available,
            si.pickup_available,
            si.delivery_fee_inr,
            i.name AS item_name,
            i.description AS item_description,
            i.image_url,
            i.price_unit,
            i.avg_rating AS item_rating,
            i.total_reviews AS item_reviews
        FROM shop_items si
        JOIN shops s ON s.id = si.shop_id AND s.is_active = true AND s.status = 'approved'
        JOIN items i ON i.id = si.item_id AND i.is_active = true
        WHERE si.item_id = $1
          AND si.is_available = true
        ORDER BY si.price_per_day_inr ASC`,
        [itemId, dates.startDate || null, dates.endDate || null]
    );
    return result.rows;
};

// ─── Search Items ─────────────────────────────────────────────────────────────
exports.searchItems = async ({ q, categoryId, minPrice, maxPrice, deliveryOnly, startDate, endDate, lat, lng, radius, limit, offset }) => {
    const params = [];
    let paramIdx = 1;

    let query = `
        SELECT
            i.id,
            i.name,
            i.description,
            i.image_url,
            i.price_unit,
            i.avg_rating,
            i.total_reviews,
            c.id AS category_id,
            c.name AS category_name,
            c.slug AS category_slug,
            COALESCE(MIN(si.price_per_day_inr), 0) AS min_price_inr,
            COUNT(DISTINCT si.shop_id) AS shop_count,
            SUM(si.quantity_available) AS total_quantity,
            SUM(si.quantity_available - (
                SELECT COUNT(*) FROM bookings b 
                WHERE b.item_id = i.id 
                  AND b.shop_id = si.shop_id
                  AND b.status IN ('confirmed', 'active', 'pending_payment')
                  AND (b.start_date, b.end_date) OVERLAPS (COALESCE($1::date, CURRENT_DATE), COALESCE($2::date, CURRENT_DATE + interval '1 day'))
            )) AS available_quantity,
            BOOL_OR(si.delivery_available) AS delivery_available,
            BOOL_OR(si.pickup_available) AS pickup_available
        FROM items i
        JOIN categories c ON i.category_id = c.id AND c.is_active = true
        JOIN shop_items si ON si.item_id = i.id AND si.is_available = true
        JOIN shops s ON s.id = si.shop_id AND s.is_active = true AND s.status = 'approved'
        WHERE i.is_active = true
    `;
    params.push(startDate, endDate);
    paramIdx += 2;

    if (lat !== null && lat !== undefined && !isNaN(lat) && lng !== null && lng !== undefined && !isNaN(lng)) {
        query += ` AND (6371 * acos(LEAST(GREATEST(cos(radians($${paramIdx})) * cos(radians(s.latitude::float)) * cos(radians(s.longitude::float) - radians($${paramIdx + 1})) + sin(radians($${paramIdx})) * sin(radians(s.latitude::float)), -1), 1))) <= $${paramIdx + 2}`;
        params.push(lat, lng, radius || 50);
        paramIdx += 3;
    }

    if (q && q.trim()) {
        query += ` AND (i.name ILIKE $${paramIdx} OR i.description ILIKE $${paramIdx})`;
        params.push(`%${q.trim()}%`);
        paramIdx++;
    }

    if (categoryId) {
        query += ` AND i.category_id = $${paramIdx}`;
        params.push(parseInt(categoryId, 10));
        paramIdx++;
    }

    if (minPrice !== undefined && minPrice !== null) {
        query += ` AND si.price_per_day_inr >= $${paramIdx}`;
        params.push(parseFloat(minPrice));
        paramIdx++;
    }

    if (maxPrice !== undefined && maxPrice !== null) {
        query += ` AND si.price_per_day_inr <= $${paramIdx}`;
        params.push(parseFloat(maxPrice));
        paramIdx++;
    }

    if (deliveryOnly) {
        query += ` AND si.delivery_available = true`;
    }

    query += `
        GROUP BY i.id, i.name, i.description, i.image_url, i.price_unit,
                 i.avg_rating, i.total_reviews, c.id, c.name, c.slug
        ORDER BY i.avg_rating DESC, i.name ASC
        LIMIT $${paramIdx} OFFSET $${paramIdx + 1}
    `;
    params.push(limit, offset);

    const result = await db.query(query, params);
    return result.rows;
};

exports.countSearchItems = async ({ q, categoryId, minPrice, maxPrice, deliveryOnly, startDate, endDate, lat, lng, radius }) => {
    const params = [];
    let paramIdx = 1;

    let query = `
        SELECT COUNT(DISTINCT i.id) AS total
        FROM items i
        JOIN categories c ON i.category_id = c.id AND c.is_active = true
        JOIN shop_items si ON si.item_id = i.id AND si.is_available = true
        JOIN shops s ON s.id = si.shop_id AND s.is_active = true AND s.status = 'approved'
        WHERE i.is_active = true
          AND (si.quantity_available > (
              SELECT COUNT(*) FROM bookings b
              WHERE b.item_id = i.id
              AND b.shop_id = si.shop_id
              AND b.status IN ('confirmed', 'active', 'pending_payment')
              AND (b.start_date, b.end_date) OVERLAPS (COALESCE($1::date, CURRENT_DATE), COALESCE($2::date, CURRENT_DATE + interval '1 day'))
          ))
    `;
    params.push(startDate, endDate);
    paramIdx += 2;

    if (lat !== null && lat !== undefined && !isNaN(lat) && lng !== null && lng !== undefined && !isNaN(lng)) {
        query += ` AND (6371 * acos(LEAST(GREATEST(cos(radians($${paramIdx})) * cos(radians(s.latitude::float)) * cos(radians(s.longitude::float) - radians($${paramIdx + 1})) + sin(radians($${paramIdx})) * sin(radians(s.latitude::float)), -1), 1))) <= $${paramIdx + 2}`;
        params.push(lat, lng, radius || 50);
        paramIdx += 3;
    }

    if (q && q.trim()) {
        query += ` AND (i.name ILIKE $${paramIdx} OR i.description ILIKE $${paramIdx})`;
        params.push(`%${q.trim()}%`);
        paramIdx++;
    }
    if (categoryId) {
        query += ` AND i.category_id = $${paramIdx}`;
        params.push(parseInt(categoryId, 10));
        paramIdx++;
    }
    if (minPrice !== undefined && minPrice !== null) {
        query += ` AND si.price_per_day_inr >= $${paramIdx}`;
        params.push(parseFloat(minPrice));
        paramIdx++;
    }
    if (maxPrice !== undefined && maxPrice !== null) {
        query += ` AND si.price_per_day_inr <= $${paramIdx}`;
        params.push(parseFloat(maxPrice));
        paramIdx++;
    }
    if (deliveryOnly) {
        query += ` AND si.delivery_available = true`;
    }

    const result = await db.query(query, params);
    return parseInt(result.rows[0].total, 10);
};

// ─── Payment History ──────────────────────────────────────────────────────────
exports.getPaymentsByUser = async (userId, limit, offset) => {
    const result = await db.query(
        `SELECT
            p.id AS payment_id,
            p.booking_id,
            p.amount_inr,
            p.currency,
            p.payment_method,
            p.razorpay_payment_id,
            p.status,
            p.invoice_number,
            p.paid_at,
            p.created_at,
            b.start_date,
            b.end_date,
            b.status AS booking_status,
            i.name AS item_name,
            i.image_url AS item_image
        FROM payments p
        JOIN bookings b ON b.booking_id = p.booking_id
        LEFT JOIN items i ON i.id = b.item_id
        WHERE p.user_id = $1
        ORDER BY p.created_at DESC
        LIMIT $2 OFFSET $3`,
        [userId, limit, offset]
    );
    return result.rows;
};

exports.countPaymentsByUser = async (userId) => {
    const result = await db.query(
        `SELECT COUNT(*) AS total FROM payments WHERE user_id = $1`,
        [userId]
    );
    return parseInt(result.rows[0].total, 10);
};

// ─── Active Rentals ───────────────────────────────────────────────────────────
exports.getActiveRentalsByUser = async (userId) => {
    const result = await db.query(
        `SELECT
            r.id AS rental_id,
            b.booking_id,
            COALESCE(r.start_date, b.start_date) as start_date,
            COALESCE(r.end_date, b.end_date) as end_date,
            COALESCE(r.status, b.status) AS rental_status,
            r.late_fine_per_day_inr,
            r.total_late_fine_inr,
            b.total_amount,
            b.delivery_method,
            i.id AS item_id,
            i.name AS item_name,
            i.image_url AS item_image,
            i.price_unit,
            s.id AS shop_id,
            s.name AS shop_name,
            s.phone AS shop_phone,
            s.city AS shop_city,
            s.address AS shop_address,
            EXTRACT(EPOCH FROM (COALESCE(r.end_date, b.end_date) - NOW())) / 86400 AS days_remaining,
            EXTRACT(EPOCH FROM (COALESCE(r.start_date, b.start_date) - NOW())) / 86400 AS days_until_start
        FROM bookings b
        LEFT JOIN rentals r ON b.booking_id = r.booking_id
        JOIN items i ON i.id = b.item_id
        JOIN shops s ON s.id = b.shop_id
        WHERE b.user_id = $1
          AND b.status IN ('confirmed', 'active')
          AND b.end_date::date >= CURRENT_DATE
        ORDER BY b.end_date ASC`,
        [userId]
    );
    return result.rows;
};

// ─── Active Rentals for Shop Owner ───────────────────────────────────────────
exports.getActiveRentalsForShopOwner = async (userId) => {
    const result = await db.query(
        `SELECT
            r.id AS rental_id,
            b.booking_id,
            b.user_id AS renter_id,
            u.fullname AS renter_name,
            u.email AS renter_email,
            COALESCE(r.start_date, b.start_date) as start_date,
            COALESCE(r.end_date, b.end_date) as end_date,
            COALESCE(r.status, b.status) AS rental_status,
            r.late_fine_per_day_inr,
            r.total_late_fine_inr,
            b.total_amount,
            b.delivery_method,
            i.id AS item_id,
            i.name AS item_name,
            i.image_url AS item_image,
            i.price_unit,
            s.id AS shop_id,
            s.name AS shop_name,
            s.phone AS shop_phone,
            s.city AS shop_city,
            s.address AS shop_address,
            EXTRACT(EPOCH FROM (COALESCE(r.end_date, b.end_date) - NOW())) / 86400 AS days_remaining,
            EXTRACT(EPOCH FROM (COALESCE(r.start_date, b.start_date) - NOW())) / 86400 AS days_until_start
        FROM bookings b
        LEFT JOIN rentals r ON b.booking_id = r.booking_id
        JOIN items i ON i.id = b.item_id
        JOIN shops s ON s.id = b.shop_id
        JOIN users u ON u.id = b.user_id
        WHERE s.owner_id = $1
          AND b.status = 'confirmed'
          AND b.end_date::date >= CURRENT_DATE
        ORDER BY b.end_date ASC`,
        [userId]
    );
    return result.rows;
};

exports.getUpcomingBookings = async (itemId, shopId) => {
    const result = await db.query(
        `SELECT start_date, end_date, status
         FROM bookings
         WHERE item_id = $1 AND shop_id = $2
           AND end_date::date >= CURRENT_DATE
           AND status IN ('confirmed', 'active', 'pending_payment')
         ORDER BY start_date ASC`,
        [itemId, shopId]
    );
    return result.rows;
};

// ─── Nearby Shops ───────────────────────────────────────────────────────────
exports.getNearbyShops = async (lat, lng, radiusKm = 10) => {
    const result = await db.query(
        `SELECT
            id, name, description, address, city, state, pincode,
            phone, image_url, rating, total_reviews,
            (6371 * acos(LEAST(GREATEST(cos(radians($1)) * cos(radians(latitude::float)) * cos(radians(longitude::float) - radians($2)) + sin(radians($1)) * sin(radians(latitude::float)), -1), 1))) AS distance
         FROM shops
         WHERE is_active = true
         AND (6371 * acos(LEAST(GREATEST(cos(radians($1)) * cos(radians(latitude::float)) * cos(radians(longitude::float) - radians($2)) + sin(radians($1)) * sin(radians(latitude::float)), -1), 1))) <= $3
         ORDER BY distance ASC
         LIMIT 6`,
        [lat, lng, radiusKm]
    );
    return result.rows;
};

// ─── Item Detail ──────────────────────────────────────────────────────────────
exports.getItemById = async (itemId) => {
    const result = await db.query(
        `SELECT i.*, c.name AS category_name, c.slug AS category_slug
         FROM items i
         JOIN categories c ON c.id = i.category_id
         WHERE i.id = $1 AND i.is_active = true`,
        [itemId]
    );
    return result.rows[0];
};

// ─── Profile Stats ─────────────────────────────────────────────────────────────
exports.getUserProfileStats = async (userId) => {
    // Top Categories (Interests)
    const topCategories = await db.query(
        `SELECT c.id, c.name, COUNT(*) as count
         FROM bookings b
         JOIN items i ON b.item_id = i.id
         JOIN categories c ON i.category_id = c.id
         WHERE b.user_id = $1 AND b.status != 'cancelled'
         GROUP BY c.id, c.name
         ORDER BY count DESC
         LIMIT 3`,
        [userId]
    );

    // Top Item
    const topItem = await db.query(
        `SELECT i.id, i.name, i.image_url, COUNT(*) as count
         FROM bookings b
         JOIN items i ON b.item_id = i.id
         WHERE b.user_id = $1 AND b.status != 'cancelled'
         GROUP BY i.id, i.name, i.image_url
         ORDER BY count DESC
         LIMIT 1`,
        [userId]
    );

    // Favorite Shop (Partner of Choice)
    const favoriteShop = await db.query(
        `SELECT s.id, s.name, COUNT(*) as count
         FROM bookings b
         JOIN shops s ON b.shop_id = s.id
         WHERE b.user_id = $1 AND b.status != 'cancelled'
         GROUP BY s.id, s.name
         ORDER BY count DESC
         LIMIT 1`,
        [userId]
    );

    return {
        topCategories: topCategories.rows,
        topItem: topItem.rows[0] || null,
        favoriteShop: favoriteShop.rows[0] || null
    };
};

// ─── Shop Item Details ────────────────────────────────────────────────────────
exports.getShopItemDetails = async (shopItemId, dates = {}) => {
    const result = await db.query(
        `SELECT 
            si.id AS shop_item_id,
            si.item_id,
            si.shop_id,
            si.price_per_day_inr,
            si.quantity_available AS total_quantity,
            si.quantity_available - (
                SELECT COUNT(*) FROM bookings b 
                WHERE b.item_id = si.item_id 
                  AND b.shop_id = si.shop_id 
                  AND b.status IN ('confirmed', 'active', 'pending_payment')
                  AND (b.start_date, b.end_date) OVERLAPS (
                      COALESCE($2::date, CURRENT_DATE), 
                      COALESCE($3::date, CURRENT_DATE + interval '1 day')
                  )
            ) AS available_quantity,
            si.is_available,
            si.delivery_available,
            si.pickup_available,
            si.delivery_fee_inr,
            i.name AS item_name,
            i.description AS item_description,
            i.image_url,
            i.avg_rating,
            i.total_reviews AS item_reviews,
            s.name AS shop_name,
            s.rating AS shop_rating,
            s.total_reviews AS shop_reviews,
            s.address,
            s.city,
            s.state,
            s.pincode,
            s.latitude::float,
            s.longitude::float,
            s.phone,
            s.working_hours,
            s.location_restrictions
        FROM shop_items si
        JOIN items i ON si.item_id = i.id
        JOIN shops s ON si.shop_id = s.id
        WHERE si.id = $1`,
        [shopItemId, dates.startDate || null, dates.endDate || null]
    );
    return result.rows[0];
};
