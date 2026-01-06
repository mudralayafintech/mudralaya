import React, { useState } from 'react';

const DataTable = ({ title, columns, data, onSearch, onDelete }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const rowsPerPage = 10;

    // Search Logic
    const filteredData = data.filter(row =>
        Object.values(row).some(
            val => String(val).toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    // Sorting Logic
    const sortedData = [...filteredData].sort((a, b) => {
        if (!sortConfig.key) return 0;
        const aVal = a[sortConfig.key] || '';
        const bVal = b[sortConfig.key] || '';

        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
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
        const headers = columns.map(c => c.label).join(',');
        const rows = data.map(row => columns.map(c => row[c.key]).join(',')).join('\n');
        const csvContent = `data:text/csv;charset=utf-8,${headers}\n${rows}`;
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `${title.replace(' ', '_')}_data.csv`);
        document.body.appendChild(link);
        link.click();
    };

    return (
        <div className="card border-0 shadow-sm" style={{ borderRadius: '12px', overflow: 'hidden' }}>
            <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center flex-wrap gap-3 border-bottom-0">
                <h5 className="mb-0 text-dark fw-bold" style={{ fontSize: '1.1rem' }}>{title}</h5>
                <div className="d-flex gap-2">
                    <div className="input-group" style={{ boxShadow: '0 2px 5px rgba(0,0,0,0.03)', borderRadius: '20px', overflow: 'hidden' }}>
                        <span className="input-group-text bg-white border-end-0 ps-3">
                            <i className="fas fa-search text-muted small"></i>
                        </span>
                        <input
                            type="text"
                            className="form-control border-start-0 ps-2"
                            style={{ fontSize: '0.9rem' }}
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                        />
                    </div>
                    <button className="btn btn-light btn-sm rounded-circle shadow-sm d-flex align-items-center justify-content-center" style={{ width: '38px', height: '38px' }} onClick={handleDownload} title="Export CSV">
                        <i className="fas fa-file-download text-success"></i>
                    </button>
                </div>
            </div>

            <div className="table-responsive">
                <table className="table table-hover align-middle mb-0 custom-table">
                    <thead className="table-light">
                        <tr>
                            <th className="ps-4" style={{ width: '60px' }}>#</th>
                            {columns.map(col => (
                                <th key={col.key} onClick={() => handleSort(col.key)} style={{ cursor: 'pointer', userSelect: 'none' }}>
                                    <div className="d-flex align-items-center gap-2">
                                        {col.label}
                                        {sortConfig.key === col.key && (
                                            <i className={`fas fa-sort-${sortConfig.direction === 'asc' ? 'up' : 'down'} text-primary small`}></i>
                                        )}
                                        {sortConfig.key !== col.key && (
                                            <i className="fas fa-sort text-muted opacity-25 small"></i>
                                        )}
                                    </div>
                                </th>
                            ))}
                            {onDelete && <th className="text-end pe-4">Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {currentRows.length > 0 ? (
                            currentRows.map((row, idx) => (
                                <tr key={idx}>
                                    <td className="ps-4 text-muted small">{indexOfFirstRow + idx + 1}</td>
                                    {columns.map(col => (
                                        <td key={col.key}>
                                            {col.format ? col.format(row[col.key], row) : (row[col.key] || '-')}
                                        </td>
                                    ))}
                                    {onDelete && (
                                        <td className="text-end pe-4">
                                            <button
                                                className="btn btn-sm btn-light text-danger rounded-circle"
                                                style={{ width: '32px', height: '32px' }}
                                                onClick={() => {
                                                    if (window.confirm('Are you sure you want to delete this entry?')) {
                                                        onDelete(row.id || row._id);
                                                    }
                                                }}
                                                title="Delete Entry"
                                            >
                                                <i className="fas fa-trash-alt"></i>
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={columns.length + (onDelete ? 2 : 1)} className="text-center py-5 text-muted">
                                    <div className="d-flex flex-column align-items-center">
                                        <div className="bg-light rounded-circle p-4 mb-3">
                                            <i className="fas fa-filter fa-2x text-secondary opacity-50"></i>
                                        </div>
                                        <h6 className="fw-bold text-dark">No records found</h6>
                                        <p className="small text-muted mb-0">Try adjusting your search criteria</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="card-footer bg-white border-top-0 d-flex justify-content-end py-3">
                    <nav>
                        <ul className="pagination pagination-sm mb-0 gap-1">
                            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                <button className="page-link rounded-circle d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }} onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}>
                                    <i className="fas fa-chevron-left small"></i>
                                </button>
                            </li>
                            {[...Array(totalPages)].map((_, i) => (
                                <li key={i + 1} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                                    <button className="page-link rounded-circle d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }} onClick={() => setCurrentPage(i + 1)}>
                                        {i + 1}
                                    </button>
                                </li>
                            ))}
                            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                <button className="page-link rounded-circle d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }} onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}>
                                    <i className="fas fa-chevron-right small"></i>
                                </button>
                            </li>
                        </ul>
                    </nav>
                </div>
            )}
        </div>
    );
};

export default DataTable;
