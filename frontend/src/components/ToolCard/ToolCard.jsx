import { Link } from "react-router-dom";
import { FaArrowRight, FaSlidersH } from "react-icons/fa";
import { motion } from "framer-motion";

const categoryStyles = {
  "PDF Tools": {
    icon: "bg-rose-50 text-rose-600 ring-rose-100",
    badge: "bg-rose-50 text-rose-700 border-rose-100",
  },
  "Image Tools": {
    icon: "bg-purple-50 text-purple-600 ring-purple-100",
    badge: "bg-purple-50 text-purple-700 border-purple-100",
  },
  "Video Tools": {
    icon: "bg-cyan-50 text-cyan-600 ring-cyan-100",
    badge: "bg-cyan-50 text-cyan-700 border-cyan-100",
  },
  "Audio Tools": {
    icon: "bg-amber-50 text-amber-600 ring-amber-100",
    badge: "bg-amber-50 text-amber-700 border-amber-100",
  },
  "Archive Tools": {
    icon: "bg-emerald-50 text-emerald-600 ring-emerald-100",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-100",
  },
};

const defaultStyle = {
  icon: "bg-blue-50 text-blue-600 ring-blue-100",
  badge: "bg-blue-50 text-blue-700 border-blue-100",
};

export default function ToolCard({ tool }) {
  const styles = categoryStyles[tool.category] || defaultStyle;

  return (
    <motion.article
      whileHover={{ y: -4 }}
      transition={{ duration: 0.18 }}
      className="h-full"
    >
      <Link
        to={`/tool/${tool.id}`}
        className="group flex h-full min-h-56 flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/5 transition-all duration-200 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-950/10 focus-ring"
        aria-label={`Open ${tool.name}`}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg text-sm font-black ring-1 ${styles.icon}`}>
            {tool.icon}
          </div>

          {tool.hasSettings && (
            <span
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-500"
              title="Includes options"
            >
              <FaSlidersH className="text-xs" />
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col">
          {tool.category && (
            <span className={`mb-3 w-fit rounded-full border px-2.5 py-1 text-xs font-bold ${styles.badge}`}>
              {tool.category}
            </span>
          )}

          <h3 className="text-lg font-black leading-snug text-slate-950">
            {tool.name}
          </h3>
          <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-500">
            {tool.description}
          </p>

          <div className="mt-auto flex items-center justify-between pt-6 text-sm font-bold text-blue-600">
            <span>Open tool</span>
            <FaArrowRight className="text-xs transition-transform duration-200 group-hover:translate-x-1" />
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
