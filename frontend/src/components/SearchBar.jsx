import { useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';

const SearchBar = ({ value, onChange, placeholder = 'Search items...', className = '' }) => {
    const debounceRef = useRef(null);

    const handleChange = (e) => {
        const val = e.target.value;
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            onChange(val);
        }, 350);
    };

    const handleClear = () => {
        onChange('');
    };

    useEffect(() => {
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, []);

    return (
        <div className={`relative flex items-center ${className}`}>
            <Search className="absolute left-4 w-5 h-5 text-gray-400 pointer-events-none" />
            <input
                type="text"
                defaultValue={value}
                onChange={handleChange}
                placeholder={placeholder}
                className="w-full pl-11 pr-10 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
            />
            {value && (
                <button
                    onClick={handleClear}
                    className="absolute right-3 p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            )}
        </div>
    );
};

export default SearchBar;
