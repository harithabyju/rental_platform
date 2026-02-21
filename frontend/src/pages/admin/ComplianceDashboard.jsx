import React, { useState, useEffect } from 'react';
import complianceService from '../../services/compliance.service';
import { toast } from 'react-toastify';

const ComplianceAdminDashboard = () => {
    const [damages, setDamages] = useState([]);
    const [disputes, setDisputes] = useState([]);
    const [loading, setLoading] = useState(true);

    // Mock data for demo as we don't have a list API yet
    useEffect(() => {
        // In a real implementation, we'd add GET /admin/compliance to the backend
        setLoading(false);
    }, []);

    const handleResolveDamage = async (id, fineAmount) => {
        try {
            await complianceService.resolveDamage(id, {
                fineAmount,
                notes: "Resolved by Admin via dashboard"
            });
            toast.success("Damage report resolved and fine deducted.");
        } catch (error) {
            toast.error("Failed to resolve damage.");
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Risk & Compliance Control Center</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Damage Reports Section */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
                    <div className="bg-red-600 px-6 py-4">
                        <h2 className="text-xl font-bold text-white">Pending Damage Reports</h2>
                    </div>
                    <div className="p-6">
                        <p className="text-gray-600 mb-4">Review reported accidents and approve fine deductions.</p>
                        <div className="space-y-4">
                            {/* Example Item */}
                            <div className="p-4 border border-gray-100 rounded-xl bg-gray-50 flex justify-between items-center">
                                <div>
                                    <p className="font-bold text-gray-800">Booking #BK1002 - Vehicle Damage</p>
                                    <p className="text-sm text-gray-500">Reported by Shop Owner: FastRentals</p>
                                </div>
                                <button
                                    onClick={() => handleResolveDamage(1, 500)}
                                    className="bg-red-100 text-red-700 px-4 py-2 rounded-lg font-semibold hover:bg-red-200 transition-colors"
                                >
                                    Approve $500 Fine
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Dispute Resolution Section */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
                    <div className="bg-indigo-600 px-6 py-4">
                        <h2 className="text-xl font-bold text-white">Dispute Resolution Panel</h2>
                    </div>
                    <div className="p-6">
                        <p className="text-gray-600 mb-4">Handle customer/vendor disputes and evidence review.</p>
                        <div className="bg-indigo-50 p-8 rounded-xl border border-indigo-100 text-center">
                            <svg className="w-12 h-12 text-indigo-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                            </svg>
                            <span className="text-indigo-900 font-medium">All disputes currently resolved.</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Fraud & Security Section */}
            <div className="mt-8 bg-gray-900 rounded-2xl shadow-2xl p-8 text-white">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-bold">Fraud & Security Watchlist</h2>
                        <p className="text-gray-400">Automated monitoring of high-risk accounts.</p>
                    </div>
                    <div className="bg-red-900/50 border border-red-500 text-red-100 px-4 py-1 rounded-full text-sm animate-pulse">
                        Live Monitoring Active
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-800 text-gray-400 text-sm">
                                <th className="pb-4">User</th>
                                <th className="pb-4">Fraud Score</th>
                                <th className="pb-4">Status</th>
                                <th className="pb-4">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            <tr>
                                <td className="py-4 font-medium">john_doe_99</td>
                                <td className="py-4">
                                    <div className="w-32 bg-gray-700 h-2 rounded-full overflow-hidden">
                                        <div className="bg-orange-500 h-full w-[85%]"></div>
                                    </div>
                                </td>
                                <td className="py-4"><span className="text-orange-400">High Risk (85)</span></td>
                                <td className="py-4">
                                    <button className="text-indigo-400 hover:text-indigo-300 font-semibold mr-4">Review</button>
                                    <button className="text-red-500 hover:text-red-400 font-semibold">Block</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ComplianceAdminDashboard;
