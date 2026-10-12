import {StatusConfig, StatusConfigMap, StatusType} from "../../types/report.ts";
import {AlertCircle, CheckCircle, Clock, FileText} from "lucide-react";

export const statusConfig: StatusConfigMap = {
    PENDING: {
        icon: <Clock className="w-4 h-4" />,
        lightClass: 'bg-amber-50 text-amber-700 border-amber-200',
        darkClass: 'dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800',
        label: 'Under Review'
    },
    ACCEPTED: {
        icon: <CheckCircle className="w-4 h-4" />,
        lightClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        darkClass: 'dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800',
        label: 'Approved'
    },
    REJECTED: {
        icon: <AlertCircle className="w-4 h-4" />,
        lightClass: 'bg-rose-50 text-rose-700 border-rose-200',
        darkClass: 'dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-800',
        label: 'Declined'
    },
    default: {
        icon: <FileText className="w-4 h-4" />,
        lightClass: 'bg-gray-50 text-gray-700 border-gray-200',
        darkClass: 'dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700',
        label: 'Unknown'
    }
};
// Helper to get status styling
export const getStatusConfig = (status: string): StatusConfig => {
    return statusConfig[status as StatusType] || statusConfig.default;
};