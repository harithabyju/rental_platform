import { useState } from 'react';
import CategoryDropdown from '../../components/common/CategoryDropdown';

const CustomerHome = () => {
    const [filters, setFilters] = useState({
        categoryId: '',
        search: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFilters({ ...filters, [name]: value });
    };

    const handleFilterChange = (e) => {
        // Specifically for category dropdown to match its expected signature if needed
        // But since it uses select name, standard handleChange works
        handleChange(e);
        console.log(`Filtering by category: ${e.target.value ?? 'All'}`);
    };

    return (
        <div className="max-w-7xl mx-auto py-10 px-4">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Browse Items</h1>

            <div className="bg-white p-4 rounded shadow mb-6 flex items-center space-x-4">
                <div className="flex-1">
                    <input
                        type="text"
                        name="search"
                        placeholder="Search items..."
                        value={filters.search}
                        onChange={handleChange}
                        className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                </div>
                <div className="w-64">
                    <CategoryDropdown
                        value={filters.categoryId}
                        onChange={handleFilterChange}
                        label="Filter by Category"
                        name="categoryId"
                        required={false}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Mock Items Logic would go here */}
                <div className="bg-white p-6 rounded shadow">
                    <div className="h-40 bg-gray-200 mb-4 rounded"></div>
                    <h3 className="font-bold text-lg mb-2">Sample Item</h3>
                    <p className="text-gray-600 mb-2">Category: {filters.categoryId ? 'Filtered' : 'Any'}</p>
                    <p className="text-sm text-gray-500">Based on selection: {filters.categoryId}</p>
                    <button className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded w-full hover:bg-indigo-700">View Details</button>
                </div>
                {/* More mock items... */}
            </div>
        </div>
    );
};

export default CustomerHome;
