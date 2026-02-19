import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDashboard } from '../context/DashboardContext';
import * as dashboardService from '../services/dashboardService';
import ItemCard from '../components/ItemCard';
import CategorySidebar from '../components/CategorySidebar';
import SearchBar from '../components/SearchBar';
import { SlidersHorizontal, PackageSearch } from 'lucide-react';

const BrowseItems = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const { categories, categoriesLoading, fetchCategories } = useDashboard();

    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
    const [error, setError] = useState(null);

    // Sync filters from URL
    const filters = {
        q: searchParams.get('q') || '',
        categoryId: searchParams.get('categoryId') ? parseInt(searchParams.get('categoryId')) : null,
        minPrice: searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')) : null,
        maxPrice: searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')) : null,
        deliveryOnly: searchParams.get('deliveryOnly') === 'true',
        page: parseInt(searchParams.get('page')) || 1,
    };

    const fetchItems = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await dashboardService.searchItems(filters);
            setItems(res.items);
            setPagination(res.pagination);
        } catch (err) {
            setError('Failed to fetch items. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        fetchItems();
    }, [searchParams]);

    const handleFilterChange = (newFilters) => {
        const updatedParams = new URLSearchParams(searchParams);

        Object.keys(newFilters).forEach(key => {
            const val = newFilters[key];
            if (val === null || val === undefined || val === '' || val === false) {
                updatedParams.delete(key);
            } else {
                updatedParams.set(key, val);
            }
        });

        // Reset to page 1 on filter change
        if (!newFilters.page) {
            updatedParams.delete('page');
        }

        setSearchParams(updatedParams);
    };

    return (
        <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar / Filters */}
            <div className="w-full lg:w-64 flex-shrink-0">
                <CategorySidebar
                    categories={categories}
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    loading={categoriesLoading}
                />
            </div>

            {/* Main Content */}
            <div className="flex-1">
                <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            {filters.categoryId
                                ? categories.find(c => c.id === filters.categoryId)?.name || 'Browse Items'
                                : filters.q ? `Search results for "${filters.q}"` : 'Browse All Items'}
                        </h1>
                        <p className="text-gray-500 text-sm mt-1">
                            {pagination.total || 0} items found
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <SearchBar
                            value={filters.q}
                            onChange={(q) => handleFilterChange({ q })}
                            className="w-full md:w-64"
                        />
                    </div>
                </div>

                {/* Results Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="bg-white rounded-3xl h-[28rem] animate-pulse border border-gray-100 shadow-sm" />
                        ))}
                    </div>
                ) : error ? (
                    <div className="bg-red-50 border border-red-100 rounded-[2rem] p-12 text-center animate-fade-in">
                        <p className="text-red-700 font-bold mb-4">{error}</p>
                        <button
                            onClick={fetchItems}
                            className="px-8 py-3 bg-red-600 text-white rounded-2xl font-bold hover:bg-red-700 transition-all active:scale-95 shadow-lg shadow-red-100"
                        >
                            Retry Search
                        </button>
                    </div>
                ) : items.length === 0 ? (
                    <div className="bg-white rounded-[2rem] border border-gray-100 p-24 text-center shadow-sm animate-scale-up">
                        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <PackageSearch className="w-12 h-12 text-gray-200" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">No treasures found!</h2>
                        <p className="text-gray-500 mt-2 max-w-sm mx-auto font-medium">
                            Try adjusting your filters or search keywords. Maybe search for "Camera" or "Bike"?
                        </p>
                        <button
                            onClick={() => handleFilterChange({ q: '', categoryId: null, minPrice: null, maxPrice: null, deliveryOnly: false })}
                            className="mt-8 px-8 py-3 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all active:scale-95 shadow-lg shadow-emerald-100"
                        >
                            Clear All Filters
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                            {items.map(item => (
                                <ItemCard key={item.id} item={item} />
                            ))}
                        </div>

                        {/* Pagination */}
                        {pagination.totalPages > 1 && (
                            <div className="mt-16 flex justify-center items-center gap-3">
                                <button
                                    disabled={pagination.page === 1}
                                    onClick={() => handleFilterChange({ page: pagination.page - 1 })}
                                    className="px-6 py-2.5 bg-white border border-gray-200 rounded-2xl text-sm font-bold text-gray-600 hover:bg-gray-50 hover:text-emerald-600 hover:border-emerald-200 disabled:opacity-50 transition-all"
                                >
                                    Prev
                                </button>
                                <div className="flex items-center gap-2">
                                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(p => (
                                        <button
                                            key={p}
                                            onClick={() => handleFilterChange({ page: p })}
                                            className={`w-12 h-12 rounded-2xl text-sm font-black transition-all ${pagination.page === p
                                                ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-100 scale-110'
                                                : 'bg-white border border-gray-100 text-gray-400 hover:bg-emerald-50 hover:text-emerald-700'
                                                }`}
                                        >
                                            {p}
                                        </button>
                                    ))}
                                </div>
                                <button
                                    disabled={pagination.page === pagination.totalPages}
                                    onClick={() => handleFilterChange({ page: pagination.page + 1 })}
                                    className="px-6 py-2.5 bg-white border border-gray-200 rounded-2xl text-sm font-bold text-gray-600 hover:bg-gray-50 hover:text-emerald-600 hover:border-emerald-200 disabled:opacity-50 transition-all"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default BrowseItems;
