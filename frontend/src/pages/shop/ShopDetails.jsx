import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import shopService from '../../services/shop.service';
import itemService from '../../services/item.service';

const ShopDetails = () => {
    const { id } = useParams();
    const [shop, setShop] = useState(null);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const shopData = await shopService.getShopById(id);
                setShop(shopData);
                const itemsData = await itemService.getItemsByShop(id);
                setItems(itemsData);
            } catch (error) {
                console.error('Error fetching shop details:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    if (loading) return <div className="p-8 text-center">Loading...</div>;
    if (!shop) return <div className="p-8 text-center text-red-500">Shop not found</div>;

    return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">{shop.shop_name}</h1>
                <p className="text-xl text-gray-600 mb-6">{shop.description}</p>
                <div className="flex items-center text-gray-500">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{shop.location?.address}, {shop.location?.city}, {shop.location?.zip}</span>
                </div>
            </div>

            <h2 className="text-2xl font-bold mb-6">Available Items</h2>
            {items.length === 0 ? (
                <p className="text-gray-500">No items available at this shop.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {items.map(item => (
                        <div key={item.item_id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition overflow-hidden">
                            <div className="h-48 bg-gray-200">
                                {item.image_url ? (
                                    <img src={item.image_url} alt={item.item_name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                                )}
                            </div>
                            <div className="p-4">
                                <h3 className="text-lg font-semibold text-gray-900 mb-1">{item.item_name}</h3>
                                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.description}</p>
                                <div className="flex justify-between items-center">
                                    <span className="text-xl font-bold text-primary">${item.price_per_day}<span className="text-sm font-normal text-gray-500">/day</span></span>
                                    <button className="bg-primary text-white px-3 py-1 rounded hover:bg-green-600 transition text-sm">
                                        Rent Now
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ShopDetails;
