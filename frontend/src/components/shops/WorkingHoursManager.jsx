import React, { useState } from 'react';

const WorkingHoursManager = ({ initialHours, onSave, loading }) => {
    const [hours, setHours] = useState(initialHours || {
        open: '09:00',
        close: '18:00',
        is_24x7: false
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setHours(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(hours);
    };

    return (
        <div className="bg-gray-50 border border-gray-200 p-6 rounded-xl">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                Operational Hours Configuration
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex items-center p-3 bg-white rounded-lg border border-gray-100">
                    <input
                        type="checkbox"
                        id="is_24x7"
                        name="is_24x7"
                        className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                        checked={hours.is_24x7}
                        onChange={handleChange}
                    />
                    <label htmlFor="is_24x7" className="ml-3 font-medium text-gray-700">Open 24/7 (Always available for pick-up)</label>
                </div>

                {!hours.is_24x7 && (
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Opening Time</label>
                            <input
                                type="time"
                                name="open"
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                value={hours.open}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Closing Time</label>
                            <input
                                type="time"
                                name="close"
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                value={hours.close}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                )}

                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-lg transition-all shadow-md active:scale-95 disabled:opacity-50"
                    >
                        {loading ? 'Saving...' : 'Update Operational Hours'}
                    </button>
                </div>
            </form>

            <p className="mt-4 text-xs text-gray-400">
                Tip: Proper working hours prevent customers from booking during your offline hours, reducing cancellation stress.
            </p>
        </div>
    );
};

export default WorkingHoursManager;
