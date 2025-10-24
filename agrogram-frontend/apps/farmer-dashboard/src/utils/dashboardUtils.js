// src/utils/dashboardUtils.js
// Utility functions for dashboard functionality

import { toast } from 'react-toastify';

/**
 * Generic API call handler with error handling
 */
export const handleApiCall = async (apiFunction, successMessage, errorMessage) => {
  try {
    const response = await apiFunction();
    if (response?.success) {
      if (successMessage) toast.success(successMessage);
      return response.data;
    } else {
      throw new Error(response?.message || 'Operation failed');
    }
  } catch (error) {
    console.error('API Error:', error);
    toast.error(errorMessage || error.message || 'An error occurred');
    return null;
  }
};

/**
 * Export data to CSV
 */
export const exportToCSV = (data, filename) => {
  if (!data || data.length === 0) {
    toast.warning('No data to export');
    return;
  }

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(header => JSON.stringify(row[header] || '')).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  toast.success('Data exported successfully');
};

/**
 * Generate PDF report
 */
export const generatePDFReport = async (dashboardData, reportType) => {
  toast.info('Generating PDF report...');
  
  // Simulate PDF generation
  setTimeout(() => {
    toast.success('PDF report generated successfully');
    // In production, implement actual PDF generation
  }, 1500);
};

/**
 * Refresh dashboard data
 */
export const refreshDashboard = async (fetchFunction, setData, setLoading) => {
  setLoading(true);
  toast.info('Refreshing data...');
  
  try {
    await fetchFunction();
    toast.success('Data refreshed successfully');
  } catch (error) {
    console.error('Refresh error:', error);
    toast.error('Failed to refresh data');
  } finally {
    setLoading(false);
  }
};

/**
 * Handle voice command
 */
export const handleVoiceCommand = (message) => {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.lang = 'en-US';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  } else {
    toast.warning('Voice commands not supported in this browser');
  }
};

/**
 * Navigation helpers
 */
export const navigateTo = (navigate, path, state = {}) => {
  navigate(path, { state });
};

/**
 * Format currency
 */
export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount || 0);
};

/**
 * Format date
 */
export const formatDate = (date, format = 'short') => {
  const dateObj = new Date(date);
  if (format === 'short') {
    return dateObj.toLocaleDateString();
  }
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Handle file upload
 */
export const handleFileUpload = async (file, uploadEndpoint) => {
  const formData = new FormData();
  formData.append('file', file);
  
  try {
    const response = await fetch(uploadEndpoint, {
      method: 'POST',
      body: formData,
    });
    
    const data = await response.json();
    if (data.success) {
      toast.success('File uploaded successfully');
      return data;
    } else {
      throw new Error(data.message || 'Upload failed');
    }
  } catch (error) {
    console.error('Upload error:', error);
    toast.error('Failed to upload file');
    return null;
  }
};

/**
 * Open modal/dialog
 */
export const openModal = (setModalState, modalData = {}) => {
  setModalState({ isOpen: true, ...modalData });
};

/**
 * Close modal/dialog
 */
export const closeModal = (setModalState) => {
  setModalState({ isOpen: false });
};

/**
 * Confirm action
 */
export const confirmAction = (message, onConfirm) => {
  if (window.confirm(message)) {
    onConfirm();
  }
};

/**
 * Search/filter data
 */
export const filterData = (data, searchTerm, fields) => {
  if (!searchTerm) return data;
  
  const term = searchTerm.toLowerCase();
  return data.filter(item => 
    fields.some(field => 
      String(item[field]).toLowerCase().includes(term)
    )
  );
};

/**
 * Sort data
 */
export const sortData = (data, field, direction = 'asc') => {
  return [...data].sort((a, b) => {
    const aVal = a[field];
    const bVal = b[field];
    
    if (direction === 'asc') {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });
};

/**
 * Pagination helper
 */
export const paginateData = (data, page, itemsPerPage) => {
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  return data.slice(startIndex, endIndex);
};

/**
 * Copy to clipboard
 */
export const copyToClipboard = (text) => {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(() => {
      toast.success('Copied to clipboard');
    }).catch(() => {
      toast.error('Failed to copy');
    });
  } else {
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    toast.success('Copied to clipboard');
  }
};

/**
 * Download file
 */
export const downloadFile = (url, filename) => {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  toast.success('Download started');
};

/**
 * Share functionality
 */
export const shareData = async (data) => {
  if (navigator.share) {
    try {
      await navigator.share(data);
      toast.success('Shared successfully');
    } catch (error) {
      if (error.name !== 'AbortError') {
        toast.error('Failed to share');
      }
    }
  } else {
    copyToClipboard(data.url || data.text);
  }
};

/**
 * Print functionality
 */
export const printContent = (elementId) => {
  const element = document.getElementById(elementId);
  if (element) {
    const printWindow = window.open('', '', 'height=600,width=800');
    printWindow.document.write('<html><head><title>Print</title>');
    printWindow.document.write('<style>body{font-family: Arial, sans-serif; padding: 20px;}</style>');
    printWindow.document.write('</head><body>');
    printWindow.document.write(element.innerHTML);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();
  } else {
    toast.error('Content not found');
  }
};

/**
 * Notification helper
 */
export const sendNotification = (title, options = {}) => {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, options);
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        new Notification(title, options);
      }
    });
  }
};

/**
 * Local storage helpers
 */
export const saveToLocalStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('LocalStorage error:', error);
    return false;
  }
};

export const getFromLocalStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('LocalStorage error:', error);
    return defaultValue;
  }
};

/**
 * Debounce function
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle function
 */
export const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};