import { Gavel, AlertTriangle, Clock, Search, Filter } from 'lucide-react';

const AdminFines = () => {
    return (
        <div className="p-6 space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                        <Gavel className="text-emerald-600" />
                        Fines Management
                    </h1>
                    <p className="text-gray-500 font-medium mt-1">Manage and track late return fines and penalties</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                    <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center mb-4">
                        <AlertTriangle className="w-6 h-6 text-amber-600" />
                    </div>
                    <div className="text-3xl font-black text-gray-900">0</div>
                    <div className="text-gray-500 text-sm font-bold uppercase tracking-wider mt-1">Pending Fines</div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                    <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center mb-4">
                        <Clock className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div className="text-3xl font-black text-emerald-600">₹0</div>
                    <div className="text-gray-500 text-sm font-bold uppercase tracking-wider mt-1">Collected Today</div>
                </div>
            </div>

            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl overflow-hidden min-h-[400px] flex flex-col items-center justify-center text-center p-12">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                    <Gavel className="w-10 h-10 text-gray-200" />
                </div>
                <h3 className="text-xl font-black text-gray-800">No Fines to display</h3>
                <p className="text-gray-400 max-w-sm mt-2 font-medium">When users return items late, automated fines will appear here for your review and management.</p>
                <div className="mt-8 flex gap-3">
                    <div className="px-6 py-3 bg-gray-50 text-gray-400 rounded-2xl text-sm font-bold flex items-center gap-2">
                        <Search className="w-4 h-4" /> Search Fines
                    </div>
                    <div className="px-6 py-3 bg-gray-50 text-gray-400 rounded-2xl text-sm font-bold flex items-center gap-2">
                        <Filter className="w-4 h-4" /> Filter By Status
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminFines;
