import { createContext, useContext, useState, useCallback } from 'react';
import * as dashboardService from '../services/dashboardService';

const DashboardContext = createContext();

export const DashboardProvider = ({ children }) => {
    const [summary, setSummary] = useState(null);
    const [categories, setCategories] = useState([]);
    const [summaryLoading, setSummaryLoading] = useState(false);
    const [categoriesLoading, setCategoriesLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchSummary = useCallback(async () => {
        setSummaryLoading(true);
        try {
            const res = await dashboardService.getDashboardSummary();
            setSummary(res.data);
        } catch (err) {
            setError('Failed to load dashboard summary');
        } finally {
            setSummaryLoading(false);
        }
    }, []);

    const fetchCategories = useCallback(async () => {
        if (categories?.length > 0) return; // Cache
        setCategoriesLoading(true);
        try {
            const res = await dashboardService.getCategories();
            setCategories(res.data || []);
        } catch (err) {
            setError('Failed to load categories');
            setCategories([]);
        } finally {
            setCategoriesLoading(false);
        }
    }, [categories?.length]);

    return (
        <DashboardContext.Provider value={{
            summary,
            categories,
            summaryLoading,
            categoriesLoading,
            error,
            fetchSummary,
            fetchCategories,
        }}>
            {children}
        </DashboardContext.Provider>
    );
};

export const useDashboard = () => useContext(DashboardContext);
