import React from "react";
import {
  IndianRupee,
  UserPlus,
  Briefcase,
  CheckSquare,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import styles from "./StatsOverview.module.css";
import clsx from "clsx";

interface StatsData {
  counts?: {
    revenue?: number;
    joinRequests?: number;
    advisorApplications?: number;
    tasks?: number;
  };
}

interface StatsOverviewProps {
  data: StatsData;
}

export default function StatsOverview({ data }: StatsOverviewProps) {
  const stats = [
    {
      title: "Total Revenue",
      value: `₹ ${(data?.counts?.revenue || 0).toLocaleString()}`,
      change: "+100%",
      isPositive: true,
      icon: IndianRupee,
      color: "primary",
    },
    {
      title: "Join Requests",
      value: data?.counts?.joinRequests || 0,
      change: "",
      isPositive: true,
      icon: UserPlus,
      color: "success",
    },
    {
      title: "Advisor Apps",
      value: data?.counts?.advisorApplications || 0,
      change: "",
      isPositive: true,
      icon: Briefcase,
      color: "info",
    },
    {
      title: "Available Tasks",
      value: data?.counts?.tasks || 0,
      change: "",
      isPositive: true,
      icon: CheckSquare,
      color: "warning",
    },
  ];

  return (
    <div className={styles.grid}>
      {stats.map((stat, index) => (
        <div key={index} className={clsx("glass-card", styles.card)}>
          <div className={styles.content}>
            <h6 className={styles.title}>{stat.title}</h6>
            <h2 className={styles.value}>{stat.value}</h2>
            {stat.change && (
              <div
                className={clsx(
                  styles.change,
                  stat.isPositive ? styles.positive : styles.negative
                )}
              >
                {stat.isPositive ? (
                  <ArrowUp size={14} />
                ) : (
                  <ArrowDown size={14} />
                )}
                <span>{stat.change} this week</span>
              </div>
            )}
          </div>
          <div className={clsx(styles.iconBox, styles[stat.color])}>
            <stat.icon size={24} />
          </div>
        </div>
      ))}
    </div>
  );
}
