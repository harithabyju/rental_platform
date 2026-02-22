import { useState, useEffect } from 'react';
import categoryService from '../../services/category.service';
import {
    Tag,
    Plus,
    Edit2,
    Trash2,
    MoreVertical,
    Search,
    Layers,
    X,
    Image,
    CheckCircle,
    AlertCircle,
    Power
} from 'lucide-react';
import { toast } from 'react-toastify';

const CategoryManagement = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentCategory, setCurrentCategory] = useState({
        name: '',
        description: '',
        icon_url: '',
        is_active: true,
        slug: ''
    });
    const [isEditing, setIsEditing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const response = await categoryService.getAllCategories();
            const data = response?.data || response;
            setCategories(Array.isArray(data) ? data : []);
        } catch (err) {
            setError('Failed to fetch categories');
            toast.error('Could not load categories. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setCurrentCategory({
            ...currentCategory,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (isEditing) {
                await categoryService.updateCategory(currentCategory.id, currentCategory);
                toast.success('Category updated successfully');
            } else {
                await categoryService.createCategory(currentCategory);
                toast.success('New category added successfully');
            }
            fetchCategories();
            closeModal();
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to save category');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
            try {
                await categoryService.deleteCategory(id);
                toast.success('Category deleted successfully');
                fetchCategories();
            } catch (err) {
                toast.error('Failed to delete category. It might be in use.');
            }
        }
    };

    const openModal = (category = null) => {
        if (category) {
            setCurrentCategory(category);
            setIsEditing(true);
        } else {
            setCurrentCategory({
                name: '',
                description: '',
                icon_url: '',
                is_active: true,
                slug: ''
            });
            setIsEditing(false);
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentCategory({ name: '', description: '', icon_url: '', is_active: true, slug: '' });
        setIsEditing(false);
    };

    const filteredCategories = categories.filter(cat =>
        cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cat.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading && categories.length === 0) {
        return (
            <div className="min-h-[400px] flex flex-col items-center justify-center space-y-4">
                <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-500 font-medium animate-pulse">Loading categories...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in p-2 sm:p-0">
            {/* Header section */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                        <Layers className="text-emerald-600" />
                        Category Management
                    </h1>
                    <p className="text-gray-500 font-medium mt-1">Organize and manage equipment categories</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-2xl font-black transition-all active:scale-95 shadow-lg shadow-emerald-100"
                >
                    <Plus size={20} />
                    Add Category
                </button>
            </header>

            {/* Stats and Search bar */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-end">
                <div className="lg:col-span-3">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-emerald-500 transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Search categories by name or description..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-2xl focus:ring-4 focus:ring-emerald-50 focus:border-emerald-500 transition-all shadow-sm outline-none font-medium"
                        />
                    </div>
                </div>
                <div className="bg-emerald-50 border-2 border-emerald-100 p-4 rounded-2xl flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Total Categories</p>
                        <p className="text-2xl font-black text-emerald-700">{categories.length}</p>
                    </div>
                    <div className="p-3 bg-white rounded-xl shadow-sm text-emerald-600">
                        <Tag size={24} />
                    </div>
                </div>
            </div>

            {/* Categories Table/List */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100 font-black text-[10px] text-gray-400 uppercase tracking-[0.2em]">
                                <th className="px-8 py-5">Category</th>
                                <th className="px-8 py-5">Slug</th>
                                <th className="px-8 py-5">Status</th>
                                <th className="px-8 py-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredCategories.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center justify-center space-y-3 opacity-40">
                                            <Layers size={48} />
                                            <p className="font-bold text-gray-500 text-lg">No categories found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredCategories.map((category) => (
                                    <tr key={category.id} className="group hover:bg-gray-50/80 transition-all duration-300">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 font-black text-xl shadow-inner group-hover:scale-110 transition-transform">
                                                    {category.icon_url ? (
                                                        <img src={category.icon_url} alt={category.name} className="w-8 h-8 object-contain" />
                                                    ) : (
                                                        category.name.charAt(0).toUpperCase()
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-black text-gray-900 leading-none mb-1">{category.name}</div>
                                                    <div className="text-xs text-gray-400 font-medium max-w-xs truncate">
                                                        {category.description || 'No description provided'}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <code className="bg-gray-100 text-gray-600 px-2 py-1 rounded-lg text-xs font-bold">
                                                {category.slug || '-'}
                                            </code>
                                        </td>
                                        <td className="px-8 py-6">
                                            {category.is_active !== false ? (
                                                <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest">
                                                    <CheckCircle size={12} /> Active
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 bg-red-100 text-red-600 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest">
                                                    <AlertCircle size={12} /> Inactive
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => openModal(category)}
                                                    className="p-3 hover:bg-white hover:text-emerald-600 hover:shadow-md rounded-xl text-gray-400 transition-all"
                                                    title="Edit Category"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(category.id)}
                                                    className="p-3 hover:bg-white hover:text-red-600 hover:shadow-md rounded-xl text-gray-400 transition-all"
                                                    title="Delete Category"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Premium Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
                    <div
                        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm animate-fade-in"
                        onClick={closeModal}
                    />
                    <div className="relative w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden animate-slide-up">
                        <div className="px-8 pt-8 pb-4 flex justify-between items-center bg-gray-50/50">
                            <div>
                                <h2 className="text-2xl font-black text-gray-900">
                                    {isEditing ? 'Edit Category' : 'Add Category'}
                                </h2>
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">
                                    Category Details
                                </p>
                            </div>
                            <button
                                onClick={closeModal}
                                className="p-3 bg-white hover:bg-gray-100 rounded-2xl transition-colors shadow-sm"
                            >
                                <X size={20} className="text-gray-400" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                                        Category Name
                                    </label>
                                    <div className="relative">
                                        <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                                        <input
                                            type="text"
                                            name="name"
                                            value={currentCategory.name}
                                            onChange={handleInputChange}
                                            placeholder="e.g. Construction Equipment"
                                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-emerald-50 focus:bg-white transition-all font-bold text-gray-900 outline-none"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                                        Description
                                    </label>
                                    <textarea
                                        name="description"
                                        value={currentCategory.description || ''}
                                        onChange={handleInputChange}
                                        placeholder="Enter category description..."
                                        rows="3"
                                        className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-emerald-50 focus:bg-white transition-all font-medium text-gray-900 outline-none resize-none"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                                        Icon URL (Optional)
                                    </label>
                                    <div className="relative">
                                        <Image className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                                        <input
                                            type="text"
                                            name="icon_url"
                                            value={currentCategory.icon_url || ''}
                                            onChange={handleInputChange}
                                            placeholder="https://example.com/icon.svg"
                                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-emerald-50 focus:bg-white transition-all font-medium text-gray-400 outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl group cursor-pointer" onClick={() => setCurrentCategory(prev => ({ ...prev, is_active: !prev.is_active }))}>
                                    <div className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${currentCategory.is_active ? 'bg-emerald-600' : 'bg-gray-300'}`}>
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${currentCategory.is_active ? 'left-7' : 'left-1'}`} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-black text-gray-900">Active Status</p>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Visibility on platform</p>
                                    </div>
                                    <Power className={currentCategory.is_active ? 'text-emerald-600' : 'text-gray-400'} size={18} />
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="flex-1 px-4 py-4 bg-gray-100 text-gray-600 rounded-2xl font-black hover:bg-gray-200 transition-colors active:scale-95"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-[2] px-4 py-4 bg-emerald-600 text-white rounded-2xl font-black hover:bg-emerald-700 shadow-lg shadow-emerald-100 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2"
                                >
                                    {submitting ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <CheckCircle size={20} />
                                    )}
                                    {isEditing ? 'Save Changes' : 'Create Category'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CategoryManagement;
