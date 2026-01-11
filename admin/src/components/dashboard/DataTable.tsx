"use client";

import React, { useState } from "react";
import {
  Search,
  FileDown,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  ChevronsUpDown,
  Filter,
} from "lucide-react";
import styles from "./DataTable.module.css";
import clsx from "clsx";

interface Column {
  key: string;
  label: string;
  format?: (value: any, row: any) => React.ReactNode;
}

interface DataTableProps {
  title: string;
  columns: Column[];
  data: any[];
  onSearch?: (term: string) => void;
  onDelete?: (id: string | number) => void;
  headerActions?: React.ReactNode;
}

export default function DataTable({
  title,
  columns,
  data,
  onSearch,
  onDelete,
  headerActions,
}: DataTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  // ... existing state ...

  const [sortConfig, setSortConfig] = useState<{
    key: string | null;
    direction: "asc" | "desc";
  }>({ key: null, direction: "asc" });

  const rowsPerPage = 10;

  // Search Logic
  const filteredData = data.filter((row) =>
    Object.values(row).some((val) =>
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Sorting Logic
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const aVal = a[sortConfig.key] || "";
    const bVal = b[sortConfig.key] || "";

    if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  const handleSort = (key: string) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Pagination Logic
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = sortedData.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(sortedData.length / rowsPerPage);

  const handleDownload = () => {
    if (!data.length) return;
    const headers = columns.map((c) => c.label).join(",");
    const rows = data
      .map((row) => columns.map((c) => row[c.key]).join(","))
      .join("\n");
    const csvContent = `data:text/csv;charset=utf-8,${headers}\n${rows}`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${title.replace(" ", "_")}_data.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Renamed for clarity based on new button text
  const exportToCSV = handleDownload;

  return (
    <div className={styles.container}>
      {/* Detached Header */}
      <div className={styles.header}>
        {title &&
        ![
          "Join Partnership Requests",
          "Contact Inquiries",
          "Advisor Applications",
        ].includes(title) ? (
          <h5 className={styles.title}>{title}</h5>
        ) : // Show at least controls if no title is present, but keep alignment
        title ? (
          <div />
        ) : null}

        <div className={styles.controls}>
          <div className={styles.searchWrapper}>
            <Search className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search..."
              className={styles.input}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
                onSearch?.(e.target.value);
              }}
            />
          </div>

          <button className={styles.exportBtn} onClick={exportToCSV}>
            <FileDown size={18} />
            <span>Export</span>
          </button>

          {headerActions && (
            <div className="flex items-center">{headerActions}</div>
          )}
        </div>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th style={{ width: "60px" }}>#</th>
              {columns.map((col) => (
                <th key={col.key} onClick={() => handleSort(col.key)}>
                  <div className={styles.sortHeader}>
                    {col.label}
                    {sortConfig.key === col.key ? (
                      sortConfig.direction === "asc" ? (
                        <ArrowUp size={14} />
                      ) : (
                        <ArrowDown size={14} />
                      )
                    ) : (
                      <ChevronsUpDown size={14} className="opacity-30" />
                    )}
                  </div>
                </th>
              ))}
              {onDelete && <th className="text-right">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {currentRows.length > 0 ? (
              currentRows.map((row, idx) => (
                <tr key={idx}>
                  <td className="text-muted">{indexOfFirstRow + idx + 1}</td>
                  {columns.map((col) => (
                    <td key={col.key}>
                      {col.format
                        ? col.format(row[col.key], row)
                        : row[col.key] || "-"}
                    </td>
                  ))}
                  {onDelete && (
                    <td className="text-right">
                      <button
                        className={styles.deleteBtn}
                        onClick={() => {
                          if (
                            window.confirm(
                              "Are you sure you want to delete this entry?"
                            )
                          ) {
                            onDelete(row.id || row._id);
                          }
                        }}
                        title="Delete Entry"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length + (onDelete ? 2 : 1)}>
                  <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>
                      <Filter size={48} />
                    </div>
                    <h6 className="font-bold">No records found</h6>
                    <p className="text-sm">
                      Try adjusting your search criteria
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className={styles.footer}>
          <nav>
            <ul className={styles.pagination}>
              <li>
                <button
                  className={styles.pageBtn}
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                >
                  <ChevronLeft size={16} />
                </button>
              </li>
              {[...Array(totalPages)].map((_, i) => (
                <li key={i + 1}>
                  <button
                    className={clsx(
                      styles.pageBtn,
                      currentPage === i + 1 && styles.active
                    )}
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                </li>
              ))}
              <li>
                <button
                  className={styles.pageBtn}
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight size={16} />
                </button>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </div>
  );
}
