import { useState } from "react";
import { motion } from "framer-motion";
import { FaSearch, FaFilePdf, FaImage, FaVideo, FaMusic, FaArchive, FaFire } from "react-icons/fa";
import ToolCard from "../components/ToolCard/ToolCard";
import { getAllTools, toolCategories } from "../services/toolService";

const allTools = getAllTools();

const categoryMeta = {
  all: { label: "All Tools", icon: <FaFire />, color: "text-blue-600 bg-blue-50" },
  pdf: { label: "PDF Tools", icon: <FaFilePdf />, color: "text-rose-600 bg-rose-50" },
  image: { label: "Image Tools", icon: <FaImage />, color: "text-purple-600 bg-purple-50" },
  video: { label: "Video Tools", icon: <FaVideo />, color: "text-cyan-600 bg-cyan-50" },
  audio: { label: "Audio Tools", icon: <FaMusic />, color: "text-amber-600 bg-amber-50" },
  archive: { label: "Archive Tools", icon: <FaArchive />, color: "text-emerald-600 bg-emerald-50" }
};

export default function AllTools() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const filtered = allTools.filter((tool) => {
    const matchSearch = search === "" ||
      tool.name.toLowerCase().includes(search.toLowerCase()) ||
      tool.description.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === "all" ||
      tool.category === toolCategories[activeCategory]?.name;
    return matchSearch && matchCat;
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-20">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-4 py-2 rounded-full mb-5">
            Complete Library
          </span>
          <h1 className="text-5xl sm:text-6xl font-black text-slate-900 tracking-tight mb-5">
            All{" "}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Conversion Tools
            </span>
          </h1>
          <p className="text-xl text-slate-500 leading-relaxed">
            50+ free online tools for PDF, images, video, audio, and archive files. No signup required.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-xl mx-auto mb-10">
          <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-slate-400">
            <FaSearch />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tools... (e.g. PDF to Word, compress)"
            className="w-full pl-13 pr-5 py-4 rounded-2xl border border-slate-200 bg-white shadow-sm text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
          />
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-3 mb-14">
          {Object.entries(categoryMeta).map(([key, meta]) => (
            <button
              key={key}
              onClick={() => setActiveCategory(key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                activeCategory === key
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                  : "bg-white border border-slate-200 text-slate-600 hover:border-blue-200 hover:text-blue-600"
              }`}
            >
              <span>{meta.icon}</span>
              {meta.label}
            </button>
          ))}
        </div>

        {/* Results count */}
        <div className="mb-8 text-sm text-slate-500 font-medium">
          Showing <span className="font-bold text-slate-800">{filtered.length}</span> tools
          {search && <span> for "<span className="text-blue-600">{search}</span>"</span>}
        </div>

        {/* Tools Grid */}
        {filtered.length > 0 ? (
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5"
          >
            {filtered.map((tool, index) => (
              <motion.div
                key={tool.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index * 0.03, 0.4) }}
                className="h-full flex flex-col"
              >
                <ToolCard tool={tool} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">No tools found</h3>
            <p className="text-slate-500 text-sm">Try a different search term or browse all categories.</p>
            <button
              onClick={() => { setSearch(""); setActiveCategory("all"); }}
              className="mt-6 px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
