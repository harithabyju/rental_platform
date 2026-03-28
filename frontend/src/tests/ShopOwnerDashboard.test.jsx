import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import ShopOwnerDashboard from '../pages/shop-owner/ShopOwnerDashboard';
import { AuthProvider } from '../context/AuthContext';
import shopService from '../services/shop.service';
import itemService from '../services/item.service';
import * as dashboardService from '../services/dashboardService';

// Mock Dependencies
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 1, fullname: 'Test Owner', role: 'shop_owner' }
  }),
  AuthProvider: ({ children }) => <div>{children}</div>
}));

vi.mock('../services/shop.service', () => ({
  default: {
    getMyShop: vi.fn(),
    getPermittedCategories: vi.fn(),
    submitForApproval: vi.fn()
  }
}));

vi.mock('../services/item.service', () => ({
  default: {
    getItemsByShop: vi.fn(),
    addItem: vi.fn()
  }
}));

vi.mock('../services/dashboardService', () => ({
  fetchSummary: vi.fn()
}));

vi.mock('../services/bookingService', () => ({
  getShopBookings: vi.fn().mockResolvedValue([])
}));

vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn()
  }
}));

// Mock lucide-react icons
vi.mock('lucide-react', async () => {
    const actual = await vi.importActual('lucide-react');
    const mockIcon = () => <div data-testid="icon" />;
    const mocks = {};
    Object.keys(actual).forEach(key => {
        mocks[key] = mockIcon;
    });
    return mocks;
});

// Mock IntersectionObserver
class IntersectionObserver {
    observe() {} unobserve() {} disconnect() {}
}
window.IntersectionObserver = IntersectionObserver;

describe('ShopOwnerDashboard Component', () => {
    const renderDashboard = () => render(
        <MemoryRouter>
            <ShopOwnerDashboard />
        </MemoryRouter>
    );

    beforeEach(() => {
        vi.clearAllMocks();
        shopService.getPermittedCategories.mockImplementation(() => Promise.resolve([]));
        itemService.getItemsByShop.mockImplementation(() => Promise.resolve([]));
        dashboardService.fetchSummary.mockImplementation(() => Promise.resolve({ earnings: 0, activeRentals: 0, itemsCount: 0 }));
    });

    it('renders "Action Required" banner for incomplete shop', async () => {
        shopService.getMyShop.mockImplementation(() => Promise.resolve({
            id: 10,
            status: 'incomplete',
            shop_name: 'Test Shop',
            address: null,
            govt_id_url: null
        }));

        renderDashboard();

        await waitFor(() => {
            expect(screen.getByText(/Action Required/i)).toBeInTheDocument();
        });
    });

    it('renders "Awaiting Admin Approval" banner for pending shop', async () => {
        shopService.getMyShop.mockResolvedValue({
            id: 10,
            status: 'pending',
            name: 'Test Shop'
        });

        renderDashboard();

        await waitFor(() => {
            expect(screen.getByText(/Awaiting Admin Approval/i)).toBeInTheDocument();
        });
    });

    it('displays shop name and owner name', async () => {
        shopService.getMyShop.mockResolvedValue({
            id: 10,
            status: 'approved',
            shop_name: 'My Awesome Shop'
        });

        renderDashboard();

        await waitFor(() => {
            expect(screen.getByText('My Awesome Shop')).toBeInTheDocument();
            expect(screen.getByText(/Welcome back, Test/i)).toBeInTheDocument();
        });
    });

    it('shows the verification checklist for incomplete shop', async () => {
        shopService.getMyShop.mockResolvedValue({
            id: 10,
            status: 'incomplete',
            shop_name: 'Test Shop',
            address: '123 test st',
            govt_id_url: 'id.jpg',
            shop_license_url: null,
            bank_account_number: null
        });

        renderDashboard();

        await waitFor(() => {
            expect(screen.getByText('Verification Status')).toBeInTheDocument();
            expect(screen.getByText('Shop Address')).toBeInTheDocument();
            expect(screen.getByText('123 test st, undefined')).toBeInTheDocument();
        });
    });

    it('opens add item modal when "Add First Item" is clicked', async () => {
        shopService.getMyShop.mockResolvedValue({
            id: 10,
            status: 'approved',
            shop_name: 'Approved Shop'
        });

        renderDashboard();

        let addBtn;
        await waitFor(() => {
            addBtn = screen.getByRole('button', { name: /add your first item/i });
        });
        
        fireEvent.click(addBtn);

        await waitFor(() => {
            expect(screen.getByText(/Add New Item/i)).toBeInTheDocument();
        });
    });
});
