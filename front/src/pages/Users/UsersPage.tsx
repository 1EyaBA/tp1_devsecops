import { useQuery } from "@apollo/client";
import { useEffect, useState } from "react";
import { GET_USERS } from "../../graphQl/queries/users";
import { Flag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {  getCurrentUser, getCurrentUserId } from "../../services/authService.ts";

const UsersPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const limit = 6;
  const navigate = useNavigate();

  const { data, loading, error } = useQuery(GET_USERS, {
    variables: { searchTerm: searchTerm || "", page, limit },
  });

  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserId = async () => {
      const id = await getCurrentUserId();
      console.log("Current User ID:", id);
      setCurrentUserId(id);
    };
    fetchUserId();
  }, []);

  useEffect(() => {
    const fetchUserRole = async () => {
      const role = await getCurrentUser().then((user) => user.role);
      console.log("Current User Role:", role);
      setCurrentUserRole(role);
    };
    fetchUserRole();
  }, []);

  const handleReportUser = async (userId: number) => {
    if (userId === currentUserId) {
      alert("You can not report yourself !! ");
      return;
    }
    navigate("/report", { state: { reportedUserId: userId } });
  };

  // Subtle card accent colors
  const cardAccents = [
    "border-blue-400",
    "border-indigo-400",
    "border-purple-400",
    "border-teal-400",
    "border-cyan-400",
  ];

  return (
      <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Users Directory</h1>
            <p className="text-gray-600 dark:text-gray-400">Browse and search for users in our community</p>
          </div>

          {/* Search Bar */}
          <div className="mb-8 relative max-w-xl mx-auto">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  ></path>
                </svg>
              </div>
              <input
                  type="text"
                  placeholder="Search users by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Content */}
          {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
              </div>
          ) : error ? (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
                <div className="flex">
                  <svg
                      className="h-5 w-5 text-red-500 mt-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                  >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error</h3>
                    <div className="mt-1 text-sm text-red-700 dark:text-red-300">{error.message}</div>
                  </div>
                </div>
              </div>
          ) : (
              <>
                {/* Users Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {data?.getUsers?.data
                      .filter((user: any) => user.id !== currentUserId)
                      .map((user: any, index: number) => (
                          <div
                              key={user.id}
                              className={`bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border-t-4 ${cardAccents[index % cardAccents.length]} transition-transform duration-300 hover:shadow-lg hover:-translate-y-1`}
                          >
                            <div className="p-6 relative">
                              {/* User info with circular image on the left */}
                              <div className="flex items-center mb-4">
                                {user.imageUrl ? (
                                    <img
                                        src={user.imageUrl || "/images/user/default-avatar.jpg"}
                                        alt={`${user.name} ${user.lastName}`}
                                        className="h-16 w-16 rounded-full object-cover shadow-sm border border-gray-200 dark:border-gray-700"
                                    />
                                ) : (
                                    <div className="h-16 w-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 text-xl font-bold shadow-sm border border-gray-200 dark:border-gray-700">
                                      {user.name.charAt(0)}
                                      {user.lastName.charAt(0)}
                                    </div>
                                )}

                                <div className="ml-4">
                                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                                    {user.name} {user.lastName}
                                  </h3>

                                  {/* Star Rating */}
                                  <div className="flex items-center mt-1 space-x-2">
                                    {user.rating != null && user.rating > 0 ? (
                                        <>
                                          {[...Array(5)].map((_, i) => (
                                              <svg
                                                  key={i}
                                                  className={`w-4 h-4 ${
                                                      i < Math.round(user.rating)
                                                          ? "text-yellow-400"
                                                          : "text-gray-300 dark:text-gray-600"
                                                  }`}
                                                  fill="currentColor"
                                                  viewBox="0 0 20 20"
                                              >
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                              </svg>
                                          ))}
                                          <span className="ml-1 text-xs text-gray-600 dark:text-gray-400">
                                  {user.rating}/5
                                </span>
                                        </>
                                    ) : (
                                        <div className="flex items-center space-x-1 text-gray-400 italic animate-pulse">
                                          <svg
                                              xmlns="http://www.w3.org/2000/svg"
                                              className="h-5 w-5 text-gray-300"
                                              fill="none"
                                              viewBox="0 0 24 24"
                                              stroke="currentColor"
                                              strokeWidth={2}
                                          >
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 20h.01" />
                                          </svg>
                                          <span>No rating yet</span>
                                        </div>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Buttons */}
                              <div className="grid grid-cols-2 gap-2 mt-4">
                                <button
                                    onClick={() => navigate(`/profile/${user.id}`)}
                                    className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-300 shadow-sm"
                                >
                                  View Profile
                                </button>
                                {/* N'affiche pas le bouton Report si le role est "admin" */}
                                {currentUserRole !== "admin" && (
                                    <button
                                        onClick={() => handleReportUser(user.id)}
                                        className="bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-red-500 border border-gray-200 dark:border-gray-600 py-2 px-4 rounded-lg font-medium transition-colors duration-300 flex items-center justify-center"
                                    >
                                      <Flag size={16} className="mr-2" />
                                      Report
                                    </button>
                                )}
                              </div>
                            </div>
                          </div>
                      ))}
                </div>

                {/* Empty State */}
                {data?.getUsers?.data.length === 0 && (
                    <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                        />
                      </svg>
                      <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">No users found</h3>
                      <p className="mt-1 text-gray-500 dark:text-gray-400">
                        Try adjusting your search or filter to find what you're looking for.
                      </p>
                    </div>
                )}

                {/* Pagination */}
                {data?.getUsers?.data.length > 0 && (
                    <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-6">
                      <div className="flex-1 flex justify-between sm:hidden">
                        <button
                            disabled={data?.getUsers?.currentPage === 1}
                            onClick={() => setPage(page - 1)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md ${
                                data?.getUsers?.currentPage === 1
                                    ? "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 border-gray-300 dark:border-gray-700"
                                    : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
                            }`}
                        >
                          Previous
                        </button>
                        <button
                            onClick={() => setPage(page + 1)}
                            disabled={page * limit >= data?.getUsers?.totalItems}
                            className={`ml-3 relative inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md ${
                                page * limit >= data?.getUsers?.totalItems
                                    ? "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 border-gray-300 dark:border-gray-700"
                                    : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
                            }`}
                        >
                          Next
                        </button>
                      </div>
                      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            Showing <span className="font-medium">{(page - 1) * limit + 1}</span> to{" "}
                            <span className="font-medium">{Math.min(page * limit, data?.getUsers?.totalItems)}</span> of{" "}
                            <span className="font-medium">{data?.getUsers?.totalItems}</span> results
                          </p>
                        </div>
                        <div>
                          <nav
                              className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                              aria-label="Pagination"
                          >
                            <button
                                disabled={data?.getUsers?.currentPage === 1}
                                onClick={() => setPage(page - 1)}
                                className={`relative inline-flex items-center px-2 py-2 rounded-l-md border ${
                                    data?.getUsers?.currentPage === 1
                                        ? "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 border-gray-300 dark:border-gray-700"
                                        : "bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
                                }`}
                            >
                              <span className="sr-only">Previous</span>
                              <svg
                                  className="h-5 w-5"
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                  aria-hidden="true"
                              >
                                <path
                                    fillRule="evenodd"
                                    d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                />
                              </svg>
                            </button>

                            {/* Current page indicator */}
                            <span className="relative inline-flex items-center px-4 py-2 border border-blue-500 bg-blue-500 text-sm font-medium text-white">
                        {data?.getUsers?.currentPage}
                      </span>

                            <button
                                onClick={() => setPage(page + 1)}
                                disabled={page * limit >= data?.getUsers?.totalItems}
                                className={`relative inline-flex items-center px-2 py-2 rounded-r-md border ${
                                    page * limit >= data?.getUsers?.totalItems
                                        ? "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 border-gray-300 dark:border-gray-700"
                                        : "bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
                                }`}
                            >
                              <span className="sr-only">Next</span>
                              <svg
                                  className="h-5 w-5"
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                  aria-hidden="true"
                              >
                                <path
                                    fillRule="evenodd"
                                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                    clipRule="evenodd"
                                />
                              </svg>
                            </button>
                          </nav>
                        </div>
                      </div>
                    </div>
                )}
              </>
          )}
        </div>
      </div>
  );
};

export default UsersPage;
