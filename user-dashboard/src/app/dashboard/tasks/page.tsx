"use client";

import React, { useState, useEffect } from "react";
import Skeleton from "@/components/ui/Skeleton";
import {
  Search,
  Filter,
  Users,
  Rocket,
  Edit2,
  Building,
  Info,
  ChevronDown,
  ChevronUp,
  Youtube,
  FileText,
  Gem,
  Loader2,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import styles from "./tasks.module.css";

interface Task {
  id: string;
  title: string;
  category?: string;
  type?: string;
  target_audience?: string[];
  icon_type: string;
  status?: string;
  action_link?: string;
  reward_free?: number;
  reward?: number;
  reward_member?: number;
  reward_premium?: number;
  reward_info?: string;
  performance_info?: string;
  video_url?: string;
  video_link?: string;
  pdf_url?: string;
  created_at: string;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  // Sidebar Filter States
  const [selectedProfessions, setSelectedProfessions] = useState<{
    [key: string]: boolean;
  }>({
    All: true,
    Student: false,
    "House Wife": false,
    "Working Professional": false,
    "Part Time": false,
  });

  const [selectedTypes, setSelectedTypes] = useState<{
    [key: string]: boolean;
  }>({
    All: true,
    Daily: false,
    Weekly: false,
    Company: false,
    Dedicated: false,
  });

  const [sortOption, setSortOption] = useState("newest");
  const [activeTab, setActiveTab] = useState("All Task");
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const { data, error } = await supabase.functions.invoke(
          "dashboard-api",
          {
            body: { action: "get-tasks" },
          }
        );

        if (error) throw error;
        setTasks(data || []);
      } catch (err) {
        console.error("Error fetching tasks:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedTaskId(expandedTaskId === id ? null : id);
  };

  const handleTakeTask = async (task: Task) => {
    if (task.action_link) {
      window.open(task.action_link, "_blank");
    }

    try {
      const { error } = await supabase.functions.invoke("dashboard-api", {
        body: { action: "start-task", taskId: task.id },
      });

      if (error) {
        console.error("Error starting task:", error);
      } else {
        setTasks((prevTasks) =>
          prevTasks.map((t) =>
            t.id === task.id ? { ...t, status: "ongoing" } : t
          )
        );
      }
    } catch (err) {
      console.error("Failed to start task:", err);
    }
  };

  const getSmartButtonLabel = (task: Task) => {
    if (task.status === "approved") return "Reward Claimed";
    if (task.status === "completed") return "Pending Approval";
    if (task.status === "ongoing" || task.status === "in_progress")
      return "Complete Task";
    if (task.status === "rejected") return "Task Rejected";
    return "Start Task";
  };

  const handleCompleteTask = async (task: Task) => {
    try {
      const { error } = await supabase.functions.invoke("dashboard-api", {
        body: {
          action: "complete-task",
          taskId: task.id,
          submissionData: {
            completed_at: new Date().toISOString(),
            action_link_visited: task.action_link ? true : false,
          },
        },
      });

      if (error) {
        console.error("Error completing task:", error);
        alert("Failed to complete task. Please try again.");
        return;
      }

      // Update local state
      setTasks((prevTasks) =>
        prevTasks.map((t) =>
          t.id === task.id ? { ...t, status: "completed" } : t
        )
      );
      alert("Task completed! Waiting for admin approval.");
    } catch (err) {
      console.error("Failed to complete task:", err);
      alert("Failed to complete task. Please try again.");
    }
  };

  const handleSmartAction = (task: Task) => {
    const label = getSmartButtonLabel(task);
    if (label === "Complete Task") {
      if (task.action_link) window.open(task.action_link, "_blank");
      // Small delay to let user see the action link open
      setTimeout(() => {
        if (confirm("Have you completed the task? Click OK to submit for approval.")) {
          handleCompleteTask(task);
        }
      }, 500);
    } else if (label === "Start Task") {
      handleTakeTask(task);
    }
    // "Reward Claimed", "Pending Approval", and "Task Rejected" are disabled states
  };

  const handleProfessionChange = (prof: string) => {
    if (prof === "All") {
      setSelectedProfessions({
        All: true,
        Student: false,
        "House Wife": false,
        "Working Professional": false,
        "Part Time": false,
      });
    } else {
      setSelectedProfessions((prev) => ({
        ...prev,
        [prof]: !prev[prof],
        All: false,
      }));
    }
  };

  const handleTypeChange = (type: string) => {
    if (type === "All") {
      setSelectedTypes({
        All: true,
        Daily: false,
        Weekly: false,
        Company: false,
        Dedicated: false,
      });
    } else {
      setSelectedTypes((prev) => ({
        ...prev,
        [type]: !prev[type],
        All: false,
      }));
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "group":
        return <Users size={20} />;
      case "rocket":
        return <Rocket size={20} />;
      case "feedback":
        return <Edit2 size={20} />;
      case "building":
        return <Building size={20} />;
      default:
        return <Users size={20} />;
    }
  };

  if (loading)
    return (
      <div className={styles.taskPage}>
        {/* Skeleton Search */}
        <div
          className={styles.taskSearchContainer}
          style={{ maxWidth: 650, margin: "0 auto 35px" }}
        >
          <Skeleton width="100%" height={56} borderRadius={50} />
        </div>

        <div className={styles.row}>
          {/* Skeleton Sidebar - Matches new glassmorphism sidebar */}
          <div className={`${styles.colLg3} mb-4`}>
            <div className={styles.filtersSidebar}>
              <Skeleton width={80} height={20} style={{ marginBottom: 20 }} />
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 15,
                  marginBottom: 30,
                }}
              >
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    style={{ display: "flex", alignItems: "center" }}
                  >
                    <Skeleton
                      width={20}
                      height={20}
                      borderRadius={6}
                      style={{ marginRight: 14 }}
                    />
                    <Skeleton width={120} height={16} />
                  </div>
                ))}
              </div>
              <Skeleton width={80} height={20} style={{ marginBottom: 20 }} />
              <div
                style={{ display: "flex", flexDirection: "column", gap: 15 }}
              >
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    style={{ display: "flex", alignItems: "center" }}
                  >
                    <Skeleton
                      width={20}
                      height={20}
                      borderRadius={6}
                      style={{ marginRight: 14 }}
                    />
                    <Skeleton width={100} height={16} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Skeleton Task List */}
          <div className={styles.colLg9}>
            {/* Header Controls Skeleton */}
            <div className={styles.taskHeaderControls}>
              <div style={{ display: "flex", gap: 12 }}>
                <Skeleton width={100} height={40} borderRadius={40} />
                <Skeleton width={100} height={40} borderRadius={40} />
                <Skeleton width={100} height={40} borderRadius={40} />
              </div>
              <Skeleton width={180} height={40} borderRadius={40} />
            </div>

            {/* Task Card Skeletons */}
            <div className={styles.taskList}>
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={styles.taskCard}
                  style={{ padding: 24, borderRadius: 24 }}
                >
                  <div className={styles.taskCardHeader} style={{ padding: 0 }}>
                    <div className={styles.taskLeft}>
                      <Skeleton
                        width={56}
                        height={56}
                        borderRadius={18}
                        style={{ flexShrink: 0 }}
                      />
                      <div style={{ flex: 1 }}>
                        <Skeleton
                          width="60%"
                          height={24}
                          style={{ marginBottom: 8 }}
                        />
                        <Skeleton width={100} height={20} borderRadius={6} />
                      </div>
                    </div>
                    <div className={styles.taskRight}>
                      <Skeleton width={100} height={44} borderRadius={14} />
                      <Skeleton width={36} height={36} borderRadius="50%" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );

  // Filtering Logic
  const filteredTasks = tasks
    .filter((task) => {
      // 1. Tab Filter
      if (activeTab === "Completed" && task.status !== "completed")
        return false;
      if (
        activeTab === "Ongoing" &&
        task.status !== "ongoing" &&
        task.status !== "in_progress"
      )
        return false;

      // 2. Profession Filter
      const activeProfessions = Object.keys(selectedProfessions).filter(
        (k) => k !== "All" && selectedProfessions[k]
      );

      // Only filter by profession IF specific professions are selected
      const professionMatch =
        selectedProfessions["All"] ||
        (task.target_audience &&
          task.target_audience.some((aud) =>
            activeProfessions.includes(aud)
          )) ||
        !task.target_audience ||
        activeProfessions.length === 0;

      // 3. Type Filter
      const activeTypes = Object.keys(selectedTypes).filter(
        (k) => k !== "All" && selectedTypes[k]
      );
      const typeMatch =
        selectedTypes["All"] ||
        activeTypes.some(
          (t) =>
            task.category &&
            task.category.toLowerCase().includes(t.toLowerCase())
        ) ||
        activeTypes.length === 0;

      return professionMatch && typeMatch;
    })
    .sort((a, b) => {
      if (sortOption === "reward_high")
        return (b.reward_free || 0) - (a.reward_free || 0);
      if (sortOption === "reward_low")
        return (a.reward_free || 0) - (b.reward_free || 0);
      // newest
      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    });

  return (
    <div className={styles.taskPage}>
      <div className={styles.taskSearchContainer}>
        <Search className={styles.searchIcon} />
        <input
          type="text"
          placeholder="Search tasks"
          className={styles.taskSearchInput}
        />
      </div>

      <div className={styles.row}>
        {/* Sidebar */}
        <div className={`${styles.colLg3} mb-4`}>
          <button
            className={styles.btnMobileFilter}
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
          >
            <Filter size={16} />{" "}
            {isFiltersOpen ? "Hide Filters" : "Show Filters"}
          </button>

          <div
            className={`${styles.filtersSidebar} ${
              isFiltersOpen ? styles.mobileVisible : styles.mobileHidden
            }`}
          >
            <div
              className="d-flex justify-content-between align-items-center mb-4"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "24px",
              }}
            >
              <h5
                className="mb-0 fw-bold text-dark"
                style={{ margin: 0, fontWeight: 700, color: "#333" }}
              >
                Filters
              </h5>
              <button
                className="btn btn-link p-0 text-decoration-none small text-muted"
                style={{
                  fontSize: "12px",
                  background: "none",
                  border: "none",
                  color: "#6c757d",
                  cursor: "pointer",
                  padding: 0,
                }}
                onClick={() => {
                  setSelectedProfessions({
                    All: true,
                    Student: false,
                    "House Wife": false,
                    "Working Professional": false,
                    "Part Time": false,
                  });
                  setSelectedTypes({
                    All: true,
                    Daily: false,
                    Weekly: false,
                    Company: false,
                    Dedicated: false,
                  });
                }}
              >
                Clear All
              </button>
            </div>

            <div className={styles.filterGroup}>
              <h6 className={styles.filterTitle}>Profession</h6>
              {Object.keys(selectedProfessions).map((prof) => (
                <div className={styles.formCheck} key={prof}>
                  <input
                    className={styles.formCheckInput}
                    type="checkbox"
                    id={`prof-${prof}`}
                    checked={selectedProfessions[prof]}
                    onChange={() => handleProfessionChange(prof)}
                  />
                  <label
                    className={styles.formCheckLabel}
                    htmlFor={`prof-${prof}`}
                  >
                    {prof}
                  </label>
                </div>
              ))}
            </div>

            <div className={styles.filterGroup}>
              <h6 className={styles.filterTitle}>Type of Task</h6>
              {Object.keys(selectedTypes).map((type) => (
                <div className={styles.formCheck} key={type}>
                  <input
                    className={styles.formCheckInput}
                    type="checkbox"
                    id={`type-${type}`}
                    checked={selectedTypes[type]}
                    onChange={() => handleTypeChange(type)}
                  />
                  <label
                    className={styles.formCheckLabel}
                    htmlFor={`type-${type}`}
                  >
                    {type}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Task List */}
        <div className={styles.colLg9}>
          <div className={styles.taskHeaderControls}>
            <div className={styles.taskTabs}>
              {["All Task", "Completed", "Ongoing"].map((tab) => (
                <button
                  key={tab}
                  className={`${styles.taskTab} ${
                    activeTab === tab ? styles.active : ""
                  }`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className={styles.taskActions}>
              <select
                className={styles.sortSelect}
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
              >
                <option value="newest">Sort by: Newest</option>
                <option value="reward_high">Reward: High to Low</option>
                <option value="reward_low">Reward: Low to High</option>
              </select>
            </div>
          </div>

          <div className={styles.taskList}>
            {filteredTasks.map((task) => (
              <div className={styles.taskCard} key={task.id}>
                <div
                  className={styles.taskCardHeader}
                  onClick={() => toggleExpand(task.id)}
                >
                  <div className={styles.taskLeft}>
                    <div
                      className={`${styles.taskIconWrapper} ${styles.iconRedGradient}`}
                    >
                      {getIcon(task.icon_type)}
                    </div>
                    <div className={styles.taskInfo}>
                      <h3>{task.title}</h3>
                      <div className={styles.taskMeta}>
                        <span>{task.category || task.type}</span>
                        <div
                          className={styles.infoTooltipContainer}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Info size={14} className={styles.infoIcon} />
                          <span className={styles.infoTooltipText}>
                            {task.performance_info ||
                              "You can earn more by your performance"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className={styles.taskRight}>
                    <button className={styles.rewardBtn}>
                      ₹ {task.reward_free || task.reward}
                    </button>
                    <button className={styles.toggleBtn}>
                      {expandedTaskId === task.id ? (
                        <ChevronUp size={24} />
                      ) : (
                        <ChevronDown size={24} />
                      )}
                    </button>
                  </div>
                </div>

                {expandedTaskId === task.id && (
                  <div className={styles.taskExpanded}>
                    <div className={styles.expandedSection}>
                      {!task.category?.toLowerCase().includes("dedicated") &&
                        !task.title.toLowerCase().includes("dedicated") && (
                          <div className={styles.rewardPricing}>
                            <div className={styles.priceItem}>
                              <div className={styles.badgeMembers}>
                                <Gem size={12} /> Members
                              </div>
                              <div
                                className={`${styles.priceValue} ${styles.textBlue}`}
                              >
                                ₹{" "}
                                {task.reward_member ||
                                  task.reward_premium ||
                                  800}
                              </div>
                            </div>
                            <div className={styles.priceItem}>
                              <div className={styles.labelFree}>Free</div>
                              <div
                                className={`${styles.priceValue} ${styles.textGreen}`}
                              >
                                ₹ {task.reward_free || task.reward || 600}
                              </div>
                            </div>
                          </div>
                        )}
                      {task.reward_info && (
                        <p
                          className="text-muted small mt-2"
                          style={{
                            fontSize: "12px",
                            color: "#6c757d",
                            marginTop: "8px",
                          }}
                        >
                          <Gem
                            size={12}
                            className="me-1"
                            style={{ marginRight: "4px" }}
                          />
                          {task.reward_info}
                        </p>
                      )}
                    </div>

                    {(task.video_url || task.video_link || task.pdf_url) && (
                      <div className="mt-3" style={{ marginTop: "16px" }}>
                        {(task.video_url || task.video_link) && (
                          <div
                            className={styles.resourceLink}
                            onClick={() =>
                              window.open(
                                task.video_url || task.video_link,
                                "_blank"
                              )
                            }
                          >
                            <div style={{ width: 24 }}></div>
                            <span>Task Guidance Video</span>
                            <div className="ms-auto">
                              <Youtube
                                style={{
                                  color: "red",
                                  width: "24px",
                                  height: "24px",
                                }}
                              />
                            </div>
                          </div>
                        )}
                        {task.pdf_url && (
                          <div
                            className={styles.resourceLink}
                            onClick={() => window.open(task.pdf_url, "_blank")}
                          >
                            <div style={{ width: 24 }}></div>
                            <span>Task Information</span>
                            <div className="ms-auto">
                              <FileText
                                style={{
                                  color: "#e53935",
                                  width: "24px",
                                  height: "24px",
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="mt-3" style={{ marginTop: "16px" }}>
                      <button
                        className={`${styles.btnTakeTask} ${
                          task.status === "approved" || task.status === "rejected"
                            ? styles.btnDisabled
                            : ""
                        }`}
                        onClick={() => handleSmartAction(task)}
                        disabled={
                          task.status === "approved" || task.status === "rejected"
                        }
                        style={{
                          opacity:
                            task.status === "approved" || task.status === "rejected"
                              ? 0.6
                              : 1,
                          cursor:
                            task.status === "approved" || task.status === "rejected"
                              ? "not-allowed"
                              : "pointer",
                        }}
                      >
                        {getSmartButtonLabel(task)}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
