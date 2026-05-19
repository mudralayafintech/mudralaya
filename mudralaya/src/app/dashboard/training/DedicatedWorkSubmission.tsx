"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import TaskSubmissionModal from "@/components/dashboard/TaskSubmissionModal";
import TaskStatusModal from "@/components/dashboard/TaskStatusModal";
import { useRouter } from "next/navigation";
import {
  ClipboardCheck,
  Clock,
  CheckCircle,
  XCircle,
  Upload,
  Loader2,
} from "lucide-react";

interface DedicatedTask {
  id: string;
  title: string;
  reward_free?: number;
  reward?: number;
  status?: string;
  action_link?: string;
  description?: string;
  rejection_reason?: string;
}

interface DedicatedWorkSubmissionProps {
  companyId: string;
  companyName: string;
}

export default function DedicatedWorkSubmission({
  companyId,
  companyName,
}: DedicatedWorkSubmissionProps) {
  const [tasks, setTasks] = useState<DedicatedTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [submissionTask, setSubmissionTask] = useState<DedicatedTask | null>(null);
  const [statusTask, setStatusTask] = useState<DedicatedTask | null>(null);

  const supabase = createClient();
  const router = useRouter();

  const fetchDedicatedTasks = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase.functions.invoke(
        "dashboard-api",
        {
          body: { action: "get-tasks" },
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (error) throw error;

      // Filter for dedicated/company tasks
      const dedicatedTasks = (data || []).filter(
        (t: any) =>
          t.task_type === "Dedicated" ||
          t.type === "Dedicated" ||
          t.category?.toLowerCase().includes("dedicated") ||
          t.company_id === companyId
      );

      setTasks(dedicatedTasks);
    } catch (err) {
      console.error("Error fetching dedicated tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDedicatedTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "ongoing":
      case "in_progress":
        return {
          label: "In Progress",
          icon: <Clock size={14} />,
          bg: "#fffbeb",
          color: "#d97706",
          border: "#fef3c7",
        };
      case "completed":
        return {
          label: "Under Review",
          icon: <Clock size={14} />,
          bg: "#eff6ff",
          color: "#2563eb",
          border: "#dbeafe",
        };
      case "approved":
        return {
          label: "Approved",
          icon: <CheckCircle size={14} />,
          bg: "#f0fdf4",
          color: "#16a34a",
          border: "#dcfce7",
        };
      case "rejected":
        return {
          label: "Rejected",
          icon: <XCircle size={14} />,
          bg: "#fef2f2",
          color: "#dc2626",
          border: "#fecaca",
        };
      default:
        return {
          label: "Available",
          icon: <ClipboardCheck size={14} />,
          bg: "#faf5ff",
          color: "#7c3aed",
          border: "#e9d5ff",
        };
    }
  };

  const handleTaskAction = (task: DedicatedTask) => {
    if (!task.status || task.status === "ongoing" || task.status === "in_progress") {
      setSubmissionTask(task);
    } else {
      setStatusTask(task);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
          color: "#94a3b8",
          gap: "8px",
        }}
      >
        <Loader2
          size={20}
          style={{ animation: "spin 1s linear infinite" }}
        />
        Loading work tasks...
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "2rem",
          background: "#f8fafc",
          borderRadius: "16px",
          border: "1px dashed #e2e8f0",
        }}
      >
        <ClipboardCheck
          size={32}
          style={{ color: "#cbd5e1", marginBottom: "8px" }}
        />
        <p style={{ color: "#94a3b8", fontSize: "0.85rem", margin: 0 }}>
          No dedicated work tasks assigned yet.
        </p>
        <p style={{ color: "#cbd5e1", fontSize: "0.75rem", margin: "4px 0 0" }}>
          Complete your training to unlock work submissions.
        </p>
      </div>
    );
  }

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {tasks.map((task) => {
          const badge = getStatusBadge(task.status);
          const canSubmit =
            !task.status ||
            task.status === "ongoing" ||
            task.status === "in_progress";

          return (
            <div
              key={task.id}
              style={{
                background: "white",
                border: "1px solid #f1f5f9",
                borderRadius: "14px",
                padding: "1rem 1.25rem",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "12px",
                transition: "all 0.2s",
                cursor: "pointer",
              }}
              onClick={() => handleTaskAction(task)}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: "4px",
                  }}
                >
                  <h4
                    style={{
                      fontSize: "0.88rem",
                      fontWeight: 600,
                      color: "#0f172a",
                      margin: 0,
                    }}
                  >
                    {task.title}
                  </h4>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      fontSize: "0.65rem",
                      fontWeight: 700,
                      padding: "2px 8px",
                      borderRadius: "6px",
                      background: badge.bg,
                      color: badge.color,
                      border: `1px solid ${badge.border}`,
                    }}
                  >
                    {badge.icon}
                    {badge.label}
                  </span>
                </div>
                {task.reward_free && (
                  <span
                    style={{
                      fontSize: "0.75rem",
                      color: "#059669",
                      fontWeight: 600,
                    }}
                  >
                    ₹{task.reward_free}
                  </span>
                )}
              </div>

              <button
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "0.5rem 1rem",
                  borderRadius: "10px",
                  border: "none",
                  background: canSubmit
                    ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
                    : badge.bg,
                  color: canSubmit ? "white" : badge.color,
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "all 0.2s",
                  flexShrink: 0,
                }}
              >
                {canSubmit ? (
                  <>
                    <Upload size={14} />
                    Submit Work
                  </>
                ) : (
                  <>
                    {badge.icon}
                    {badge.label}
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Submission Modal */}
      {submissionTask && (
        <TaskSubmissionModal
          isOpen={!!submissionTask}
          onClose={() => setSubmissionTask(null)}
          task={submissionTask}
          onSuccess={() => {
            setSubmissionTask(null);
            fetchDedicatedTasks();
          }}
        />
      )}

      {/* Status Modal */}
      {statusTask && (
        <TaskStatusModal
          isOpen={!!statusTask}
          onClose={() => setStatusTask(null)}
          task={statusTask}
          onResubmit={() => {
            setStatusTask(null);
            setSubmissionTask(statusTask);
          }}
          onGoToWallet={() => {
            setStatusTask(null);
            router.push("/dashboard/wallet");
          }}
        />
      )}
    </>
  );
}
