import React, { useState } from 'react';
import { Card, Button, Input, TextArea, Select, Alert } from '@agro-gram/ui';

export const BuyerCancelOrderForm = ({ order, onSubmit, onCancel }) => {
  // Safety check for null order
  if (!order) {
    return (
      <Card className="order-form">
        <div className="form-header">
          <h3>Error</h3>
          <p>Order information is not available</p>
        </div>
        <div className="form-actions">
          <Button type="button" variant="outline" onClick={onCancel}>
            Close
          </Button>
        </div>
      </Card>
    );
  }

  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const cancellationReasons = [
    { value: 'changed_mind', label: 'Changed my mind' },
    { value: 'found_cheaper', label: 'Found a better price' },
    { value: 'ordered_by_mistake', label: 'Ordered by mistake' },
    { value: 'delivery_too_long', label: 'Delivery takes too long' },
    { value: 'product_not_needed', label: 'No longer need the product' },
    { value: 'financial_reasons', label: 'Financial reasons' },
    { value: 'other', label: 'Other reason' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!reason.trim()) {
      setError('Please select a cancellation reason');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onSubmit({
        orderId: order.id,
        action: 'CANCEL_ORDER',
        reason: reason,
        additionalDetails: reason === 'other' ? document.getElementById('otherReason').value : ''
      });
    } catch (err) {
      setError('Failed to cancel order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="order-form">
      <div className="form-header">
        <h3>Cancel Order #{order.id}</h3>
        <p>Please tell us why you're cancelling this order</p>
      </div>

      <form onSubmit={handleSubmit}>
        {error && <Alert type="error">{error}</Alert>}

        <div className="form-section">
          <Select
            label="Cancellation Reason *"
            options={cancellationReasons}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
          />
        </div>

        {reason === 'other' && (
          <div className="form-section">
            <TextArea
              label="Please specify your reason *"
              id="otherReason"
              rows={3}
              placeholder="Please provide details about why you're cancelling this order..."
              required
            />
          </div>
        )}

        <div className="order-summary">
          <h4>Order Summary</h4>
          <div className="summary-item">
            <span>Product:</span>
            <span>{order.product_details?.title || 'Product'}</span>
          </div>
          <div className="summary-item">
            <span>Quantity:</span>
            <span>{order.quantity || 1}</span>
          </div>
          <div className="summary-item">
            <span>Total Amount:</span>
            <span>${order.total_price || 0}</span>
          </div>
        </div>

        <div className="form-actions">
          <Button 
            type="submit" 
            variant="error" 
            loading={loading}
            disabled={!reason.trim()}
          >
            Confirm Cancellation
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Go Back
          </Button>
        </div>

        <div className="form-notice">
          <p>⚠️ <strong>Note:</strong> Once cancelled, this order cannot be restored. 
          The seller will be notified of your cancellation.</p>
        </div>
      </form>
    </Card>
  );
};

export const BuyerRefundRequestForm = ({ order, onSubmit, onCancel }) => {
  // Safety check for null order
  if (!order) {
    return (
      <Card className="order-form">
        <div className="form-header">
          <h3>Error</h3>
          <p>Order information is not available</p>
        </div>
        <div className="form-actions">
          <Button type="button" variant="outline" onClick={onCancel}>
            Close
          </Button>
        </div>
      </Card>
    );
  }

  const [refundType, setRefundType] = useState('');
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const refundTypes = [
    { value: 'full_refund', label: 'Full Refund' },
    { value: 'partial_refund', label: 'Partial Refund' },
    { value: 'exchange', label: 'Exchange Product' }
  ];

  const refundReasons = [
    { value: 'damaged_product', label: 'Product arrived damaged' },
    { value: 'wrong_item', label: 'Wrong item received' },
    { value: 'not_as_described', label: 'Product not as described' },
    { value: 'missing_parts', label: 'Missing parts/accessories' },
    { value: 'quality_issue', label: 'Poor quality' },
    { value: 'late_delivery', label: 'Extremely late delivery' },
    { value: 'other', label: 'Other reason' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!refundType || !reason) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onSubmit({
        orderId: order.id,
        action: 'REQUEST_REFUND',
        refundType,
        reason,
        description,
        requestedAmount: refundType === 'partial_refund' ? 
          document.getElementById('refundAmount').value : order.total_price
      });
    } catch (err) {
      setError('Failed to submit refund request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="order-form">
      <div className="form-header">
        <h3>Request Refund - Order #{order.id}</h3>
        <p>Submit a refund request for this order</p>
      </div>

      <form onSubmit={handleSubmit}>
        {error && <Alert type="error">{error}</Alert>}

        <div className="form-section">
          <Select
            label="Refund Type *"
            options={refundTypes}
            value={refundType}
            onChange={(e) => setRefundType(e.target.value)}
            required
          />
        </div>

        {refundType === 'partial_refund' && (
          <div className="form-section">
            <Input
              label="Refund Amount *"
              id="refundAmount"
              type="number"
              min="1"
              max={order.total_price || 0}
              placeholder={`Maximum: $${order.total_price || 0}`}
              required
            />
          </div>
        )}

        <div className="form-section">
          <Select
            label="Refund Reason *"
            options={refundReasons}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
          />
        </div>

        <div className="form-section">
          <TextArea
            label="Detailed Description *"
            rows={4}
            placeholder="Please provide detailed information about why you're requesting a refund. Include any relevant details about the issue..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        <div className="form-section">
          <label className="file-upload-label">
            Upload Evidence (Optional)
            <input type="file" accept="image/*,.pdf" multiple />
            <small>Photos, videos, or documents supporting your refund request</small>
          </label>
        </div>

        <div className="order-summary">
          <h4>Order Details</h4>
          <div className="summary-item">
            <span>Product:</span>
            <span>{order.product_details?.title || 'Product'}</span>
          </div>
          <div className="summary-item">
            <span>Order Date:</span>
            <span>{order.created_at ? new Date(order.created_at).toLocaleDateString() : 'Unknown'}</span>
          </div>
          <div className="summary-item">
            <span>Total Paid:</span>
            <span>${order.total_price || 0}</span>
          </div>
        </div>

        <div className="form-actions">
          <Button 
            type="submit" 
            variant="primary" 
            loading={loading}
            disabled={!refundType || !reason || !description.trim()}
          >
            Submit Refund Request
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>

        <div className="form-notice">
          <p>📞 <strong>Support:</strong> Our team will review your request within 24-48 hours. 
          You may be contacted for additional information.</p>
        </div>
      </form>
    </Card>
  );
};

export const BuyerDeliveryConfirmationForm = ({ order, onSubmit, onCancel }) => {
  // Safety check for null order
  if (!order) {
    return (
      <Card className="order-form">
        <div className="form-header">
          <h3>Error</h3>
          <p>Order information is not available</p>
        </div>
        <div className="form-actions">
          <Button type="button" variant="outline" onClick={onCancel}>
            Close
          </Button>
        </div>
      </Card>
    );
  }

  const [condition, setCondition] = useState('');
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);

  const conditions = [
    { value: 'excellent', label: 'Excellent - Perfect condition' },
    { value: 'good', label: 'Good - Minor issues' },
    { value: 'fair', label: 'Fair - Noticeable issues' },
    { value: 'poor', label: 'Poor - Significant problems' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onSubmit({
        orderId: order.id,
        action: 'CONFIRM_DELIVERY',
        condition,
        rating,
        feedback,
        confirmedAt: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="order-form">
      <div className="form-header">
        <h3>Confirm Delivery - Order #{order.id}</h3>
        <p>Please confirm you've received your order</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-section">
          <Select
            label="Product Condition *"
            options={conditions}
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            required
          />
        </div>

        <div className="form-section">
          <label className="rating-label">
            Delivery Experience Rating *
            <div className="star-rating">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={`star ${star <= rating ? 'active' : ''}`}
                  onClick={() => setRating(star)}
                >
                  ⭐
                </button>
              ))}
            </div>
            <small>Rate your overall delivery experience</small>
          </label>
        </div>

        <div className="form-section">
          <TextArea
            label="Delivery Feedback (Optional)"
            rows={3}
            placeholder="Any comments about the delivery process, packaging, or overall experience..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
          />
        </div>

        <div className="delivery-checklist">
          <h4>Please verify:</h4>
          <label className="checkbox-label">
            <input type="checkbox" required />
            <span>I have received the complete order</span>
          </label>
          <label className="checkbox-label">
            <input type="checkbox" required />
            <span>The product matches the description</span>
          </label>
          <label className="checkbox-label">
            <input type="checkbox" required />
            <span>I understand this confirms successful delivery</span>
          </label>
        </div>

        <div className="form-actions">
          <Button 
            type="submit" 
            variant="success" 
            loading={loading}
            disabled={!condition || rating === 0}
          >
            Confirm Successful Delivery
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Not Yet Received
          </Button>
        </div>

        <div className="form-notice">
          <p>✅ <strong>Note:</strong> Confirming delivery completes your order. 
          You can still request a refund later if issues arise.</p>
        </div>
      </form>
    </Card>
  );
};