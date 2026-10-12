import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import ReportForm from '../../components/report/ReportForm';
import { GET_USER_BY_ID } from '../../graphQl/queries/userById';
import { AppUser } from '../../types/posts';
import { getCurrentUserId, getCurrentUser } from '../../services/authService';
import { ArrowLeft } from 'lucide-react';

interface LocationState {
    reportedUserId?: number;
    from?: string;
}

interface CurrentUser {
    id: number;
    email: string;
}

const ReportPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { state } = location;
    const { reportedUserId, from } = (state as LocationState) || {};

    const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!reportedUserId) {
            navigate('/', { replace: true });
        }
    }, [reportedUserId, navigate]);

    useEffect(() => {
        const loadCurrentUser = async () => {
            try {
                const id = await getCurrentUserId();
                if (!id) {
                    navigate('/login', {
                        replace: true,
                        state: {
                            from: '/report',
                            redirectParams: { reportedUserId },
                            previousPath: location.pathname
                        },
                    });
                    return;
                }

                const userData = await getCurrentUser();
                setCurrentUser({
                    id,
                    email: userData.email,
                });
            } catch (error) {
                console.error('Error loading current user:', error);
                navigate('/login', { replace: true });
            } finally {
                setIsLoading(false);
            }
        };

        loadCurrentUser();
    }, [navigate, reportedUserId, location.pathname]);

    const { loading, data } = useQuery<{ getUserById: AppUser }>(
        GET_USER_BY_ID,
        {
            skip: !reportedUserId,
            variables: { id: reportedUserId! },
            fetchPolicy: 'network-only',
        }
    );

    const reportedUser = data?.getUserById;

    const handleGoBack = () => {
        if (from) {
            navigate(from);
        } else {
            navigate(-1);
        }
    };

    if (!reportedUserId || isLoading || loading || !currentUser || !reportedUser) {
        return (
            <div className="min-h-screen relative overflow-hidden">
                {/* Refined gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 dark:from-gray-900 dark:via-indigo-950 dark:to-purple-950 z-0"></div>

                {/* Top wave decoration */}
                <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-blue-500/20 dark:from-indigo-800/30 dark:via-purple-800/30 dark:to-blue-800/30 rounded-b-full z-0"></div>

                {/* Decorative elements */}
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-700/10 rounded-full -mb-20 -mr-20 z-0"></div>
                <div className="absolute top-1/3 left-10 w-40 h-40 bg-purple-500/10 dark:bg-purple-700/10 rounded-full z-0"></div>
                <div className="absolute bottom-1/4 left-1/4 w-24 h-24 bg-blue-500/10 dark:bg-blue-700/10 rounded-full z-0"></div>

                {/* Loading spinner */}
                <div className="relative flex flex-col items-center justify-center min-h-screen z-10">
                    <div className="w-20 h-20 relative">
                        <div className="absolute inset-0 border-4 border-indigo-200 dark:border-indigo-800 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-transparent border-t-indigo-600 dark:border-t-indigo-400 rounded-full animate-spin"></div>
                    </div>
                    <p className="mt-4 text-lg font-medium text-gray-700 dark:text-gray-300">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen relative overflow-hidden">
            {/* Enhanced gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 dark:from-gray-900 dark:via-indigo-950 dark:to-purple-950 z-0"></div>

            {/* Top design element */}
            <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-blue-500/20 dark:from-indigo-800/30 dark:via-purple-800/30 dark:to-blue-800/30 rounded-b-full z-0"></div>

            {/* Decorative circles */}
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-700/10 rounded-full -mb-20 -mr-20 z-0"></div>
            <div className="absolute top-1/3 left-10 w-40 h-40 bg-purple-500/10 dark:bg-purple-700/10 rounded-full z-0"></div>
            <div className="absolute bottom-1/4 left-1/4 w-24 h-24 bg-blue-500/10 dark:bg-blue-700/10 rounded-full z-0"></div>

            {/* Content container */}
            <div className="relative z-10 py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
                {/* Back button */}
                <button
                    onClick={handleGoBack}
                    className="group flex items-center mb-6 text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
                >
                    <ArrowLeft size={20} className="mr-2 group-hover:-translate-x-1 transition-transform" />
                    <span className="font-medium">Back</span>
                </button>

                {/* Main content card */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-800 dark:to-purple-800">
                        <h1 className="text-2xl font-bold text-white">Report a User</h1>
                    </div>

                    <div className="p-6">
                        <ReportForm
                            reporterId={currentUser.id}
                            reporterEmail={currentUser.email}
                            reportedUser={reportedUser}
                        />
                    </div>
                </div>

                {/* Footer note */}
                <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
                    Your report will be reviewed by our admin .
                </p>
            </div>
        </div>
    );
};

export default ReportPage;