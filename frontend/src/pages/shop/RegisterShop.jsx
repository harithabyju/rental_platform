import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import shopService from '../../services/shop.service';
import { toast } from 'react-toastify';

const RegisterShop = () => {
    const [formData, setFormData] = useState({
        shop_name: '',
        description: '',
        address: '',
        city: '',
        zip: ''
    });
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Combine address fields into location object
            const location = {
                address: formData.address,
                city: formData.city,
                zip: formData.zip
            };
            
            await shopService.registerShop({
                shop_name: formData.shop_name,
                description: formData.description,
                location
            });
            
            toast.success('Shop registered successfully! Pending approval.');
            navigate('/myshop');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to register shop');
        }
    };

    return (
        <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-center">Register Your Shop</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-gray-700">Shop Name</label>
                    <input
                        type="text"
                        name="shop_name"
                        value={formData.shop_name}
                        onChange={handleChange}
                        required
                        className="w-full mt-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>
                <div>
                    <label className="block text-gray-700">Description</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        className="w-full mt-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>
                <div>
                    <label className="block text-gray-700">Address</label>
                    <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        className="w-full mt-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>
                <div className="flex gap-4">
                    <div className="flex-1">
                        <label className="block text-gray-700">City</label>
                        <input
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                            className="w-full mt-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                    <div className="flex-1">
                        <label className="block text-gray-700">Zip Code</label>
                        <input
                            type="text"
                            name="zip"
                            value={formData.zip}
                            onChange={handleChange}
                            className="w-full mt-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                </div>
                <button
                    type="submit"
                    className="w-full bg-primary text-white p-2 rounded hover:bg-green-600 transition font-semibold"
                >
                    Register Shop
                </button>
            </form>
        </div>
    );
};

export default RegisterShop;
