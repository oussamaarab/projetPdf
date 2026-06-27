import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaArchive,
  FaArrowRight,
  FaBars,
  FaChevronDown,
  FaCog,
  FaFilePdf,
  FaHistory,
  FaImage,
  FaMusic,
  FaSearch,
  FaSignOutAlt,
  FaStar,
  FaTimes,
  FaUser,
  FaVideo,
} from 'react-icons/fa';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';

const navLinks = [
  { label: 'PDF Tools', to: '/pdf-tools', icon: FaFilePdf, tone: 'text-rose-600 bg-rose-50' },
  { label: 'Image Tools', to: '/image-tools', icon: FaImage, tone: 'text-purple-600 bg-purple-50' },
  { label: 'Video Tools', to: '/video-tools', icon: FaVideo, tone: 'text-cyan-600 bg-cyan-50' },
  { label: 'Audio Tools', to: '/audio-tools', icon: FaMusic, tone: 'text-amber-600 bg-amber-50' },
  { label: 'Archive Tools', to: '/archive-tools', icon: FaArchive, tone: 'text-emerald-600 bg-emerald-50' },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    setUserMenuOpen(false);
    setMenuOpen(false);
    navigate('/login');
  };

  return (
    <header className={`sticky top-0 z-50 border-b transition-all duration-200 ${
      scrolled ? 'border-slate-200 bg-white/90 shadow-sm backdrop-blur-xl' : 'border-transparent bg-white/80 backdrop-blur-xl'
    }`}>
      <div className="page-shell flex h-16 items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm shadow-blue-600/20">
            <FaFilePdf />
          </span>
          <span>
            <span className="block text-lg font-black tracking-tight text-slate-950">ConvertHub</span>
            <span className="block text-[10px] font-bold uppercase tracking-widest text-slate-400">Online tools</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          <div
            className="relative"
            onMouseEnter={() => setMegaMenuOpen(true)}
            onMouseLeave={() => setMegaMenuOpen(false)}
          >
            <button
              type="button"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
            >
              Tools
              <FaChevronDown className="text-xs" />
            </button>

            <AnimatePresence>
              {megaMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="absolute left-0 top-full mt-3 w-[440px] rounded-xl border border-slate-200 bg-white p-3 shadow-2xl shadow-slate-900/10"
                >
                  <div className="grid gap-1">
                    {navLinks.map((link) => (
                      <Link
                        key={link.to}
                        to={link.to}
                        onClick={() => setMegaMenuOpen(false)}
                        className="group flex items-center gap-3 rounded-lg p-3 transition hover:bg-slate-50"
                      >
                        <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${link.tone}`}>
                          <link.icon />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-bold text-slate-900">{link.label}</span>
                          <span className="block text-xs text-slate-500">Convert, compress, and manage files</span>
                        </span>
                        <FaArrowRight className="text-xs text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-blue-600" />
                      </Link>
                    ))}
                  </div>
                  <Link
                    to="/all-tools"
                    onClick={() => setMegaMenuOpen(false)}
                    className="mt-2 flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-bold text-blue-700 transition hover:bg-blue-50"
                  >
                    View all tools
                    <FaArrowRight className="text-xs" />
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Link to="/pricing" className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950">
            Pricing
          </Link>
          <Link to="/about" className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950">
            About
          </Link>
          <Link to="/contact" className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950">
            Contact
          </Link>
        </nav>

        <div className="hidden min-w-0 flex-1 justify-center xl:flex">
          <div className="relative w-full max-w-xs">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search tools"
              className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-600/10"
            />
          </div>
        </div>

        <div className="hidden items-center gap-2 lg:flex">
          {isAuthenticated ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserMenuOpen((open) => !open)}
                className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <FaUser className="text-xs text-slate-400" />
                {user?.name || 'Account'}
                <FaChevronDown className="text-xs text-slate-400" />
              </button>

              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="absolute right-0 top-full mt-3 w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-2xl shadow-slate-900/10"
                  >
                    {[
                      { to: '/dashboard', icon: FaUser, label: 'Dashboard' },
                      { to: '/history', icon: FaHistory, label: 'History' },
                      { to: '/favorites', icon: FaStar, label: 'Favorites' },
                      { to: '/settings', icon: FaCog, label: 'Settings' },
                    ].map((item) => (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
                      >
                        <item.icon className="text-slate-400" />
                        {item.label}
                      </Link>
                    ))}
                    <div className="my-2 border-t border-slate-200" />
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                    >
                      <FaSignOutAlt />
                      Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <>
              <Link to="/login" className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950">
                Sign in
              </Link>
              <Link
                to="/register"
                className="group relative inline-flex h-10 items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-blue-700/20 ring-1 ring-blue-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-700/30 focus:outline-none focus:ring-4 focus:ring-blue-600/20"
              >
                <span>Get Started</span>
                <FaArrowRight className="text-xs transition-transform duration-300 group-hover:translate-x-0.5" />
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          className="rounded-lg border border-slate-200 p-2 text-slate-700 transition hover:bg-slate-100 lg:hidden"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        >
          {menuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-slate-200 bg-white lg:hidden"
          >
            <div className="page-shell space-y-4 py-4">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search tools"
                  className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-600/10"
                />
              </div>

              <div className="grid gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                  >
                    <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${link.tone}`}>
                      <link.icon />
                    </span>
                    {link.label}
                  </Link>
                ))}
                {[
                  { to: '/all-tools', label: 'All Tools' },
                  { to: '/pricing', label: 'Pricing' },
                  { to: '/about', label: 'About' },
                  { to: '/contact', label: 'Contact' },
                ].map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMenuOpen(false)}
                    className="rounded-lg px-3 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3 border-t border-slate-200 pt-4">
                {isAuthenticated ? (
                  <>
                    <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="rounded-lg bg-blue-600 px-4 py-3 text-center text-sm font-bold text-white">
                      Dashboard
                    </Link>
                    <button type="button" onClick={handleLogout} className="rounded-lg border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700">
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setMenuOpen(false)} className="rounded-lg border border-slate-200 px-4 py-3 text-center text-sm font-bold text-slate-700">
                      Sign in
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setMenuOpen(false)}
                      className="group relative inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-center text-sm font-bold text-white shadow-lg shadow-blue-700/20 ring-1 ring-blue-500/20 transition-all duration-300 hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-700/30 focus:outline-none focus:ring-4 focus:ring-blue-600/20"
                    >
                      <span>Get Started</span>
                      <FaArrowRight className="text-xs transition-transform duration-300 group-hover:translate-x-0.5" />
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
