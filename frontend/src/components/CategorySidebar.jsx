import { useState } from 'react';
import { Filter, ChevronDown, ChevronUp, Truck, Package } from 'lucide-react';

const CategorySidebar = ({ categories, filters, onFilterChange, loading }) => {
    const [priceExpanded, setPriceExpanded] = useState(true);
    const [catExpanded, setCatExpanded] = useState(true);

    const handleCategoryClick = (catId) => {
        onFilterChange({ categoryId: filters.categoryId === catId ? null : catId });
    };

    const handlePriceChange = (field, value) => {
        onFilterChange({ [field]: value === '' ? null : parseFloat(value) });
    };

    const handleReset = () => {
        onFilterChange({ categoryId: null, minPrice: null, maxPrice: null, deliveryOnly: false });
    };

    return (
        <aside className="w-full bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sticky top-24 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-emerald-600" />
                    <h3 className="font-bold text-gray-900 uppercase tracking-widest text-xs">Filters</h3>
                </div>
                <button
                    onClick={handleReset}
                    className="text-xs text-emerald-600 hover:text-emerald-700 font-bold transition-colors"
                >
                    Reset
                </button>
            </div>

            {/* Category Filter */}
            <div className="mb-6">
                <button
                    className="flex items-center justify-between w-full mb-4"
                    onClick={() => setCatExpanded(!catExpanded)}
                >
                    <span className="text-sm font-bold text-gray-700 uppercase tracking-wider">Categories</span>
                    {catExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </button>
                {catExpanded && (
                    <div className="space-y-1.5">
                        <button
                            onClick={() => onFilterChange({ categoryId: null })}
                            className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${!filters.categoryId
                                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100 translate-x-1'
                                : 'text-gray-500 hover:bg-emerald-50 hover:text-emerald-700'
                                }`}
                        >
                            All Items
                        </button>
                        {loading ? (
                            Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="h-10 bg-gray-50 rounded-xl animate-pulse" />
                            ))
                        ) : (
                            categories.map((cat, index) => (
                                <button
                                    key={cat.id}
                                    onClick={() => handleCategoryClick(cat.id)}
                                    className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-3 animate-slide-up hover-tilt active-press active-pop ${filters.categoryId === cat.id
                                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100 translate-x-1'
                                        : 'text-gray-500 hover:bg-emerald-50 hover:text-emerald-700'
                                        }`}
                                    style={{ animationDelay: `${(index + 1) * 0.1}s` }}
                                >
                                    <span className={`w-2 h-2 rounded-full ${filters.categoryId === cat.id ? 'bg-white' : 'bg-gray-300 group-hover:bg-emerald-400'}`} />
                                    {cat.name}
                                </button>
                            ))

                        )}

                    </div>
                )}
            </div>

            <hr className="border-gray-100 mb-6" />

            {/* Price Range */}
            <div className="mb-6">
                <button
                    className="flex items-center justify-between w-full mb-4"
                    onClick={() => setPriceExpanded(!priceExpanded)}
                >
                    <span className="text-sm font-bold text-gray-700 uppercase tracking-wider">Price (₹/Day)</span>
                    {priceExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </button>
                {priceExpanded && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Min</label>
                                <input
                                    type="number"
                                    min="0"
                                    placeholder="0"
                                    value={filters.minPrice ?? ''}
                                    onChange={(e) => handlePriceChange('minPrice', e.target.value)}
                                    className="w-full px-3 py-2 bg-gray-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Max</label>
                                <input
                                    type="number"
                                    min="0"
                                    placeholder="Any"
                                    value={filters.maxPrice ?? ''}
                                    onChange={(e) => handlePriceChange('maxPrice', e.target.value)}
                                    className="w-full px-3 py-2 bg-gray-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <hr className="border-gray-100 mb-6" />

            {/* Options */}
            <div>
                <span className="text-sm font-bold text-gray-700 uppercase tracking-wider block mb-4">Availability</span>
                <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative">
                        <input
                            type="checkbox"
                            checked={filters.deliveryOnly || false}
                            onChange={(e) => onFilterChange({ deliveryOnly: e.target.checked })}
                            className="w-5 h-5 accent-emerald-600 rounded-lg cursor-pointer"
                        />
                    </div>
                    <span className="flex items-center gap-1.5 text-sm font-bold text-gray-600 group-hover:text-emerald-700 transition-colors">
                        <Truck className="w-4 h-4 text-blue-500" /> Delivery Service
                    </span>
                </label>
            </div>
        </aside>
    );
};

export default CategorySidebar;
