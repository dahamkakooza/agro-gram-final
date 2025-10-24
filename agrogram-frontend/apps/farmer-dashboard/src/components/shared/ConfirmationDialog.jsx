// src/components/shared/ConfirmationDialog.jsx
import React from 'react';
import ModalManager from './ModalManager';
import './ConfirmationDialog.css';

const ConfirmationDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "default", // default, danger, warning
  loading = false
}) => {
  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <ModalManager
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="small"
    >
      <div className="confirmation-dialog">
        <p className="confirmation-message">{message}</p>
        <div className="confirmation-actions">
          <button
            className={`confirm-button ${variant}`}
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? 'Processing...' : confirmText}
          </button>
          <button
            className="cancel-button"
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </button>
        </div>
      </div>
    </ModalManager>
  );
};

export default ConfirmationDialog;