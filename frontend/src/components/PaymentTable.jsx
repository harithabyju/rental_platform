import { CheckCircle, Clock, XCircle, AlertCircle, Package, Download } from 'lucide-react';

const statusConfig = {
    completed: { label: 'Settled', icon: CheckCircle, bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-100' },
    pending: { label: 'Processing', icon: Clock, bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-100' },
    failed: { label: 'Declined', icon: XCircle, bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-100' },
    refunded: { label: 'Refunded', icon: AlertCircle, bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-100' },
};

const PaymentTable = ({ payments, loading }) => {
    if (loading) {
        return (
            <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-20 bg-gray-50 rounded-2xl animate-pulse" />
                ))}
            </div>
        );
    }

    if (!payments || payments.length === 0) {
        return (
            <div className="text-center py-20 animate-scale-up">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                    <Clock className="w-10 h-10 text-gray-300" />
                </div>
                <p className="text-gray-900 font-black text-xl">No transactions yet</p>
                <p className="text-sm text-gray-500 mt-2 font-medium">When you rent items, your payment history will appear here.</p>
            </div>
        );
    }

    const handleDownload = (paymentId) => {
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const token = localStorage.getItem('token');
        
        // We can't open directly if we need Authorization header, 
        // but simple solution is fetch as blob and trigger download
        fetch(`${baseUrl}/payments/${paymentId}/invoice`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(res => res.blob())
        .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Invoice_${paymentId}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        })
        .catch(err => console.error('Failed to download invoice:', err));
    };

    return (
        <div className="overflow-x-auto -mx-1 px-1">
            <table className="w-full border-separate border-spacing-y-4">
                <thead>
                    <tr>
                        <th className="text-left text-[10px] font-black text-gray-400 uppercase tracking-widest pb-2 px-6">Transaction Item</th>
                        <th className="text-left text-[10px] font-black text-gray-400 uppercase tracking-widest pb-2 px-4">Invoice ID</th>
                        <th className="text-left text-[10px] font-black text-gray-400 uppercase tracking-widest pb-2 px-4">Amount</th>
                        <th className="text-left text-[10px] font-black text-gray-400 uppercase tracking-widest pb-2 px-4">Status</th>
                        <th className="text-right text-[10px] font-black text-gray-400 uppercase tracking-widest pb-2 px-6">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {payments.map((payment) => {
                        const config = statusConfig[payment.status] || statusConfig.pending;
                        const StatusIcon = config.icon;
                        const paymentId = payment.id || payment.paymentId;
                        return (
                            <tr key={paymentId} className="group hover:scale-[1.01] transition-all duration-300">
                                <td className="bg-white py-5 px-6 rounded-l-[1.5rem] border-y border-l border-gray-100 group-hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl overflow-hidden shadow-sm border border-gray-100 flex-shrink-0 bg-emerald-50 flex items-center justify-center text-emerald-600">
                                            <Package size={20} />
                                        </div>
                                        <div>
                                            <span className="text-sm font-black text-gray-900 line-clamp-1 group-hover:text-emerald-600 transition-colors">
                                                Rental Booking
                                            </span>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">{payment.payment_method || payment.paymentMethod}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="bg-white py-5 px-4 border-y border-gray-100 group-hover:bg-gray-50 transition-colors">
                                    <span className="text-xs text-gray-500 font-black tracking-tighter">
                                        {payment.razorpay_payment_id || payment.invoiceNumber || `#TXN-${String(paymentId).substring(0, 8)}`}
                                    </span>
                                </td>
                                <td className="bg-white py-5 px-4 border-y border-gray-100 group-hover:bg-gray-50 transition-colors">
                                    <span className="text-base font-black text-gray-900">
                                        ₹{(payment.amount_inr || payment.amount || 0).toLocaleString('en-IN')}
                                    </span>
                                </td>
                                <td className="bg-white py-5 px-4 border-y border-gray-100 group-hover:bg-gray-50 transition-colors">
                                    <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${config.bg} ${config.text} ${config.border} shadow-sm`}>
                                        <StatusIcon className="w-3 h-3" />
                                        {config.label}
                                    </span>
                                </td>
                                <td className="bg-white py-5 px-6 rounded-r-[1.5rem] border-y border-r border-gray-100 text-right group-hover:bg-gray-50 transition-colors">
                                    {payment.status === 'completed' && (
                                        <button 
                                            onClick={() => handleDownload(paymentId)}
                                            className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gray-50 text-gray-500 hover:bg-emerald-50 hover:text-emerald-600 border border-gray-200 hover:border-emerald-200 transition-all shadow-sm"
                                            title="Download Invoice"
                                        >
                                            <Download size={18} />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default PaymentTable;

