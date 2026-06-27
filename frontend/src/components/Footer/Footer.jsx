import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaFilePdf, FaGithub, FaLinkedin, FaPaperPlane, FaTwitter, FaYoutube } from 'react-icons/fa';

const links = {
  'PDF Tools': [
    { label: 'Merge PDF', to: '/tool/merge-pdf' },
    { label: 'Split PDF', to: '/tool/split-pdf' },
    { label: 'Compress PDF', to: '/tool/compress-pdf' },
    { label: 'PDF to Word', to: '/tool/pdf-to-word' },
    { label: 'PDF to JPG', to: '/tool/pdf-to-jpg' },
  ],
  Tools: [
    { label: 'Image Tools', to: '/image-tools' },
    { label: 'Video Tools', to: '/video-tools' },
    { label: 'Audio Tools', to: '/audio-tools' },
    { label: 'Archive Tools', to: '/archive-tools' },
    { label: 'All Tools', to: '/all-tools' },
  ],
  Company: [
    { label: 'About', to: '/about' },
    { label: 'Pricing', to: '/pricing' },
    { label: 'Contact', to: '/contact' },
  ],
  Legal: [
    { label: 'Privacy Policy', to: '#' },
    { label: 'Terms of Service', to: '#' },
    { label: 'Security', to: '#' },
  ],
};

const socials = [
  { icon: <FaTwitter />, href: '#', label: 'Twitter' },
  { icon: <FaGithub />, href: '#', label: 'GitHub' },
  { icon: <FaLinkedin />, href: '#', label: 'LinkedIn' },
  { icon: <FaYoutube />, href: '#', label: 'YouTube' },
];

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (event) => {
    event.preventDefault();
    if (!email.trim()) return;

    setSubscribed(true);
    setEmail('');
    window.setTimeout(() => setSubscribed(false), 5000);
  };

  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="page-shell py-14 sm:py-16">
        <div className="grid gap-10 lg:grid-cols-6">
          <div className="lg:col-span-2">
            <Link to="/" className="inline-flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm shadow-blue-600/20">
                <FaFilePdf />
              </span>
              <span>
                <span className="block text-xl font-black text-slate-950">ConvertHub</span>
                <span className="block text-xs font-semibold uppercase tracking-widest text-slate-400">File conversion platform</span>
              </span>
            </Link>

            <p className="mt-5 max-w-sm text-sm leading-6 text-slate-600">
              Fast, secure file conversion tools for documents, images, video, audio, and archives.
            </p>

            <div className="mt-5 flex gap-2">
              {socials.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                >
                  {social.icon}
                </a>
              ))}
            </div>

            <form onSubmit={handleSubscribe} className="mt-7 max-w-sm">
              <label htmlFor="footer-email" className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-500">
                Product updates
              </label>
              <div className="flex gap-2">
                <input
                  id="footer-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="h-11 min-w-0 flex-1 rounded-lg border border-slate-300 px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-600/10"
                />
                <button
                  type="submit"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-slate-950 text-white transition hover:bg-blue-700"
                  aria-label="Subscribe"
                >
                  <FaPaperPlane className="text-xs" />
                </button>
              </div>
              {subscribed && (
                <p className="mt-2 text-xs font-semibold text-emerald-700">You are subscribed. Thanks.</p>
              )}
            </form>
          </div>

          {Object.entries(links).map(([heading, items]) => (
            <div key={heading}>
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">{heading}</h3>
              <ul className="mt-4 space-y-3">
                {items.map((item) => (
                  <li key={item.label}>
                    <Link to={item.to} className="text-sm font-medium text-slate-600 transition hover:text-blue-700">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-slate-200 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>Copyright {new Date().getFullYear()} ConvertHub. All rights reserved.</p>
          <p className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            All systems operational
          </p>
        </div>
      </div>
    </footer>
  );
}
