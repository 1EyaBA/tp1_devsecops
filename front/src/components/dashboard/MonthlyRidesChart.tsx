import { useState, useEffect, useMemo } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import {
    CalendarIcon,
    TrendingUpIcon,
    TrendingDownIcon,
    BarChartIcon,
    LineChartIcon,
    ArrowRightIcon,
    ArrowLeftIcon, Activity,
    ChevronUp, ChevronDown, TrendingUp, TrendingDown
} from "lucide-react";

interface MonthlyData {
    month: string;
    count: number;
}

interface Props {
    data: MonthlyData[];
    title?: string;
}

// Helper function to sort months chronologically
const sortMonthsChronologically = (data: MonthlyData[]): MonthlyData[] => {
    // Create a mapping of month names to their numerical value
    const monthOrder: Record<string, number> = {
        'January': 0, 'February': 1, 'March': 2, 'April': 3,
        'May': 4, 'June': 5, 'July': 6, 'August': 7,
        'September': 8, 'October': 9, 'November': 10, 'December': 11
    };

    // Handle abbreviated month names if present
    const abbrevMonthOrder: Record<string, number> = {
        'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
        'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
    };

    // First, try to determine if the months include year information
    const hasYearInfo = data.some(item => {
        // Check for formats like "Jan 2023", "January 2023", "01/2023", etc.
        return /\d{4}$|\d{4}-\d{2}|\/\d{4}/.test(item.month);
    });

    if (hasYearInfo) {
        // Sort by parsed date if years are included
        return [...data].sort((a, b) => {
            const dateA = new Date(a.month);
            const dateB = new Date(b.month);
            return dateA.getTime() - dateB.getTime();
        });
    } else {
        // Check format - is it month name or number?
        const firstMonth = data[0]?.month;
        const isNumeric = /^\d+$/.test(firstMonth);

        if (isNumeric) {
            // If months are numbers (1-12), sort numerically
            return [...data].sort((a, b) => parseInt(a.month) - parseInt(b.month));
        } else {
            // If months are names, use our mapping
            return [...data].sort((a, b) => {
                // First check if it's a full month name
                if (monthOrder[a.month] !== undefined && monthOrder[b.month] !== undefined) {
                    return monthOrder[a.month] - monthOrder[b.month];
                }
                // Then check abbreviated month names
                return (abbrevMonthOrder[a.month] || 0) - (abbrevMonthOrder[b.month] || 0);
            });
        }
    }
};

