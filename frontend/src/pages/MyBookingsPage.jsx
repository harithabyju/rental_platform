import React, { useEffect, useState } from 'react';
import { getMyBookings } from '../services/bookingService';
import BookingCard from '../components/BookingCard';

const MyBookingsPage = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchBookings = async () => {
        try {
            const data = await getMyBookings();
            setBookings(data);
        } catch (err) {
            setError('Failed to load bookings');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    if (loading) return <div className="p-4">Loading...</div>;
    if (error) return <div className="p-4 text-red-500">{error}</div>;

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">My Bookings</h1>
            {bookings.length === 0 ? (
                <p>No bookings found.</p>
            ) : (
                <div className="grid gap-4">
                    {bookings.map(booking => (
                        <BookingCard key={booking.booking_id} booking={booking} onUpdate={fetchBookings} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyBookingsPage;
