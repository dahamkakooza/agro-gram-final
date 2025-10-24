// src/components/shared/DataGrid.jsx
import React, { useState, useMemo } from 'react';
import './DataGrid.css';

const DataGrid = ({ 
  data, 
  columns, 
  pageSize = 10,
  sortable = true,
  filterable = true,
  onRowClick 
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [filters, setFilters] = useState({});

  const filteredAndSortedData = useMemo(() => {
    let filteredData = data;

    // Apply filters
    if (filterable) {
      filteredData = data.filter(row =>
        columns.every(col => {
          const filterValue = filters[col.key];
          if (!filterValue) return true;
          const cellValue = String(row[col.key] || '').toLowerCase();
          return cellValue.includes(filterValue.toLowerCase());
        })
      );
    }

    // Apply sorting
    if (sortable && sortConfig.key) {
      filteredData = [...filteredData].sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filteredData;
  }, [data, columns, filters, sortConfig, filterable, sortable]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredAndSortedData.slice(startIndex, startIndex + pageSize);
  }, [filteredAndSortedData, currentPage, pageSize]);

  const handleSort = (key) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
    });
  };

  const handleFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(filteredAndSortedData.length / pageSize);

  return (
    <div className="data-grid">
      <div className="grid-header">
        <div className="grid-info">
          Showing {paginatedData.length} of {filteredAndSortedData.length} records
        </div>
        {filterable && (
          <div className="grid-filters">
            {columns.map(col => (
              <input
                key={col.key}
                type="text"
                placeholder={`Filter ${col.header}...`}
                value={filters[col.key] || ''}
                onChange={(e) => handleFilter(col.key, e.target.value)}
                className="filter-input"
              />
            ))}
          </div>
        )}
      </div>

      <div className="grid-container">
        <table className="grid-table">
          <thead>
            <tr>
              {columns.map(col => (
                <th 
                  key={col.key}
                  className={sortable ? 'sortable' : ''}
                  onClick={() => sortable && handleSort(col.key)}
                >
                  {col.header}
                  {sortConfig.key === col.key && (
                    <span className="sort-indicator">
                      {sortConfig.direction === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row, index) => (
              <tr 
                key={index} 
                className={onRowClick ? 'clickable' : ''}
                onClick={() => onRowClick && onRowClick(row)}
              >
                {columns.map(col => (
                  <td key={col.key}>
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="grid-pagination">
          <button 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Previous
          </button>
          <span>Page {currentPage} of {totalPages}</span>
          <button 
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default DataGrid;