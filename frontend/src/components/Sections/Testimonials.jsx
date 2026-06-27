import { motion } from "framer-motion";
import { FaStar } from "react-icons/fa";

const testimonials = [
  {
    name: "Sarah Mitchell",
    role: "Marketing Director",
    company: "TechCorp Inc.",
    avatar: "SM",
    rating: 5,
    text: "ConvertHub has completely transformed our document workflow. What used to take hours now takes seconds. The PDF tools are exceptional and the quality is always perfect.",
    color: "from-blue-500 to-indigo-600"
  },
  {
    name: "David Chen",
    role: "Software Engineer",
    company: "StartupXYZ",
    avatar: "DC",
    rating: 5,
    text: "The API integration is seamless. We've automated our entire file conversion pipeline using ConvertHub. Reliability has been outstanding — 99.9% uptime in 6 months.",
    color: "from-purple-500 to-pink-600"
  },
  {
    name: "Emma Rodriguez",
    role: "Content Creator",
    company: "Freelancer",
    avatar: "ER",
    rating: 5,
    text: "As someone who converts hundreds of files weekly, ConvertHub is a lifesaver. The interface is intuitive, fast, and the results are always professional quality.",
    color: "from-emerald-500 to-teal-600"
  },
  {
    name: "James Wilson",
    role: "Operations Manager",
    company: "Global Logistics Ltd",
    avatar: "JW",
    rating: 5,
    text: "Security was our main concern and ConvertHub delivered. All files are encrypted, auto-deleted, and the enterprise plan gives us full compliance documentation.",
    color: "from-amber-500 to-orange-600"
  },
  {
    name: "Lisa Park",
    role: "Academic Researcher",
    company: "MIT University",
    avatar: "LP",
    rating: 5,
    text: "The OCR and PDF extraction tools are incredibly accurate. I use it daily for my research and it handles complex academic papers with ease. Highly recommended.",
    color: "from-rose-500 to-pink-600"
  },
  {
    name: "Michael Torres",
    role: "Video Producer",
    company: "Studio Alpha",
    avatar: "MT",
    rating: 5,
    text: "Video conversion quality is top-notch. No quality loss whatsoever. The batch processing feature alone saves me hours every single week on video deliverables.",
    color: "from-cyan-500 to-blue-600"
  }
];

function StarRating({ count }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <FaStar key={i} className="text-amber-400 text-sm" />
      ))}
    </div>
  );
}

export default function Testimonials() {
  return (
    <section className="py-24 bg-slate-50 relative overflow-hidden z-0">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(99,102,241,0.05),transparent_70%)] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-4 py-2 rounded-full mb-5">
            Customer Stories
          </span>
          <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight mb-5">
            Trusted by{" "}
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              500,000+ Users
            </span>
          </h2>
          <p className="text-lg text-slate-500 leading-relaxed">
            From individual creators to Fortune 500 companies — professionals worldwide rely on ConvertHub.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((t, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: index * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -6 }}
              className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full"
            >
              {/* Stars */}
              <StarRating count={t.rating} />

              {/* Quote */}
              <p className="mt-5 text-slate-600 text-sm leading-relaxed flex-grow">
                &ldquo;{t.text}&rdquo;
              </p>

              {/* Author */}
              <div className="mt-8 pt-6 border-t border-slate-100 flex items-center gap-4">
                <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${t.color} text-white flex items-center justify-center text-sm font-bold flex-shrink-0`}>
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">{t.name}</p>
                  <p className="text-xs text-slate-500">{t.role} · {t.company}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trust Stats */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { value: "500K+", label: "Active Users" },
            { value: "50M+", label: "Files Converted" },
            { value: "99.9%", label: "Uptime SLA" },
            { value: "4.9/5", label: "Average Rating" }
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <p className="text-4xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {stat.value}
              </p>
              <p className="text-slate-500 text-sm font-semibold mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
