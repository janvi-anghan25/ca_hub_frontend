import { useEffect, useMemo, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LogOut, X } from 'lucide-react';
import { filterNavGroups } from '../../config/navGroups';

const BrandMark = () => (
  <div className="w-9 h-9 rounded-lg bg-brass text-forest font-display font-bold text-sm flex items-center justify-center shadow-sm">
    CA
  </div>
);

const IconRailShell = ({
  groups,
  role,
  user,
  onLogout,
  brandSubtitle = 'CA Hub',
  children,
}) => {
  const location = useLocation();
  const visibleGroups = useMemo(() => filterNavGroups(groups, role), [groups, role]);
  const [openGroupId, setOpenGroupId] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const activeGroupId = useMemo(() => {
    for (const group of visibleGroups) {
      for (const link of group.links) {
        if (link.exact) {
          if (location.pathname === link.to) return group.id;
        } else if (location.pathname === link.to || location.pathname.startsWith(`${link.to}/`)) {
          return group.id;
        }
      }
    }
    return visibleGroups[0]?.id ?? null;
  }, [location.pathname, visibleGroups]);

  // Keep flyout mounted across in-app navigation — only close the mobile sheet.
  // Sync open group when the route lands in a different section (no close→reopen cycle).
  useEffect(() => {
    setOpenGroupId((current) => {
      if (!activeGroupId) return current;
      if (current === null) return activeGroupId;
      if (current !== activeGroupId) return activeGroupId;
      return current;
    });
    setMobileOpen(false);
  }, [location.pathname, activeGroupId]);

  useEffect(() => {
    if (!mobileOpen) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setMobileOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [mobileOpen]);

  const openGroup = visibleGroups.find((g) => g.id === openGroupId) ?? null;
  const flyoutId = openGroup ? `rail-flyout-${openGroup.id}` : undefined;

  const FlyoutLinks = ({ onNavigate, showHeader = true }) => (
    <div className="flex flex-col h-full">
      {showHeader && (
        <div className="px-4 pt-4 pb-3 border-b border-white/10">
          <p className="font-display text-parchment text-base">{openGroup?.label}</p>
          <p className="text-[10px] tracking-widest uppercase text-brass mt-1">{brandSubtitle}</p>
        </div>
      )}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5" aria-label={openGroup?.label}>
        {openGroup?.links.map(({ to, label, exact }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            onClick={onNavigate}
            className={({ isActive }) =>
              `rail-link ${isActive ? 'rail-link-active' : ''}`
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="px-3 py-3 border-t border-white/10 space-y-2">
        <button
          type="button"
          onClick={onLogout}
          className="rail-link w-full text-red-200 hover:text-white hover:bg-red-500/20"
        >
          <LogOut size={16} />
          Logout
        </button>
        <div className="flex items-center gap-2.5 px-2 py-2">
          <div className="w-8 h-8 rounded-full bg-brass/30 text-parchment font-semibold text-sm flex items-center justify-center">
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-parchment truncate">{user?.name || 'User'}</p>
            <p className="text-[10px] text-forest-300 capitalize">{role}</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-forest-50 overflow-hidden">
      <aside className="hidden lg:flex flex-col w-14 bg-forest flex-shrink-0 z-30" aria-label="Primary">
        <div className="h-14 flex items-center justify-center border-b border-white/10">
          <BrandMark />
        </div>
        <nav className="flex-1 flex flex-col items-center gap-2 py-3" aria-label="Sections">
          {visibleGroups.map((group) => {
            const Icon = group.icon;
            const active = group.id === activeGroupId;
            const open = group.id === openGroupId;
            return (
              <button
                key={group.id}
                type="button"
                title={group.label}
                aria-label={group.label}
                aria-expanded={open}
                aria-controls={open ? flyoutId : undefined}
                onClick={() => setOpenGroupId(open ? null : group.id)}
                className={`relative w-10 h-10 rounded-lg flex items-center justify-center transition-colors duration-rail ${
                  active || open
                    ? 'bg-white/10 text-parchment'
                    : 'text-forest-300 hover:bg-white/5 hover:text-parchment'
                }`}
              >
                <Icon size={18} aria-hidden />
                {active && (
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-brass rounded-full" />
                )}
              </button>
            );
          })}
        </nav>
      </aside>

      {openGroup && (
        <aside
          id={flyoutId}
          className="hidden lg:flex flex-col w-52 bg-forest-500 text-parchment shadow-rail flex-shrink-0 z-20"
          aria-label={`${openGroup.label} menu`}
        >
          {/* Desktop: navigate only — keep flyout open so the shell does not reload */}
          <FlyoutLinks />
        </aside>
      )}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {children}
      </div>

      <nav
        className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-forest border-t border-white/10 flex justify-around gap-0.5 px-0.5 py-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))] overflow-x-auto"
        aria-label="Sections"
      >
        {visibleGroups.map((group) => {
          const Icon = group.icon;
          const active = group.id === activeGroupId;
          return (
            <button
              key={group.id}
              type="button"
              aria-label={group.label}
              aria-expanded={mobileOpen && openGroupId === group.id}
              onClick={() => {
                setOpenGroupId(group.id);
                setMobileOpen(true);
              }}
              className={`flex flex-col items-center gap-0.5 min-w-[3rem] max-w-[4.5rem] flex-1 py-1.5 px-0.5 rounded-lg ${
                active ? 'text-brass' : 'text-forest-300'
              }`}
            >
              <Icon size={18} aria-hidden />
              <span className="text-[9px] font-medium truncate w-full text-center leading-tight">{group.label}</span>
            </button>
          );
        })}
      </nav>

      {mobileOpen && openGroup && (
        <div className="lg:hidden fixed inset-0 z-40" role="dialog" aria-modal="true" aria-label={openGroup.label}>
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute bottom-0 inset-x-0 max-h-[75vh] bg-forest-500 rounded-t-2xl shadow-rail flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <div>
                <p className="font-display text-parchment">{openGroup.label}</p>
                <p className="text-[10px] tracking-widest uppercase text-brass mt-0.5">{brandSubtitle}</p>
              </div>
              <button
                type="button"
                className="p-2 text-parchment"
                aria-label="Close menu"
                onClick={() => setMobileOpen(false)}
              >
                <X size={18} />
              </button>
            </div>
            <div className="overflow-y-auto pb-20">
              <FlyoutLinks onNavigate={() => setMobileOpen(false)} showHeader={false} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IconRailShell;
