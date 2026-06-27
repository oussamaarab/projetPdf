import { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  FaBars,
  FaBell,
  FaChartBar,
  FaCog,
  FaFilePdf,
  FaHistory,
  FaHome,
  FaKey,
  FaSearch,
  FaSignOutAlt,
  FaStar,
  FaTimes,
  FaUser,
  FaUsers,
} from 'react-icons/fa';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const userMenuItems = [
    { icon: FaHome, label: 'Overview', path: '/dashboard' },
    { icon: FaHistory, label: 'History', path: '/history' },
    { icon: FaStar, label: 'Favorites', path: '/favorites' },
    { icon: FaUser, label: 'Profile', path: '/profile' },
    { icon: FaCog, label: 'Settings', path: '/settings' },
  ];

  const adminMenuItems = [
    { icon: FaChartBar, label: 'Admin Dashboard', path: '/admin' },
    { icon: FaUsers, label: 'User Management', path: '/admin/users' },
    { icon: FaFilePdf, label: 'File Management', path: '/admin/files' },
    { icon: FaKey, label: 'API Logs', path: '/admin/api-logs' },
  ];

  const menuItems = isAdmin() ? [...userMenuItems, ...adminMenuItems] : userMenuItems;

  const sidebar = (
    <aside className="flex h-full w-72 flex-col border-r border-slate-200 bg-white">
      <div className="border-b border-slate-200 p-5">
        <Link to="/" className="flex items-center gap-3" onClick={() => setSidebarOpen(false)}>
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm shadow-blue-600/20">
            <FaFilePdf />
          </span>
          <span>
            <span className="block text-lg font-black text-slate-950">ConvertHub</span>
            <span className="block text-xs font-semibold uppercase tracking-widest text-slate-400">Dashboard</span>
          </span>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto p-4">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
                  active
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
                }`}
              >
                <item.icon className={active ? 'text-blue-600' : 'text-slate-400'} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="border-t border-slate-200 p-4">
        <div className="mb-4 flex items-center gap-3 rounded-lg bg-slate-50 p-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold text-slate-900">{user?.name || 'User'}</span>
            <span className="block truncate text-xs text-slate-500">{user?.email || 'user@example.com'}</span>
          </span>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"
        >
          <FaSignOutAlt />
          Logout
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex min-h-screen bg-slate-50">
      <div className="hidden lg:block">{sidebar}</div>

      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 34 }}
              className="fixed inset-y-0 left-0 z-50 lg:hidden"
            >
              {sidebar}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
            <button
              type="button"
              onClick={() => setSidebarOpen((open) => !open)}
              className="rounded-lg border border-slate-200 p-2 text-slate-700 transition hover:bg-slate-100 lg:hidden"
              aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
            >
              {sidebarOpen ? <FaTimes /> : <FaBars />}
            </button>

            <div className="relative hidden w-full max-w-xl sm:block">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search conversions and tools"
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-600/10"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                className="relative rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-100"
                aria-label="Notifications"
              >
                <FaBell />
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-blue-600" />
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
