import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaChevronDown } from "react-icons/fa";

const faqs = [
  {
    q: "Is ConvertHub completely free to use?",
    a: "Yes! Our core tools are 100% free with no account required. We offer a Pro plan for power users who need batch processing, higher file size limits, API access, and priority queue processing."
  },
  {
    q: "How secure are my uploaded files?",
    a: "All file transfers use 256-bit SSL encryption. Your files are processed in isolated containers, never shared with third parties, and automatically deleted from our servers after 1 hour. We are GDPR compliant."
  },
  {
    q: "What is the maximum file size?",
    a: "Free users can upload files up to 100MB. Pro users get up to 2GB per file. Enterprise plans support unlimited file sizes with dedicated infrastructure."
  },
  {
    q: "How fast is the conversion?",
    a: "Most conversions complete in seconds. Large files or complex operations (like OCR) may take up to a few minutes. Pro users get priority processing and dedicated server resources."
  },
  {
    q: "Do you support batch conversion?",
    a: "Yes! Pro and Enterprise plans support batch conversion — upload multiple files and convert them all at once. Our API also supports bulk operations programmatically."
  },
  {
    q: "Is there an API available?",
    a: "Absolutely. We offer a comprehensive REST API for developers and businesses. You get full documentation, SDKs for popular languages, and a sandbox environment for testing. API access is included in Pro plans."
  },
  {
    q: "What output quality can I expect?",
    a: "We use industry-leading conversion engines to ensure the highest quality output. For document conversions, formatting is preserved. For image/video, you can choose quality presets."
  },
  {
    q: "Can I use ConvertHub for commercial projects?",
    a: "Yes. All plans allow commercial use. Enterprise plans include additional SLA guarantees, dedicated support, and compliance documentation for regulated industries."
  }
];

function FAQItem({ faq, index }) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
      className="border border-slate-200 rounded-2xl overflow-hidden"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors duration-200"
        aria-expanded={open}
      >
        <span className="font-semibold text-slate-800 text-sm sm:text-base">{faq.q}</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0 text-slate-400"
        >
          <FaChevronDown />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 text-slate-500 text-sm leading-relaxed border-t border-slate-100 pt-4">
              {faq.a}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FAQ() {
  return (
    <section className="py-24 bg-white relative z-0">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-4 py-2 rounded-full mb-5">
            FAQ
          </span>
          <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight mb-5">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-slate-500">
            Everything you need to know about ConvertHub. Can't find your answer?{" "}
            <a href="/contact" className="text-blue-600 hover:underline font-semibold">Contact us</a>.
          </p>
        </div>

        {/* Accordion */}
        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <FAQItem key={index} faq={faq} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
