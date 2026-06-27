import { Outlet, Link } from 'react-router-dom';
import { FaArrowLeft, FaFilePdf } from 'react-icons/fa';
import { motion } from 'framer-motion';

const AuthLayout = () => {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-4 py-24">
      <div className="absolute inset-0 soft-grid opacity-70" />
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-white to-transparent" />

      <Link
        to="/"
        className="focus-ring absolute left-4 top-4 z-10 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-white hover:text-slate-950 sm:left-6 sm:top-6"
      >
        <FaArrowLeft className="text-xs" />
        Back home
      </Link>

      <div className="relative z-10 w-full max-w-md">
        <Link to="/" className="mx-auto mb-8 flex w-max items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm shadow-blue-600/20">
            <FaFilePdf />
          </span>
          <span>
            <span className="block text-xl font-black tracking-tight text-slate-950">ConvertHub</span>
            <span className="block text-xs font-semibold uppercase tracking-widest text-slate-400">Secure file tools</span>
          </span>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <Outlet />
        </motion.div>
      </div>
    </div>
  );
};

export default AuthLayout;
