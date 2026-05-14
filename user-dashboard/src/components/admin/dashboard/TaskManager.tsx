"use client";

import React, { useState, useEffect } from "react";
import { adminApiRequest } from "@/lib/adminApi";
import styles from "./TaskManager.module.css";
import clsx from "clsx";
import DataTable from "./DataTable";
import { PlusCircle, Users, Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

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
  submission_image_url?: string;
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
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);

  const supabase = createClient();
  const [uploadingPdfCreate, setUploadingPdfCreate] = useState(false);
  const [uploadingVideoCreate, setUploadingVideoCreate] = useState(false);
  const [uploadingPdfEdit, setUploadingPdfEdit] = useState(false);
  const [uploadingVideoEdit, setUploadingVideoEdit] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: 'video_link' | 'pdf_url', isEditing: boolean) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (isEditing) {
      if (fieldName === 'video_link') setUploadingVideoEdit(true);
      if (fieldName === 'pdf_url') setUploadingPdfEdit(true);
    } else {
      if (fieldName === 'video_link') setUploadingVideoCreate(true);
      if (fieldName === 'pdf_url') setUploadingPdfCreate(true);
    }

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `task_${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `assets/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("task-submissions")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from("task-submissions")
        .getPublicUrl(filePath);

      if (isEditing) {
        setEditingTask((prev: any) => ({ ...prev, [fieldName]: data.publicUrl }));
      } else {
        setNewTask((prev) => ({ ...prev, [fieldName]: data.publicUrl }));
      }
    } catch (err: any) {
      console.error("Upload failed:", err);
      alert("Upload failed: " + err.message);
    } finally {
      if (isEditing) {
        if (fieldName === 'video_link') setUploadingVideoEdit(false);
        if (fieldName === 'pdf_url') setUploadingPdfEdit(false);
      } else {
        if (fieldName === 'video_link') setUploadingVideoCreate(false);
        if (fieldName === 'pdf_url') setUploadingPdfCreate(false);
      }
    }
  };

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
      console.log("Task created successfully:", taskData);
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

  const handleEditTask = (task: Task) => {
    setEditingTask({
      ...task,
      task_type: task.task_type || task.type,
      reward_member: (task as any).reward_member || (task as any).reward_premium || "",
      reward_premium: (task as any).reward_premium || "",
      reward_min: (task as any).reward_min || "",
      reward_max: (task as any).reward_max || "",
      reward_info: (task as any).reward_info || "",
      video_link: (task as any).video_link || (task as any).video_url || "",
      pdf_url: (task as any).pdf_url || "",
      action_link: (task as any).action_link || "",
      icon_type: (task as any).icon_type || "group",
      target_audience: (task as any).target_audience || [],
      steps: (task as any).steps || "",
      description: (task as any).description || ""
    });
    setShowEditForm(true);
  };

  const handleUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const taskData = {
        ...editingTask,
        reward_free: editingTask.reward_free === "" ? 0 : Number(editingTask.reward_free),
        reward_member: editingTask.reward_member === "" ? null : Number(editingTask.reward_member),
        reward_premium: editingTask.reward_premium === "" ? null : Number(editingTask.reward_premium),
        reward_min: editingTask.reward_min === "" ? null : Number(editingTask.reward_min),
        reward_max: editingTask.reward_max === "" ? null : Number(editingTask.reward_max),
      };

      await adminApiRequest("update-task", taskData);
      console.log("Task updated successfully:", taskData);
      alert("Task Updated Successfully");
      setShowEditForm(false);
      fetchTasks();
    } catch (err) {
      alert("Failed to update task: " + (err as Error).message);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("Are you sure you want to delete this task? This action cannot be undone.")) return;
    try {
      await adminApiRequest("delete-task", { taskId });
      alert("Task Deleted Successfully");
      fetchTasks();
      if (selectedTask?.id === taskId) {
        setSelectedTask(null);
        setParticipants([]);
      }
    } catch (err) {
      alert("Failed to delete task: " + (err as Error).message);
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
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className={styles.viewBtn}
            onClick={() => handleViewProgress(row)}
          >
            Progress
          </button>
          <button
            className={styles.editBtn}
            onClick={() => handleEditTask(row)}
            style={{ padding: '6px 10px', background: '#f59e0b', color: 'white', borderRadius: '6px', border: 'none', cursor: 'pointer' }}
          >
            Edit
          </button>
          <button
            className={styles.deleteBtn}
            onClick={() => handleDeleteTask(row.id)}
            style={{ padding: '6px 10px', background: '#ef4444', color: 'white', borderRadius: '6px', border: 'none', cursor: 'pointer' }}
          >
            Delete
          </button>
        </div>
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
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="url"
                      className={styles.input}
                      value={newTask.video_link}
                      onChange={(e) =>
                        setNewTask({ ...newTask, video_link: e.target.value })
                      }
                      placeholder="https://youtube.com/..."
                      style={{ flex: 1 }}
                    />
                    <label style={{ cursor: 'pointer', padding: '10px', background: '#e2e8f0', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '500' }}>
                      {uploadingVideoCreate ? <Loader2 size={18} className="animate-spin" style={{ marginRight: '4px' }} /> : "Upload"}
                      <input type="file" accept="video/*" style={{ display: 'none' }} disabled={uploadingVideoCreate} onChange={(e) => handleFileUpload(e, 'video_link', false)} />
                    </label>
                  </div>
                </div>
                <div className={styles.col6}>
                  <label className={styles.label}>PDF URL (Optional)</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="url"
                      className={styles.input}
                      value={newTask.pdf_url}
                      onChange={(e) =>
                        setNewTask({ ...newTask, pdf_url: e.target.value })
                      }
                      placeholder="https://..."
                      style={{ flex: 1 }}
                    />
                    <label style={{ cursor: 'pointer', padding: '10px', background: '#e2e8f0', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '500' }}>
                      {uploadingPdfCreate ? <Loader2 size={18} className="animate-spin" style={{ marginRight: '4px' }} /> : "Upload"}
                      <input type="file" accept="application/pdf" style={{ display: 'none' }} disabled={uploadingPdfCreate} onChange={(e) => handleFileUpload(e, 'pdf_url', false)} />
                    </label>
                  </div>
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
                          checked={newTask.target_audience?.includes(audience)}
                          onChange={(e) => {
                            const current = newTask.target_audience || [];
                            if (e.target.checked) {
                              setNewTask({
                                ...newTask,
                                target_audience: [
                                  ...current,
                                  audience,
                                ],
                              });
                            } else {
                              setNewTask({
                                ...newTask,
                                target_audience: current.filter(
                                  (a: string) => a !== audience,
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

                <div className={styles.col12} style={{ textAlign: "right", display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                  <button type="button" className={styles.cancelBtn} onClick={() => setShowCreateForm(false)} style={{ padding: '10px 20px', background: '#e2e8f0', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                    Cancel
                  </button>
                  <button type="submit" className={styles.saveBtn} style={{ padding: '10px 20px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                    Create Task
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditForm && editingTask && (
        <div className={styles.formCard}>
          <div className={styles.cardHeader}>Edit Task: {editingTask.title}</div>
          <div className={styles.cardBody}>
            <form onSubmit={handleUpdateTask}>
              <div className={styles.formGrid}>
                <div className={styles.col6}>
                  <label className={styles.label}>Task Title</label>
                  <input
                    type="text"
                    className={styles.input}
                    value={editingTask.title}
                    onChange={(e) =>
                      setEditingTask({ ...editingTask, title: e.target.value })
                    }
                    placeholder="Enter task title"
                    required
                  />
                </div>
                <div className={styles.col3}>
                  <label className={styles.label}>Type</label>
                  <select
                    className={styles.select}
                    value={editingTask.task_type}
                    onChange={(e) =>
                      setEditingTask({
                        ...editingTask,
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
                    value={editingTask.icon_type}
                    onChange={(e) =>
                      setEditingTask({ ...editingTask, icon_type: e.target.value })
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
                    value={editingTask.description}
                    onChange={(e) =>
                      setEditingTask({ ...editingTask, description: e.target.value })
                    }
                    placeholder="Describe the task..."
                  />
                </div>

                <div className={styles.col12}>
                  <label className={styles.label}>Steps (Optional)</label>
                  <textarea
                    className={styles.textarea}
                    rows={2}
                    value={editingTask.steps}
                    onChange={(e) =>
                      setEditingTask({ ...editingTask, steps: e.target.value })
                    }
                    placeholder="Step-by-step instructions..."
                  />
                </div>

                <div className={styles.col3}>
                  <label className={styles.label}>Free Reward (₹)</label>
                  <input
                    type="number"
                    className={styles.input}
                    value={editingTask.reward_free}
                    onChange={(e) =>
                      setEditingTask({ ...editingTask, reward_free: e.target.value })
                    }
                    placeholder="0"
                  />
                </div>
                <div className={styles.col3}>
                  <label className={styles.label}>Member Reward (₹)</label>
                  <input
                    type="number"
                    className={styles.input}
                    value={editingTask.reward_member}
                    onChange={(e) =>
                      setEditingTask({ ...editingTask, reward_member: e.target.value })
                    }
                    placeholder="0"
                  />
                </div>
                <div className={styles.col3}>
                  <label className={styles.label}>Premium Reward (₹)</label>
                  <input
                    type="number"
                    className={styles.input}
                    value={editingTask.reward_premium}
                    onChange={(e) =>
                      setEditingTask({ ...editingTask, reward_premium: e.target.value })
                    }
                    placeholder="0"
                  />
                </div>
                <div className={styles.col3}>
                  <label className={styles.label}>Reward Info</label>
                  <input
                    type="text"
                    className={styles.input}
                    value={editingTask.reward_info}
                    onChange={(e) =>
                      setEditingTask({ ...editingTask, reward_info: e.target.value })
                    }
                    placeholder="e.g., Up to ₹500"
                  />
                </div>

                <div className={styles.col6}>
                  <label className={styles.label}>Video Link (Optional)</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="url"
                      className={styles.input}
                      value={editingTask.video_link}
                      onChange={(e) =>
                        setEditingTask({ ...editingTask, video_link: e.target.value })
                      }
                      placeholder="https://youtube.com/..."
                      style={{ flex: 1 }}
                    />
                    <label style={{ cursor: 'pointer', padding: '10px', background: '#e2e8f0', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '500' }}>
                      {uploadingVideoEdit ? <Loader2 size={18} className="animate-spin" style={{ marginRight: '4px' }} /> : "Upload"}
                      <input type="file" accept="video/*" style={{ display: 'none' }} disabled={uploadingVideoEdit} onChange={(e) => handleFileUpload(e, 'video_link', true)} />
                    </label>
                  </div>
                </div>
                <div className={styles.col6}>
                  <label className={styles.label}>PDF URL (Optional)</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="url"
                      className={styles.input}
                      value={editingTask.pdf_url}
                      onChange={(e) =>
                        setEditingTask({ ...editingTask, pdf_url: e.target.value })
                      }
                      placeholder="https://..."
                      style={{ flex: 1 }}
                    />
                    <label style={{ cursor: 'pointer', padding: '10px', background: '#e2e8f0', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '500' }}>
                      {uploadingPdfEdit ? <Loader2 size={18} className="animate-spin" style={{ marginRight: '4px' }} /> : "Upload"}
                      <input type="file" accept="application/pdf" style={{ display: 'none' }} disabled={uploadingPdfEdit} onChange={(e) => handleFileUpload(e, 'pdf_url', true)} />
                    </label>
                  </div>
                </div>

                <div className={styles.col12}>
                  <label className={styles.label}>Action Link (Optional)</label>
                  <input
                    type="url"
                    className={styles.input}
                    value={editingTask.action_link}
                    onChange={(e) =>
                      setEditingTask({ ...editingTask, action_link: e.target.value })
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
                          checked={editingTask.target_audience?.includes(audience)}
                          onChange={(e) => {
                            const current = editingTask.target_audience || [];
                            if (e.target.checked) {
                              setEditingTask({
                                ...editingTask,
                                target_audience: [
                                  ...current,
                                  audience,
                                ],
                              });
                            } else {
                              setEditingTask({
                                ...editingTask,
                                target_audience: current.filter(
                                  (a: string) => a !== audience,
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

                <div className={styles.col12} style={{ textAlign: "right", display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                  <button type="button" className={styles.cancelBtn} onClick={() => setShowEditForm(false)} style={{ padding: '10px 20px', background: '#e2e8f0', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                    Cancel
                  </button>
                  <button type="submit" className={styles.saveBtn}>
                    Update Task
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
                  <li key={idx} className={styles.participantItem} style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
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
                          {p.status === 'completed' ? 'In Process' : p.status}
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
                    </div>
                    {p.submission_image_url && (
                      <div className={styles.evidenceContainer} style={{ marginTop: '12px', padding: '10px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', display: 'block', marginBottom: '8px' }}>SUBMITTED EVIDENCE:</span>
                        <a href={p.submission_image_url} target="_blank" rel="noreferrer">
                           {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img 
                            src={p.submission_image_url} 
                            alt="Task Evidence" 
                            style={{ maxWidth: '100%', borderRadius: '4px', cursor: 'zoom-in', maxHeight: '200px', objectFit: 'contain' }}
                          />
                        </a>
                      </div>
                    )}
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
