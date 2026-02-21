const bookingRepository = require('./booking.repository');
const shopService = require('../shops/shop.service');
const itemRepository = require('../items/item.repository');

class BookingService {
    async createBooking(userId, bookingData) {
        const { item_id, start_date, end_date } = bookingData;

        // 1. Fetch item and associated shop info
        const item = await itemRepository.findById(item_id);
        if (!item) throw new Error('Item not found');

        // 2. Scenario 1: Night-Time Rental Restriction
        // Check if the shop is open at the requested start time
        const isOpen = await shopService.isShopOpen(item.shop_id, start_date);
        if (!isOpen) {
            throw new Error(`Shop is closed at the scheduled pick-up time. Working hours: ${item.working_hours.open} - ${item.working_hours.close}`);
        }

        // 3. Scenario 10: Location-Based Restrictions
        // (Simplified version: checking against shop-level restrictions)
        // In a full implementation, we'd also check regional_restrictions table for the item category
        if (item.shop_restrictions && bookingData.delivery_address) {
            // Assume we have a utility to check if address is in restricted regions
            const isRestricted = item.shop_restrictions.some(region =>
                bookingData.delivery_address.toLowerCase().includes(region.toLowerCase())
            );
            if (isRestricted) {
                throw new Error('This item cannot be delivered to your selected region.');
            }
        }

        // 4. Create the booking with a transaction (Scenario 5: Double Booking Prevention)
        return await bookingRepository.createWithTransaction({
            ...bookingData,
            user_id: userId,
            security_deposit: item.security_deposit
        });
    }

    async confirmBooking(ownerId, bookingId) {
        const booking = await bookingRepository.findById(bookingId);
        if (!booking) throw new Error('Booking not found');

        const item = await itemRepository.findById(booking.item_id);
        if (item.owner_id !== ownerId) throw new Error('Unauthorized');

        // Scenario 6: Vendor Confirmation System
        return await bookingRepository.updateStatus(bookingId, 'confirmed');
    }

    async cancelBooking(userId, bookingId) {
        const booking = await bookingRepository.findById(bookingId);
        if (!booking) throw new Error('Booking not found');
        if (booking.user_id !== userId) throw new Error('Unauthorized');

        // Scenario 11: Refund & Cancellation Policy
        // Logic for partial refunds would go here
        return await bookingRepository.updateStatus(bookingId, 'cancelled');
    }

    async getMyBookings(userId) {
        return await bookingRepository.findByUserId(userId);
    }

    async getShopBookings(ownerId) {
        return await bookingRepository.findByShopOwnerId(ownerId);
    }
}

module.exports = new BookingService();
