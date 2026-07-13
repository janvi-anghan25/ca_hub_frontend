const STATUS_CONFIG = {
  Active: 'badge-green',
  Inactive: 'badge-gray',
  Filed: 'badge-green',
  'Late Filed': 'badge-red',
  Pending: 'badge-yellow',
  'Data Received': 'badge-blue',
  'In Progress': 'badge-blue',
  Paid: 'badge-green',
  'Partially Paid': 'badge-yellow',
  Overdue: 'badge-red',
  Cancelled: 'badge-gray',
  Done: 'badge-green',
  Todo: 'badge-gray',
  Review: 'badge-purple',
  High: 'badge-red',
  Urgent: 'badge-red',
  Medium: 'badge-yellow',
  Low: 'badge-green',
  Processed: 'badge-green',
  Received: 'badge-green',
  Revised: 'badge-purple',
  'Not Applicable': 'badge-gray',
};

const StatusBadge = ({ status }) => {
  const cls = STATUS_CONFIG[status] || 'badge-gray';
  return <span className={cls}>{status}</span>;
};

export default StatusBadge;
