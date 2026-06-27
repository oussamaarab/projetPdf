import { motion } from 'framer-motion';

const Card = ({
  children,
  className = '',
  hover = true,
  glass = false,
  ...props
}) => {
  const baseClasses = `
    rounded-xl border p-6 transition-all duration-200
    ${glass ? 'border-white/15 bg-white/10 text-white backdrop-blur-xl' : 'surface-card text-slate-900'}
  `;

  const Component = hover ? motion.div : 'div';
  const motionProps = hover
    ? {
        whileHover: { y: -3 },
        transition: { duration: 0.18 },
      }
    : {};

  return (
    <Component className={`${baseClasses} ${className}`} {...motionProps} {...props}>
      {children}
    </Component>
  );
};

export default Card;
