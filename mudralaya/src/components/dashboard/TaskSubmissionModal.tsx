"use client";

import React, { useState } from "react";
import {
  X,
  Upload,
  Link as LinkIcon,
  Image as ImageIcon,
  CheckCircle,
  Loader2,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import styles from "./task-submission-modal.module.css";

interface Task {
  id: string;
  title: string;
  action_link?: string;
  reward_free?: number;
  reward?: number;
  status?: string;
  description?: string;
  steps?: string;
}

interface TaskSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task;
  onSuccess: () => void;
}

type SubmissionStep = "instructions" | "submit" | "uploading" | "success";

export default function TaskSubmissionModal({
  isOpen,
  onClose,
  task,
  onSuccess,
}: TaskSubmissionModalProps) {
  const [step, setStep] = useState<SubmissionStep>("instructions");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [proofLink, setProofLink] = useState("");
  const [submissionNote, setSubmissionNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const resetState = () => {
    setStep("instructions");
    setSelectedFile(null);
    setProofLink("");
    setSubmissionNote("");
    setError(null);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) {
        setError("File size must be less than 10MB");
        return;
      }
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleSubmit = async () => {
    setStep("uploading");
    setError(null);

    try {
      let imageUrl: string | null = null;

      // Upload image if selected
      if (selectedFile) {
        const timestamp = Date.now();
        const path = `${task.id}/${timestamp}_${selectedFile.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("task-submissions")
          .upload(path, selectedFile);

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage
          .from("task-submissions")
          .getPublicUrl(uploadData.path);

        imageUrl = publicUrl;
      }

      // Call API
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const { error: apiError } = await supabase.functions.invoke(
        "dashboard-api",
        {
          body: {
            action: "complete-task",
            taskId: task.id,
            submissionImageUrl: imageUrl,
            submissionData: {
              completed_at: new Date().toISOString(),
              action_link_visited: task.action_link ? true : false,
              proof_link: proofLink || null,
              note: submissionNote || null,
            },
          },
          headers: session
            ? { Authorization: `Bearer ${session.access_token}` }
            : undefined,
        }
      );

      if (apiError) throw apiError;

      setStep("success");

      // Auto close after 2.5s
      setTimeout(() => {
        handleClose();
        onSuccess();
      }, 2500);
    } catch (err: any) {
      console.error("Submission failed:", err);
      setError(err.message || "Failed to submit. Please try again.");
      setStep("submit");
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Close button */}
        <button className={styles.closeBtn} onClick={handleClose}>
          <X size={18} />
        </button>

        {/* ─── Step 1: Instructions ─── */}
        {step === "instructions" && (
          <div className={styles.content}>
            <div className={styles.header}>
              <div className={styles.headerIcon}>
                <CheckCircle size={24} />
              </div>
              <h2>Complete Task</h2>
              <p className={styles.taskTitle}>{task.title}</p>
            </div>

            {/* Task instructions */}
            <div className={styles.instructionsCard}>
              <h3>📋 Instructions</h3>
              {task.description ? (
                <p>{task.description}</p>
              ) : (
                <p>Complete this task following the guidelines provided. Submit proof of completion for faster approval.</p>
              )}

              {task.steps && (
                <div className={styles.stepsList}>
                  <h4>Steps to follow:</h4>
                  {task.steps.split("\n").filter(Boolean).map((s, i) => (
                    <div key={i} className={styles.stepItem}>
                      <span className={styles.stepNumber}>{i + 1}</span>
                      <span>{s.trim()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Proof requirements */}
            <div className={styles.proofRequirements}>
              <h3>📤 Proof Requirements</h3>
              <ul>
                <li>Upload a screenshot showing task completion</li>
                <li>Optionally provide a link as proof</li>
                <li>Add any notes for the reviewer</li>
              </ul>
            </div>

            {/* Reward info */}
            <div className={styles.rewardCard}>
              <span>💰 Reward</span>
              <strong>₹{task.reward_free || task.reward || 0}</strong>
            </div>

            {/* Action link */}
            {task.action_link && (
              <a
                href={task.action_link}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.actionLinkBtn}
              >
                Open Task Link
                <ArrowRight size={16} />
              </a>
            )}

            <button
              className={styles.primaryBtn}
              onClick={() => setStep("submit")}
            >
              I&apos;ve Completed the Task
              <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* ─── Step 2: Submit Proof ─── */}
        {step === "submit" && (
          <div className={styles.content}>
            <div className={styles.header}>
              <div className={styles.headerIconUpload}>
                <Upload size={24} />
              </div>
              <h2>Submit Proof</h2>
              <p>Upload evidence for faster approval</p>
            </div>

            {error && (
              <div className={styles.errorBanner}>
                <AlertTriangle size={16} />
                {error}
              </div>
            )}

            {/* Image Upload */}
            <div className={styles.uploadSection}>
              <label className={styles.uploadLabel}>
                <ImageIcon size={16} />
                Screenshot / Image
              </label>
              <div className={styles.uploadArea}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className={styles.fileInput}
                />
                {selectedFile ? (
                  <div className={styles.fileSelected}>
                    <CheckCircle size={16} className={styles.fileCheckIcon} />
                    <span>{selectedFile.name}</span>
                    <button
                      className={styles.fileRemove}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFile(null);
                      }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div className={styles.uploadPlaceholder}>
                    <Upload size={20} />
                    <span>Click or drag to upload</span>
                    <small>PNG, JPG up to 10MB</small>
                  </div>
                )}
              </div>

              {/* Image Preview */}
              {selectedFile && (
                <div className={styles.imagePreview}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={URL.createObjectURL(selectedFile)}
                    alt="Preview"
                  />
                </div>
              )}
            </div>

            {/* Proof Link */}
            <div className={styles.uploadSection}>
              <label className={styles.uploadLabel}>
                <LinkIcon size={16} />
                Proof Link (optional)
              </label>
              <input
                type="url"
                placeholder="https://..."
                value={proofLink}
                onChange={(e) => setProofLink(e.target.value)}
                className={styles.textInput}
              />
            </div>

            {/* Notes */}
            <div className={styles.uploadSection}>
              <label className={styles.uploadLabel}>
                Additional Notes (optional)
              </label>
              <textarea
                placeholder="Any details about how you completed the task..."
                value={submissionNote}
                onChange={(e) => setSubmissionNote(e.target.value)}
                className={styles.textArea}
                rows={3}
              />
            </div>

            <div className={styles.btnRow}>
              <button
                className={styles.secondaryBtn}
                onClick={() => setStep("instructions")}
              >
                Back
              </button>
              <button className={styles.primaryBtn} onClick={handleSubmit}>
                Submit for Review
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ─── Step 3: Uploading ─── */}
        {step === "uploading" && (
          <div className={styles.content}>
            <div className={styles.centeredState}>
              <div className={styles.spinnerWrapper}>
                <Loader2 size={36} className={styles.spinner} />
              </div>
              <h2>Submitting your proof...</h2>
              <p>Please wait while we upload your submission</p>
            </div>
          </div>
        )}

        {/* ─── Step 4: Success ─── */}
        {step === "success" && (
          <div className={styles.content}>
            <div className={styles.centeredState}>
              <div className={styles.successIcon}>
                <CheckCircle size={40} />
              </div>
              <h2>Task Submitted! 🎉</h2>
              <p>Your task is now under verification.</p>
              <div className={styles.statusMessage}>
                <span>⏳</span>
                <div>
                  <strong>Please wait</strong>
                  <p>We&apos;ll review your submission and credit your reward once approved.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
