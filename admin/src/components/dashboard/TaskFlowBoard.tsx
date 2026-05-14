"use client";

import React, { useState, useEffect, useCallback } from "react";
import { adminApiRequest } from "@/lib/adminApi";
import { createClient } from "@/utils/supabase/client";
import {
  CheckCircle2,
  Clock,
  PlayCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  Users,
  Image as ImageIcon,
  ArrowRight,
  RefreshCw,
  Loader2,
  AlertCircle,
} from "lucide-react";
import styles from "./TaskFlowBoard.module.css";

/* ───────────── Types ───────────── */

interface Task {
  id: string;
  title: string;
  reward_free: number;
  reward_member?: number;
  reward_premium?: number;
  reward_info?: string;
  type: string;
  task_type?: string;
  icon_type?: string;
  is_active?: boolean;
}

interface Participant {
  id: string;
  user_id: string;
  users?: {
    full_name?: string;
    email_id?: string;
    mobile_number?: string;
  };
  status: string;
  reward_earned: number;
  task_id: string;
  submission_image_url?: string;
  created_at?: string;
  updated_at?: string;
}

type FlowStage = "new" | "ongoing" | "completed" | "approved" | "rejected";

interface StageConfig {
  key: FlowStage;
  label: string;
  icon: React.ReactNode;
  color: string;
  bgLight: string;
  borderColor: string;
  description: string;
}

/* ───────────── Stage Config ───────────── */

const STAGES: StageConfig[] = [
  {
    key: "new",
    label: "Available",
    icon: <PlayCircle size={18} />,
    color: "#6366f1",
    bgLight: "rgba(99, 102, 241, 0.08)",
    borderColor: "rgba(99, 102, 241, 0.2)",
    description: "Tasks visible to users",
  },
  {
    key: "ongoing",
    label: "In Progress",
    icon: <Clock size={18} />,
    color: "#f59e0b",
    bgLight: "rgba(245, 158, 11, 0.08)",
    borderColor: "rgba(245, 158, 11, 0.2)",
    description: "Users have started",
  },
  {
    key: "completed",
    label: "Pending Review",
    icon: <AlertCircle size={18} />,
    color: "#3b82f6",
    bgLight: "rgba(59, 130, 246, 0.08)",
    borderColor: "rgba(59, 130, 246, 0.2)",
    description: "Awaiting admin approval",
  },
  {
    key: "approved",
    label: "Approved",
    icon: <CheckCircle2 size={18} />,
    color: "#10b981",
    bgLight: "rgba(16, 185, 129, 0.08)",
    borderColor: "rgba(16, 185, 129, 0.2)",
    description: "Reward credited",
  },
  {
    key: "rejected",
    label: "Rejected",
    icon: <XCircle size={18} />,
    color: "#ef4444",
    bgLight: "rgba(239, 68, 68, 0.08)",
    borderColor: "rgba(239, 68, 68, 0.2)",
    description: "Task submission rejected",
  },
];

/* ───────────── Component ───────────── */

