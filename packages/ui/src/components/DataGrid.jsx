import React, { useState, useMemo } from 'react';
import './DataGrid.css';

const DataGrid = ({
  data = [],
  columns = [],
  pageSize = 10,
  showPagination = true,
  showSearch = true,
  showSorting = true,
  striped = true,
  hover = true,
  className = '',
  onRowClick,
  loading = false
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    
    return data.filter(row =>
      columns.some(column => {
        const value = row[column.key];
        return value?.toString().toLowerCase().includes(searchTerm.toLowerCase());
      })
    );
  }, [data, searchTerm, columns]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [filteredData, sortConfig]);

  // Paginate data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedData.slice(startIndex, startIndex + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const totalPages = Math.ceil(sortedData.length / pageSize);

  const handleSort = (key) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };

  const renderCell = (row, column) => {
    if (column.render) {
      return column.render(row[column.key], row);
    }
    return row[column.key] || '-';
  };

  if (loading) {
    return (
      <div className={`data-grid loading ${className}`}>
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  return (
    <div className={`data-grid ${className}`}>
      {/* Search */}
      {showSearch && (
        <div className="data-grid-search">
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={handleSearch}
            className="search-input"
          />
          <span className="search-results">
            {sortedData.length} of {data.length} records
          </span>
        </div>
      )}

      {/* Table */}
      <div className="data-grid-table-container">
        <table className="data-grid-table">
          <thead>
            <tr>
              {columns.map(column => (
                <th
                  key={column.key}
                  className={showSorting ? 'sortable' : ''}
                  onClick={() => showSorting && handleSort(column.key)}
                  style={{ width: column.width }}
                >
                  <div className="header-content">
                    {column.header}
                    {showSorting && sortConfig.key === column.key && (
                      <span className="sort-indicator">
                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row, index) => (
              <tr
                key={index}
                className={`
                  ${striped && index % 2 === 0 ? 'striped' : ''}
                  ${hover ? 'hoverable' : ''}
                  ${onRowClick ? 'clickable' : ''}
                `}
                onClick={() => onRowClick && onRowClick(row)}
              >
                {columns.map(column => (
                  <td key={column.key}>
                    {renderCell(row, column)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        {paginatedData.length === 0 && (
          <div className="data-grid-empty">
            No data found
          </div>
        )}
      </div>

      {/* Pagination */}
      {showPagination && totalPages > 1 && (
        <div className="data-grid-pagination">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="pagination-btn"
          >
            Previous
          </button>
          
          <span className="pagination-info">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="pagination-btn"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default DataGrid;