import { Eye} from "lucide-react";
import { useState } from "react";
import ReportDetails from "./ReportDetails.tsx";
import { Report } from "../../types/report";
import {getStatusConfig} from "./statusConfig.tsx";


const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    }).format(date);
};

// Calculate time difference for relative time display
const getTimeAgo = (dateString: string): string => {
    const now = new Date();
    const past = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hrs ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return formatDate(dateString);
};

interface ReportCardProps {
    report: Report;
    onViewDetails?: (report: Report) => void;
    onRefresh?: () => void;
}

export const ReportCard: React.FC<ReportCardProps> = ({ report, onViewDetails , onRefresh }) => {
    const statusCfg = getStatusConfig(report.status);
    const [showDetails, setShowDetails] = useState(false);

    // Handle click on view details button
    const handleViewDetails = () => {
        if (onViewDetails) {
            onViewDetails(report);
        } else {
            setShowDetails(true);
        }
    };

    return (
        <>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-all duration-300 hover:shadow-md hover:translate-y-px">
                {/* Status indicator strip */}
                <div className={`h-1 w-full ${report.status === 'PENDING' ? 'bg-amber-400 dark:bg-amber-500' :
                    report.status === 'ACCEPTED' ? 'bg-emerald-400 dark:bg-emerald-500' :
                        'bg-rose-400 dark:bg-rose-500'}`} />

                {/* Card Header with Status Badge */}
                <div className="p-5 border-b border-gray-100 dark:border-gray-700">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 truncate">
                            {report.subjectType}
                        </h3>
                        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${statusCfg.lightClass} ${statusCfg.darkClass}`}>
                            {statusCfg.icon}
                            <span>{statusCfg.label}</span>
                        </div>
                    </div>
                </div>

                {/* Card Body with Report Content */}
                <div className="p-5">
                    <div className="mb-4">
                        <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line">{report.reason}</p>
                    </div>

                    {/* Card Footer with Meta Information & Action */}
                    <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                        <div className="flex flex-col">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                Submitted {getTimeAgo(report.createdAt)}
                            </span>

                        </div>

                        <div className="flex items-center gap-3">

                            {/* View Details Button */}
                            <button
                                onClick={handleViewDetails}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
                            >
                                <Eye className="w-4 h-4" />
                                View Details
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* This will show your ReportDetails component when showDetails is true */}
            {showDetails && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    {/* Backdrop with blur effect */}
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={() => setShowDetails(false)}
                    />

                    {/* Your ReportDetails component would be rendered here */}
                    <div className="relative z-10 max-w-2xl w-full max-h-[90vh] overflow-auto">
                        {/* Import your ReportDetails component here */}
                         <ReportDetails
                             report={report}
                             onClose={() => setShowDetails(false)}
                             onChange={onRefresh}
                         />
                    </div>
                </div>
            )}
        </>
    );
};