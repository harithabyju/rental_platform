const query = require('./dashboard.query');

// Configurable USD to INR conversion rate
const USD_TO_INR = parseFloat(process.env.USD_TO_INR_RATE) || 83;

/**
 * Convert USD amount to INR
 */
const toINR = (usdAmount) => {
    if (!usdAmount) return 0;
    return parseFloat((parseFloat(usdAmount) * USD_TO_INR).toFixed(2));
};

/**
 * Format INR currency string
 */
const formatINR = (amount) => {
    return `₹${parseFloat(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

/**
 * Calculate days remaining until a date
 */
const calcDaysRemaining = (endDate) => {
    const now = new Date();
    const end = new Date(endDate);
    const diffMs = end - now;
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
};

/**
 * Calculate late fine for overdue rentals
 */
const calcLateFine = (endDate, lateFinePerDay) => {
    const daysRemaining = calcDaysRemaining(endDate);
    if (daysRemaining >= 0) return 0;
    const daysOverdue = Math.abs(daysRemaining);
    return parseFloat((daysOverdue * (lateFinePerDay || 0)).toFixed(2));
};

// ─── Service Methods ──────────────────────────────────────────────────────────

exports.getDashboardSummary = async (userId) => {
    const raw = await query.getDashboardSummary(userId);
    return {
        totalBookings: parseInt(raw.totalBookings, 10) || 0,
        activeRentals: parseInt(raw.activeRentals, 10) || 0,
        completedRentals: parseInt(raw.completedRentals, 10) || 0,
        cancelledRentals: parseInt(raw.cancelledRentals, 10) || 0,
        totalSpent: parseFloat(raw.totalSpent || 0).toFixed(2),
        totalSpentFormatted: formatINR(raw.totalSpent || 0),
    };
};

exports.getAllCategories = async () => {
    return await query.getAllCategories();
};

exports.getItemsByCategory = async (categoryId, page = 1, pageSize = 12) => {
    const limit = parseInt(pageSize, 10);
    const offset = (parseInt(page, 10) - 1) * limit;

    const [items, total] = await Promise.all([
        query.getItemsByCategory(categoryId, limit, offset),
        query.countItemsByCategory(categoryId),
    ]);

    return {
        items: items.map(formatItem),
        pagination: {
            page: parseInt(page, 10),
            pageSize: limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};

exports.getShopsForItem = async (itemId) => {
    const rows = await query.getShopsForItem(itemId);
    return rows.map((row) => ({
        shopItemId: row.shop_item_id,
        shopId: row.shop_id,
        shopName: row.shop_name,
        location: {
            address: row.address,
            city: row.city,
            state: row.state,
            pincode: row.pincode,
            latitude: row.latitude,
            longitude: row.longitude,
        },
        shopPhone: row.phone,
        shopRating: parseFloat(row.shop_rating || 0),
        shopReviews: parseInt(row.shop_reviews || 0, 10),
        pricePerDay: parseFloat(row.price_per_day_inr),
        priceFormatted: formatINR(row.price_per_day_inr),
        priceUnit: row.price_unit,
        quantityAvailable: row.quantity_available,
        isAvailable: row.is_available,
        deliveryAvailable: row.delivery_available,
        pickupAvailable: row.pickup_available,
        deliveryFee: parseFloat(row.delivery_fee_inr || 0),
        deliveryFeeFormatted: formatINR(row.delivery_fee_inr || 0),
        item: {
            id: itemId,
            name: row.item_name,
            description: row.item_description,
            imageUrl: row.image_url,
            rating: parseFloat(row.item_rating || 0),
            totalReviews: parseInt(row.item_reviews || 0, 10),
        },
    }));
};

exports.searchItems = async (filters, page = 1, pageSize = 12) => {
    const limit = parseInt(pageSize, 10);
    const offset = (parseInt(page, 10) - 1) * limit;

    const [items, total] = await Promise.all([
        query.searchItems({ ...filters, limit, offset }),
        query.countSearchItems(filters),
    ]);

    return {
        items: items.map(formatItem),
        pagination: {
            page: parseInt(page, 10),
            pageSize: limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};

exports.getPaymentsByUser = async (userId, page = 1, pageSize = 10) => {
    const limit = parseInt(pageSize, 10);
    const offset = (parseInt(page, 10) - 1) * limit;

    const [payments, total] = await Promise.all([
        query.getPaymentsByUser(userId, limit, offset),
        query.countPaymentsByUser(userId),
    ]);

    return {
        payments: payments.map((p) => ({
            paymentId: p.payment_id,
            bookingId: p.booking_id,
            amount: parseFloat(p.amount_inr),
            amountFormatted: formatINR(p.amount_inr),
            currency: p.currency,
            paymentMethod: p.payment_method,
            razorpayPaymentId: p.razorpay_payment_id,
            status: p.status,
            invoiceNumber: p.invoice_number,
            paidAt: p.paid_at,
            createdAt: p.created_at,
            booking: {
                startDate: p.start_date,
                endDate: p.end_date,
                status: p.booking_status,
            },
            item: {
                name: p.item_name,
                imageUrl: p.item_image,
            },
        })),
        pagination: {
            page: parseInt(page, 10),
            pageSize: limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};

exports.getActiveRentalsByUser = async (userId) => {
    const rows = await query.getActiveRentalsByUser(userId);
    return rows.map((r) => {
        const daysRemaining = parseFloat(r.days_remaining || 0);
        const isOverdue = daysRemaining < 0;
        const lateFine = isOverdue
            ? calcLateFine(r.end_date, r.late_fine_per_day_inr)
            : 0;

        return {
            rentalId: r.rental_id,
            bookingId: r.booking_id,
            startDate: r.start_date,
            endDate: r.end_date,
            rentalStatus: isOverdue ? 'overdue' : r.rental_status,
            daysRemaining: Math.ceil(daysRemaining),
            isOverdue,
            daysOverdue: isOverdue ? Math.abs(Math.ceil(daysRemaining)) : 0,
            lateFine,
            lateFineFormatted: formatINR(lateFine),
            totalAmount: parseFloat(r.total_amount || 0),
            totalAmountFormatted: formatINR(r.total_amount || 0),
            deliveryMethod: r.delivery_method,
            item: {
                id: r.item_id,
                name: r.item_name,
                imageUrl: r.item_image,
                priceUnit: r.price_unit,
            },
            shop: {
                id: r.shop_id,
                name: r.shop_name,
                phone: r.shop_phone,
                city: r.shop_city,
                address: r.shop_address,
            },
        };
    });
};

exports.getUserProfileStats = async (userId) => {
    const stats = await query.getUserProfileStats(userId);
    return {
        topCategories: stats.topCategories.map(c => ({
            id: c.id,
            name: c.name,
            count: parseInt(c.count, 10)
        })),
        topItem: stats.topItem ? {
            id: stats.topItem.id,
            name: stats.topItem.name,
            imageUrl: stats.topItem.image_url,
            rentalCount: parseInt(stats.topItem.count, 10)
        } : null,
        favoriteShop: stats.favoriteShop ? {
            id: stats.favoriteShop.id,
            name: stats.favoriteShop.name,
            rentalCount: parseInt(stats.favoriteShop.count, 10)
        } : null
    };
};


// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatItem(i) {
    return {
        id: i.id,
        name: i.name,
        description: i.description,
        imageUrl: i.image_url,
        priceUnit: i.price_unit,
        minPriceInr: parseFloat(i.min_price_inr || 0),
        minPriceFormatted: formatINR(i.min_price_inr || 0),
        avgRating: parseFloat(i.avg_rating || 0),
        totalReviews: parseInt(i.total_reviews || 0, 10),
        shopCount: parseInt(i.shop_count || 0, 10),
        deliveryAvailable: i.delivery_available,
        pickupAvailable: i.pickup_available,
        isAvailable: i.is_available !== false,
        category: {
            id: i.category_id,
            name: i.category_name,
            slug: i.category_slug,
        },
    };
}

exports.getShopItemDetails = async (shopItemId) => {
    return await query.getShopItemDetails(shopItemId);
};
