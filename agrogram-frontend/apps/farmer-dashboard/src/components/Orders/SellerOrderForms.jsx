import React, { useState } from 'react';
import { Card, Button, Input, TextArea, Select, Alert, DatePicker } from '@agro-gram/ui';

export const SellerOrderConfirmationForm = ({ order, onSubmit, onCancel }) => {
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

  const [processingTime, setProcessingTime] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const processingTimes = [
    { value: '1', label: '1 business day' },
    { value: '2', label: '2 business days' },
    { value: '3', label: '3 business days' },
    { value: '5', label: '5 business days' },
    { value: '7', label: '1 week' },
    { value: 'custom', label: 'Custom timeframe' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!processingTime) {
      setError('Please select processing time');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onSubmit({
        orderId: order.id,
        action: 'CONFIRM_ORDER',
        processingTime,
        notes,
        estimatedShipDate: calculateShipDate(processingTime),
        confirmedAt: new Date().toISOString()
      });
    } catch (err) {
      setError('Failed to confirm order');
    } finally {
      setLoading(false);
    }
  };

  const calculateShipDate = (time) => {
    const days = parseInt(time) || 3;
    const shipDate = new Date();
    shipDate.setDate(shipDate.getDate() + days);
    return shipDate.toISOString();
  };

  return (
    <Card className="order-form">
      <div className="form-header">
        <h3>Confirm Order #{order.id}</h3>
        <p>Confirm you can fulfill this order</p>
      </div>

      <form onSubmit={handleSubmit}>
        {error && <Alert type="error">{error}</Alert>}

        <div className="form-section">
          <Select
            label="Estimated Processing Time *"
            options={processingTimes}
            value={processingTime}
            onChange={(e) => setProcessingTime(e.target.value)}
            required
          />
          {processingTime === 'custom' && (
            <Input
              label="Custom Processing Time"
              placeholder="e.g., 10-14 business days"
              required
            />
          )}
        </div>

        <div className="form-section">
          <TextArea
            label="Order Notes (Optional)"
            rows={3}
            placeholder="Any special notes for the buyer, production details, or additional information..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <div className="order-summary">
          <h4>Order Commitment</h4>
          <div className="summary-item">
            <span>Buyer:</span>
            <span>{order.buyer_name || order.buyer_email || 'Unknown'}</span>
          </div>
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

        <div className="commitment-checklist">
          <h4>By confirming, you agree to:</h4>
          <label className="checkbox-label">
            <input type="checkbox" required />
            <span>Process and ship this order within the specified timeframe</span>
          </label>
          <label className="checkbox-label">
            <input type="checkbox" required />
            <span>Provide quality products as described</span>
          </label>
          <label className="checkbox-label">
            <input type="checkbox" required />
            <span>Maintain communication with the buyer</span>
          </label>
        </div>

        <div className="form-actions">
          <Button 
            type="submit" 
            variant="success" 
            loading={loading}
            disabled={!processingTime}
          >
            Confirm Order
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
};

export const SellerOrderRejectionForm = ({ order, onSubmit, onCancel }) => {
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
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const rejectionReasons = [
    { value: 'out_of_stock', label: 'Product out of stock' },
    { value: 'production_issue', label: 'Production issues' },
    { value: 'pricing_error', label: 'Pricing error' },
    { value: 'cannot_fulfill', label: 'Cannot fulfill order requirements' },
    { value: 'suspicious_order', label: 'Suspicious order activity' },
    { value: 'other', label: 'Other reason' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!reason.trim()) {
      setError('Please select a rejection reason');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onSubmit({
        orderId: order.id,
        action: 'REJECT_ORDER',
        reason,
        details,
        rejectedAt: new Date().toISOString()
      });
    } catch (err) {
      setError('Failed to reject order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="order-form">
      <div className="form-header">
        <h3>Reject Order #{order.id}</h3>
        <p>Please provide reason for rejecting this order</p>
      </div>

      <form onSubmit={handleSubmit}>
        {error && <Alert type="error">{error}</Alert>}

        <div className="form-section">
          <Select
            label="Rejection Reason *"
            options={rejectionReasons}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
          />
        </div>

        <div className="form-section">
          <TextArea
            label="Detailed Explanation *"
            rows={4}
            placeholder="Please provide a detailed explanation for rejecting this order. This will be shared with the buyer..."
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            required
          />
        </div>

        <div className="form-section">
          <label className="checkbox-label">
            <input type="checkbox" required />
            <span>I understand this action cannot be undone and the buyer will be notified</span>
          </label>
        </div>

        <div className="order-summary">
          <h4>Order Being Rejected</h4>
          <div className="summary-item">
            <span>Buyer:</span>
            <span>{order.buyer_name || order.buyer_email || 'Unknown'}</span>
          </div>
          <div className="summary-item">
            <span>Product:</span>
            <span>{order.product_details?.title || 'Product'}</span>
          </div>
          <div className="summary-item">
            <span>Order Total:</span>
            <span>${order.total_price || 0}</span>
          </div>
        </div>

        <div className="form-actions">
          <Button 
            type="submit" 
            variant="error" 
            loading={loading}
            disabled={!reason || !details.trim()}
          >
            Confirm Rejection
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Go Back
          </Button>
        </div>

        <div className="form-notice">
          <p>⚠️ <strong>Important:</strong> Frequent order rejections may affect your seller rating and visibility.</p>
        </div>
      </form>
    </Card>
  );
};

export const SellerShippingForm = ({ order, onSubmit, onCancel }) => {
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

  const [carrier, setCarrier] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [shipDate, setShipDate] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const carriers = [
    { value: 'fedex', label: 'FedEx' },
    { value: 'ups', label: 'UPS' },
    { value: 'usps', label: 'USPS' },
    { value: 'dhl', label: 'DHL' },
    { value: 'other', label: 'Other carrier' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!carrier || !trackingNumber.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onSubmit({
        orderId: order.id,
        action: 'MARK_SHIPPED',
        carrier,
        trackingNumber,
        shipDate: shipDate || new Date().toISOString(),
        notes,
        shippedAt: new Date().toISOString()
      });
    } catch (err) {
      setError('Failed to update shipping information');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="order-form">
      <div className="form-header">
        <h3>Mark as Shipped - Order #{order.id}</h3>
        <p>Update shipping information for this order</p>
      </div>

      <form onSubmit={handleSubmit}>
        {error && <Alert type="error">{error}</Alert>}

        <div className="form-section">
          <Select
            label="Shipping Carrier *"
            options={carriers}
            value={carrier}
            onChange={(e) => setCarrier(e.target.value)}
            required
          />
        </div>

        <div className="form-section">
          <Input
            label="Tracking Number *"
            type="text"
            placeholder="Enter tracking number"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            required
          />
        </div>

        <div className="form-section">
          <Input
            label="Ship Date"
            type="date"
            value={shipDate}
            onChange={(e) => setShipDate(e.target.value)}
          />
        </div>

        <div className="form-section">
          <TextArea
            label="Shipping Notes (Optional)"
            rows={3}
            placeholder="Any special shipping instructions, packaging details, or notes for the buyer..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <div className="shipping-checklist">
          <h4>Shipping Verification:</h4>
          <label className="checkbox-label">
            <input type="checkbox" required />
            <span>Package is properly sealed and labeled</span>
          </label>
          <label className="checkbox-label">
            <input type="checkbox" required />
            <span>All items are included in the shipment</span>
          </label>
          <label className="checkbox-label">
            <input type="checkbox" required />
            <span>Tracking information is accurate</span>
          </label>
        </div>

        <div className="form-actions">
          <Button 
            type="submit" 
            variant="primary" 
            loading={loading}
            disabled={!carrier || !trackingNumber.trim()}
          >
            Confirm Shipped
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>

        <div className="form-notice">
          <p>📦 <strong>Note:</strong> The buyer will be notified with tracking information once confirmed.</p>
        </div>
      </form>
    </Card>
  );
};

export const SellerRefundProcessingForm = ({ order, onSubmit, onCancel }) => {
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

  const [refundAmount, setRefundAmount] = useState(order.total_price || 0);
  const [refundMethod, setRefundMethod] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const refundMethods = [
    { value: 'original_payment', label: 'Refund to original payment method' },
    { value: 'store_credit', label: 'Issue store credit' },
    { value: 'bank_transfer', label: 'Bank transfer' },
    { value: 'other', label: 'Other method' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!refundMethod || refundAmount <= 0) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onSubmit({
        orderId: order.id,
        action: 'PROCESS_REFUND',
        refundAmount,
        refundMethod,
        notes,
        processedAt: new Date().toISOString()
      });
    } catch (err) {
      setError('Failed to process refund');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="order-form">
      <div className="form-header">
        <h3>Process Refund - Order #{order.id}</h3>
        <p>Process refund for the requested amount</p>
      </div>

      <form onSubmit={handleSubmit}>
        {error && <Alert type="error">{error}</Alert>}

        <div className="form-section">
          <Input
            label="Refund Amount *"
            type="number"
            min="0.01"
            max={order.total_price || 0}
            step="0.01"
            value={refundAmount}
            onChange={(e) => setRefundAmount(parseFloat(e.target.value))}
            required
          />
          <small>Maximum refundable amount: ${order.total_price || 0}</small>
        </div>

        <div className="form-section">
          <Select
            label="Refund Method *"
            options={refundMethods}
            value={refundMethod}
            onChange={(e) => setRefundMethod(e.target.value)}
            required
          />
        </div>

        <div className="form-section">
          <TextArea
            label="Refund Notes (Optional)"
            rows={3}
            placeholder="Any notes about the refund process, reasons, or communication with the buyer..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <div className="refund-summary">
          <h4>Refund Summary</h4>
          <div className="summary-item">
            <span>Original Order Total:</span>
            <span>${order.total_price || 0}</span>
          </div>
          <div className="summary-item">
            <span>Refund Amount:</span>
            <span className="refund-amount">${refundAmount}</span>
          </div>
          {refundAmount < (order.total_price || 0) && (
            <div className="summary-item">
              <span>Amount Retained:</span>
              <span>${((order.total_price || 0) - refundAmount).toFixed(2)}</span>
            </div>
          )}
        </div>

        <div className="form-actions">
          <Button 
            type="submit" 
            variant="primary" 
            loading={loading}
            disabled={!refundMethod || refundAmount <= 0}
          >
            Process Refund
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>

        <div className="form-notice">
          <p>💰 <strong>Processing Time:</strong> Refunds typically take 3-5 business days to appear in the buyer's account.</p>
        </div>
      </form>
    </Card>
  );
};