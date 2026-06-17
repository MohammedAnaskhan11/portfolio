import { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, Heart, Smartphone, Zap, ExternalLink, IndianRupee } from 'lucide-react';

const UPI_ID   = 'smohammedanaskhan@oksbi';
const UPI_NAME = 'Mohammed Anas Khan';

// UPI deep-link encoded for QR generation
const UPI_URI  = `upi://pay?pa=${encodeURIComponent(UPI_ID)}&pn=${encodeURIComponent(UPI_NAME)}&cu=INR`;
const QR_URL   = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(UPI_URI)}&color=3ef2d0&bgcolor=080a12&qzone=2&margin=0`;

// ── Replace with your Razorpay.me link once you create an account ──
// Create at: https://razorpay.me → Sign up → Create Payment Page
const RAZORPAY_URL = 'https://razorpay.me/@mohammedanaskhan';

const AMOUNTS = [
  { label: '₹49',  value: 49  },
  { label: '₹99',  value: 99  },
  { label: '₹199', value: 199 },
  { label: 'Custom', value: null },
];

const apps = [
  { label: 'GPay',    color: '#4285F4' },
  { label: 'PhonePe', color: '#5f259f' },
  { label: 'Paytm',   color: '#002970' },
  { label: 'BHIM',    color: '#00639b' },
];

export default function Support() {
  const [copied, setCopied] = useState(false);

  const copyUPI = () => {
    navigator.clipboard.writeText(UPI_ID);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <section id="support" className="py-28 px-6 max-w-6xl mx-auto">
      {/* Heading */}
      <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.6 }}>
        <h2 className="font-display font-bold text-3xl md:text-4xl text-white mb-3">
          Support My Work
        </h2>
        <span className="block h-[3px] w-14 rounded-full mt-3 mb-6"
          style={{ background: 'linear-gradient(90deg,#3ef2d0,#7c5cff)' }} />
        <p className="text-gray-400 text-base max-w-xl mb-14">
          If you find my work helpful or just want to show some love, you can support me
          with a small contribution. Every coffee counts! ☕
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-8 items-start">

        {/* ── UPI QR Card ─────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.7 }}
          className="relative group">

          {/* Glow border */}
          <div className="absolute -inset-[1px] rounded-2xl opacity-60 group-hover:opacity-100 transition-opacity duration-500 blur-[1px]"
            style={{ background: 'linear-gradient(135deg,rgba(62,242,208,0.5),rgba(124,92,255,0.4))' }} />

          <div className="relative rounded-2xl p-8 flex flex-col items-center gap-6"
            style={{ background: 'rgba(8,10,18,0.96)', backdropFilter: 'blur(20px)' }}>

            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg,rgba(62,242,208,0.2),rgba(124,92,255,0.15))' }}>
                <Smartphone className="w-4 h-4 text-accent" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">Pay via UPI</p>
                <p className="text-gray-500 text-xs font-mono">Scan with any UPI app</p>
              </div>
            </div>

            {/* QR Code */}
            <div className="relative">
              <div className="absolute -inset-3 rounded-2xl opacity-30"
                style={{ background: 'radial-gradient(circle,rgba(62,242,208,0.3) 0%,transparent 70%)' }} />
              <div className="relative rounded-2xl overflow-hidden border border-accent/20 p-3"
                style={{ background: '#080a12' }}>
                <img
                  src={QR_URL}
                  alt="UPI QR Code"
                  width={220} height={220}
                  className="rounded-xl block"
                  loading="lazy"
                />
              </div>
              {/* Corner accents */}
              {[
                'top-0 left-0 border-t-2 border-l-2 rounded-tl-xl',
                'top-0 right-0 border-t-2 border-r-2 rounded-tr-xl',
                'bottom-0 left-0 border-b-2 border-l-2 rounded-bl-xl',
                'bottom-0 right-0 border-b-2 border-r-2 rounded-br-xl',
              ].map((cls, i) => (
                <span key={i} className={`absolute w-5 h-5 border-accent/60 ${cls}`} />
              ))}
            </div>

            {/* UPI ID + copy */}
            <div className="w-full">
              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                <span className="flex-1 font-mono text-sm text-gray-300 truncate">{UPI_ID}</span>
                <button onClick={copyUPI}
                  className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all duration-200"
                  style={{ background: copied ? 'rgba(62,242,208,0.15)' : 'rgba(255,255,255,0.06)',
                           color: copied ? '#3ef2d0' : '#94a3b8' }}>
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied!' : 'Copy ID'}
                </button>
              </div>
              <p className="text-center text-xs text-gray-600 font-mono mt-2">
                Works with GPay · PhonePe · Paytm · BHIM · Any UPI app
              </p>
            </div>

            {/* Supported apps */}
            <div className="flex gap-2 flex-wrap justify-center">
              {apps.map(app => (
                <span key={app.label}
                  className="px-3 py-1 rounded-full text-xs font-mono border border-white/8 text-gray-400"
                  style={{ background: `${app.color}18` }}>
                  {app.label}
                </span>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ── Right side: BMC + info ──────────────────────────────── */}
        <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.7, delay: 0.1 }}
          className="flex flex-col gap-6">

          {/* Buy Me a Coffee card */}
          <div className="relative group">
            <div className="absolute -inset-[1px] rounded-2xl opacity-50 group-hover:opacity-90 transition-opacity duration-500"
              style={{ background: 'linear-gradient(135deg,rgba(82,143,240,0.5),rgba(7,38,84,0.8))' }} />
            <div className="relative rounded-2xl p-7 flex flex-col gap-5"
              style={{ background: 'rgba(8,10,18,0.96)', backdropFilter: 'blur(20px)' }}>

              {/* Razorpay header */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg,rgba(82,143,240,0.25),rgba(7,38,84,0.3))' }}>
                  <IndianRupee className="w-5 h-5" style={{ color: '#528FF0' }} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-white font-bold text-base">Pay via Razorpay</p>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border"
                      style={{ color: '#528FF0', borderColor: 'rgba(82,143,240,0.3)', background: 'rgba(82,143,240,0.08)' }}>
                      Secure
                    </span>
                  </div>
                  <p className="text-gray-500 text-xs font-mono">Cards · Net Banking · Wallets · UPI</p>
                </div>
              </div>

              <p className="text-gray-400 text-sm leading-relaxed">
                Support my AI/ML research and open-source work. Choose an amount or enter a custom one — all major Indian payment methods accepted.
              </p>

              {/* Amount selector */}
              <div className="grid grid-cols-4 gap-2">
                {AMOUNTS.map(({ label }) => (
                  <a key={label} href={RAZORPAY_URL} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center py-2 rounded-xl text-xs font-mono font-bold border transition-all duration-200 hover:scale-[1.05]"
                    style={{ borderColor: 'rgba(82,143,240,0.3)', color: '#528FF0', background: 'rgba(82,143,240,0.08)' }}
                    onMouseEnter={e => { e.currentTarget.style.background='rgba(82,143,240,0.18)'; e.currentTarget.style.borderColor='rgba(82,143,240,0.6)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background='rgba(82,143,240,0.08)'; e.currentTarget.style.borderColor='rgba(82,143,240,0.3)'; }}>
                    {label}
                  </a>
                ))}
              </div>

              {/* Main CTA */}
              <a href={RAZORPAY_URL} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-sm transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                style={{ background: 'linear-gradient(135deg,#528FF0,#072654)', color: '#fff' }}>
                <IndianRupee className="w-4 h-4" />
                Support via Razorpay
                <ExternalLink className="w-3.5 h-3.5 opacity-70" />
              </a>

              <p className="text-center text-[11px] font-mono text-gray-600">
                🔒 Powered by Razorpay · 256-bit SSL encrypted
              </p>
            </div>
          </div>


          {/* Why support card */}
          <div className="rounded-2xl p-7 border border-white/5"
            style={{ background: 'rgba(15,17,27,0.7)', backdropFilter: 'blur(12px)' }}>
            <div className="flex items-center gap-2 mb-4">
              <Heart className="w-4 h-4 text-red-400" />
              <p className="text-white font-semibold text-sm">Why Support?</p>
            </div>
            <ul className="space-y-3">
              {[
                { icon: '🔬', text: 'Helps me pursue research in AI/ML & Computer Vision' },
                { icon: '💻', text: 'Funds hardware for deep learning experiments' },
                { icon: '📚', text: 'Supports access to courses & research papers' },
                { icon: '🚀', text: 'Keeps me building open-source projects' },
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-gray-400">
                  <span className="text-base shrink-0 mt-0.5">{item.icon}</span>
                  {item.text}
                </li>
              ))}
            </ul>
          </div>

          {/* Quick stats */}
          <div className="rounded-xl px-6 py-4 border border-accent/10 flex items-center gap-3"
            style={{ background: 'rgba(62,242,208,0.04)' }}>
            <Zap className="w-4 h-4 text-accent shrink-0" />
            <p className="text-xs font-mono text-gray-400">
              Payments are instant · UPI is free · No platform fees on direct UPI transfers
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
