import React from "react";
import {
  UserIcon,
  PageIcon,
  ChatIcon,
  CheckCircleIcon,
  BoltIcon,
  AlertIcon,
} from "../../icons";
import Badge, { BadgeColor } from "../ui/badge/Badge";
import { motion } from "framer-motion";

type Metric = {
  label: string;
  count: number;
  badgeColor: BadgeColor;
  Icon: React.FC<React.SVGProps<SVGSVGElement>>;
  description: string;
};

interface Props {
  stats: {
    userCount: number;
    rideCount: number;
    postCount: number;
    reviewCount: number;
    reportCount: number;
    commentCount: number;
  };
}

export default function DashboardMetrics({ stats }: Props) {
  if (!stats) {
    return (
        <div className="rounded-lg bg-gray-50 p-4 text-gray-500 dark:bg-gray-800/50 dark:text-gray-400">
          No metrics available
        </div>
    );
  }

  const metricsConfig: Metric[] = [
    {
      label: "Users",
      count: stats.userCount ?? 0,
      badgeColor: "success",
      Icon: UserIcon,
      description: "Total registered users"
    },
    {
      label: "Rides",
      count: stats.rideCount ?? 0,
      badgeColor: "error",
      Icon: BoltIcon,
      description: "Completed rides"
    },
    {
      label: "Posts",
      count: stats.postCount ?? 0,
      badgeColor: "info",
      Icon: PageIcon,
      description: "Published posts"
    },
    {
      label: "Comments",
      count: stats.commentCount ?? 0,
      badgeColor: "warning",
      Icon: ChatIcon,
      description: "User comments"
    },
    {
      label: "Reviews",
      count: stats.reviewCount ?? 0,
      badgeColor: "success",
      Icon: CheckCircleIcon,
      description: "User reviews"
    },
    {
      label: "Reports",
      count: stats.reportCount ?? 0,
      badgeColor: "light",
      Icon: AlertIcon,
      description: "Issue reports"
    },
  ];

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
      <motion.div
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
          variants={container}
          initial="hidden"
          animate="show"
      >
        {metricsConfig.map((metric) => (
            <motion.div
                key={metric.label}
                variants={item}
                className="group relative overflow-hidden rounded-xl border border-gray-100 bg-white p-5 dark:border-gray-800 dark:bg-gray-900"
                whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
            >
              {/* Background decoration */}
              <div className="absolute -right-4 -top-4 z-0 h-24 w-24 rounded-full opacity-20 blur-2xl transition-all duration-300 group-hover:opacity-30"
                   style={{
                     background: metric.badgeColor === "success" ? "linear-gradient(135deg, #10b981, #059669)" :
                         metric.badgeColor === "error" ? "linear-gradient(135deg, #ef4444, #dc2626)" :
                             metric.badgeColor === "warning" ? "linear-gradient(135deg, #f59e0b, #d97706)" :
                                 metric.badgeColor === "info" ? "linear-gradient(135deg, #3b82f6, #2563eb)" :
                                     "linear-gradient(135deg, #6b7280, #4b5563)"
                   }}
              />

              <div className="relative z-10 flex items-start justify-between">
                {/* Text Content */}
                <div className="space-y-3">
                  <Badge color={metric.badgeColor}>
                    {metric.label}
                  </Badge>
                  <div className="space-y-1">
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
                      {metric.count?.toLocaleString() ?? "N/A"}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {metric.description}
                    </p>
                  </div>
                </div>

                {/* Icon Container */}
                <div className={`rounded-lg p-3 shadow-sm transition-all duration-300 ${
                    metric.badgeColor === "success"
                        ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400" :
                        metric.badgeColor === "error"
                            ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" :
                            metric.badgeColor === "warning"
                                ? "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400" :
                                metric.badgeColor === "info"
                                    ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" :
                                    "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                } group-hover:scale-110`}>
                  <metric.Icon className="h-6 w-6" />
                </div>
              </div>

              {/* Bottom accent line */}
              <div
                  className="absolute bottom-0 left-0 h-1 w-full transform transition-all duration-300 group-hover:scale-x-100"
                  style={{
                    background: metric.badgeColor === "success" ? "#10b981" :
                        metric.badgeColor === "error" ? "#ef4444" :
                            metric.badgeColor === "warning" ? "#f59e0b" :
                                metric.badgeColor === "info" ? "#3b82f6" :
                                    "#6b7280",
                    transformOrigin: "left",
                    transform: "scaleX(0.15)",
                  }}
              />
            </motion.div>
        ))}
      </motion.div>
  );
}