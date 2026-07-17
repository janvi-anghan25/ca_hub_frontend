import { Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Topbar = ({ title }) => {
  const navigate = useNavigate();

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
      </button>
    </header>
  );
};

export default Topbar;
