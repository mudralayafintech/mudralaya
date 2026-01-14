"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import Skeleton from "@/components/ui/Skeleton";
import {
  Play,
  TrendingUp,
  Wallet,
  Users,
  Copy,
  Rocket,
  MessageSquare,
  HandCoins,
  ChevronUp,
  Loader2,
} from "lucide-react";
import styles from "./dashboard.module.css";
import VideoModal from "@/components/dashboard/VideoModal";

interface Task {
  id: string;
  title: string;
  category: string;
  icon_type: string;
  action_link?: string;
  reward_member?: number;
  reward_free?: number;
  reward_info?: string;
}

interface DashboardData {
  tasks: Task[];
  ongoingTask: Task | null;
  stats: {
    approved: number;
    pending: number;
    total: number;
    today: number;
    monthly: number;
  };
}

export default function DashboardHome() {
  const [data, setData] = useState<DashboardData>({
    tasks: [],
    ongoingTask: null,
    stats: { approved: 0, pending: 0, total: 0, today: 0, monthly: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [joiningTaskId, setJoiningTaskId] = useState<string | null>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  const supabase = createClient();

  const fetchDashboardData = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    try {
      // Fetch Profile
      const { data: profileData } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();
      if (profileData) setProfile(profileData);

      // Fetch Dashboard Data
      const [tasksRes, statsRes, userTasksRes] = await Promise.all([
        supabase.from("tasks").select("*").limit(5),
        supabase.rpc("get_user_wallet_stats", { user_id_param: user.id }),
        supabase
          .from("user_tasks")
          .select("*, tasks(*)")
          .eq("user_id", user.id)
          .eq("status", "ongoing")
          .order("created_at", { ascending: false })
          .limit(1),
      ]);

      const tasks = tasksRes.data || [];
      const stats = statsRes.data || {
        approved: 0,
        pending: 0,
        total: 0,
        payout: 0,
        today: 0,
        monthly: 0,
      };
      const ongoingTask =
        userTasksRes.data && userTasksRes.data.length > 0
          ? userTasksRes.data[0].tasks
          : null;

      setData({
        tasks,
        ongoingTask,
        stats: stats as any,
      });
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleStartTask = async (task: Task) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    setJoiningTaskId(task.id);
    try {
      if (task.action_link) {
        window.open(task.action_link, "_blank");
      }

      const { error } = await supabase.functions.invoke("dashboard-api", {
        body: { action: "start-task", taskId: task.id },
      });

      if (error) {
        let errorMessage = error.message;
        try {
          if (error && typeof error === "object" && "context" in error) {
            const json = await (error as any).context.json();
            if (json.error) errorMessage = json.error;
          }
        } catch {
          /* ignore */
        }
        throw new Error(errorMessage);
      }

      await fetchDashboardData();
    } catch (err: any) {
      console.error("Failed to start task:", err);
      alert(`Failed to join task: ${err.message}`);
    } finally {
      setJoiningTaskId(null);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "group":
        return <Users size={20} />;
      case "rocket":
        return <Rocket size={20} />;
      case "feedback":
        return <MessageSquare size={20} />;
      default:
        return <Copy size={20} />;
    }
  };

  if (loading) {
    return (
      <div className={styles.dashboardHome}>
        {/* Skeleton Welcome */}
        <div className={styles.welcomeSection} style={{ minHeight: 140 }}>
          <div>
            <Skeleton width={300} height={32} style={{ marginBottom: 8 }} />
            <Skeleton width={200} height={20} />
          </div>
          <Skeleton width={180} height={48} borderRadius={50} />
        </div>

        {/* Skeleton Stats */}
        <div className={styles.statsGrid}>
          {[1, 2, 3].map((i) => (
            <div key={i} className={styles.statCard}>
              <div
                className={styles.statHeader}
                style={{ display: "flex", justifyContent: "space-between" }}
              >
                <Skeleton width={100} height={16} />
                <Skeleton width={10} height={16} />
              </div>
              <div className={styles.statContent}>
                <Skeleton width={80} height={32} />
                <Skeleton width={56} height={56} borderRadius={18} />
              </div>
            </div>
          ))}
        </div>

        {/* Skeleton Main Grid */}
        <div className={styles.dashboardGrid}>
          <div className={styles.dashboardColumn}>
            <div className={styles.dashboardCard} style={{ minHeight: 300 }}>
              <Skeleton width={150} height={24} style={{ marginBottom: 20 }} />
              <Skeleton width="100%" height={200} borderRadius={18} />
            </div>
            <div className={`${styles.dashboardCard} ${styles.fullHeight}`}>
              <Skeleton width={120} height={24} style={{ marginBottom: 20 }} />
              <Skeleton width="100%" height={100} />
            </div>
          </div>

          <div className={styles.dashboardColumn}>
            <div className={styles.dashboardCard}>
              <Skeleton width={100} height={24} style={{ marginBottom: 20 }} />
              <div className={styles.tasksList}>
                {[1, 2, 3].map((i) => (
                  <Skeleton
                    key={i}
                    width="100%"
                    height={80}
                    borderRadius={20}
                  />
                ))}
              </div>
            </div>
            <div className={`${styles.dashboardCard} ${styles.fullHeight}`}>
              <Skeleton width={120} height={24} style={{ marginBottom: 20 }} />
              <Skeleton width="100%" height={60} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.dashboardHome}>
      {/* Welcome Section */}
      <div className={styles.welcomeSection}>
        <div>
          <h1 className={styles.welcomeTitle}>
            Welcome Back {profile?.full_name || "User"}
          </h1>
          <p className={styles.welcomeSubtitle}>Start your task to earn!</p>
        </div>
        <button
          className={styles.guidanceBtn}
          onClick={() => setIsVideoModalOpen(true)}
        >
          <span>Earning Guidance</span>
          <div className={styles.playIconWrapper}>
            <Play size={16} fill="white" />
          </div>
        </button>
      </div>

      <VideoModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        videoSrc="/video/mission_video_new.mp4"
      />

      {/* Earnings Stats */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <h3>Today's Earning</h3>
            <span>:</span>
          </div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>₹ {data.stats?.today || 0}</div>
            <div className={`${styles.statIconBg} ${styles.iconMoneyHand}`}>
              <HandCoins size={24} />
            </div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <h3>Monthly Earning</h3>
            <span>:</span>
          </div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>₹ {data.stats?.monthly || 0}</div>
            <div className={`${styles.statIconBg} ${styles.iconGraph}`}>
              <TrendingUp size={24} />
            </div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <h3>Total Earning</h3>
            <span>:</span>
          </div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>₹ {data.stats?.total || 0}</div>
            <div className={`${styles.statIconBg} ${styles.iconWallet}`}>
              <Wallet size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Ongoing Task & Tasks List */}
      <div className={styles.dashboardGrid}>
        <div className={styles.dashboardColumn}>
          <div className={styles.dashboardCard}>
            <div className={styles.cardHeader}>
              <h3>Ongoing Task</h3>
              <span>:</span>
            </div>
            {data.ongoingTask ? (
              <div className={styles.ongoingTaskCard}>
                <div className={styles.taskInfoRow}>
                  <div
                    className={`${styles.taskIconCircle} ${styles.blueGradient}`}
                  >
                    {getIcon(data.ongoingTask.icon_type)}
                  </div>
                  <div className={styles.taskDetails}>
                    <h4>{data.ongoingTask.title}</h4>
                    <p>{data.ongoingTask.category}</p>
                  </div>
                  <ChevronUp className={styles.expandIcon} />
                </div>
                <div className={styles.taskRewardsRow}>
                  <span>Task Reward</span>
                  <div className={styles.rewards}>
                    {data.ongoingTask.reward_member &&
                      data.ongoingTask.reward_member > 0 ? (
                      <>
                        <div className={styles.rewardItem}>
                          <span
                            className={`${styles.badgeLabel} ${styles.member}`}
                          >
                            Members
                          </span>
                          <span className={styles.amount}>
                            ₹ {data.ongoingTask.reward_member}
                          </span>
                        </div>
                        <div className={styles.rewardItem}>
                          <span
                            className={`${styles.badgeLabel} ${styles.free}`}
                          >
                            Free
                          </span>
                          <span className={styles.amount}>
                            ₹ {data.ongoingTask.reward_free}
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className={styles.rewardItem}>
                        <span className={styles.amount}>
                          ₹ {data.ongoingTask.reward_free}
                        </span>
                        {data.ongoingTask.reward_info && (
                          <small style={{ fontSize: "11px", color: "#64748b" }}>
                            {data.ongoingTask.reward_info}
                          </small>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className={styles.taskActionsRow}>
                  <button className={styles.btnViewDetails}>Resume Task</button>
                  <button className={styles.btnCopyCode}>
                    <span>Claim Reward</span>
                    <HandCoins size={14} />
                  </button>
                </div>
              </div>
            ) : (
              <div className={styles.emptyState}>
                <p>No ongoing tasks</p>
              </div>
            )}
          </div>

          <div className={`${styles.dashboardCard} ${styles.fullHeight}`}>
            <div className={styles.cardHeader}>
              <h3>Leaderboard</h3>
              <span>:</span>
            </div>
            <div className={styles.emptyState}>
              <p>Coming Soon</p>
            </div>
          </div>
        </div>

        <div className={styles.dashboardColumn}>
          <div className={styles.dashboardCard}>
            <div className={styles.cardHeader}>
              <h3>Tasks</h3>
              <span>:</span>
            </div>
            <div className={styles.tasksList}>
              {data.tasks?.map((task, index) => (
                <div key={task.id} className={styles.taskListItem}>
                  <div className={styles.taskItemLeft}>
                    <div
                      className={`${styles.taskIconCircle} ${index % 2 === 0
                          ? styles.blueGradient
                          : styles.purpleGradient
                        }`}
                    >
                      {getIcon(task.icon_type)}
                    </div>
                    <div className={styles.taskDetails}>
                      <h4>{task.title}</h4>
                      <p>{task.category}</p>
                    </div>
                  </div>
                  <div className={styles.taskActionsRight}>
                    {data.ongoingTask && data.ongoingTask.id === task.id ? (
                      <button className={`${styles.btnSuccess}`} disabled>
                        Joined
                      </button>
                    ) : (
                      <button
                        className={`${styles.btnPrimary}`}
                        onClick={() => handleStartTask(task)}
                        disabled={
                          joiningTaskId === task.id || !!data.ongoingTask
                        }
                      >
                        {joiningTaskId === task.id ? (
                          <>
                            <Loader2 className={styles.spinner} size={14} />
                          </>
                        ) : (
                          "Start"
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={`${styles.dashboardCard} ${styles.fullHeight}`}>
            <div className={styles.cardHeader}>
              <h3>Notifications</h3>
              <span>:</span>
            </div>
            <div className={styles.emptyState}>
              <p>No new notifications</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
