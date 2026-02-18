import { useState } from 'react';
import CategoryDropdown from '../../components/common/CategoryDropdown';

const ShopOwnerDashboard = () => {
    const [itemData, setItemData] = useState({
        name: '',
        description: '',
        price: '',
        categoryId: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setItemData({ ...itemData, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        alert(`Item Created: ${JSON.stringify(itemData, null, 2)}`);
        // Here you would call itemService.createItem(itemData)
    };

    return (
        <div className="max-w-4xl mx-auto py-10 px-4">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Shop Owner Dashboard</h1>

            <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                <h2 className="text-xl font-bold mb-4">Add New Item</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                            Item Name
                        </label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            id="name"
                            type="text"
                            name="name"
                            value={itemData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
                            Description
                        </label>
                        <textarea
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            id="description"
                            name="description"
                            value={itemData.description}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="price">
                            Price
                        </label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            id="price"
                            type="number"
                            name="price"
                            value={itemData.price}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <CategoryDropdown
                        value={itemData.categoryId}
                        onChange={handleChange}
                        required={true}
                        label="Category"
                        name="categoryId"
                    />

                    <div className="flex items-center justify-between">
                        <button
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                            type="submit"
                        >
                            Create Item
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ShopOwnerDashboard;
