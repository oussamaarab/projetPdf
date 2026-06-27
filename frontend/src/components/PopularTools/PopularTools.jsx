import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaArrowRight } from "react-icons/fa";
import ToolCard from "../ToolCard/ToolCard";
import { getAllTools } from "../../services/toolService";

const popularToolIds = [
  "merge-pdf",
  "split-pdf",
  "compress-pdf",
  "pdf-to-word",
  "word-to-pdf",
  "jpg-to-pdf",
  "pdf-to-jpg",
  "excel-to-pdf"
];

const allTools = getAllTools();
const popularTools = popularToolIds
  .map(id => allTools.find(t => t.id === id))
  .filter(Boolean);

const tabs = [
  { id: "all", label: "All Popular" },
  { id: "PDF Tools", label: "PDF" },
  { id: "Image Tools", label: "Image" },
  { id: "Video Tools", label: "Video" },
  { id: "Audio Tools", label: "Audio" },
  { id: "Archive Tools", label: "Archive" }
];

export default function PopularTools({ activeCategory, onSelectCategory }) {
  const filtered = activeCategory === "all"
    ? popularTools
    : allTools.filter(t => t.category === activeCategory).slice(0, 8);

  return (
    <section id="popular-tools" className="py-24 bg-white border-t border-slate-100 relative z-0">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-4 py-2 rounded-full mb-5">
            Most Used
          </span>
          <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight mb-5">
            Popular Conversion Tools
          </h2>
          <p className="text-lg text-slate-500 leading-relaxed">
            The most-used tools by our 500K+ community. Professional quality, zero hassle.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onSelectCategory(tab.id)}
              className={`relative px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                activeCategory === tab.id
                  ? "text-white shadow-md"
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-50 border border-slate-100"
              }`}
            >
              {activeCategory === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-blue-600 rounded-xl -z-10"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Grid */}
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((tool) => (
              <motion.div
                key={tool.id}
                layout
                initial={{ opacity: 0, scale: 0.93 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.93 }}
                transition={{ duration: 0.2 }}
                className="h-full flex flex-col"
              >
                <ToolCard tool={tool} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* CTA */}
        <div className="text-center mt-14">
          <Link
            to="/all-tools"
            className="group inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-600/25 focus:outline-none focus:ring-4 focus:ring-blue-600/20"
          >
            <span>View All 50+ Tools</span>
            <FaArrowRight className="text-xs transition-transform duration-300 group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
