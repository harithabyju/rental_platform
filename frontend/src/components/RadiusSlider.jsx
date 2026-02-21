import React from 'react';
import { FaArrowsLeftRight } from 'react-icons/fa6';

const RadiusSlider = ({ value, onChange }) => {
    return (
        <div className="relative flex-grow">
            <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Search Radius</label>
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{value} KM</span>
            </div>
            <div className="relative pt-2">
                <input
                    type="range"
                    min="1"
                    max="50"
                    step="1"
                    value={value}
                    onChange={(e) => onChange(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-[10px] text-gray-400 mt-2 font-medium">
                    <span>1km</span>
                    <span>10km</span>
                    <span>25km</span>
                    <span>50km</span>
                </div>
            </div>
        </div>
    );
};

export default RadiusSlider;
