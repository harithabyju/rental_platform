import BorderGlow from './BorderGlow';

const DashboardCard = ({ label, value, icon: Icon, iconBg, iconColor, trend }) => {
    return (
        <BorderGlow borderRadius={16} animated={false}>
            <div className="bg-white/95 dark:bg-[#111827]/90 rounded-2xl p-6 shadow-sm border border-transparent hover:shadow-md transition-shadow duration-200 h-full">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">{label}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
                    {trend && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{trend}</p>
                    )}
                </div>
                {Icon && (
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${iconBg || 'bg-violet-50'}`}>
                        <Icon className={`w-6 h-6 ${iconColor || 'text-violet-600'}`} />
                    </div>
                )}
            </div>
            </div>
        </BorderGlow>
    );
};

export default DashboardCard;
