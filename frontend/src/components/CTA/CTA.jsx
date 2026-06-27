import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaRocket, FaCheckCircle, FaCode } from "react-icons/fa";

const benefits = [
  "50+ conversion tools, all free",
  "No file size limits on core tools",
  "256-bit SSL encryption on all uploads",
  "Auto-delete files after 1 hour",
  "No account required to start",
  "Full developer API available"
];

export default function CTA() {
  return (
    <section className="py-24 relative overflow-hidden z-0">
      {/* Full-bleed gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 -z-10" />
      <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none -z-10" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-black/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-6 relative">
        <div className="grid lg:grid-cols-5 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="lg:col-span-3 text-white">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 border border-white/20 text-white text-xs font-bold mb-8">
              <FaRocket className="text-amber-300" />
              Start Converting in Seconds
            </span>

            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight mb-6">
              Ready to Simplify
              <br />
              <span className="bg-gradient-to-r from-blue-200 to-purple-200 bg-clip-text text-transparent">
                Your Workflow?
              </span>
            </h2>

            <p className="text-white/70 text-lg leading-relaxed mb-10 max-w-xl">
              Join 500,000+ professionals and businesses who rely on ConvertHub to convert, 
              compress, and process files every day. No credit card required.
            </p>

            {/* Benefits Checklist */}
            <div className="grid sm:grid-cols-2 gap-3">
              {benefits.map((benefit, i) => (
                <div key={i} className="flex items-center gap-2.5 text-sm text-white/80">
                  <FaCheckCircle className="text-emerald-400 flex-shrink-0" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right CTAs */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link
                to="/all-tools"
                className="block w-full py-5 px-8 rounded-2xl bg-white text-slate-900 font-bold text-center text-lg hover:bg-blue-50 shadow-2xl shadow-black/20 transition-all duration-300"
              >
                Start Converting Free →
              </Link>
            </motion.div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link
                to="/pricing"
                className="block w-full py-5 px-8 rounded-2xl bg-white/10 border border-white/20 text-white font-bold text-center text-base hover:bg-white/15 backdrop-blur-sm transition-all duration-300"
              >
                View Pro Plans
              </Link>
            </motion.div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link
                to="/contact"
                className="block w-full py-4 px-8 rounded-2xl text-white/60 font-semibold text-center text-sm hover:text-white transition-all duration-300 flex items-center justify-center gap-2"
              >
                <FaCode />
                View Developer API →
              </Link>
            </motion.div>

            {/* Social proof */}
            <div className="mt-4 pt-6 border-t border-white/15 text-center">
              <p className="text-white/50 text-xs">
                ⭐⭐⭐⭐⭐ Rated 4.9/5 by 12,000+ reviews
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
