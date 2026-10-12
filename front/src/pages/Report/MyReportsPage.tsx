// src/pages/MyReportsPage.tsx
import { useEffect, useState } from 'react';
import { useQuery } from '@apollo/client';
import { useNavigate } from 'react-router-dom'; // Ajout de useNavigate
import { GET_MY_REPORTS } from '../../graphQl/queries/myReports.ts';
import { AlertCircle, CheckCircle, Clock, FileText, Search } from 'lucide-react';
import { ReportCardSkeleton } from '../../components/report/ReportCardSkaleton.tsx';
import { EmptyState } from '../../components/report/EmptyState.tsx';
import { ReportCard } from '../../components/report/ReportCard.tsx';
import { ReportPaginated } from '../../types/report.ts';

interface MyReportsData {
    getMyReports: ReportPaginated;
}

const MyReportsPage: React.FC = () => {
    const navigate = useNavigate(); // Hook pour la navigation
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);
    const [statusFilter, setStatusFilter] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const limit = 6;

    // Debounce search input
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedSearch(searchQuery), 300);
        return () => clearTimeout(handler);
    }, [searchQuery]);

    // Fetch paginated reports based on filters
    const { data, loading, error, refetch } = useQuery<MyReportsData>(
        GET_MY_REPORTS,
        {
            variables: {
                page,
                limit,
                search: debouncedSearch || undefined,
                status: statusFilter || undefined,
            },
            fetchPolicy: 'network-only',
            // Gestion des erreurs d'authentification
            onError: (error) => {
                // Vérifier si l'erreur indique que l'utilisateur n'est pas autorisé
                if (error.graphQLErrors?.some(err =>
                    err.extensions?.code === 'UNAUTHENTICATED' ||
                    err.message.includes('unauthorized') ||
                    err.message.includes('Unauthorized') ||
                    err.extensions?.code === 'FORBIDDEN'
                )) {
                    navigate('/signIn');
                }
                // Ou vérifier les erreurs réseau avec status 401/403
                if (error.networkError && 'statusCode' in error.networkError) {
                    const statusCode = (error.networkError as any).statusCode;
                    if (statusCode === 401 || statusCode === 403) {
                        navigate('/signIn');
                    }
                }
            }
        }
    );

    // Fetch all reports once for global stats (ignore filters/pagination)
    const { data: allData } = useQuery<MyReportsData>(
        GET_MY_REPORTS,
        {
            variables: { page: 1, limit: 9999 },
            fetchPolicy: 'network-only',
            // Même gestion d'erreur pour la requête des stats
            onError: (error) => {
                if (error.graphQLErrors?.some(err =>
                    err.extensions?.code === 'UNAUTHENTICATED' ||
                    err.message.includes('unauthorized') ||
                    err.message.includes('Unauthorized') ||
                    err.extensions?.code === 'FORBIDDEN'
                )) {
                    navigate('/signIn');
                }
                if (error.networkError && 'statusCode' in error.networkError) {
                    const statusCode = (error.networkError as any).statusCode;
                    if (statusCode === 401 || statusCode === 403) {
                        navigate('/signIn');
                    }
                }
            }
        }
    );

    // Reset to first page when search or filter change
    useEffect(() => {
        setPage(1);
    }, [debouncedSearch, statusFilter]);

    // Data and pagination
    const reports = data?.getMyReports.data || [];
    // Client-side filter: apply search only within selected status
    const searchedReports = debouncedSearch
        ? reports.filter(r =>
            r.subjectType.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
            r.reason.toLowerCase().includes(debouncedSearch.toLowerCase())
        )
        : reports;
    const displayedReports = statusFilter
        ? searchedReports.filter(r => r.status === statusFilter)
        : searchedReports;
    const totalPages = data?.getMyReports.totalPages || 1;

    // Compute stats from full dataset
    const allReports = allData?.getMyReports.data || [];
    const stats = {
        total: allReports.length,
        pending: allReports.filter(r => r.status === 'PENDING').length,
        accepted: allReports.filter(r => r.status === 'ACCEPTED').length,
        rejected: allReports.filter(r => r.status === 'REJECTED').length,
    };

    // Refresh function for individual ReportCard
    const handleRefresh = () => {
        refetch();
    };

    // Pagination handlers
    const handleNext = () => page < totalPages && setPage(prev => prev + 1);
    const handlePrev = () => page > 1 && setPage(prev => prev - 1);

    return (
        <div className="min-h-screen py-8 px-4 sm:px-6 relative bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
            <div className="max-w-7xl mx-auto relative">
                {/* Header */}
                <div className="mb-8">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden">
                        <div className="px-6 py-5 flex justify-between items-center">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Reports</h1>
                                <p className="text-gray-600 dark:text-gray-400 mt-2">Track and manage all your reports</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search & Filters + Stats */}
                <div className="flex flex-col items-center gap-4 mb-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700 backdrop-blur-sm bg-opacity-95 dark:bg-opacity-90">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 md:w-[100%]">
                        {/* Total Reports */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-100 dark:border-gray-700 backdrop-blur-sm bg-opacity-90 dark:bg-opacity-90 relative group hover:scale-[1.02] transition-transform">
                            <div className="absolute inset-0 bg-purple-500 opacity-0 group-hover:opacity-5 dark:group-hover:opacity-10 rounded-xl transition-opacity"></div>
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/60 shadow-inner">
                                    <FileText className="w-5 h-5 text-purple-500 dark:text-purple-400" />
                                </div>
                                <div>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm">Total Reports</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.total}</p>
                                </div>
                            </div>
                        </div>
                        {/* Pending */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-100 dark:border-gray-700 border-l-4 border-l-amber-400 dark:border-l-amber-500 backdrop-blur-sm bg-opacity-90 dark:bg-opacity-90 relative group hover:scale-[1.02] transition-transform">
                            <div className="absolute inset-0 bg-amber-500 opacity-0 group-hover:opacity-5 dark:group-hover:opacity-10 rounded-xl transition-opacity"></div>
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-full bg-amber-100 dark:bg-amber-900/60 shadow-inner">
                                    <Clock className="w-5 h-5 text-amber-500 dark:text-amber-400" />
                                </div>
                                <div>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm">Pending</p>
                                    <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">{stats.pending}</p>
                                </div>
                            </div>
                        </div>
                        {/* Approved */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-100 dark:border-gray-700 border-l-4 border-l-emerald-400 dark:border-l-emerald-500 backdrop-blur-sm bg-opacity-90 dark:bg-opacity-90 relative group hover:scale-[1.02] transition-transform">
                            <div className="absolute inset-0 bg-emerald-500 opacity-0 group-hover:opacity-5 dark:group-hover:opacity-10 rounded-xl transition-opacity"></div>
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-full bg-emerald-100 dark:bg-emerald-900/60 shadow-inner">
                                    <CheckCircle className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
                                </div>
                                <div>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm">Approved</p>
                                    <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{stats.accepted}</p>
                                </div>
                            </div>
                        </div>
                        {/* Declined */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-100 dark:border-gray-700 border-l-4 border-l-rose-400 dark:border-l-rose-500 backdrop-blur-sm bg-opacity-90 dark:bg-opacity-90 relative group hover:scale-[1.02] transition-transform">
                            <div className="absolute inset-0 bg-rose-500 opacity-0 group-hover:opacity-5 dark:group-hover:opacity-10 rounded-xl transition-opacity"></div>
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-full bg-rose-100 dark:bg-rose-900/60 shadow-inner">
                                    <AlertCircle className="w-5 h-5 text-rose-500 dark:text-rose-400" />
                                </div>
                                <div>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm">Declined</p>
                                    <p className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1">{stats.rejected}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Search Input */}
                    <div className="relative w-full md:w-[70%] mb-4">
                        <Search className="absolute inset-y-0 left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Search reports..."
                            className="block w-full pl-10 pr-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-600 focus:border-transparent"
                        />
                    </div>

                    {/* Status Buttons */}
                    <div className="flex justify-center gap-2 overflow-x-auto">
                        <button
                            onClick={() => setStatusFilter(null)}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                                statusFilter === null
                                    ? 'bg-purple-600 text-white dark:bg-purple-500 shadow-sm'
                                    : 'bg-purple-50 text-purple-700 hover:bg-purple-100 dark:bg-purple-900/30 dark:text-purple-300 dark:hover:bg-purple-900/50'
                            }`}
                        >
                            All Reports
                        </button>
                        <button
                            onClick={() => setStatusFilter('PENDING')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${
                                statusFilter === 'PENDING'
                                    ? 'bg-amber-600 text-white dark:bg-amber-700 shadow-sm'
                                    : 'bg-amber-50 text-amber-800 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-300 dark:hover:bg-amber-900/50'
                            }`}
                        >
                            <Clock className="w-4 h-4" /> Pending
                        </button>
                        <button
                            onClick={() => setStatusFilter('ACCEPTED')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${
                                statusFilter === 'ACCEPTED'
                                    ? 'bg-emerald-600 text-white dark:bg-emerald-700 shadow-sm'
                                    : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-300 dark:hover:bg-emerald-900/50'
                            }`}
                        >
                            <CheckCircle className="w-4 h-4" /> Approved
                        </button>
                        <button
                            onClick={() => setStatusFilter('REJECTED')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${
                                statusFilter === 'REJECTED'
                                    ? 'bg-rose-600 text-white dark:bg-rose-700 shadow-sm'
                                    : 'bg-rose-50 text-rose-800 hover:bg-rose-100 dark:bg-rose-900/30 dark:text-rose-300 dark:hover:bg-rose-900/50'
                            }`}
                        >
                            <AlertCircle className="w-4 h-4" /> Declined
                        </button>
                    </div>
                </div>

                {/* Loading & Error */}
                {loading && <ReportCardSkeleton />}
                {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-400">
                        Error loading reports: {error.message}
                    </div>
                )}

                {/* Reports List or Empty */}
                {!loading && !error && (
                    displayedReports.length === 0 ? <EmptyState /> : (
                        <>
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {displayedReports.map(report => (
                                    <ReportCard key={report.id} report={report} onRefresh={handleRefresh} />
                                ))}
                            </div>
                            <div className="flex justify-center items-center gap-4 py-6">
                                <button onClick={handlePrev} disabled={page <= 1} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg disabled:opacity-50">Prev</button>
                                <span className="text-gray-700 dark:text-gray-300">Page {page} of {totalPages}</span>
                                <button onClick={handleNext} disabled={page >= totalPages} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg disabled:opacity-50">Next</button>
                            </div>
                        </>
                    )
                )}
            </div>
        </div>
    );
};

export default MyReportsPage;