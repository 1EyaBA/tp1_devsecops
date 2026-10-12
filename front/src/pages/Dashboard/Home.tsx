import { useQuery } from '@apollo/client';
import { Get_DashboardData } from '../../graphQl/queries/dashboardData';
import DashboardMetrics from "../../components/dashboard/DashboardMetrics.tsx";
import MonthlyRidesChart from "../../components/dashboard/MonthlyRidesChart.tsx";
import PageMeta from "../../components/common/PageMeta";
import RecentRides from "../../components/dashboard/RecentRides.tsx";
import RecentUsers from "../../components/dashboard/RecentUsers.tsx";
import {CurrentUser, getCurrentUser} from '../../services/authService';
import {useEffect, useState} from "react"; // assume this hook exists

export default function Home() {
    const [user, setUser] = useState<CurrentUser| null>(null);

    // Load current user once
    useEffect(() => {
        getCurrentUser().then(setUser);
    }, []);

    const isAdmin = user?.role === 'admin';

    // Always call useQuery but skip execution if not admin or user not loaded
    const { data, error } = useQuery(Get_DashboardData, {
        skip: !user || !isAdmin
    });

    // Show placeholder while user auth is loading
    if (user === null) return <div>Loading...</div>;

    // Common error handling (only for admin)
    if (isAdmin && error) return (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline"> Unable to load data: {error.message}</span>
        </div>
    );

    if (isAdmin) {
        console.log("Dashboard data:", data);
    }

    const stats = data?.getDashboardData.stats || {};
    const ridesPerMonth = data?.getDashboardData.ridesPerMonth || [];
    const recentRides = data?.getDashboardData.recentRides || [];
    const recentUsers = data?.getDashboardData.recentUsers || [];

    return (
        <>
            {isAdmin ? (
                // Admin view (Eya)
                <>
                    <PageMeta
                        title="Admin Dashboard | Ridesharing Application"
                        description="Admin main dashboard"
                    />
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-8 mb-10">
                        <div className="grid grid-cols-12 gap-6">
                            <div className="col-span-12 flex flex-col space-y-6">
                                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md dark:shadow-lg dark:shadow-gray-700/20">
                                    <DashboardMetrics stats={stats} />
                                </div>
                                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md dark:shadow-lg dark:shadow-gray-700/20">
                                    <MonthlyRidesChart data={ridesPerMonth} />
                                </div>
                            </div>
                            <div className="col-span-12 mt-2">
                                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md dark:shadow-lg dark:shadow-gray-700/20">
                                    <RecentRides rides={recentRides} />
                                </div>
                            </div>
                            <div className="col-span-12 mt-2">
                                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md dark:shadow-lg dark:shadow-gray-700/20">
                                    <RecentUsers users={recentUsers} />
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                // Regular user view
                <>
                    <div className="mt-6 rounded-2xl border border-stroke bg-gradient-to-br from-white via-blue-50 to-blue-100 p-10 shadow-2xl dark:from-gray-900 dark:via-gray-800 dark:to-boxdark dark:border-strokedark overflow-hidden relative isolate">
                        {/* Vibrant background gradient elements */}
                        <div className="absolute inset-0 -z-10 overflow-hidden">
                            <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-primary/20 dark:bg-primary/30 animate-blob mix-blend-multiply filter blur-3xl opacity-80 dark:opacity-40"></div>
                            <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-teal-400/20 dark:bg-teal-400/30 animate-blob animation-delay-2000 mix-blend-multiply filter blur-3xl opacity-80 dark:opacity-40"></div>
                            <div className="absolute top-1/2 left-1/4 w-56 h-56 rounded-full bg-purple-400/20 dark:bg-purple-400/30 animate-blob animation-delay-4000 mix-blend-multiply filter blur-3xl opacity-80 dark:opacity-40"></div>
                        </div>

                        <div className="max-w-3xl mx-auto text-center relative z-10">
                            {/* Colorful animated icon container */}
                            <div className="mb-8 inline-flex p-4 bg-gradient-to-br from-primary/20 via-blue-100/50 to-blue-200/30 dark:from-primary/30 dark:via-blue-900/30 dark:to-blue-800/40 rounded-2xl shadow-inner border border-white/70 dark:border-gray-700/50">
                                <div className="p-4 bg-white/70 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl border border-white/50 dark:border-gray-700/40 shadow-sm">
                                    <svg
                                        className="h-16 w-16 text-primary animate-float"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="1.5"
                                            d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                                        />
                                    </svg>
                                </div>
                            </div>

                            {/* Headline with vibrant gradient */}
                            <h1 className="text-5xl font-extrabold text-gray-900 dark:text-white mb-6 tracking-tight">
            <span className="relative inline-block">
              <span className="relative z-10">Ride</span>
              <span className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-blue-400/40 to-teal-400/40 dark:from-primary/30 dark:to-teal-400/30 -rotate-1 -z-0"></span>
            </span>
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-teal-500 dark:from-primary dark:to-teal-400">Share</span>
                            </h1>

                            {/* Subheading with colorful elements */}
                            <p className="text-xl text-gray-700 dark:text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed relative group">
                                Connect with fellow travelers, share costs, and reduce your carbon footprint.
                                <span className="block mt-3 font-medium">
              <span className="text-blue-500 dark:text-blue-400">Simple</span> •
              <span className="text-teal-500 dark:text-teal-400"> Safe</span> •
              <span className="text-purple-500 dark:text-purple-400"> Sustainable</span>
            </span>
                                <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-teal-500 transition-all duration-500 group-hover:w-full group-hover:left-0"></span>
                            </p>

                            {/* Vibrant action buttons */}
                            <div className="flex flex-col sm:flex-row justify-center gap-4">
                                <a
                                    href="/rides"
                                    className="relative inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 to-teal-500 py-4 px-10 text-center font-semibold text-white hover:shadow-lg transition-all duration-300 hover:brightness-110 group overflow-hidden"
                                >
                                    <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-teal-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                                    <span className="relative z-10 flex items-center">
                <svg
                    className="mr-3 h-5 w-5 text-white/90 group-hover:translate-x-1 transition-transform duration-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
                Start Sharing Rides Now
              </span>
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <svg className="h-4 w-4 text-white/80 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd"></path>
                </svg>
              </span>
                                </a>


                            </div>

                            {/* Colorful trust indicators */}
                            <div className="mt-12 pt-8 border-t border-gray-200/70 dark:border-gray-700/50">
                                <p className="text-sm uppercase tracking-wider text-blue-600/80 dark:text-blue-400/80 mb-6 font-medium">
                                    Trusted by thousands of eco-conscious travelers
                                </p>
                                <div className="flex flex-wrap justify-center items-center gap-6">
                                    <div className="flex items-center bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm px-4 py-2 rounded-lg border border-gray-200/50 dark:border-gray-700/50 shadow-sm hover:shadow-md transition-shadow duration-300">
                                        <div className="flex -space-x-1 mr-2">
                                            {[1, 2, 3].map((item) => (
                                                <div key={item} className="h-6 w-6 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 border-2 border-white dark:border-gray-800"></div>
                                            ))}
                                        </div>
                                        <div>
                                            <div className="font-bold text-gray-700 dark:text-gray-200">4.9/5</div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">User Rating</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm px-4 py-2 rounded-lg border border-gray-200/50 dark:border-gray-700/50 shadow-sm hover:shadow-md transition-shadow duration-300">
                                        <svg className="h-6 w-6 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                                        </svg>
                                        <div>
                                            <div className="font-bold text-gray-700 dark:text-gray-200">100%</div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">Verified</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm px-4 py-2 rounded-lg border border-gray-200/50 dark:border-gray-700/50 shadow-sm hover:shadow-md transition-shadow duration-300">
                                        <svg className="h-6 w-6 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path>
                                        </svg>
                                        <div>
                                            <div className="font-bold text-gray-700 dark:text-gray-200">500+</div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">Cities</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </>
    );
}