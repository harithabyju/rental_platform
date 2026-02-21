import React from 'react';
import { Info, Code, MapPin, Globe } from 'lucide-react';

const TechnicalInsights = ({ onClose }) => {
    return (
        <div className="glass-morphic p-8 sm:p-10 rounded-[2.5rem] border border-white/40 shadow-2xl animate-scale-up space-y-8 max-w-4xl mx-auto relative overflow-hidden group">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] group-hover:bg-emerald-500/20 transition-all duration-700" />

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600">
                        <Info size={24} />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-gray-900">Technical Insights</h3>
                        <p className="text-gray-500 text-sm font-medium">How Location-Based Search works</p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-gray-900 transition-all text-xl"
                >
                    &times;
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
                {/* Mathematical Logic */}
                <div className="space-y-4">
                    <div className="flex items-center gap-3 text-emerald-700 font-bold uppercase tracking-widest text-[10px]">
                        <Globe size={14} /> Mathematical Logic
                    </div>
                    <div className="bg-emerald-50/50 p-6 rounded-3xl border border-emerald-100/50 space-y-4">
                        <p className="text-sm text-gray-700 leading-relaxed">
                            We use the <strong>Haversine Formula</strong> to calculate the distance between you and the shop. This formula accounts for the Earth's curvature, providing "Great-Circle" distance accuracy.
                        </p>
                        <div className="bg-white/80 p-4 rounded-xl text-center shadow-inner">
                            <code className="text-[11px] font-black text-emerald-800 break-all leading-loose">
                                d = 2R · arcsin(√(sin²(Δφ/2) + cos φ1 · cos φ2 · sin²(Δλ/2)))
                            </code>
                        </div>
                    </div>
                </div>

                {/* Database Implementation */}
                <div className="space-y-4">
                    <div className="flex items-center gap-3 text-blue-700 font-bold uppercase tracking-widest text-[10px]">
                        <Code size={14} /> SQL Implementation
                    </div>
                    <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100/50 space-y-4">
                        <p className="text-sm text-gray-700 leading-relaxed">
                            This math is optimized directly in our PostgreSQL database using <strong>Radiant-based ACos</strong> for real-time filtering and sorting.
                        </p>
                        <div className="bg-gray-900 p-4 rounded-xl shadow-2xl overflow-x-auto">
                            <pre className="text-[9px] text-emerald-400 font-mono leading-tight">
                                {`SELECT ... 
(6371 * acos(
  cos(radians($1)) * cos(radians(lat)) * 
  cos(radians(lng) - radians($2)) + 
  sin(radians($1)) * sin(radians(lat))
)) AS distance
FROM items ...
ORDER BY distance ASC`}
                            </pre>
                        </div>
                    </div>
                </div>
            </div>

            <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-gray-500 text-xs font-bold italic">
                    <MapPin size={12} className="text-emerald-500" />
                    Calculated in <span className="text-gray-900">kilometers</span> from your coordinates.
                </div>
                <div className="px-4 py-1.5 bg-gray-900 text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
                    Real-Time Geospatial Processing
                </div>
            </div>
        </div>
    );
};

export default TechnicalInsights;