export default function InnovativeMonthlyRidesChart({
                                                        data,
                                                        title = "Monthly Ride Activity"
                                                    }: Props) {
    const [chartView, setChartView] = useState<'area' | 'bar'>('area');
    const [visibleMonths] = useState<number>(6); // Default shown months
    const [startIndex, setStartIndex] = useState<number>(0);
    const [isAnimating, setIsAnimating] = useState<boolean>(false);
    const [showFullStats, setShowFullStats] = useState<boolean>(false);


    const safeData = data ?? [];
    // Sort the data chronologically - moved before useEffect
    const sortedData = useMemo(() => sortMonthsChronologically(safeData), [safeData]);

    // Set initial visible range to show the most recent months
    useEffect(() => {
        if (sortedData.length > visibleMonths) {
            setStartIndex(sortedData.length - visibleMonths);
        }
    }, [sortedData, visibleMonths]); // Added sortedData to dependencies

    // Calculate visible data range
    const visibleData = useMemo(() => {
        return sortedData.slice(startIndex, startIndex + visibleMonths);
    }, [sortedData, startIndex, visibleMonths]);

    // Process data for the chart
    const months = visibleData.map(item => item.month);
    const counts = visibleData.map(item => item.count);

    // Calculate stats for the data
    const stats = useMemo(() => {
        // Current vs previous month trend
        const currentMonthRides = sortedData[sortedData.length - 1]?.count || 0;
        const previousMonthRides = sortedData[sortedData.length - 2]?.count || 1; // Prevent division by zero
        const percentageChange = ((currentMonthRides - previousMonthRides) / previousMonthRides) * 100;

        // Calculate average ride count
        const total = sortedData.reduce((sum, item) => sum + item.count, 0);
        const average = sortedData.length > 0 ? total / sortedData.length : 0;

        // Find max and min ride counts
        const max = Math.max(...sortedData.map(item => item.count));
        const min = Math.min(...sortedData.map(item => item.count));

        // Find months with max and min values
        const maxMonth = sortedData.find(item => item.count === max)?.month || '';
        const minMonth = sortedData.find(item => item.count === min)?.month || '';

        // Calculate growth rate (average monthly change)
        let growthRate = 0;
        if (sortedData.length > 1) {
            const firstValue = sortedData[0].count;
            const lastValue = sortedData[sortedData.length - 1].count;
            const periods = sortedData.length - 1;
            growthRate = ((lastValue / firstValue) ** (1 / periods) - 1) * 100;
        }

        return {
            currentMonth: sortedData[sortedData.length - 1]?.month || '',
            currentMonthRides,
            previousMonthRides,
            percentageChange,
            isPositiveTrend: percentageChange >= 0,
            total,
            average,
            max,
            min,
            maxMonth,
            minMonth,
            growthRate,
            growthIsPositive: growthRate >= 0
        };
    }, [sortedData]);
    // Handle empty data case
    if (!data || data.length === 0) {
        return (
            <div className="flex h-96 items-center justify-center rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/70 text-gray-800 dark:text-gray-100 p-6 shadow-lg transition-all duration-300">
                <div className="text-center">
                    <CalendarIcon className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-600 opacity-80" />
                    <h3 className="mt-4 text-lg font-medium text-gray-700 dark:text-gray-200">No ride data available</h3>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Try adding some monthly ride data to visualize your stats</p>
                </div>
            </div>
        );
    }
    // Helper to navigate through months
    const canGoBack = startIndex > 0;
    const canGoForward = startIndex + visibleMonths < sortedData.length;

    const goBack = () => {
        if (canGoBack && !isAnimating) {
            setIsAnimating(true);
            const newIndex = Math.max(0, startIndex - Math.floor(visibleMonths / 2));
            setStartIndex(newIndex);
            setTimeout(() => setIsAnimating(false), 600);
        }
    };

    const goForward = () => {
        if (canGoForward && !isAnimating) {
            setIsAnimating(true);
            const newIndex = Math.min(sortedData.length - visibleMonths, startIndex + Math.floor(visibleMonths / 2));
            setStartIndex(newIndex);
            setTimeout(() => setIsAnimating(false), 600);
        }
    };

    // Color theme definition
    const colors = {
        mainColor: '#6366f1', // Indigo
        secondaryColor: '#818cf8',
        gradientStop1: '#6366f1',
        gradientStop2: 'rgba(99, 102, 241, 0.1)',
        gridColor: 'rgba(0, 0, 0, 0.06)',
        cardBackground: 'bg-white dark:bg-gray-900/50',
        cardBorder: 'border-gray-100 dark:border-gray-800',
        statCard: 'bg-gray-50/80 dark:bg-gray-800/60 border-gray-100 dark:border-gray-700/50'
    };

    // Chart options
    const options: ApexOptions = {
        chart: {
            height: 350,
            type: chartView,
            toolbar: {
                show: false,
            },
            animations: {
                enabled: !isAnimating,
                speed: 600,
                animateGradually: {
                    enabled: true,
                    delay: 150
                },
                dynamicAnimation: {
                    enabled: true,
                    speed: 350
                }
            },
            fontFamily: 'inherit',
            background: 'transparent',
            dropShadow: {
                enabled: true,
                top: 5,
                left: 0,
                blur: 8,
                opacity: 0.2,
                color: colors.mainColor
            }
        },
        colors: [colors.mainColor],
        dataLabels: {
            enabled: false,
        },
        stroke: {
            curve: 'smooth',
            width: chartView === 'area' ? 3 : 0,
            lineCap: 'round',
        },
        fill: {
            type: chartView === 'area' ? 'gradient' : 'solid',
            gradient: {
                shade: 'dark',
                type: 'vertical',
                shadeIntensity: 0.2,
                gradientToColors: [colors.gradientStop2],
                inverseColors: false,
                opacityFrom: 0.85,
                opacityTo: 0.2,
                stops: [0, 100]
            },
            colors: [colors.mainColor]
        },
        xaxis: {
            categories: months,
            labels: {
                style: {
                    colors: '#64748b', // Light mode label color
                    fontFamily: 'inherit',
                    fontWeight: 500
                },
                rotateAlways: false,
                hideOverlappingLabels: true,
            },
            axisBorder: {
                show: false,
            },
            axisTicks: {
                show: false,
            },
            crosshairs: {
                show: true,
                position: 'back',
                stroke: {
                    color: colors.mainColor,
                    width: 1,
                    dashArray: 3,
                }
            },
            tooltip: {
                enabled: true,
            }
        },
        yaxis: {
            labels: {
                style: {
                    colors: '#64748b', // Light mode label color
                    fontFamily: 'inherit',
                },
                formatter: (value) => Math.round(value).toString(),
            },
            tickAmount: 5,
        },
        grid: {
            borderColor: colors.gridColor,
            strokeDashArray: 5,
            xaxis: {
                lines: {
                    show: true,
                },
            },
            yaxis: {
                lines: {
                    show: true,
                },
            },
            padding: {
                top: 0,
                right: 10,
                bottom: 0,
                left: 10,
            },
        },
        tooltip: {
            theme: 'light', // ApexCharts will handle dark mode through CSS
            style: {
                fontSize: '14px',
                fontFamily: 'inherit'
            },
            x: {
                show: true,
            },
            y: {
                title: {
                    formatter: () => 'Rides:',
                },
                formatter: (val) => `${Math.round(val).toLocaleString()}`,
            },
            marker: {
                show: true,
                fillColors: [colors.mainColor]
            },
            fixed: {
                enabled: false,
                position: 'topRight',
                offsetX: 0,
                offsetY: 0,
            },
        },
        markers: {
            size: 5,
            strokeWidth: 0,
            fillOpacity: 1,
            strokeOpacity: 0,
            hover: {
                size: 8,
            }
        },
        plotOptions: {
            bar: {
                borderRadius: 6,
                columnWidth: '60%',
                dataLabels: {
                    position: 'top',
                },
                colors: {
                    ranges: [{
                        from: 0,
                        to: 9999999,
                        color: colors.mainColor
                    }]
                }
            }
        },
        responsive: [
            {
                breakpoint: 640,
                options: {
                    chart: {
                        height: 300,
                    },
                    markers: {
                        size: 4,
                    },
                },
            },
        ],
    };

    const series = [
        {
            name: 'Rides',
            data: counts,
        },
    ];

    // Enhanced version with animation and stats
    return (
        <div className="transition-colors duration-300 text-gray-800 dark:text-gray-100">
            <div className={`rounded-xl ${colors.cardBackground} ${colors.cardBorder} border shadow-lg overflow-hidden transition-all duration-300`}>
                {/* Header with title, stats, and controls */}
                <div className="p-5 border-b border-gray-100 dark:border-gray-800 border-opacity-40 bg-opacity-50 backdrop-blur-sm backdrop-filter flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-xl font-semibold">
                                {title}
                            </h3>
                            {stats.isPositiveTrend ? (
                                <span className="inline-flex items-center rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2.5 py-1 text-xs font-medium">
                  <TrendingUpIcon className="mr-1 h-3 w-3" />
                                    {Math.abs(stats.percentageChange).toFixed(1)}%
                </span>
                            ) : (
                                <span className="inline-flex items-center rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-2.5 py-1 text-xs font-medium">
                  <TrendingDownIcon className="mr-1 h-3 w-3" />
                                    {Math.abs(stats.percentageChange).toFixed(1)}%
                </span>
                            )}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Showing {months[0]} - {months[months.length - 1]} ({visibleData.length} of {sortedData.length} months)
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2 items-center">
                        {/* Chart type selector */}
                        <div className="flex items-center rounded-lg bg-gray-100 dark:bg-gray-800 p-1">
                            <button
                                onClick={() => setChartView('area')}
                                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors flex items-center gap-1 ${
                                    chartView === 'area'
                                        ? 'bg-white dark:bg-gray-700 text-gray-800 dark:text-white shadow-sm'
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700/70'
                                }`}
                            >
                                <LineChartIcon className="h-3.5 w-3.5" /> Area
                            </button>
                            <button
                                onClick={() => setChartView('bar')}
                                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors flex items-center gap-1 ${
                                    chartView === 'bar'
                                        ? 'bg-white dark:bg-gray-700 text-gray-800 dark:text-white shadow-sm'
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700/70'
                                }`}
                            >
                                <BarChartIcon className="h-3.5 w-3.5" /> Bar
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main chart content */}
                <div className="p-5">
                    {/* Navigation controls */}
                    {sortedData.length > visibleMonths && (
                        <div className="flex justify-between mb-3">
                            <button
                                onClick={goBack}
                                disabled={!canGoBack || isAnimating}
                                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                                    canGoBack && !isAnimating
                                        ? 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                                        : 'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-800'
                                }`}
                            >
                                <ArrowLeftIcon className="h-4 w-4" /> Previous
                            </button>

                            <button
                                onClick={goForward}
                                disabled={!canGoForward || isAnimating}
                                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                                    canGoForward && !isAnimating
                                        ? 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                                        : 'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-800'
                                }`}
                            >
                                Next <ArrowRightIcon className="h-4 w-4" />
                            </button>
                        </div>
                    )}

                    {/* Chart container */}
                    <div className={`relative h-80 transition-all duration-300 ${isAnimating ? 'opacity-50' : 'opacity-100'}`}>
                        <Chart
                            options={options}
                            series={series}
                            type={chartView}
                            height="100%"
                        />
                    </div>

                    {/* Statistics panel */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                            <Activity className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                                Ride Statistics
                            </h3>
                        </div>
                        <button
                            onClick={() => setShowFullStats(!showFullStats)}
                            className="flex items-center px-3 py-1 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/30 rounded-full transition-all duration-200"
                        >
                            <span>{showFullStats ? 'Show Less' : 'Show More'}</span>
                            {showFullStats ? (
                                <ChevronUp className="ml-1 h-4 w-4" />
                            ) : (
                                <ChevronDown className="ml-1 h-4 w-4" />
                            )}
                        </button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {/* Basic stats always shown */}
                        <div className="p-4 rounded-lg bg-gradient-to-br from-white to-indigo-50 dark:from-gray-800 dark:to-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 shadow-sm hover:shadow-md transition-shadow duration-200">
                            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Latest Month</div>
                            <div className="text-xl font-bold mt-2 text-gray-800 dark:text-gray-200">{stats.currentMonthRides.toLocaleString()}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">rides in {stats.currentMonth}</div>
                        </div>

                        <div className="p-4 rounded-lg bg-gradient-to-br from-white to-indigo-50 dark:from-gray-800 dark:to-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 shadow-sm hover:shadow-md transition-shadow duration-200">
                            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Monthly Change</div>
                            <div className={`flex items-center mt-2 ${stats.isPositiveTrend ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                {stats.isPositiveTrend ? (
                                    <TrendingUp className="h-5 w-5 mr-1" />
                                ) : (
                                    <TrendingDown className="h-5 w-5 mr-1" />
                                )}
                                <span className="text-xl font-bold">{Math.abs(stats.percentageChange).toFixed(1)}%</span>
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">vs previous month</div>
                        </div>

                        {/* Additional stats shown when expanded */}
                        {showFullStats && (
                            <>
                                <div className="p-4 rounded-lg bg-gradient-to-br from-white to-emerald-50 dark:from-gray-800 dark:to-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 shadow-sm hover:shadow-md transition-shadow duration-200">
                                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Peak Month</div>
                                    <div className="text-xl font-bold mt-2 text-gray-800 dark:text-gray-200">{stats.max.toLocaleString()}</div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">{stats.maxMonth}</div>
                                </div>

                                <div className="p-4 rounded-lg bg-gradient-to-br from-white to-amber-50 dark:from-gray-800 dark:to-amber-950/30 border border-amber-100 dark:border-amber-900/50 shadow-sm hover:shadow-md transition-shadow duration-200">
                                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Lowest Month</div>
                                    <div className="text-xl font-bold mt-2 text-gray-800 dark:text-gray-200">{stats.min.toLocaleString()}</div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">{stats.minMonth}</div>
                                </div>

                                <div className="p-4 rounded-lg bg-gradient-to-br from-white to-purple-50 dark:from-gray-800 dark:to-purple-950/30 border border-purple-100 dark:border-purple-900/50 shadow-sm hover:shadow-md transition-shadow duration-200">
                                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Total Rides</div>
                                    <div className="text-xl font-bold mt-2 text-gray-800 dark:text-gray-200">{stats.total.toLocaleString()}</div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">all time</div>
                                </div>

                                <div className="p-4 rounded-lg bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-blue-950/30 border border-blue-100 dark:border-blue-900/50 shadow-sm hover:shadow-md transition-shadow duration-200">
                                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Average Rides</div>
                                    <div className="text-xl font-bold mt-2 text-gray-800 dark:text-gray-200">{Math.round(stats.average).toLocaleString()}</div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">per month</div>
                                </div>

                                <div className="p-4 rounded-lg bg-gradient-to-br from-white to-cyan-50 dark:from-gray-800 dark:to-cyan-950/30 border border-cyan-100 dark:border-cyan-900/50 shadow-sm hover:shadow-md transition-shadow duration-200">
                                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Average Growth</div>
                                    <div className={`flex items-center mt-2 ${stats.growthIsPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                        {stats.growthIsPositive ? (
                                            <TrendingUp className="h-5 w-5 mr-1" />
                                        ) : (
                                            <TrendingDown className="h-5 w-5 mr-1" />
                                        )}
                                        <span className="text-xl font-bold">{Math.abs(stats.growthRate).toFixed(1)}%</span>
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">month over month</div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}