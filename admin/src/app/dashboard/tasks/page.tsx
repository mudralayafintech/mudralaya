"use client";

import React, { useState } from "react";
import TaskManager from "@/components/dashboard/TaskManager";
import TaskFlowBoard from "@/components/dashboard/TaskFlowBoard";
import { LayoutList, GitBranch } from "lucide-react";

type ViewMode = "manage" | "flow";

export default function TasksPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("flow");

  return (
    <div>
      {/* View Toggle */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: "1.25rem",
          gap: "6px",
        }}
      >
        <button
          onClick={() => setViewMode("flow")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "0.5rem 1rem",
            borderRadius: "10px",
            border:
              viewMode === "flow"
                ? "1px solid rgba(99, 102, 241, 0.3)"
                : "1px solid #e2e8f0",
            background:
              viewMode === "flow"
                ? "linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.1))"
                : "white",
            color: viewMode === "flow" ? "#6366f1" : "#94a3b8",
            fontWeight: 600,
            fontSize: "0.8rem",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
        >
          <GitBranch size={15} />
          Task Flow
        </button>
        <button
          onClick={() => setViewMode("manage")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "0.5rem 1rem",
            borderRadius: "10px",
            border:
              viewMode === "manage"
                ? "1px solid rgba(37, 99, 235, 0.3)"
                : "1px solid #e2e8f0",
            background:
              viewMode === "manage"
                ? "rgba(37, 99, 235, 0.08)"
                : "white",
            color: viewMode === "manage" ? "#2563eb" : "#94a3b8",
            fontWeight: 600,
            fontSize: "0.8rem",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
        >
          <LayoutList size={15} />
          Manage Tasks
        </button>
      </div>

      {/* Views */}
      {viewMode === "flow" ? <TaskFlowBoard /> : <TaskManager />}
    </div>
  );
}
