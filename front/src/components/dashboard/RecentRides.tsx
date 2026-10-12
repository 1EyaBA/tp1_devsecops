import { useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import { CalendarDays, Clock, ArrowRight, Info, AlertCircle, ExternalLink } from "lucide-react";
import {useNavigate} from "react-router";

interface Ride {
    id: string;
    departure: string;
    arrival: string;
    date: string;
    time: string;
    price: number;
    nbPassengers: number;
    state: string;
}

interface Props {
    rides: Ride[];
}

export default function RecentRides({ rides }: Props) {
    const [showInfo, setShowInfo] = useState(false);
    const navigate = useNavigate();

    // Number of rides to display
    const displayCount = 5;

    // Format price with currency
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        }).format(price);
    };

    // Get status badge color based on ride state
    const getStatusColor = (state: string) => {
        switch (state) {
            case "Not Started":
                return "warning";
            case "Started":
                return "success";
            case "Closed":
                return "warning";
            default:
                return "error";
        }
    };

    // Get items to display
    const displayItems = rides.slice(0, displayCount);

    return (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-md dark:border-gray-800 dark:bg-white/[0.03]">
            {/* Header with gradient */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 text-white dark:border-gray-800">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-white">
                            Recent Rides
                        </h3>
                        <button
                            className="text-white/70 hover:text-white transition-colors"
                            onClick={() => setShowInfo(!showInfo)}
                        >
                            <Info size={16} />
                        </button>
                    </div>
                    <div className="flex items-center gap-3">
                        <button  onClick={() => navigate('/rides')}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-md text-xs font-medium transition-colors">
                            <ExternalLink size={14} />
                            <span>View All Rides</span>
                        </button>

                    </div>
                </div>

                {/* Info box */}
                {showInfo && (
                    <div className="mt-3 p-3 bg-white/10 rounded-lg flex items-start gap-2">
                        <AlertCircle size={16} className="text-white mt-0.5" />
                        <p className="text-xs text-white/90">
                            This table shows your most recent ride activities. Click on any row to view detailed information about the ride.
                        </p>
                    </div>
                )}
            </div>

            {/* Table */}
            <div className="max-w-full overflow-x-auto">
                <Table>
                    <TableHeader className="bg-gray-50/50 dark:bg-gray-800/30">
                        <TableRow>
                            <TableCell isHeader className="py-3 px-6 text-xs font-medium text-start text-gray-500 dark:text-gray-400">
                                From
                            </TableCell>
                            <TableCell isHeader className="py-3 px-6 text-xs font-medium text-start text-gray-500 dark:text-gray-400">
                                To
                            </TableCell>
                            <TableCell isHeader className="py-3 px-6 text-xs font-medium text-start text-gray-500 dark:text-gray-400">
                                Date
                            </TableCell>
                            <TableCell isHeader className="py-3 px-6 text-xs font-medium text-start text-gray-500 dark:text-gray-400">
                                Time
                            </TableCell>
                            <TableCell isHeader className="py-3 px-6 text-xs font-medium text-start text-gray-500 dark:text-gray-400">
                                Price
                            </TableCell>
                            <TableCell isHeader className="py-3 px-6 text-xs font-medium text-start text-gray-500 dark:text-gray-400">
                                Status
                            </TableCell>
                        </TableRow>
                    </TableHeader>

                    <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {displayItems.map((ride) => (
                            <TableRow
                                key={ride.id}
                                className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
                            >
                                <TableCell className="py-4 px-6 text-sm font-medium text-gray-800 dark:text-white/90">
                                    {ride.departure}
                                </TableCell>
                                <TableCell className="py-4 px-6 text-sm text-gray-800 dark:text-white/90">
                                    <div className="flex items-center gap-1.5">
                                        <ArrowRight size={14} className="text-gray-400" />
                                        <span>{ride.arrival}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="py-4 px-6 text-sm text-gray-500 dark:text-gray-400">
                                    <div className="flex items-center gap-1.5">
                                        <CalendarDays size={14} className="text-gray-400" />
                                        <span>{ride.date}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="py-4 px-6 text-sm text-gray-500 dark:text-gray-400">
                                    <div className="flex items-center gap-1.5">
                                        <Clock size={14} className="text-gray-400" />
                                        <span>{ride.time}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="py-4 px-6 text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {formatPrice(ride.price)}
                                </TableCell>
                                <TableCell className="py-4 px-6">
                                    <Badge
                                        size="sm"
                                        variant="light"
                                        color={getStatusColor(ride.state)}
                                    >
                                        {ride.state}
                                    </Badge>
                                </TableCell>
                            </TableRow>
                        ))}

                        {/* Empty state */}
                        {displayItems.length === 0 && (
                            <TableRow>
                                <TableCell  className="py-8 text-center">
                                    <div className="flex flex-col items-center justify-center gap-2">
                                        <Clock size={24} className="text-gray-400" />
                                        <p className="text-gray-500 dark:text-gray-400">No rides found</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Footer */}
            {rides.length > displayCount && (
                <div className="flex items-center justify-center px-6 py-4 border-t border-gray-200 dark:border-gray-800">
                    <button className="flex items-center gap-1.5 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm font-medium transition-colors">
                        <ExternalLink size={14} />
                        <span>View All Rides</span>
                    </button>
                </div>
            )}
        </div>
    );
}