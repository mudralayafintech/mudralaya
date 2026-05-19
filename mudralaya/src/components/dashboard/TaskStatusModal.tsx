"use client";

import React from "react";
import {
  X,
  Clock,
  CheckCircle,
  XCircle,
  RotateCcw,
  Wallet,
  AlertTriangle,
} from "lucide-react";
import styles from "./task-status-modal.module.css";

interface TaskStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: {
    id: string;
    title: string;
    status?: string;
    reward_free?: number;
    reward?: number;
    rejection_reason?: string;
  };
  onResubmit: () => void;
  onGoToWallet: () => void;
}

export default function TaskStatusModal({
  isOpen,
  onClose,
  task,
  onResubmit,
  onGoToWallet,
}: TaskStatusModalProps) {
  if (!isOpen) return null;

  const status = task.status || "ongoing";

  const getConfig = () => {
    switch (status) {
      case "completed":
        return {
          icon: <Clock size={32} />,
          iconBg: "linear-gradient(135deg, #dbeafe, #bfdbfe)",
          iconColor: "#2563eb",
          title: "Under Verification",
          subtitle: "Please wait, your task is under verification",
          message:
            "Our team is reviewing your submission. This usually takes up to 24 hours. You'll receive a notification once it's processed.",
          emoji: "⏳",
        };
      case "approved":
        return {
          icon: <CheckCircle size={32} />,
          iconBg: "linear-gradient(135deg, #d1fae5, #a7f3d0)",
          iconColor: "#059669",
          title: "Task Approved! 🎉",
          subtitle: `₹${task.reward_free || task.reward || 0} has been credited to your wallet`,
          message:
            "Congratulations! Your submission was verified successfully and the reward has been added to your wallet balance.",
          emoji: "✅",
        };
      case "rejected":
        return {
          icon: <XCircle size={32} />,
          iconBg: "linear-gradient(135deg, #fee2e2, #fecaca)",
          iconColor: "#dc2626",
          title: "Task Rejected",
          subtitle: "Your submission did not meet the requirements",
          message:
            task.rejection_reason ||
            "Your submission was reviewed and found to be incomplete or incorrect. Please review the task requirements and try again.",
          emoji: "❌",
        };
      default:
        return {
          icon: <Clock size={32} />,
          iconBg: "linear-gradient(135deg, #fef3c7, #fde68a)",
          iconColor: "#d97706",
          title: "Task In Progress",
          subtitle: "Complete the task and submit proof",
          message: "Follow the task instructions and submit your proof of completion.",
          emoji: "🔄",
        };
    }
  };

  const config = getConfig();

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}>
          <X size={18} />
        </button>

        <div className={styles.content}>
          {/* Status Icon */}
          <div
            className={styles.statusIconWrapper}
            style={{ background: config.iconBg, color: config.iconColor }}
          >
            {config.icon}
          </div>

          {/* Title */}
          <h2 className={styles.title}>{config.title}</h2>
          <p className={styles.subtitle}>{config.subtitle}</p>

          {/* Task Name */}
          <div className={styles.taskName}>
            <span>Task</span>
            <strong>{task.title}</strong>
          </div>

          {/* Status Message */}
          <div
            className={`${styles.messageCard} ${
              status === "rejected" ? styles.messageCardError : ""
            }`}
          >
            <span className={styles.messageEmoji}>{config.emoji}</span>
            <div className={styles.messageText}>
              {status === "rejected" && task.rejection_reason && (
                <div className={styles.rejectionLabel}>
                  <AlertTriangle size={14} />
                  Reason for rejection:
                </div>
              )}
              <p>{config.message}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className={styles.actions}>
            {status === "approved" && (
              <button className={styles.walletBtn} onClick={onGoToWallet}>
                <Wallet size={18} />
                Go to Wallet
              </button>
            )}

            {status === "rejected" && (
              <button className={styles.resubmitBtn} onClick={onResubmit}>
                <RotateCcw size={16} />
                Resubmit Task
              </button>
            )}

            {status === "completed" && (
              <div className={styles.waitingInfo}>
                <div className={styles.waitingDots}>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <p>Verification in progress...</p>
              </div>
            )}

            <button className={styles.dismissBtn} onClick={onClose}>
              {status === "approved" ? "Close" : "Back to Tasks"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
