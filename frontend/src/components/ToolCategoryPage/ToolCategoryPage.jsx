import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import ToolCard from "../ToolCard/ToolCard";

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } }
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } }
};

/**
 * Reusable category page layout for all tool categories.
 * Props: tools[], title, subtitle, badgeText, badgeColor, heroGradient, icon
 */
export default function ToolCategoryPage({
  tools,
  title,
  subtitle,
  badgeText,
  badgeColor = "text-blue-600 bg-blue-50",
  heroGradient = "from-blue-600 to-indigo-600",
  icon
}) {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Hero Banner */}
      <div className={`relative bg-gradient-to-br ${heroGradient} text-white py-24 overflow-hidden`}>
        {/* Background texture */}
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.07)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white/5 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-black/10 blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-6 text-center">
          <Link
            to="/all-tools"
            className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm font-medium mb-8 transition"
          >
            <FaArrowLeft className="text-xs" />
            All Tools
          </Link>

          <div className="text-6xl mb-6">{icon}</div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className={`inline-block border border-white/20 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-5 ${badgeColor}`}>
              {badgeText}
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight mb-5 leading-tight">
              {title}
            </h1>
            <p className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
              {subtitle}
            </p>
          </motion.div>

          {/* Stats row */}
          <div className="mt-10 flex flex-wrap justify-center gap-8 text-sm">
            <div className="flex items-center gap-2 text-white/80">
              <span className="font-bold text-white text-lg">{tools.length}</span> tools available
            </div>
            <div className="flex items-center gap-2 text-white/80">
              <span className="font-bold text-white text-lg">100%</span> free
            </div>
            <div className="flex items-center gap-2 text-white/80">
              <span className="font-bold text-white text-lg">No</span> signup needed
            </div>
          </div>
        </div>
      </div>

      {/* Tools Grid */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
        >
          {tools.map((tool) => (
            <motion.div key={tool.id} variants={cardVariants} className="h-full flex flex-col">
              <ToolCard tool={tool} />
            </motion.div>
          ))}
        </motion.div>

        {/* Back Link */}
        <div className="mt-16 text-center">
          <Link
            to="/all-tools"
            className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 font-semibold text-sm transition"
          >
            <FaArrowLeft className="text-xs" />
            Back to All Tools
          </Link>
        </div>
      </div>
    </div>
  );
}
