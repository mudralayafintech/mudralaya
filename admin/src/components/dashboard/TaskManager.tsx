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
  category?: string;
}

interface Participant {
  users?: {
    full_name?: string;
    email_id?: string;
    mobile_number?: string;
  };
  status: string;
  reward_earned: number;
}

export default function TaskManager() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    reward_free: "",
    reward_premium: "",
    reward_min: "",
    reward_max: "",
    reward_info: "",
    type: "Daily Task",
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
      await adminApiRequest("create-task", newTask);
      alert("Task Created Successfully");
      setShowCreateForm(false);
      // Reset form (simplified for brevity, should reset all fields)
      setNewTask({ ...newTask, title: "", description: "" });
      fetchTasks();
    } catch (err: any) {
      alert("Failed to create task: " + err.message);
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

  const columns = [
    { key: "title", label: "Title" },
    {
      key: "reward_free",
      label: "Reward",
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
                    className={styles.input}
                    value={newTask.title}
                    onChange={(e) =>
                      setNewTask({ ...newTask, title: e.target.value })
                    }
                    placeholder="e.g., Daily Login Bonus"
                    required
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
                    required
                  />
                </div>
                <div className={styles.col3}>
                  <label className={styles.label}>Type</label>
                  <select
                    className={styles.select}
                    value={newTask.type}
                    onChange={(e) =>
                      setNewTask({ ...newTask, type: e.target.value })
                    }
                  >
                    <option>Daily Task</option>
                    <option>Weekly Task</option>
                    <option>One-time</option>
                    <option>Dedicated Task</option>
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
                    placeholder="Describe the task steps..."
                  />
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
                    </div>
                    <div>
                      <span
                        className={clsx(
                          styles.statusPill,
                          p.status === "completed"
                            ? styles.completed
                            : styles.pending
                        )}
                      >
                        {p.status}
                      </span>
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
