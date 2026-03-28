import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, it, expect } from 'vitest';
import BookingCard from '../components/BookingCard';
import * as bookingService from '../services/bookingService';

// Mock services
vi.mock('../services/bookingService', () => ({
    cancelBooking: vi.fn(),
    extendBooking: vi.fn(),
    returnBooking: vi.fn()
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

describe('BookingCard Component', () => {
    const mockBooking = {
        booking_id: 1,
        item_name: 'Camera',
        shop_name: 'Tech Shop',
        shop_city: 'Mumbai',
        total_amount: 1000,
        start_date: '2026-04-01',
        end_date: '2026-04-05',
        status: 'confirmed',
        item_image: null
    };

    it('renders booking details correctly', () => {
        render(
            <BrowserRouter>
                <BookingCard booking={mockBooking} onUpdate={vi.fn()} />
            </BrowserRouter>
        );

        expect(screen.getByText('Camera')).toBeInTheDocument();
        expect(screen.getByText('₹1000')).toBeInTheDocument();
        expect(screen.getByText('confirmed')).toBeInTheDocument();
    });

    it('shows action buttons for confirmed status', () => {
        render(
            <BrowserRouter>
                <BookingCard booking={mockBooking} onUpdate={vi.fn()} />
            </BrowserRouter>
        );

        expect(screen.getByText('Extend')).toBeInTheDocument();
        expect(screen.getByText('Cancel')).toBeInTheDocument();
        expect(screen.getByText('Confirm Return')).toBeInTheDocument();
    });

    it('shows refund amount for cancelled status', () => {
        const cancelledBooking = { ...mockBooking, status: 'cancelled', refund_amount: 500 };
        render(
            <BrowserRouter>
                <BookingCard booking={cancelledBooking} onUpdate={vi.fn()} />
            </BrowserRouter>
        );

        expect(screen.getByText(/Booking Cancelled/i)).toBeInTheDocument();
        expect(screen.getByText(/Got Return Payment: ₹500/i)).toBeInTheDocument();
    });

    it('calls cancelBooking service on cancel click', async () => {
        vi.spyOn(window, 'confirm').mockReturnValue(true);
        render(
            <BrowserRouter>
                <BookingCard booking={mockBooking} onUpdate={vi.fn()} />
            </BrowserRouter>
        );

        fireEvent.click(screen.getByText('Cancel'));
        expect(bookingService.cancelBooking).toHaveBeenCalledWith(1);
    });

    it('navigates to delivery tracking for delivery bookings', () => {
        const deliveryBooking = { ...mockBooking, delivery_method: 'delivery' };
        render(
            <BrowserRouter>
                <BookingCard booking={deliveryBooking} onUpdate={vi.fn()} />
            </BrowserRouter>
        );

        const trackBtn = screen.getByText(/Track Delivery/i);
        fireEvent.click(trackBtn);
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard/delivery/1');
    });
});
