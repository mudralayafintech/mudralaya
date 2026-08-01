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
  FileText,
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
  submission_data?: any;
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
  const [viewingData, setViewingData] = useState<any | null>(null);
  const [viewingAllDataForTask, setViewingAllDataForTask] = useState<Task | null>(null);

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

  const exportToCsv = (e: React.MouseEvent, task: Task) => {
    e.stopPropagation();
    const taskParts = allParticipants.filter((p) => p.task_id === task.id);
    
    if (taskParts.length === 0) {
      alert("No data to export");
      return;
    }
    
    // Get all unique questions from all participants
    const allQuestions = new Set<string>();
    taskParts.forEach(p => {
      if (p.submission_data?.responses) {
        Object.keys(p.submission_data.responses).forEach(q => allQuestions.add(q));
      }
    });
    
    const headers = ["User Name", "Email", "Phone", "Status", ...Array.from(allQuestions)];
    
    const rows = taskParts.map(p => {
      const row = [
        p.users?.full_name || "Unknown",
        p.users?.email_id || "",
        p.users?.mobile_number || "",
        p.status,
      ];
      
      Array.from(allQuestions).forEach(q => {
        const val = p.submission_data?.responses?.[q];
        if (val === undefined || val === null) row.push("");
        else if (typeof val === 'object') row.push(JSON.stringify(val).replace(/"/g, '""'));
        else row.push(String(val).replace(/"/g, '""'));
      });
      
      return row.map(cell => `"${cell}"`).join(",");
    });
    
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${task.title.replace(/\s+/g, '_')}_data.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button 
                        className={styles.evidenceBtn}
                        style={{ color: '#059669', borderColor: '#059669', background: 'rgba(5, 150, 105, 0.05)', whiteSpace: 'nowrap', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', borderRadius: '6px', border: '1px solid', fontSize: '12px' }}
                        onClick={(e) => { e.stopPropagation(); setViewingAllDataForTask(task); }}
                        title="View all captured data in a table"
                      >
                        <FileText size={14} />
                        See All Data
                      </button>
                      <button className={styles.expandToggle}>
                        {isExpanded ? (
                          <ChevronUp size={20} />
                        ) : (
                          <ChevronDown size={20} />
                        )}
                      </button>
                    </div>
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

                                  {/* Custom Form Data */}
                                  {p.submission_data?.responses && (
                                    <button
                                      className={styles.evidenceBtn}
                                      onClick={() =>
                                        setViewingData(p.submission_data.responses)
                                      }
                                      title="View captured data"
                                      style={{ color: '#8b5cf6', borderColor: '#8b5cf6', background: 'rgba(139, 92, 246, 0.05)' }}
                                    >
                                      <FileText size={14} />
                                      View Data
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

      {/* ─── Custom Data Modal ─── */}
      {viewingData && (
        <div className={styles.lightboxOverlay} onClick={() => setViewingData(null)}>
          <div className={styles.lightboxContent} onClick={(e) => e.stopPropagation()} style={{ background: 'white', padding: '24px', borderRadius: '12px', maxWidth: '600px', width: '100%', maxHeight: '80vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
              <h3 style={{ margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={20} color="#8b5cf6" />
                Captured Form Data
              </h3>
              <button onClick={() => setViewingData(null)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#64748b' }}>×</button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {Object.entries(viewingData).map(([question, answer], idx) => (
                <div key={idx} style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontWeight: 600, color: '#334155', marginBottom: '4px', fontSize: '13px' }}>{question}</div>
                  <div style={{ color: '#0f172a', fontSize: '14px', whiteSpace: 'pre-wrap' }}>
                    {typeof answer === 'object' ? JSON.stringify(answer, null, 2) : String(answer)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── See All Data Modal ─── */}
      {viewingAllDataForTask && (() => {
        const taskParts = allParticipants
          .filter(p => p.task_id === viewingAllDataForTask.id)
          .sort((a, b) => {
            const dateA = new Date(a.updated_at || a.created_at || 0).getTime();
            const dateB = new Date(b.updated_at || b.created_at || 0).getTime();
            return dateB - dateA;
          });
        const allQuestions = new Set<string>();
        taskParts.forEach(p => {
          if (p.submission_data?.responses) {
            Object.keys(p.submission_data.responses).forEach(q => allQuestions.add(q));
          }
        });
        const questionsArray = Array.from(allQuestions);

        return (
          <div className={styles.lightboxOverlay} onClick={() => setViewingAllDataForTask(null)}>
            <div className={styles.lightboxContent} onClick={(e) => e.stopPropagation()} style={{ background: 'white', padding: '24px', borderRadius: '12px', maxWidth: '90vw', width: '100%', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', flexShrink: 0 }}>
                <div>
                  <h3 style={{ margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileText size={20} color="#059669" />
                    All Recorded Data
                  </h3>
                  <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '13px' }}>{viewingAllDataForTask.title} • {taskParts.length} entries</p>
                </div>
                <button onClick={() => setViewingAllDataForTask(null)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#64748b' }}>×</button>
              </div>
              
              {taskParts.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>No data recorded yet.</div>
              ) : (
                <div style={{ overflow: 'auto', flex: 1, border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
                    <thead style={{ background: '#f8fafc', position: 'sticky', top: 0, zIndex: 10, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                      <tr>
                        <th style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 600, fontSize: '13px', whiteSpace: 'nowrap' }}>Date & Time</th>
                        <th style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 600, fontSize: '13px', whiteSpace: 'nowrap' }}>User Name</th>
                        <th style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 600, fontSize: '13px', whiteSpace: 'nowrap' }}>Email</th>
                        <th style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 600, fontSize: '13px', whiteSpace: 'nowrap' }}>Phone</th>
                        <th style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 600, fontSize: '13px', whiteSpace: 'nowrap' }}>Status</th>
                        {questionsArray.map((q, idx) => (
                          <th key={idx} style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 600, fontSize: '13px', whiteSpace: 'nowrap' }}>{q}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {taskParts.map((p, idx) => {
                        const submittedDate = p.updated_at || p.created_at;
                        const formattedDate = submittedDate 
                          ? new Date(submittedDate).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })
                          : '—';
                        return (
                        <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0', background: idx % 2 === 0 ? 'white' : '#f8fafc' }}>
                          <td style={{ padding: '12px 16px', color: '#64748b', fontSize: '13px', whiteSpace: 'nowrap' }}>{formattedDate}</td>
                          <td style={{ padding: '12px 16px', color: '#0f172a', fontSize: '14px', whiteSpace: 'nowrap' }}>{p.users?.full_name || "Unknown"}</td>
                          <td style={{ padding: '12px 16px', color: '#0f172a', fontSize: '14px', whiteSpace: 'nowrap' }}>{p.users?.email_id || "—"}</td>
                          <td style={{ padding: '12px 16px', color: '#0f172a', fontSize: '14px', whiteSpace: 'nowrap' }}>{p.users?.mobile_number || "—"}</td>
                          <td style={{ padding: '12px 16px', color: '#0f172a', fontSize: '14px', whiteSpace: 'nowrap' }}>
                            <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '12px', background: p.status === 'approved' ? '#dcfce7' : p.status === 'rejected' ? '#fee2e2' : p.status === 'completed' ? '#dbeafe' : '#fef3c7', color: p.status === 'approved' ? '#166534' : p.status === 'rejected' ? '#991b1b' : p.status === 'completed' ? '#1e40af' : '#92400e' }}>
                              {p.status}
                            </span>
                          </td>
                          {questionsArray.map((q, qIdx) => {
                            const val = p.submission_data?.responses?.[q];
                            return (
                              <td key={qIdx} style={{ padding: '12px 16px', color: '#0f172a', fontSize: '14px', maxWidth: '300px' }}>
                                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
                                  {val === undefined || val === null ? "—" : typeof val === 'object' ? JSON.stringify(val) : String(val)}
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
