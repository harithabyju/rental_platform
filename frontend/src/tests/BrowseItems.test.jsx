import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import BrowseItems from '../pages/BrowseItems';
import * as dashboardService from '../services/dashboardService';

// Mock the context and service
vi.mock('../context/DashboardContext', () => ({
    useDashboard: () => ({
        categories: [{ id: 1, name: 'Electronics' }],
        categoriesLoading: false,
        fetchCategories: vi.fn()
    })
}));

vi.mock('../services/dashboardService', () => ({
    searchItems: vi.fn()
}));

// Mock useSearchParams
const mockSearchParams = new URLSearchParams();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useSearchParams: () => [mockSearchParams, vi.fn()],
    };
});

describe('BrowseItems Page', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders and fetches items', async () => {
        const mockItems = [
            { id: 1, name: 'DSLR Camera', price: 500, category_name: 'Electronics' }
        ];
        dashboardService.searchItems.mockResolvedValue({
            items: mockItems,
            pagination: { total: 1, totalPages: 1, page: 1 }
        });

        render(
            <BrowserRouter>
                <BrowseItems />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('DSLR Camera')).toBeInTheDocument();
        });
        expect(screen.getByText('1 items found')).toBeInTheDocument();
    });

    it('shows empty state when no items found', async () => {
        dashboardService.searchItems.mockResolvedValue({
            items: [],
            pagination: { total: 0, totalPages: 0, page: 1 }
        });

        render(
            <BrowserRouter>
                <BrowseItems />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByText(/No treasures found!/i)).toBeInTheDocument();
        });
    });

    it('shows error state on API failure', async () => {
        dashboardService.searchItems.mockRejectedValue(new Error('API error'));

        render(
            <BrowserRouter>
                <BrowseItems />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByText(/Failed to fetch items/i)).toBeInTheDocument();
        });
    });
});
