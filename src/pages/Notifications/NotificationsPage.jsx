import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, Info } from 'lucide-react';
import { notificationApi } from '../../api/notificationApi';
import { SectionLoader } from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await notificationApi.getAll({ limit: 50 });
      setNotifications(data.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const markAllRead = async () => {
    await notificationApi.markAllRead();
    toast.success('All marked as read');
    window.dispatchEvent(new Event('notificationRead'));
    load();
  };

  const handleNotificationClick = async (n) => {
    if (!n.isRead) {
      try {
        await notificationApi.markRead(n._id);
        window.dispatchEvent(new Event('notificationRead'));
        setNotifications((prev) =>
          prev.map((item) => (item._id === n._id ? { ...item, isRead: true } : item))
        );
      } catch (err) {
        console.error('Failed to mark notification as read:', err);
      }
    }

    const taskId = n.data?.taskId;
    if (taskId || n.type === 'TASK_ASSIGNED' || n.type === 'TASK_COMPLETED') {
      navigate('/tasks', { state: { taskId } });
    } else if (n.type === 'GST_FILED' || n.data?.gstReturnId) {
      navigate('/gst');
    } else if (n.type === 'ITR_FILED' || n.data?.itrReturnId) {
      navigate('/itr');
    } else if (n.type === 'INVOICE_CREATED' || n.data?.invoiceId) {
      navigate('/invoices');
    } else if (n.type === 'DOCUMENT_UPLOADED' || n.data?.documentId) {
      navigate('/documents');
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Notifications</h1>
          {unreadCount > 0 && <p className="text-sm text-forest-400">{unreadCount} unread</p>}
        </div>
        {unreadCount > 0 && (
          <button className="btn-secondary btn-sm" onClick={markAllRead}>
            <CheckCheck size={14} /> Mark All Read
          </button>
        )}
      </div>

      <div className="card p-0">
        {loading ? <SectionLoader /> : notifications.length === 0 ? (
          <EmptyState icon={Bell} title="No notifications" description="You're all caught up!" />
        ) : (
          <div className="divide-y divide-forest-100">
            {notifications.map((n) => (
              <div
                key={n._id}
                onClick={() => handleNotificationClick(n)}
                className={`flex items-start gap-4 px-5 py-4 cursor-pointer hover:bg-forest-50 transition-colors ${!n.isRead ? 'bg-forest-50/50' : ''}`}
              >
                <div className={`mt-0.5 p-2 rounded-lg flex-shrink-0 ${!n.isRead ? 'bg-forest-100' : 'bg-forest-50'}`}>
                  <Info size={16} className={!n.isRead ? 'text-forest-500' : 'text-forest-400'} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${!n.isRead ? 'font-semibold text-forest' : 'text-forest-500'}`}>{n.title}</p>
                  <p className="text-xs text-forest-400 mt-0.5">{n.message}</p>
                  <p className="text-xs text-forest-400 mt-1">{formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}</p>
                </div>
                {!n.isRead && <div className="w-2 h-2 bg-forest rounded-full mt-2 flex-shrink-0" />}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
