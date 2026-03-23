import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import itemService from '../../services/item.service';
import { Search, Filter, Package, Star, ArrowRight, Loader2, Tag, Store } from 'lucide-react';
import { toast } from 'react-toastify';
import CategoryDropdown from '../../components/common/CategoryDropdown';
import { BACKEND_URL } from '../../services/api';

const ItemCard = ({ item }) => {
    const navigate = useNavigate();
    const imgSrc = item.image_url
        ? (item.image_url.startsWith('http') ? item.image_url : `${BACKEND_URL}${item.image_url}`)
        : 'https://placehold.co/600x400/1E293B/64748B?text=No+Image';

    const itemRating = parseFloat(item.avg_rating || 0);

    return (
        <div
            onClick={() => navigate(`/dashboard/booking/${item.item_id}`)}
            className="group bg-white dark:bg-[#111827] rounded-[2rem] border border-gray-100 dark:border-gray-800/60 shadow-sm hover:shadow-xl hover:shadow-emerald-900/20 hover:border-emerald-700/30 transition-all duration-500 cursor-pointer overflow-hidden flex flex-col h-full"
        >
            <div className="aspect-[4/3] bg-gray-100 dark:bg-gray-800 relative overflow-hidden">
                <img
                    src={imgSrc}
                    alt={item.item_name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-2xl text-[10px] font-black text-emerald-400 flex items-center gap-1 shadow-lg border border-gray-200 dark:border-gray-700/30">
                    <Star className={`w-3 h-3 ${itemRating > 0 ? 'fill-emerald-400' : 'text-gray-500'}`} />
                    {itemRating > 0 ? itemRating.toFixed(1) : 'New'}
                </div>
                <div className="absolute bottom-4 left-4 flex gap-2">
                    <span className="bg-black/70 backdrop-blur-md text-emerald-300 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl border border-gray-200 dark:border-gray-700/30">
                        ₹{item.price_per_day}/day
                    </span>
                </div>
            </div>
            <div className="p-6 flex flex-col flex-1">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="bg-emerald-900/40 text-emerald-400 px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider flex items-center gap-1 border border-emerald-700/20">
                            <Tag className="w-2.5 h-2.5" /> {item.category_name}
                        </span>
                        <span className="bg-blue-900/40 text-blue-400 px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider flex items-center gap-1 border border-blue-700/20">
                            <Store className="w-2.5 h-2.5" /> {item.shop_name}
                        </span>
                    </div>
                    <h3 className="text-lg font-black text-gray-900 dark:text-gray-100 leading-tight group-hover:text-emerald-400 transition-colors line-clamp-1">{item.item_name}</h3>
                    <p className="text-gray-500 text-xs mt-2 font-medium line-clamp-2 leading-relaxed">{item.description}</p>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800/60 flex items-center justify-between">
                    <div className={`text-[10px] font-black uppercase tracking-widest ${item.available_quantity > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {item.available_quantity > 0 ? `${item.available_quantity} Available` : 'Fully Booked'}
                    </div>
                    <div className="w-8 h-8 rounded-full bg-emerald-900/40 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300 border border-emerald-700/20">
                        <ArrowRight size={16} />
                    </div>
                </div>
            </div>
        </div>
    );
};

const CustomerHome = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        categoryId: '',
        search: ''
    });

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        setLoading(true);
        try {
            const data = await itemService.getAllItems();
            setItems(data);
        } catch (err) {
            toast.error('Failed to load items');
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const filteredItems = items.filter(item => {
        const matchesSearch = item.item_name.toLowerCase().includes(filters.search.toLowerCase()) ||
            item.shop_name.toLowerCase().includes(filters.search.toLowerCase());
        const matchesCategory = !filters.categoryId || item.category_id?.toString() === filters.categoryId.toString() || item.shop_item_category_id?.toString() === filters.categoryId.toString();
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="p-6 space-y-8 animate-fade-in max-w-7xl mx-auto min-h-screen">
            {/* Hero/Header Section */}
            <div className="relative rounded-[3rem] bg-gradient-to-br from-emerald-900 to-gray-900 p-12 overflow-hidden shadow-2xl shadow-emerald-900/20 border border-emerald-800/30">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full -mr-32 -mt-32 blur-3xl animate-pulse" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-400/5 rounded-full -ml-24 -mb-24 blur-2xl" />

                <div className="relative z-10 max-w-2xl">
                    <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-4">
                        Rent High-Quality Gear <br /><span className="text-emerald-400">Simplified.</span>
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-lg font-medium opacity-90 leading-relaxed">
                        Discover top-rated equipment from verified shops in your neighborhood. Book instantly with secure payments.
                    </p>
                </div>
            </div>

            {/* Sticky Search & Filter Bar */}
            <div className="sticky top-6 z-30 bg-white dark:bg-[#111827]/90 backdrop-blur-xl p-4 rounded-3xl border border-gray-100 dark:border-gray-800/60 shadow-xl shadow-black/20 flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                    <input
                        type="text"
                        name="search"
                        placeholder="Search items, categories, or shops..."
                        value={filters.search}
                        onChange={handleFilterChange}
                        className="w-full bg-gray-800/50 border border-gray-700 rounded-2xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-bold text-gray-900 dark:text-gray-100 placeholder-gray-500"
                    />
                </div>
                <div className="w-full md:w-72">
                    <CategoryDropdown
                        value={filters.categoryId}
                        onChange={(e) => setFilters(prev => ({ ...prev, categoryId: e.target.value }))}
                        label="Categories"
                        name="categoryId"
                        required={false}
                    />
                </div>
            </div>

            {/* Content Section */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
                    <p className="text-gray-500 font-bold animate-pulse uppercase tracking-[0.2em] text-[10px]">Syncing Gear...</p>
                </div>
            ) : filteredItems.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {filteredItems.map(item => (
                        <ItemCard key={item.item_id} item={item} />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-32 text-center space-y-4">
                    <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                        <Package className="w-10 h-10 text-gray-600" />
                    </div>
                    <h3 className="text-xl font-black text-gray-800 dark:text-gray-200 tracking-tight">No Items found</h3>
                    <p className="text-gray-500 max-w-sm font-medium">Try adjusting your filters or search terms to find what you're looking for.</p>
                </div>
            )}
        </div>
    );
};

export default CustomerHome;
