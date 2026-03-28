import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import CustomerDashboard from '../pages/CustomerDashboard';
import { AuthProvider } from '../context/AuthContext';
import { DashboardProvider } from '../context/DashboardContext';

// Mock the context hooks
vi.mock('../context/AuthContext', () => ({
    useAuth: () => ({
        user: { fullname: 'John Doe', latitude: 28.6139, longitude: 77.2090 }
    }),
    AuthProvider: ({ children }) => <div>{children}</div>
}));

vi.mock('../context/DashboardContext', () => ({
    useDashboard: () => ({
        categories: [
            { id: 1, name: 'Electronics', slug: 'electronics' },
            { id: 2, name: 'Vehicles', slug: 'vehicles' }
        ],
        fetchCategories: vi.fn(),
        summary: { activeRentals: 2, completedRentals: 5, totalSpentFormatted: '₹1500.00' },
        fetchSummary: vi.fn()
    }),
    DashboardProvider: ({ children }) => <div>{children}</div>
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

describe('CustomerDashboard Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders welcome message with user name', () => {
        render(
            <BrowserRouter>
                <CustomerDashboard />
            </BrowserRouter>
        );
        expect(screen.getByText(/Namaste, John!/i)).toBeInTheDocument();
    });

    it('renders statistics correctly', () => {
        render(
            <BrowserRouter>
                <CustomerDashboard />
            </BrowserRouter>
        );
        expect(screen.getByText('2')).toBeInTheDocument(); // Active Rentals
        expect(screen.getByText('5')).toBeInTheDocument(); // Completed
        expect(screen.getByText('₹1500.00')).toBeInTheDocument(); // Total Spent
    });

    it('updates search input and navigates on submit', () => {
        render(
            <BrowserRouter>
                <CustomerDashboard />
            </BrowserRouter>
        );
        
        const searchInput = screen.getByPlaceholderText(/What are you looking for\?/i);
        fireEvent.change(searchInput, { target: { value: 'camera' } });
        
        const findButton = screen.getByText(/Find Now/i);
        fireEvent.click(findButton);
        
        expect(mockNavigate).toHaveBeenCalledWith(expect.stringContaining('q=camera'));
    });

    it('renders categories and navigates on click', () => {
        render(
            <BrowserRouter>
                <CustomerDashboard />
            </BrowserRouter>
        );
        
        const electronicsBtn = screen.getByText('Electronics');
        expect(electronicsBtn).toBeInTheDocument();
        
        fireEvent.click(electronicsBtn);
        expect(mockNavigate).toHaveBeenCalledWith(expect.stringContaining('categoryId=1'));
    });
});
