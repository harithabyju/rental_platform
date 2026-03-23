import React, { useState } from 'react';
import { X, CreditCard, Smartphone, Landmark, CheckCircle2, ShieldCheck, Loader2 } from 'lucide-react';

const MockRazorpayModal = ({ isOpen, onClose, onPaymentSuccess, amount, productName }) => {
    const [step, setStep] = useState('selection'); // 'selection' | 'payment' | 'processing' | 'success'
    const [method, setMethod] = useState(''); // 'card' | 'upi' | 'netbanking'
    const [isProcessing, setIsProcessing] = useState(false);

    if (!isOpen) return null;

    const handleMethodSelect = (selectedMethod) => {
        setMethod(selectedMethod);
        setStep('payment');
    };

    const handlePay = () => {
        setIsProcessing(true);
        setStep('processing');
        
        // Simulate processing time
        setTimeout(() => {
            setIsProcessing(false);
            setStep('success');
            
            // Wait a bit on success then close and trigger callback
            setTimeout(() => {
                onPaymentSuccess();
            }, 1500);
        }, 2000);
    };

    const methods = [
        { id: 'card', name: 'Card', icon: CreditCard, subtitle: 'Visa, Mastercard, RuPay' },
        { id: 'upi', name: 'UPI', icon: Smartphone, subtitle: 'Google Pay, PhonePe' },
        { id: 'netbanking', name: 'Netbanking', icon: Landmark, subtitle: 'All Indian Banks' }
    ];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 ml-[250px] sm:ml-0 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-[#0B0F1A] w-full max-w-[420px] rounded-[2rem] overflow-hidden shadow-2xl border border-gray-100 dark:border-gray-800 animate-scale-up">
                
                {/* Header */}
                <div className="bg-[#111827] p-6 text-white relative">
                    <button 
                        onClick={onClose}
                        className="absolute right-4 top-4 p-2 hover:bg-white/10 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center rotate-45">
                            <div className="w-3 h-3 bg-white -rotate-45" />
                        </div>
                        <span className="text-xs font-bold tracking-widest uppercase text-gray-400">MockRazorpay</span>
                    </div>
                    <div className="flex justify-between items-end mt-4">
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Paying for</p>
                            <h3 className="text-lg font-black line-clamp-1">{productName}</h3>
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-black">₹{amount.toLocaleString('en-IN')}</p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 h-[340px] flex flex-col">
                    {step === 'selection' && (
                        <div className="space-y-3 animate-slide-up">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Preferred Methods</p>
                            {methods.map((m) => (
                                <button
                                    key={m.id}
                                    onClick={() => handleMethodSelect(m.id)}
                                    className="w-full flex items-center gap-4 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-900/40 hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-all group"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-800/60 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <m.icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">{m.name}</p>
                                        <p className="text-[11px] text-gray-400 font-medium">{m.subtitle}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    {step === 'payment' && (
                        <div className="flex-1 flex flex-col pt-4 animate-slide-up">
                            <div className="flex-1 space-y-4">
                                <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 text-blue-700 dark:text-blue-400 mb-6">
                                    <p className="text-xs font-bold flex items-center gap-2">
                                        <ShieldCheck className="w-4 h-4" />
                                        This is a simulated secure transaction
                                    </p>
                                </div>
                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Mock {method} Details</label>
                                        <div className="w-full h-12 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-100 dark:border-gray-800 flex items-center px-4">
                                            <span className="text-gray-900 dark:text-gray-200 font-bold tracking-[4px]">•••• •••• •••• 4242</span>
                                        </div>
                                    </div>
                                    <p className="text-[11px] text-gray-500 font-medium italic">
                                        Clicking "Pay" will simulate a successful transaction and update the inventory records.
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={handlePay}
                                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all active:scale-95 shadow-xl shadow-blue-100 dark:shadow-none"
                            >
                                Pay ₹{amount.toLocaleString('en-IN')}
                            </button>
                            <button 
                                onClick={() => setStep('selection')}
                                className="w-full mt-3 py-2 text-[10px] font-black text-gray-400 hover:text-gray-600 uppercase tracking-widest transition-colors"
                            >
                                ← Choose Different Method
                            </button>
                        </div>
                    )}

                    {step === 'processing' && (
                        <div className="flex-1 flex flex-col items-center justify-center space-y-6 animate-scale-up">
                            <div className="relative">
                                <div className="w-20 h-20 border-[3px] border-blue-600 rounded-full animate-ping opacity-20 absolute inset-0" />
                                <div className="w-20 h-20 border-[3px] border-blue-600 border-t-transparent rounded-full animate-spin relative" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                                </div>
                            </div>
                            <div className="text-center">
                                <h4 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">Processing Payment</h4>
                                <p className="text-xs text-gray-500 font-medium mt-1">Please do not refresh or close the window</p>
                            </div>
                        </div>
                    )}

                    {step === 'success' && (
                        <div className="flex-1 flex flex-col items-center justify-center space-y-6 animate-scale-up">
                            <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center scale-125">
                                <CheckCircle2 className="w-12 h-12 text-emerald-500 animate-bounce" />
                            </div>
                            <div className="text-center">
                                <h4 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Payment Successful</h4>
                                <p className="text-xs text-gray-500 font-medium mt-1 italic">Order details updated successfully</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 bg-gray-50 dark:bg-[#111827] border-t border-gray-100 dark:border-gray-800 flex items-center justify-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Verified Simulated Secure</span>
                </div>
            </div>
        </div>
    );
};

export default MockRazorpayModal;
