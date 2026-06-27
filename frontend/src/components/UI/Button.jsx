import { motion } from 'framer-motion';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  loading = false,
  icon = null,
  onClick,
  type = 'button',
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all duration-200 focus:outline-none focus:ring-4 disabled:pointer-events-none disabled:opacity-55';

  const variants = {
    primary: 'bg-blue-600 text-white shadow-sm shadow-blue-600/20 hover:bg-blue-700 focus:ring-blue-600/20',
    secondary: 'bg-slate-900 text-white shadow-sm shadow-slate-900/10 hover:bg-slate-800 focus:ring-slate-900/15',
    outline: 'border border-slate-300 bg-white text-slate-800 hover:border-blue-300 hover:text-blue-700 hover:bg-blue-50 focus:ring-blue-600/15',
    ghost: 'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-950 focus:ring-slate-900/10',
    danger: 'bg-red-600 text-white shadow-sm hover:bg-red-700 focus:ring-red-600/20',
    success: 'bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 focus:ring-emerald-600/20',
  };

  const sizes = {
    sm: 'h-9 px-3 text-sm',
    md: 'h-11 px-4 text-sm',
    lg: 'h-12 px-5 text-base',
    xl: 'h-14 px-7 text-base',
  };

  return (
    <motion.button
      whileHover={{ y: disabled || loading ? 0 : -1 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      type={type}
      className={`${baseClasses} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading ? (
        <>
          <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
          <span>Loading</span>
        </>
      ) : (
        <>
          {icon && <span className="inline-flex shrink-0 items-center">{icon}</span>}
          {children}
        </>
      )}
    </motion.button>
  );
};

export default Button;
