import { Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Topbar = ({ title }) => {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-forest-200 px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
      <div>
        {title && (
          <>
            <h1 className="page-title text-xl sm:text-2xl">{title}</h1>
            <div className="page-title-rule" />
          </>
        )}
      </div>
      <button
        type="button"
        onClick={() => navigate('/notifications')}
        className="relative p-2 rounded-lg hover:bg-forest-50 text-forest-400 transition-colors"
        aria-label="Notifications"
      >
        <Bell size={20} />
      </button>
    </header>
  );
};

export default Topbar;
