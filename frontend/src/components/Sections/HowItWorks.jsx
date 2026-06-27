import { motion } from "framer-motion";
import { FaUpload, FaCog, FaDownload } from "react-icons/fa";

const steps = [
  {
    step: "01",
    icon: <FaUpload />,
    title: "Upload Your File",
    desc: "Drag & drop or browse your device. We support over 300 file formats including PDF, Word, Excel, images, videos, and audio.",
    color: "from-blue-500 to-blue-600",
    glow: "shadow-blue-500/20"
  },
  {
    step: "02",
    icon: <FaCog />,
    title: "Process & Convert",
    desc: "Our AI-powered cloud engine processes your file at lightning speed with enterprise-grade quality. Configure settings as needed.",
    color: "from-indigo-500 to-purple-600",
    glow: "shadow-purple-500/20"
  },
  {
    step: "03",
    icon: <FaDownload />,
    title: "Download Result",
    desc: "Your converted file is ready instantly. Download it directly or share via secure link. Files are auto-deleted after 1 hour.",
    color: "from-emerald-500 to-teal-600",
    glow: "shadow-emerald-500/20"
  }
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
};

export default function HowItWorks() {
  return (
    <section className="py-24 bg-white relative overflow-hidden z-0">
      {/* Decorative background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(37,99,235,0.04),transparent_70%)] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-4 py-2 rounded-full mb-5">
            Simple Process
          </span>
          <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight mb-5">
            Convert Files in{" "}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              3 Easy Steps
            </span>
          </h2>
          <p className="text-lg text-slate-500 leading-relaxed">
            No account required. No software to install. Just upload, convert, and download — all in your browser.
          </p>
        </div>

        {/* Steps */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 relative"
        >
          {/* Connecting line — desktop only */}
          <div className="hidden md:block absolute top-16 left-[calc(16.666%+2rem)] right-[calc(16.666%+2rem)] h-px bg-gradient-to-r from-blue-200 via-purple-200 to-emerald-200" />

          {steps.map((step, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="flex flex-col items-center text-center relative"
            >
              {/* Icon bubble */}
              <div className={`relative w-20 h-20 rounded-3xl bg-gradient-to-br ${step.color} text-white flex items-center justify-center text-2xl shadow-xl ${step.glow} mb-8 z-10`}>
                {step.icon}
                <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-slate-900 text-white text-xs font-black flex items-center justify-center">
                  {step.step}
                </span>
              </div>

              <h3 className="text-xl font-bold text-slate-900 mb-3">{step.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed max-w-xs">{step.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