export default function TaskFlowBoard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [allParticipants, setAllParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  const [selectedStage, setSelectedStage] = useState<FlowStage | "all">("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const supabase = createClient();

  const fetchData = useCallback(async () => {
    try {
      const tasksRes = await adminApiRequest("get-tasks");
      setTasks(tasksRes || []);

      // Fetch participants for all tasks
      const allParts: Participant[] = [];
      for (const task of tasksRes || []) {
        try {
          const parts = await adminApiRequest("get-task-participants", {
            taskId: task.id,
          });
          if (parts && Array.isArray(parts)) {
            allParts.push(...parts);
          }
        } catch {
          // Skip tasks with no participants
        }
      }
      setAllParticipants(allParts);
    } catch (err) {
      console.error("Failed to fetch flow data", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  /* ─── Derived data ─── */

  // Count participants per stage
  const stageCounts: Record<FlowStage, number> = {
    new: 0,
    ongoing: 0,
    completed: 0,
    approved: 0,
    rejected: 0,
  };

  // Total tasks that have no participants = "new" count is tasks
  const tasksWithParticipants = new Set(allParticipants.map((p) => p.task_id));
  stageCounts.new = tasks.filter((t) => !tasksWithParticipants.has(t.id)).length;

  allParticipants.forEach((p) => {
    const s = p.status as FlowStage;
    if (stageCounts[s] !== undefined) {
      stageCounts[s]++;
    }
  });

  // Group participants by task and stage
  const getParticipantsForTaskAndStage = (
    taskId: string,
    stage: FlowStage
  ): Participant[] => {
    return allParticipants.filter(
      (p) => p.task_id === taskId && p.status === stage
    );
  };

  // Get all stages a task appears in
  const getTaskStages = (taskId: string): FlowStage[] => {
    const stages = new Set<FlowStage>();
    const taskParts = allParticipants.filter((p) => p.task_id === taskId);
    if (taskParts.length === 0) {
      stages.add("new");
    }
    taskParts.forEach((p) => {
      if ((STAGES.map((s) => s.key) as string[]).includes(p.status)) {
        stages.add(p.status as FlowStage);
      }
    });
    return Array.from(stages);
  };

  // Filter tasks based on selected stage
  const getFilteredTasks = (): Task[] => {
    if (selectedStage === "all") return tasks;
    return tasks.filter((t) => {
      const stages = getTaskStages(t.id);
      return stages.includes(selectedStage);
    });
  };

  /* ─── Actions ─── */

  const handleApprove = async (userTaskId: string) => {
    if (
      !confirm(
        "Approve this task? The reward will be credited to the user's wallet."
      )
    )
      return;

    setActionLoading(userTaskId);
    try {
      await adminApiRequest("approve-task", { userTaskId });
      alert("Task approved! Reward credited.");
      fetchData();
    } catch (err) {
      alert("Failed to approve: " + (err as Error).message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (userTaskId: string) => {
    const reason = prompt("Reason for rejection (optional):");
    setActionLoading(userTaskId);
    try {
      await adminApiRequest("reject-task", {
        userTaskId,
        reason: reason || null,
      });
      alert("Task rejected.");
      fetchData();
    } catch (err) {
      alert("Failed to reject: " + (err as Error).message);
    } finally {
      setActionLoading(null);
    }
  };

  /* ─── Render ─── */

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}>
          <Loader2 size={32} className={styles.spin} />
        </div>
        <p>Loading task flow...</p>
      </div>
    );
  }

  const filteredTasks = getFilteredTasks();

  return (
    <div className={styles.container}>
      {/* ─── Flow Pipeline Header ─── */}
      <div className={styles.pipelineHeader}>
        <div className={styles.pipelineTitle}>
          <h2>Task Flow Pipeline</h2>
          <p>Visualize how tasks move from creation to completion</p>
        </div>
        <button
          className={styles.refreshBtn}
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <RefreshCw
            size={16}
            className={refreshing ? styles.spin : ""}
          />
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* ─── Flow Stages Bar ─── */}
      <div className={styles.stagesBar}>
        <button
          className={`${styles.stageChip} ${selectedStage === "all" ? styles.stageChipActive : ""}`}
          onClick={() => setSelectedStage("all")}
          style={
            selectedStage === "all"
              ? {
                  background: "linear-gradient(135deg, #667eea, #764ba2)",
                  borderColor: "transparent",
                  color: "white",
                }
              : {}
          }
        >
          <Users size={14} />
          All Stages
          <span className={styles.stageCount}>
            {tasks.length} tasks
          </span>
        </button>

        {STAGES.map((stage, idx) => (
          <React.Fragment key={stage.key}>
            {idx > 0 && (
              <ArrowRight size={14} className={styles.stageArrow} />
            )}
            <button
              className={`${styles.stageChip} ${selectedStage === stage.key ? styles.stageChipActive : ""}`}
              onClick={() =>
                setSelectedStage(
                  selectedStage === stage.key ? "all" : stage.key
                )
              }
              style={
                selectedStage === stage.key
                  ? {
                      background: stage.color,
                      borderColor: "transparent",
                      color: "white",
                    }
                  : { borderColor: stage.borderColor }
              }
            >
              {stage.icon}
              {stage.label}
              <span
                className={styles.stageCount}
                style={
                  selectedStage === stage.key
                    ? { background: "rgba(255,255,255,0.25)", color: "white" }
                    : { background: stage.bgLight, color: stage.color }
                }
              >
                {stageCounts[stage.key]}
              </span>
            </button>
          </React.Fragment>
        ))}
      </div>

      {/* ─── Flow Diagram Visual ─── */}
      <div className={styles.flowDiagram}>
        {STAGES.map((stage, idx) => (
          <React.Fragment key={stage.key}>
            <div
              className={styles.flowNode}
              style={{ borderColor: stage.borderColor }}
            >
              <div
                className={styles.flowNodeIcon}
                style={{ background: stage.bgLight, color: stage.color }}
              >
                {stage.icon}
              </div>
              <div className={styles.flowNodeInfo}>
                <span className={styles.flowNodeLabel}>{stage.label}</span>
                <span className={styles.flowNodeDesc}>
                  {stage.description}
                </span>
              </div>
              <div
                className={styles.flowNodeCount}
                style={{ background: stage.color }}
              >
                {stageCounts[stage.key]}
              </div>
            </div>
            {idx < STAGES.length - 1 && (
              <div className={styles.flowConnector}>
                <ArrowRight size={18} />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* ─── Task Cards ─── */}
      <div className={styles.taskGrid}>
        {filteredTasks.length === 0 ? (
          <div className={styles.emptyState}>
            <Users size={48} />
            <p>No tasks found for this stage</p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const taskStages = getTaskStages(task.id);
            const isExpanded = expandedTask === task.id;
            const totalParticipants = allParticipants.filter(
              (p) => p.task_id === task.id
            ).length;
            const pendingReviewCount = getParticipantsForTaskAndStage(
              task.id,
              "completed"
            ).length;

            return (
              <div
                key={task.id}
                className={`${styles.taskCard} ${isExpanded ? styles.taskCardExpanded : ""}`}
              >
                {/* Task Header */}
                <div
                  className={styles.taskCardHeader}
                  onClick={() =>
                    setExpandedTask(isExpanded ? null : task.id)
                  }
                >
                  <div className={styles.taskCardLeft}>
                    <div className={styles.taskCardTitle}>
                      <h3>{task.title}</h3>
                      <span className={styles.taskTypeBadge}>
                        {task.task_type || task.type || "Daily"}
                      </span>
                    </div>
                    <div className={styles.taskCardMeta}>
                      <span className={styles.rewardBadge}>
                        ₹{Number(task.reward_free || 0).toLocaleString()}
                      </span>
                      <span className={styles.participantCount}>
                        <Users size={12} />
                        {totalParticipants} participant
                        {totalParticipants !== 1 ? "s" : ""}
                      </span>
                      {pendingReviewCount > 0 && (
                        <span className={styles.pendingBadge}>
                          <AlertCircle size={12} />
                          {pendingReviewCount} pending review
                        </span>
                      )}
                    </div>
                  </div>

                  <div className={styles.taskCardRight}>
                    {/* Mini stage indicators */}
                    <div className={styles.miniStages}>
                      {STAGES.map((stage) => {
                        const count = getParticipantsForTaskAndStage(
                          task.id,
                          stage.key
                        ).length;
                        const isNew =
                          stage.key === "new" && taskStages.includes("new");
                        const hasEntries = count > 0 || isNew;
                        return (
                          <div
                            key={stage.key}
                            className={`${styles.miniStage} ${hasEntries ? styles.miniStageActive : ""}`}
                            style={
                              hasEntries
                                ? {
                                    background: stage.bgLight,
                                    borderColor: stage.borderColor,
                                    color: stage.color,
                                  }
                                : {}
                            }
                            title={`${stage.label}: ${isNew ? "Active" : count}`}
                          >
                            {stage.icon}
                            {!isNew && count > 0 && (
                              <span>{count}</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <button className={styles.expandToggle}>
                      {isExpanded ? (
                        <ChevronUp size={20} />
                      ) : (
                        <ChevronDown size={20} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Expanded Detail */}
                {isExpanded && (
                  <div className={styles.taskCardBody}>
                    {/* Stage breakdown */}
                    {STAGES.filter(
                      (s) => s.key !== "new"
                    ).map((stage) => {
                      const parts = getParticipantsForTaskAndStage(
                        task.id,
                        stage.key
                      );
                      if (parts.length === 0) return null;

                      return (
                        <div key={stage.key} className={styles.stageSection}>
                          <div
                            className={styles.stageSectionHeader}
                            style={{
                              borderLeftColor: stage.color,
                            }}
                          >
                            <span
                              className={styles.stageSectionIcon}
                              style={{
                                background: stage.bgLight,
                                color: stage.color,
                              }}
                            >
                              {stage.icon}
                            </span>
                            <span className={styles.stageSectionTitle}>
                              {stage.label}
                            </span>
                            <span
                              className={styles.stageSectionCount}
                              style={{
                                background: stage.bgLight,
                                color: stage.color,
                              }}
                            >
                              {parts.length}
                            </span>
                          </div>

                          <div className={styles.participantsList}>
                            {parts.map((p) => (
                              <div
                                key={p.id}
                                className={styles.participantCard}
                              >
                                <div className={styles.participantInfo}>
                                  <div className={styles.participantAvatar}>
                                    {(
                                      p.users?.full_name?.[0] || "U"
                                    ).toUpperCase()}
                                  </div>
                                  <div className={styles.participantDetails}>
                                    <span className={styles.participantName}>
                                      {p.users?.full_name || "Unknown User"}
                                    </span>
                                    <span className={styles.participantEmail}>
                                      {p.users?.email_id || "—"}
                                    </span>
                                    {p.reward_earned > 0 && (
                                      <span
                                        className={
                                          styles.participantReward
                                        }
                                      >
                                        ₹
                                        {Number(
                                          p.reward_earned
                                        ).toLocaleString()}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <div className={styles.participantActions}>
                                  {/* Evidence thumbnail */}
                                  {p.submission_image_url && (
                                    <button
                                      className={styles.evidenceBtn}
                                      onClick={() =>
                                        setLightboxImage(
                                          p.submission_image_url!
                                        )
                                      }
                                      title="View evidence"
                                    >
                                      <ImageIcon size={14} />
                                      Evidence
                                    </button>
                                  )}

                                  {/* Action buttons for pending review */}
                                  {stage.key === "completed" && (
                                    <div className={styles.actionBtns}>
                                      <button
                                        className={styles.approveBtn}
                                        onClick={() => handleApprove(p.id)}
                                        disabled={
                                          actionLoading === p.id
                                        }
                                      >
                                        {actionLoading === p.id ? (
                                          <Loader2
                                            size={14}
                                            className={styles.spin}
                                          />
                                        ) : (
                                          <CheckCircle2 size={14} />
                                        )}
                                        Approve
                                      </button>
                                      <button
                                        className={styles.rejectBtn}
                                        onClick={() => handleReject(p.id)}
                                        disabled={
                                          actionLoading === p.id
                                        }
                                      >
                                        <XCircle size={14} />
                                        Reject
                                      </button>
                                    </div>
                                  )}

                                  {/* Status pill for other stages */}
                                  {stage.key !== "completed" && (
                                    <span
                                      className={styles.statusPill}
                                      style={{
                                        background: stage.bgLight,
                                        color: stage.color,
                                      }}
                                    >
                                      {stage.label}
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}

                    {/* If no participants at all */}
                    {allParticipants.filter((p) => p.task_id === task.id)
                      .length === 0 && (
                      <div className={styles.noParticipants}>
                        <Users size={32} />
                        <p>No participants yet</p>
                        <span>
                          This task is available but no users have started it
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* ─── Image Lightbox ─── */}
      {lightboxImage && (
        <div
          className={styles.lightboxOverlay}
          onClick={() => setLightboxImage(null)}
        >
          <div
            className={styles.lightboxContent}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className={styles.lightboxClose}
              onClick={() => setLightboxImage(null)}
            >
              ×
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={lightboxImage} alt="Task Evidence" />
          </div>
        </div>
      )}
    </div>
  );
}
