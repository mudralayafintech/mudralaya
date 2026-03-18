"use client";

import React, { useState, useEffect } from "react";
import { adminApiRequest } from "@/lib/adminApi";
import styles from "./TaskManager.module.css";
import clsx from "clsx";
import DataTable from "./DataTable";
import { PlusCircle, Users } from "lucide-react";

interface Task {
  id: string;
  title: string;
  reward_free: number;
  reward: number; // Fallback
  reward_info?: string;
  type: string;
  task_type?: string; // Daily or Dedicated
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
}

export default function TaskManager() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const ignoreLoading = loading;
  const [showCreateForm, setShowCreateForm] = useState(false);

  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    reward_free: "",
    reward_premium: "",
    reward_min: "",
    reward_max: "",
    reward_info: "",
    type: "Daily",
    task_type: "Daily", // Explicitly added
    video_link: "",
    pdf_url: "",
    action_link: "",
    icon_type: "group",
    target_audience: [] as string[],
    steps: "",
    reward_member: "",
  });

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loadingParticipants, setLoadingParticipants] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await adminApiRequest("get-tasks");
      setTasks(res || []);
    } catch (err) {
      console.error("Failed to fetch tasks", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Convert empty strings to null for numeric fields
      const taskData = {
        ...newTask,
        reward_free:
          newTask.reward_free === "" ? 0 : Number(newTask.reward_free),
        reward_member:
          newTask.reward_member === "" ? null : Number(newTask.reward_member),
        reward_premium:
          newTask.reward_premium === "" ? null : Number(newTask.reward_premium),
        reward_min:
          newTask.reward_min === "" ? null : Number(newTask.reward_min),
        reward_max:
          newTask.reward_max === "" ? null : Number(newTask.reward_max),
      };

      await adminApiRequest("create-task", taskData);
      alert("Task Created Successfully");
      setShowCreateForm(false);
      // Reset form
      setNewTask({
        title: "",
        description: "",
        reward_free: "",
        reward_premium: "",
        reward_min: "",
        reward_max: "",
        reward_info: "",
        type: "Daily",
        task_type: "Daily",
        video_link: "",
        pdf_url: "",
        action_link: "",
        icon_type: "group",
        target_audience: [],
        steps: "",
        reward_member: "",
      });
      fetchTasks();
    } catch (err) {
      alert("Failed to create task: " + (err as Error).message);
    }
  };

  const handleViewProgress = async (task: Task) => {
    setSelectedTask(task);
    setParticipants([]);
    setLoadingParticipants(true);
    try {
      const res = await adminApiRequest("get-task-participants", {
        taskId: task.id,
      });
      setParticipants(res || []);
    } catch (err) {
      console.error("Failed to fetch participants", err);
    } finally {
      setLoadingParticipants(false);
    }
  };

  const handleApproveTask = async (userTaskId: string) => {
    if (
      !confirm(
        "Are you sure you want to approve this task? The reward will be added to the user's wallet.",
      )
    ) {
      return;
    }
    try {
      await adminApiRequest("approve-task", { userTaskId });
      alert("Task approved! Reward has been added to user's wallet.");
      // Refresh participants list
      if (selectedTask) {
        handleViewProgress(selectedTask);
      }
    } catch (err) {
      alert("Failed to approve task: " + (err as Error).message);
    }
  };

  const handleRejectTask = async (userTaskId: string) => {
    const reason = prompt("Please provide a reason for rejection (optional):");
    try {
      await adminApiRequest("reject-task", {
        userTaskId,
        reason: reason || null,
      });
      alert("Task rejected.");
      // Refresh participants list
      if (selectedTask) {
        handleViewProgress(selectedTask);
      }
    } catch (err) {
      alert("Failed to reject task: " + (err as Error).message);
    }
  };

  const columns = [
    { key: "title", label: "Title" },
    {
      key: "reward_free",
      label: "Reward",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      format: (val: any) => (
        <span className={styles.rewardBadge}>
          ₹{Number(val).toLocaleString()}
        </span>
      ),
    },
    { key: "type", label: "Type" },
    {
      key: "actions",
      label: "Action",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      format: (_: any, row: Task) => (
        <button
          className={styles.viewBtn}
          onClick={() => handleViewProgress(row)}
        >
          View Progress
        </button>
      ),
    },
  ];

  const createButton = (
    <button
      className={styles.createBtn}
      onClick={() => setShowCreateForm(!showCreateForm)}
    >
      <PlusCircle size={18} />
      {showCreateForm ? "Cancel" : "Create Task"}
    </button>
  );

  return (
    <div className={styles.container}>
      {showCreateForm && (
        <div className={styles.formCard}>
          <div className={styles.cardHeader}>Create New Task</div>
          <div className={styles.cardBody}>
            <form onSubmit={handleCreateTask}>
              <div className={styles.formGrid}>
                <div className={styles.col6}>
                  <label className={styles.label}>Task Title</label>
                  <input
                    type="text"
                    className={styles.input}
                    value={newTask.title}
                    onChange={(e) =>
                      setNewTask({ ...newTask, title: e.target.value })
                    }
                    placeholder="Enter task title"
                    required
                  />
                </div>
                <div className={styles.col3}>
                  <label className={styles.label}>Type</label>
                  <select
                    className={styles.select}
                    value={newTask.task_type}
                    onChange={(e) =>
                      setNewTask({
                        ...newTask,
                        task_type: e.target.value,
                        type: e.target.value,
                      })
                    }
                  >
                    <option value="Daily">Daily Task</option>
                    <option value="Dedicated">Dedicated Task</option>
                  </select>
                </div>
                <div className={styles.col3}>
                  <label className={styles.label}>Icon Type</label>
                  <select
                    className={styles.select}
                    value={newTask.icon_type}
                    onChange={(e) =>
                      setNewTask({ ...newTask, icon_type: e.target.value })
                    }
                  >
                    <option value="group">Group</option>
                    <option value="youtube">YouTube</option>
                    <option value="facebook">Facebook</option>
                    <option value="instagram">Instagram</option>
                    <option value="twitter">Twitter</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="telegram">Telegram</option>
                    <option value="whatsapp">WhatsApp</option>
                  </select>
                </div>

                <div className={styles.col12}>
                  <label className={styles.label}>Description</label>
                  <textarea
                    className={styles.textarea}
                    rows={3}
                    value={newTask.description}
                    onChange={(e) =>
                      setNewTask({ ...newTask, description: e.target.value })
                    }
                    placeholder="Describe the task..."
                  />
                </div>

                <div className={styles.col12}>
                  <label className={styles.label}>Steps (Optional)</label>
                  <textarea
                    className={styles.textarea}
                    rows={2}
                    value={newTask.steps}
                    onChange={(e) =>
                      setNewTask({ ...newTask, steps: e.target.value })
                    }
                    placeholder="Step-by-step instructions..."
                  />
                </div>

                <div className={styles.col3}>
                  <label className={styles.label}>Free Reward (₹)</label>
                  <input
                    type="number"
                    className={styles.input}
                    value={newTask.reward_free}
                    onChange={(e) =>
                      setNewTask({ ...newTask, reward_free: e.target.value })
                    }
                    placeholder="0"
                  />
                </div>
                <div className={styles.col3}>
                  <label className={styles.label}>Member Reward (₹)</label>
                  <input
                    type="number"
                    className={styles.input}
                    value={newTask.reward_member}
                    onChange={(e) =>
                      setNewTask({ ...newTask, reward_member: e.target.value })
                    }
                    placeholder="0"
                  />
                </div>
                <div className={styles.col3}>
                  <label className={styles.label}>Premium Reward (₹)</label>
                  <input
                    type="number"
                    className={styles.input}
                    value={newTask.reward_premium}
                    onChange={(e) =>
                      setNewTask({ ...newTask, reward_premium: e.target.value })
                    }
                    placeholder="0"
                  />
                </div>
                <div className={styles.col3}>
                  <label className={styles.label}>Reward Info</label>
                  <input
                    type="text"
                    className={styles.input}
                    value={newTask.reward_info}
                    onChange={(e) =>
                      setNewTask({ ...newTask, reward_info: e.target.value })
                    }
                    placeholder="e.g., Up to ₹500"
                  />
                </div>

                <div className={styles.col6}>
                  <label className={styles.label}>Video Link (Optional)</label>
                  <input
                    type="url"
                    className={styles.input}
                    value={newTask.video_link}
                    onChange={(e) =>
                      setNewTask({ ...newTask, video_link: e.target.value })
                    }
                    placeholder="https://youtube.com/..."
                  />
                </div>
                <div className={styles.col6}>
                  <label className={styles.label}>PDF URL (Optional)</label>
                  <input
                    type="url"
                    className={styles.input}
                    value={newTask.pdf_url}
                    onChange={(e) =>
                      setNewTask({ ...newTask, pdf_url: e.target.value })
                    }
                    placeholder="https://..."
                  />
                </div>

                <div className={styles.col12}>
                  <label className={styles.label}>Action Link (Optional)</label>
                  <input
                    type="url"
                    className={styles.input}
                    value={newTask.action_link}
                    onChange={(e) =>
                      setNewTask({ ...newTask, action_link: e.target.value })
                    }
                    placeholder="https://..."
                  />
                </div>

                <div className={styles.col12}>
                  <label className={styles.label}>Target Audience</label>
                  <div
                    style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}
                  >
                    {["All", "Free", "Member", "Premium"].map((audience) => (
                      <label
                        key={audience}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={newTask.target_audience.includes(audience)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewTask({
                                ...newTask,
                                target_audience: [
                                  ...newTask.target_audience,
                                  audience,
                                ],
                              });
                            } else {
                              setNewTask({
                                ...newTask,
                                target_audience: newTask.target_audience.filter(
                                  (a) => a !== audience,
                                ),
                              });
                            }
                          }}
                        />
                        {audience}
                      </label>
                    ))}
                  </div>
                </div>

                <div className={styles.col12} style={{ textAlign: "right" }}>
                  <button type="submit" className={styles.saveBtn}>
                    Save Task
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className={styles.layout}>
        <div className={styles.taskList}>
          <DataTable
            title=""
            columns={columns}
            data={tasks}
            headerActions={createButton}
          />
        </div>

        <div className={styles.progressCard}>
          <div className={styles.progressHeader}>
            <div className={styles.progressTitle}>
              {selectedTask ? selectedTask.title : "Task Progress"}
            </div>
            <div className={styles.progressSubtitle}>
              {selectedTask
                ? "Participant details"
                : "Select a task to view details"}
            </div>
          </div>

          <div className={styles.participantList}>
            {!selectedTask ? (
              <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                <Users size={48} className="mb-2 opacity-20" />
                <span className="text-sm">Select a task from the list</span>
              </div>
            ) : loadingParticipants ? (
              <div className="p-8 text-center text-gray-500 animate-pulse">
                Loading participants...
              </div>
            ) : participants.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-sm">
                No participants found
              </div>
            ) : (
              <ul>
                {participants.map((p, idx) => (
                  <li key={idx} className={styles.participantItem}>
                    <div>
                      <span className={styles.userName}>
                        {p.users?.full_name || "Unknown User"}
                      </span>
                      <span className={styles.userEmail}>
                        {p.users?.email_id}
                      </span>
                      {p.reward_earned > 0 && (
                        <span className={styles.rewardText}>
                          Reward: ₹{p.reward_earned}
                        </span>
                      )}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        gap: "8px",
                        alignItems: "center",
                      }}
                    >
                      <span
                        className={clsx(
                          styles.statusPill,
                          p.status === "completed" || p.status === "approved"
                            ? styles.completed
                            : p.status === "rejected"
                              ? styles.rejected
                              : styles.pending,
                        )}
                      >
                        {p.status}
                      </span>
                      {p.status === "completed" && (
                        <>
                          <button
                            className={styles.approveBtn}
                            onClick={() => handleApproveTask(p.id)}
                            style={{
                              padding: "6px 12px",
                              fontSize: "12px",
                              background: "#10b981",
                              color: "white",
                              border: "none",
                              borderRadius: "6px",
                              cursor: "pointer",
                            }}
                          >
                            Approve
                          </button>
                          <button
                            className={styles.rejectBtn}
                            onClick={() => handleRejectTask(p.id)}
                            style={{
                              padding: "6px 12px",
                              fontSize: "12px",
                              background: "#ef4444",
                              color: "white",
                              border: "none",
                              borderRadius: "6px",
                              cursor: "pointer",
                            }}
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
