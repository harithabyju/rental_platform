import React from 'react';
import { FaSortAmountDown } from 'react-icons/fa';

const SortDropdown = ({ value, onChange }) => {
    return (
        <div className="relative">
            <div className="relative">
                <FaSortAmountDown className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <select
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="pl-11 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none text-sm text-gray-700 font-semibold transition-all cursor-pointer hover:border-gray-300"
                >
                    <option value="distance">Nearest First</option>
                    <option value="price">Price: Low to High</option>
                    <option value="rating">Top Rated</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>
        </div>
    );
};

export default SortDropdown;
