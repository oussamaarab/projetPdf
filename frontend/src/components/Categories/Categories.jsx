import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaFilePdf, FaImage, FaVideo, FaMusic, FaArchive, FaArrowRight } from "react-icons/fa";

const categoryList = [
  {
    id: "pdf",
    to: "/pdf-tools",
    title: "PDF Tools",
    desc: "Merge, split, compress, convert, protect and edit PDF documents with professional precision.",
    icon: <FaFilePdf />,
    color: "from-rose-500 to-red-600",
    iconBg: "bg-rose-50 text-rose-600 group-hover:bg-rose-600 group-hover:text-white",
    border: "hover:border-rose-200",
    count: "19 Tools"
  },
  {
    id: "image",
    to: "/image-tools",
    title: "Image Tools",
    desc: "Convert, resize, compress, crop, and optimize images in any format including HEIC and WebP.",
    icon: <FaImage />,
    color: "from-purple-500 to-violet-600",
    iconBg: "bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white",
    border: "hover:border-purple-200",
    count: "10 Tools"
  },
  {
    id: "video",
    to: "/video-tools",
    title: "Video Tools",
    desc: "Convert, compress, trim and transform video files. Extract audio and create GIFs effortlessly.",
    icon: <FaVideo />,
    color: "from-cyan-500 to-blue-600",
    iconBg: "bg-cyan-50 text-cyan-600 group-hover:bg-cyan-600 group-hover:text-white",
    border: "hover:border-cyan-200",
    count: "7 Tools"
  },
  {
    id: "audio",
    to: "/audio-tools",
    title: "Audio Tools",
    desc: "Convert audio between all major formats, compress audio files, and trim recordings with ease.",
    icon: <FaMusic />,
    color: "from-amber-500 to-orange-600",
    iconBg: "bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white",
    border: "hover:border-amber-200",
    count: "6 Tools"
  },
  {
    id: "archive",
    to: "/archive-tools",
    title: "Archive Tools",
    desc: "Create, extract and convert archive files. Support for ZIP, RAR, 7Z, TAR and more.",
    icon: <FaArchive />,
    color: "from-emerald-500 to-teal-600",
    iconBg: "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white",
    border: "hover:border-emerald-200",
    count: "5 Tools"
  }
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } }
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }
};

export default function Categories({ onSelectCategory }) {
  const handleClick = (categoryId) => {
    if (onSelectCategory) {
      onSelectCategory(categoryId);
      const el = document.getElementById("popular-tools");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section className="py-24 bg-slate-50 border-t border-slate-100 relative z-0">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-4 py-2 rounded-full mb-5">
            Tool Categories
          </span>
          <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight mb-5">
            Everything You Need,{" "}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              All In One Place
            </span>
          </h2>
          <p className="text-lg text-slate-500 leading-relaxed">
            Browse our complete suite of file conversion and processing tools — organized by category for quick access.
          </p>
        </div>

        {/* Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6"
        >
          {categoryList.map((cat) => (
            <motion.div key={cat.id} variants={cardVariants} className="h-full">
              <Link
                to={cat.to}
                onClick={() => handleClick(cat.id)}
                className={`group flex flex-col h-full bg-white rounded-3xl border border-slate-100 p-7 shadow-sm hover:shadow-xl transition-all duration-300 ${cat.border}`}
              >
                {/* Icon */}
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl border transition-all duration-300 ${cat.iconBg}`}>
                  {cat.icon}
                </div>

                {/* Content */}
                <div className="flex-grow mt-5">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-base font-bold text-slate-800 group-hover:text-blue-600 transition">
                      {cat.title}
                    </h3>
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md flex-shrink-0">
                      {cat.count}
                    </span>
                  </div>
                  <p className="mt-2 text-slate-500 text-xs leading-relaxed">{cat.desc}</p>
                </div>

                {/* Action */}
                <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between text-xs font-bold text-blue-600">
                  <span>Browse Tools</span>
                  <FaArrowRight className="-translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300 text-xs" />
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
