import { motion } from "framer-motion";
import { FaBolt, FaShieldAlt, FaCloud, FaBrain, FaInfinity, FaMobile } from "react-icons/fa";

const features = [
  {
    icon: <FaBolt />,
    title: "Lightning Fast",
    desc: "AI-powered cloud processing completes most conversions in under 10 seconds, even for large files.",
    gradient: "from-amber-400 to-orange-500",
    glow: "shadow-amber-500/15"
  },
  {
    icon: <FaShieldAlt />,
    title: "Enterprise Security",
    desc: "256-bit SSL encryption, isolated processing containers, and automatic file deletion after 1 hour.",
    gradient: "from-emerald-400 to-teal-500",
    glow: "shadow-emerald-500/15"
  },
  {
    icon: <FaCloud />,
    title: "100% Cloud-Based",
    desc: "No software to install. Process files from any device, anywhere in the world, at any time.",
    gradient: "from-blue-400 to-indigo-500",
    glow: "shadow-blue-500/15"
  },
  {
    icon: <FaBrain />,
    title: "AI-Powered Quality",
    desc: "Our machine learning engine preserves formatting, layout, and quality with industry-leading accuracy.",
    gradient: "from-purple-400 to-pink-500",
    glow: "shadow-purple-500/15"
  },
  {
    icon: <FaInfinity />,
    title: "No Limits",
    desc: "Unlimited conversions on our free plan. Pro users get 2GB file sizes, batch processing, and API access.",
    gradient: "from-rose-400 to-red-500",
    glow: "shadow-rose-500/15"
  },
  {
    icon: <FaMobile />,
    title: "Mobile Friendly",
    desc: "Fully responsive design works perfectly on every device — desktop, tablet, and mobile.",
    gradient: "from-cyan-400 to-blue-500",
    glow: "shadow-cyan-500/15"
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

export default function Features() {
  return (
    <section className="py-24 bg-slate-50 relative overflow-hidden z-0">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(37,99,235,0.04),transparent_60%)] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-4 py-2 rounded-full mb-5">
            Why ConvertHub
          </span>
          <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight mb-5">
            Built for{" "}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Professionals
            </span>
          </h2>
          <p className="text-lg text-slate-500 leading-relaxed">
            Enterprise-grade conversion technology accessible to everyone — from individual creators to Fortune 500 teams.
          </p>
        </div>

        {/* Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              whileHover={{ y: -6 }}
              className={`bg-white rounded-3xl border border-slate-100 p-8 shadow-sm hover:shadow-xl transition-all duration-300 h-full flex flex-col ${feature.glow}`}
            >
              {/* Icon */}
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} text-white flex items-center justify-center text-xl shadow-lg mb-6`}>
                {feature.icon}
              </div>

              <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed flex-grow">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}