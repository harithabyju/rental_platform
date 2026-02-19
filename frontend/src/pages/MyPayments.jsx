import { useEffect, useState } from 'react';
import * as dashboardService from '../services/dashboardService';
import PaymentTable from '../components/PaymentTable';
import { CreditCard, Download, ExternalLink, Info } from 'lucide-react';

const MyPayments = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
    const [error, setError] = useState(null);

    const fetchPayments = async (page = 1) => {
        setLoading(true);
        setError(null);
        try {
            const res = await dashboardService.getMyPayments(page);
            setPayments(res.payments);
            setPagination(res.pagination);
        } catch (err) {
            setError('Failed to load payment history.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayments();
    }, []);

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Payment History</h1>
                    <p className="text-gray-500 font-medium mt-1">Track all your transactions and download invoices</p>
                </div>

                {/* Summary Box */}
                <div className="flex items-center gap-5 bg-white px-6 py-4 rounded-3xl border border-gray-100 shadow-sm shadow-gray-50">
                    <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center">
                        <CreditCard className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Lifetime Spent</p>
                        <p className="text-xl font-black text-gray-900">
                            {loading ? '...' : `₹${payments.reduce((acc, p) => acc + (p.status === 'completed' ? p.amount : 0), 0).toLocaleString('en-IN')}`}
                        </p>
                    </div>
                </div>
            </div>

            {/* Info Box */}
            <div className="flex items-start gap-4 p-5 bg-blue-50/50 border border-blue-100 rounded-3xl animate-slide-up">
                <div className="p-2 bg-blue-100 rounded-xl">
                    <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />
                </div>
                <div>
                    <p className="text-sm font-bold text-blue-900">Refund Policy Reminder</p>
                    <p className="text-sm text-blue-700 font-medium mt-0.5">
                        Refunds for cancelled bookings are typically processed within 5-7 business days to your original payment method.
                    </p>
                </div>
            </div>

            {/* Content Card */}
            <div className="card p-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                {error ? (
                    <div className="text-center py-12">
                        <p className="text-red-700 font-bold mb-6">{error}</p>
                        <button
                            onClick={() => fetchPayments()}
                            className="px-8 py-3 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all active:scale-95 shadow-lg shadow-emerald-100"
                        >
                            Retry Loading
                        </button>
                    </div>
                ) : (
                    <>
                        <PaymentTable payments={payments} loading={loading} />

                        {/* Pagination */}
                        {!loading && pagination.totalPages > 1 && (
                            <div className="mt-12 flex justify-center items-center gap-3">
                                <button
                                    disabled={pagination.page === 1}
                                    onClick={() => fetchPayments(pagination.page - 1)}
                                    className="px-6 py-2.5 bg-white border border-gray-200 rounded-2xl text-sm font-bold text-gray-600 hover:bg-gray-50 hover:text-emerald-600 hover:border-emerald-200 disabled:opacity-50 transition-all"
                                >
                                    Prev
                                </button>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-black text-emerald-600 bg-emerald-50 px-4 py-2 rounded-xl">
                                        Page {pagination.page} / {pagination.totalPages}
                                    </span>
                                </div>
                                <button
                                    disabled={pagination.page === pagination.totalPages}
                                    onClick={() => fetchPayments(pagination.page + 1)}
                                    className="px-6 py-2.5 bg-white border border-gray-200 rounded-2xl text-sm font-bold text-gray-600 hover:bg-gray-50 hover:text-emerald-600 hover:border-emerald-200 disabled:opacity-50 transition-all"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default MyPayments;
