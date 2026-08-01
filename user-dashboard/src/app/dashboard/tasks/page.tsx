"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
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
  FileText,
  Gem,
  Youtube,
  Upload,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import TaskSubmissionModal from "@/components/dashboard/TaskSubmissionModal";
import TaskStatusModal from "@/components/dashboard/TaskStatusModal";
import CustomTaskRenderer from "@/components/dashboard/CustomTaskRenderer";
import styles from "./tasks.module.css";

interface Task {
  id: string;
  title: string;
  category?: string;
  type?: string;
  task_type?: string;
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
  description?: string;
  steps?: string;
  rejection_reason?: string;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();

  // Modal States
  const [submissionTask, setSubmissionTask] = useState<Task | null>(null);
  const [statusTask, setStatusTask] = useState<Task | null>(null);

  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState("");

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
  const [activeTaskType, setActiveTaskType] = useState<"Daily" | "Dedicated" | "Custom">(
    "Daily",
  );
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const fetchTasks = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const { data, error } = await supabase.functions.invoke(
        "dashboard-api",
        {
          body: { action: "get-tasks" },
          headers: session ? { Authorization: `Bearer ${session.access_token}` } : undefined
        },
      );

      if (error) throw error;
      setTasks(data || []);
    } catch (err) {
      console.error("Error fetching tasks:", err);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const toggleExpand = (id: string) => {
    setExpandedTaskId(expandedTaskId === id ? null : id);
  };

  const handleTakeTask = async (task: Task) => {
    if (task.action_link) {
      window.open(task.action_link, "_blank");
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const { data, error } = await supabase.functions.invoke("dashboard-api", {
        body: { action: "start-task", taskId: task.id },
        headers: session ? { Authorization: `Bearer ${session.access_token}` } : undefined
      });

      if (error) {
        console.error("Error starting task:", error);
      } else if (data && data.success === false) {
        console.error("Backend Error on start:", data.error, data.stack);
        alert(`Backend Error on Start: ${data.error}\n\nPlease copy this and show the developer!`);
      } else {
        setTasks((prevTasks) =>
          prevTasks.map((t) =>
            t.id === task.id ? { ...t, status: "ongoing" } : t,
          ),
        );
      }
    } catch (err) {
      console.error("Failed to start task:", err);
    }
  };

  const getSmartButtonLabel = (task: Task) => {
    if (task.status === "approved") return "Reward Claimed";
    if (task.status === "completed") return "In Process";
    if (task.status === "ongoing" || task.status === "in_progress")
      return "Complete Task";
    if (task.status === "rejected") return "Task Rejected";
    return "Start Task";
  };

  const [selectedImage, setSelectedImage] = useState<{ [key: string]: File | null }>({});
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (taskId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(prev => ({ ...prev, [taskId]: e.target.files![0] }));
    }
  };

  const handleCompleteTask = async (task: Task) => {
    try {
      setIsUploading(true);
      let imageUrl = null;

      // 1. Upload image if selected
      const file = selectedImage[task.id];
      if (file) {
        const timestamp = Date.now();
        const path = `${task.id}/${timestamp}_${file.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("task-submissions")
          .upload(path, file);

        if (uploadError) throw uploadError;
        
        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from("task-submissions")
          .getPublicUrl(uploadData.path);
        
        imageUrl = publicUrl;
      }

      // 2. Call API
      const { data: { session } } = await supabase.auth.getSession();
      const { error } = await supabase.functions.invoke("dashboard-api", {
        body: {
          action: "complete-task",
          taskId: task.id,
          submissionImageUrl: imageUrl,
          submissionData: {
            completed_at: new Date().toISOString(),
            action_link_visited: task.action_link ? true : false,
          },
        },
        headers: session ? { Authorization: `Bearer ${session.access_token}` } : undefined
      });

      if (error) {
        console.error("Error completing task:", error);
        alert("Failed to complete task. Please try again.");
        return;
      }

      // Update local state
      setTasks((prevTasks) =>
        prevTasks.map((t) =>
          t.id === task.id ? { ...t, status: "completed" } : t,
        ),
      );
      alert("Task submitted successfully! Status: In Process");
    } catch (err) {
      console.error("Failed to complete task:", err);
      alert("Failed to complete task. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSmartAction = (task: Task) => {
    const label = getSmartButtonLabel(task);
    if (label === "Complete Task") {
      // Open the submission modal instead of confirm()
      setSubmissionTask(task);
    } else if (label === "Start Task") {
      handleTakeTask(task);
    } else if (label === "In Process" || label === "Reward Claimed" || label === "Task Rejected") {
      // Open status modal so user can see verification state / rejection reason
      setStatusTask(task);
    }
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
      // Search filter
      if (
        searchQuery &&
        !task.title.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }

      // Profession filter
      const selectedProfs = Object.keys(selectedProfessions).filter(
        (k) => selectedProfessions[k],
      );
      if (
        !selectedProfs.includes("All") &&
        task.target_audience &&
        Array.isArray(task.target_audience) &&
        task.target_audience.length > 0 &&
        !task.target_audience.some((prof) => selectedProfs.includes(prof))
      ) {
        return false;
      }

      // Type filter (sidebar checkboxes - keeping for backward compatibility)
      const selectedTypesArray = Object.keys(selectedTypes).filter(
        (k) => selectedTypes[k],
      );
      if (
        !selectedTypesArray.includes("All") &&
        task.type &&
        !selectedTypesArray.includes(task.type)
      ) {
        return false;
      }

      // Task Type Filter (Daily/Dedicated/Custom buttons)
      const taskTypeRaw = task.task_type || task.type || task.category || "Daily";
      const isActuallyDedicated = taskTypeRaw === "Dedicated" || taskTypeRaw?.toLowerCase().includes("dedicated");
      const isActuallyCustom = taskTypeRaw === 'Mudralaya Custom';

      if (activeTaskType === "Custom") {
        if (!isActuallyCustom) return false;
      } else if (activeTaskType === "Dedicated") {
        if (!isActuallyDedicated) return false;
      } else {
        // Daily (Anything that isn't explicitly Custom or Dedicated)
        if (isActuallyDedicated || isActuallyCustom) return false;
      }

      // Tab filter (All Task, Completed, Ongoing)
      if (activeTab === "Completed" && task.status !== "approved") {
        return false;
      }
      if (
        activeTab === "Ongoing" &&
        task.status !== "ongoing" &&
        task.status !== "in_progress"
      ) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      if (sortOption === "newest") {
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      } else if (sortOption === "reward_high") {
        return (
          (b.reward_free || b.reward || 0) - (a.reward_free || a.reward || 0)
        );
      } else if (sortOption === "reward_low") {
        return (
          (a.reward_free || a.reward || 0) - (b.reward_free || b.reward || 0)
        );
      }
      return 0;
    });

  return (
    <div className={styles.taskPage}>
      <div className={styles.taskSearchContainer}>
        <Search className={styles.searchIcon} />
        <input
          type="text"
          placeholder="Search tasks"
          className={styles.taskSearchInput}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
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
            className={`${styles.filtersSidebar} ${isFiltersOpen ? styles.mobileVisible : styles.mobileHidden
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
          {/* Main Content */}
          <div className={styles.mainContent}>
            {/* Task Type Tabs + Tabs Row */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "20px",
              }}
            >
              {/* Daily Task Button */}
              <button
                onClick={() => { setActiveTaskType("Daily"); setActiveTab("All Task"); }}
                style={{
                  padding: "10px 24px",
                  borderRadius: "8px",
                  border:
                    activeTaskType === "Daily" ? "none" : "1px solid #e2e8f0",
                  backgroundColor:
                    activeTaskType === "Daily" ? "#2563eb" : "#fff",
                  color: activeTaskType === "Daily" ? "#fff" : "#64748b",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  fontSize: "14px",
                }}
              >
                Daily Task
              </button>

              {/* Dedicated Task Button */}
              <button
                onClick={() => { setActiveTaskType("Dedicated"); setActiveTab("All Task"); }}
                style={{
                  padding: "10px 24px",
                  borderRadius: "8px",
                  border:
                    activeTaskType === "Dedicated"
                      ? "none"
                      : "1px solid #e2e8f0",
                  backgroundColor:
                    activeTaskType === "Dedicated" ? "#db2777" : "#fff",
                  color: activeTaskType === "Dedicated" ? "#fff" : "#64748b",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  fontSize: "14px",
                }}
              >
                Dedicated Task
              </button>

              {/* Custom Task Button */}
              <button
                onClick={() => { setActiveTaskType("Custom"); setActiveTab("All Task"); }}
                style={{
                  padding: "10px 24px",
                  borderRadius: "8px",
                  border:
                    activeTaskType === "Custom"
                      ? "none"
                      : "1px solid #e2e8f0",
                  backgroundColor:
                    activeTaskType === "Custom" ? "#8b5cf6" : "#fff",
                  color: activeTaskType === "Custom" ? "#fff" : "#64748b",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  fontSize: "14px",
                }}
              >
                Custom Data Tasks
              </button>

              {/* Spacer */}
              <div style={{ flex: 1 }} />

              {/* All Task / Completed / Ongoing Tabs */}
              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  background: "rgba(255, 255, 255, 0.7)",
                  padding: "6px",
                  borderRadius: "50px",
                  border: "1px solid #fff",
                  backdropFilter: "blur(10px)",
                }}
              >
                {["All Task", "Completed", "Ongoing"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    style={{
                      background: activeTab === tab ? "#fff" : "transparent",
                      border: "none",
                      color:
                        activeTab === tab ? "#2563eb" : "rgb(148, 163, 184)",
                      padding: "8px 20px",
                      borderRadius: "40px",
                      fontSize: "14px",
                      fontWeight: "600",
                      transition: "all 0.3s ease",
                      cursor: "pointer",
                      boxShadow:
                        activeTab === tab
                          ? "0 4px 12px rgba(0, 0, 0, 0.05)"
                          : "none",
                    }}
                  >
                    {tab}
                  </button>
                ))}
              </div>
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
                        <span>{task.task_type || task.category || task.type || "Daily Task"}</span>
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
                        !task.title.toLowerCase().includes("dedicated") && 
                        ((task.reward_free ?? 0) > 0 || (task.reward ?? 0) > 0 || (task.reward_member ?? 0) > 0 || (task.reward_premium ?? 0) > 0) && (
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
                                  0}
                              </div>
                            </div>
                            <div className={styles.priceItem}>
                              <div className={styles.labelFree}>Free</div>
                              <div
                                className={`${styles.priceValue} ${styles.textGreen}`}
                              >
                                ₹ {task.reward_free || task.reward || 0}
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
                                "_blank",
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
                                  color: "#6366f1",
                                  width: "24px",
                                  height: "24px",
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Submission Section */}
                    {(task.status === "ongoing" || task.status === "in_progress") && (
                      (task.task_type === 'Mudralaya Custom' || task.type === 'Mudralaya Custom') ? (
                        <CustomTaskRenderer 
                          task={task} 
                          onComplete={async (responses, imageUrl) => {
                            try {
                              const { data: { session } } = await supabase.auth.getSession();
                              const { data, error } = await supabase.functions.invoke("dashboard-api", {
                                body: {
                                  action: "complete-task",
                                  taskId: task.id,
                                  submissionImageUrl: imageUrl,
                                  submissionData: {
                                    completed_at: new Date().toISOString(),
                                    action_link_visited: task.action_link ? true : false,
                                    responses: responses
                                  },
                                },
                                headers: session ? { Authorization: `Bearer ${session.access_token}` } : undefined
                              });

                              if (error) {
                                console.error("Error completing task:", error);
                                alert("Failed to complete task. Please try again.");
                                return;
                              }
                              
                              if (data && data.success === false) {
                                console.error("Backend Error:", data.error, data.stack);
                                alert(`Backend Error: ${data.error}\n\nPlease copy this and show the developer!`);
                                return;
                              }
                              const isCustom = task.task_type === 'Mudralaya Custom' || task.type === 'Mudralaya Custom' || !!task.steps;
                              
                              setTasks((prevTasks) =>
                                prevTasks.map((t) =>
                                  t.id === task.id ? { ...t, status: isCustom ? "new" : "completed" } : t,
                                ),
                              );
                              alert(isCustom ? "Form submitted successfully! You can submit another response if you'd like." : "Task submitted successfully! Status: In Process");
                            } catch (err) {
                              console.error(err);
                              alert("Failed to complete task.");
                            }
                          }}
                          isUploading={isUploading}
                          setIsUploading={setIsUploading}
                        />
                      ) : (
                        <div className={styles.submissionSection} style={{ marginTop: '20px', padding: '16px', borderRadius: '12px', border: '1px dashed #cbd5e1', backgroundColor: '#f8fafc' }}>
                          <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: '#1e293b' }}>Task Evidence (Optional)</h4>
                          <div className={styles.fileUploadWrapper} style={{ position: 'relative' }}>
                            <input 
                              type="file" 
                              accept="image/*" 
                              onChange={(e) => handleFileChange(task.id, e)}
                              style={{ opacity: 0, position: 'absolute', inset: 0, cursor: 'pointer', zIndex: 2 }}
                              disabled={isUploading}
                            />
                            <div className={styles.fileDisplay} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                              <div style={{ padding: '8px', borderRadius: '6px', backgroundColor: '#eff6ff', color: '#2563eb' }}>
                                <Upload size={18} />
                              </div>
                              <span style={{ fontSize: '13px', color: '#64748b' }}>
                                {selectedImage[task.id] ? selectedImage[task.id]?.name : "Upload screenshot of task completion"}
                              </span>
                            </div>
                          </div>
                          {selectedImage[task.id] && (
                            <div className={styles.imagePreview} style={{ marginTop: '12px' }}>
                               {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img 
                                src={URL.createObjectURL(selectedImage[task.id]!)} 
                                alt="Submission Preview" 
                                style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                              />
                            </div>
                          )}
                        </div>
                      )
                    )}

                    {(!(task.status === "ongoing" || task.status === "in_progress") || (task.task_type !== 'Mudralaya Custom' && task.type !== 'Mudralaya Custom')) && (
                      <div className="mt-3" style={{ marginTop: "24px" }}>
                        <button
                          className={`${styles.btnTakeTask}`}
                          onClick={() => handleSmartAction(task)}
                          disabled={isUploading}
                          style={{
                            width: "100%",
                            backgroundColor: getSmartButtonLabel(task) === "Complete Task" ? "#22c55e" 
                              : getSmartButtonLabel(task) === "In Process" ? "#3b82f6"
                              : getSmartButtonLabel(task) === "Task Rejected" ? "#ef4444"
                              : getSmartButtonLabel(task) === "Reward Claimed" ? "#10b981"
                              : undefined,
                            cursor: isUploading ? "wait" : "pointer",
                          }}
                        >
                          {isUploading ? "Uploading..." : getSmartButtonLabel(task)}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Task Submission Modal (Phase 2) ─── */}
      {submissionTask && (
        <TaskSubmissionModal
          isOpen={!!submissionTask}
          onClose={() => setSubmissionTask(null)}
          task={submissionTask}
          onSuccess={() => {
            setSubmissionTask(null);
            fetchTasks();
          }}
        />
      )}

      {/* ─── Task Status Modal (Phase 3) ─── */}
      {statusTask && (
        <TaskStatusModal
          isOpen={!!statusTask}
          onClose={() => setStatusTask(null)}
          task={statusTask}
          onResubmit={() => {
            setStatusTask(null);
            // Re-open submission modal for resubmit
            const taskToResubmit = tasks.find(t => t.id === statusTask.id);
            if (taskToResubmit) {
              // Reset status to ongoing so user can resubmit
              setTasks(prev => prev.map(t => t.id === statusTask.id ? { ...t, status: 'ongoing' } : t));
              setSubmissionTask({ ...taskToResubmit, status: 'ongoing' });
            }
          }}
          onGoToWallet={() => {
            setStatusTask(null);
            router.push('/dashboard/wallet');
          }}
        />
      )}
    </div>
  );
}
