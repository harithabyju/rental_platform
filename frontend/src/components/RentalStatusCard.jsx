import { AlertTriangle, Clock, Phone, MapPin, Package } from 'lucide-react';

const RentalStatusCard = ({ rental }) => {
    const isOverdue = rental.isOverdue;
    const daysRemaining = rental.daysRemaining;

    const getCountdownColor = () => {
        if (isOverdue) return 'text-red-600';
        if (daysRemaining <= 1) return 'text-amber-600';
        if (daysRemaining <= 3) return 'text-orange-500';
        return 'text-emerald-600';
    };

    const getCountdownBg = () => {
        if (isOverdue) return 'bg-red-50 border-red-200';
        if (daysRemaining <= 1) return 'bg-amber-50 border-amber-200';
        if (daysRemaining <= 3) return 'bg-orange-50 border-orange-200';
        return 'bg-emerald-50 border-emerald-200';
    };

    return (
        <div className={`card overflow-hidden group transition-all duration-300 ${isOverdue ? 'ring-2 ring-red-500 ring-offset-4' : ''}`}>
            {/* Overdue Banner */}
            {isOverdue && (
                <div className="bg-gradient-to-r from-red-600 to-rose-700 text-white px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <AlertTriangle className="w-5 h-5 animate-bounce" />
                        <span className="text-sm font-black uppercase tracking-widest">
                            OVERDUE BY {rental.daysOverdue} DAY{rental.daysOverdue > 1 ? 's' : ''}
                        </span>
                    </div>
                    <span className="text-xs font-bold bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                        Fine: {rental.lateFineFormatted?.replace('$', '₹')}
                    </span>
                </div>
            )}

            <div className="p-8">
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Item Image */}
                    <div className="w-full md:w-32 h-44 md:h-32 rounded-[2rem] overflow-hidden flex-shrink-0 shadow-lg border-4 border-white">
                        <img
                            src={rental.item?.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'}
                            alt={rental.item?.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'; }}
                        />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                            <div>
                                <h3 className="text-2xl font-black text-gray-900 tracking-tight group-hover:text-emerald-600 transition-colors">{rental.item?.name}</h3>
                                {rental.shop?.name && (
                                    <p className="text-sm text-emerald-600 font-black mt-0.5 uppercase tracking-widest">{rental.shop.name}</p>
                                )}
                            </div>
                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm ${getCountdownBg()} ${getCountdownColor()}`}>
                                {isOverdue ? 'Action Required' : 'On Loan'}
                            </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-6 mt-6">
                            {/* Duration */}
                            <div className="flex items-center gap-2 text-sm font-bold text-gray-500 bg-gray-50 px-3 py-1.5 rounded-xl">
                                <Clock className="w-4 h-4 text-emerald-500" />
                                <span>
                                    {new Date(rental.startDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                                    <span className="mx-2 text-gray-300">→</span>
                                    {new Date(rental.endDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                </span>
                            </div>

                            {/* Delivery method */}
                            {rental.deliveryMethod && (
                                <div className="flex items-center gap-2 text-sm font-bold text-gray-500 bg-gray-50 px-3 py-1.5 rounded-xl">
                                    <Package className="w-4 h-4 text-emerald-500" />
                                    <span className="capitalize">{rental.deliveryMethod} Delivery</span>
                                </div>
                            )}

                            {/* Shop location */}
                            {rental.shop?.city && (
                                <div className="flex items-center gap-2 text-sm font-bold text-gray-500 bg-gray-50 px-3 py-1.5 rounded-xl">
                                    <MapPin className="w-4 h-4 text-emerald-500" />
                                    <span>{rental.shop.city} Location</span>
                                </div>
                            )}
                        </div>

                        {/* Countdown */}
                        <div className={`mt-6 inline-flex items-center gap-3 px-5 py-2.5 rounded-2xl border text-sm font-black shadow-sm ${getCountdownBg()} ${getCountdownColor()}`}>
                            <div className={`w-2.5 h-2.5 rounded-full animate-pulse ${isOverdue ? 'bg-red-500' : 'bg-emerald-500'}`} />
                            {isOverdue
                                ? `${rental.daysOverdue} DAY${rental.daysOverdue > 1 ? 'S' : ''} OVERDUE`
                                : daysRemaining === 0
                                    ? 'DUE TODAY'
                                    : `${daysRemaining} DAY${daysRemaining > 1 ? 'S' : ''} REMAINING`
                            }
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex flex-col sm:flex-row items-center justify-between mt-8 pt-8 border-t border-gray-100 gap-6">
                    <div className="flex items-center gap-4">
                        <div className="text-right sm:text-left">
                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Total Rental Value</p>
                            <p className="text-2xl font-black text-gray-900">{rental.totalAmountFormatted?.replace('$', '₹')}</p>
                        </div>
                    </div>
                    {rental.shop?.phone && (
                        <a
                            href={`tel:${rental.shop.phone}`}
                            className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-3.5 bg-gray-900 text-white text-sm font-black rounded-2xl hover:bg-emerald-600 transition-all active:scale-95 shadow-xl shadow-gray-200 hover:shadow-emerald-100"
                        >
                            <Phone className="w-4 h-4" />
                            Direct Contact
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RentalStatusCard;
