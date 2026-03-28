import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import ReviewModal from '../components/ReviewModal';
import api from '../services/api';
import { toast } from 'react-toastify';

// Mock Dependencies
vi.mock('../services/api', () => ({
  default: {
    post: vi.fn(),
    defaults: { baseURL: 'http://localhost:5000/api' }
  }
}));

vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

// Mock createPortal
vi.mock('react-dom', async () => {
  const actual = await vi.importActual('react-dom');
  return {
    ...actual,
    createPortal: (node) => node,
  };
});

describe('ReviewModal Component', () => {
    const mockProps = {
        isOpen: true,
        onClose: vi.fn(),
        booking: {
            booking_id: 123,
            item_id: 456,
            item_name: 'Test Item'
        },
        onSuccess: vi.fn()
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders correctly when open', () => {
        render(<ReviewModal {...mockProps} />);
        expect(screen.getByText(/Rate your Experience/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/How was the item and the service/i)).toBeInTheDocument();
    });

    it('does not render when closed', () => {
        render(<ReviewModal {...mockProps} isOpen={false} />);
        expect(screen.queryByText(/Rate your Experience/i)).not.toBeInTheDocument();
    });

    it('updates rating on star click', () => {
        render(<ReviewModal {...mockProps} />);
        const stars = screen.getAllByRole('button').filter(b => b.querySelector('svg'));
        // stars[0] is the Close button, stars[1-5] are the Star buttons.
        fireEvent.click(stars[3]); // Rating 3
        expect(screen.getByText('Good')).toBeInTheDocument();
    });

    it('submits correctly', async () => {
        api.post.mockResolvedValueOnce({ data: { message: 'Success' } });
        render(<ReviewModal {...mockProps} />);
        
        const textarea = screen.getByPlaceholderText(/How was the item and the service/i);
        fireEvent.change(textarea, { target: { value: 'Great service!' } });
        
        const submitBtn = screen.getByRole('button', { name: /Submit Review/i });
        fireEvent.click(submitBtn);

        await waitFor(() => {
            expect(api.post).toHaveBeenCalledWith('/reviews', expect.objectContaining({
                bookingId: 123,
                itemId: 456,
                rating: 5, // Default is 5
                comment: 'Great service!'
            }));
            expect(toast.success).toHaveBeenCalledWith('Review submitted successfully!');
            expect(mockProps.onSuccess).toHaveBeenCalled();
            expect(mockProps.onClose).toHaveBeenCalled();
        });
    });

    it('handles submission error', async () => {
        api.post.mockRejectedValueOnce({ response: { data: { message: 'Test Error' } } });
        render(<ReviewModal {...mockProps} />);
        
        const submitBtn = screen.getByRole('button', { name: /Submit Review/i });
        fireEvent.click(submitBtn);

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('Test Error');
        });
    });
});
