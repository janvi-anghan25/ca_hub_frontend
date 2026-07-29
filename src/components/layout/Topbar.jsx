import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { notificationApi } from '../../api/notificationApi';

const Topbar = ({ title }) => {
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await notificationApi.getUnreadCount();
        setUnreadCount(res.data?.data?.count || 0);
      } catch {
        // Ignore silent error
      }
    };

    fetchUnread();

    const handleRefresh = () => fetchUnread();
    window.addEventListener('notificationRead', handleRefresh);

    const interval = setInterval(fetchUnread, 15000);

    return () => {
      window.removeEventListener('notificationRead', handleRefresh);
      clearInterval(interval);
    };
  }, []);

  return (
    <header className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-forest-200 px-3 sm:px-6 py-3 flex items-center justify-between gap-3">
      <div className="min-w-0">
        {title && (
          <>
            <h1 className="page-title text-lg sm:text-2xl truncate">{title}</h1>
            <div className="page-title-rule" />
          </>
        )}
      </div>
      <button
        type="button"
        onClick={() => navigate('/notifications')}
        className="relative p-2 rounded-lg hover:bg-forest-50 text-forest-400 transition-colors flex-shrink-0"
        aria-label="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
    </header>
  );
};

export default Topbar;
