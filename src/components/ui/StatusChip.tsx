import { OrderStatus, ReturnStatus } from '../../lib/types';

interface StatusChipProps {
  status: OrderStatus | ReturnStatus | string;
  variant?: 'order' | 'return' | 'default';
}

const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
  PENDING: { bg: '#FFF3CD', text: '#856404', label: 'Pending' },
  CONFIRMED: { bg: '#D1ECF1', text: '#0C5460', label: 'Confirmed' },
  PROCESSING: { bg: '#D1ECF1', text: '#0C5460', label: 'Processing' },
  SHIPPED: { bg: '#CCE5FF', text: '#004085', label: 'Shipped' },
  OUT_FOR_DELIVERY: { bg: '#CCE5FF', text: '#004085', label: 'Out for Delivery' },
  DELIVERED: { bg: '#D4EDDA', text: '#155724', label: 'Delivered' },
  CANCELLED: { bg: '#F8D7DA', text: '#721C24', label: 'Cancelled' },
  RETURNED: { bg: '#F8D7DA', text: '#721C24', label: 'Returned' },
  REFUNDED: { bg: '#D4EDDA', text: '#155724', label: 'Refunded' },
  REQUESTED: { bg: '#FFF3CD', text: '#856404', label: 'Requested' },
  APPROVED: { bg: '#D1ECF1', text: '#0C5460', label: 'Approved' },
  PICKUP_SCHEDULED: { bg: '#CCE5FF', text: '#004085', label: 'Pickup Scheduled' },
  PICKED_UP: { bg: '#CCE5FF', text: '#004085', label: 'Picked Up' },
  IN_TRANSIT: { bg: '#CCE5FF', text: '#004085', label: 'In Transit' },
  RECEIVED: { bg: '#D1ECF1', text: '#0C5460', label: 'Received' },
  INSPECTED: { bg: '#D1ECF1', text: '#0C5460', label: 'Inspected' },
  APPROVED_FOR_REFUND: { bg: '#D4EDDA', text: '#155724', label: 'Approved for Refund' },
  REJECTED: { bg: '#F8D7DA', text: '#721C24', label: 'Rejected' },
  REPLACED: { bg: '#D4EDDA', text: '#155724', label: 'Replaced' },
};

export function StatusChip({ status }: StatusChipProps) {
  const config = statusConfig[status] || { bg: '#E2E3E5', text: '#383D41', label: status };

  return (
    <span
      style={{
        display: 'inline-block',
        padding: '4px 12px',
        borderRadius: '12px',
        fontSize: '14px',
        fontWeight: 500,
        backgroundColor: config.bg,
        color: config.text,
      }}
      role="status"
      aria-label={`Status: ${config.label}`}
    >
      {config.label}
    </span>
  );
}
