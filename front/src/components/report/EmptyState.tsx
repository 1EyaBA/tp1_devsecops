import {useNavigate} from "react-router";
import {AlertCircle, FileText} from "lucide-react";

export const EmptyState: React.FC = () => {
    const navigate = useNavigate();

    const handleNewReport = () => {
        navigate('/users'); // Redirige vers la page souhaitée
    };

    return (
        <div className="flex flex-col items-center justify-center py-24 text-center bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="relative">
                <FileText className="w-24 h-24 text-gray-200 dark:text-gray-700" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <AlertCircle className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                </div>
            </div>
            <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300 mt-6 mb-2">No Reports Found</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md">
                You haven't submitted any reports yet. Reports you submit will appear here for easy tracking.
            </p>
            <button
                onClick={handleNewReport}
                className="mt-6 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200 dark:bg-blue-700 dark:hover:bg-blue-600"
            >
                Create New Report
            </button>
        </div>
    );
};
