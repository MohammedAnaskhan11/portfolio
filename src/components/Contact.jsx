import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Download, Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { GithubIcon, LinkedinIcon } from './icons';
import { useData } from '../context/DataContext';
import { supabase } from '../lib/supabase';

const inputStyle = {
  width: '100%',
  background: 'rgba(var(--c-primary)/0.04)',
  border: '1px solid rgba(var(--c-primary)/0.18)',
  borderRadius: '0.75rem',
  padding: '0.75rem 1rem',
  fontSize: '0.875rem',
  color: 'var(--col-heading)',
  outline: 'none',
  transition: 'border-color 0.2s, background 0.2s',
  fontFamily: 'inherit',
};

function InputField({ label, children, required }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--col-muted)', marginBottom: '6px' }}>
        {label}{required && ' *'}
      </label>
      {children}
    </div>
  );
}

function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [status, setStatus]   = useState(null);
  const [errMsg, setErrMsg]   = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!form.name || !form.email || !form.message) {
      setStatus('error'); setErrMsg('Please fill in name, email, and message.'); return;
    }
    setLoading(true); setStatus(null);
    const { error } = await supabase.from('messages').insert([{
      name: form.name.trim(), email: form.email.trim(),
      subject: form.subject.trim() || null, message: form.message.trim(),
    }]);
    setLoading(false);
    if (error) { setStatus('error'); setErrMsg(error.message); return; }
    setStatus('success');
    setForm({ name: '', email: '', subject: '', message: '' });
  };

  if (status === 'success') return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
      className="text-center py-10 glass rounded-2xl">
      <CheckCircle className="w-12 h-12 mx-auto mb-3" style={{ color: 'rgb(var(--c-secondary))' }} />
      <p className="font-semibold text-lg" style={{ color: 'var(--col-heading)' }}>Message sent!</p>
      <p className="text-sm mt-1" style={{ color: 'var(--col-muted)' }}>I'll get back to you soon.</p>
      <button onClick={() => setStatus(null)}
        className="mt-5 text-xs font-mono transition-colors"
        style={{ color: 'var(--col-muted)' }}>
        Send another message
      </button>
    </motion.div>
  );

  return (
    <div className="glass rounded-2xl p-6 space-y-4">
      <h3 className="font-display text-lg font-bold mb-2" style={{ color: 'var(--col-heading)' }}>
        Send a Message
      </h3>
      <div className="grid sm:grid-cols-2 gap-4">
        <InputField label="Name" required>
          <input value={form.name} onChange={e => set('name', e.target.value)}
            placeholder="Your name" style={inputStyle}
            onFocus={e => { e.target.style.borderColor = 'rgba(var(--c-primary)/0.5)'; e.target.style.background = 'rgba(var(--c-primary)/0.07)'; }}
            onBlur={e => { e.target.style.borderColor = 'rgba(var(--c-primary)/0.18)'; e.target.style.background = 'rgba(var(--c-primary)/0.04)'; }} />
        </InputField>
        <InputField label="Email" required>
          <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
            placeholder="your@email.com" style={inputStyle}
            onFocus={e => { e.target.style.borderColor = 'rgba(var(--c-primary)/0.5)'; e.target.style.background = 'rgba(var(--c-primary)/0.07)'; }}
            onBlur={e => { e.target.style.borderColor = 'rgba(var(--c-primary)/0.18)'; e.target.style.background = 'rgba(var(--c-primary)/0.04)'; }} />
        </InputField>
      </div>
      <InputField label="Subject">
        <input value={form.subject} onChange={e => set('subject', e.target.value)}
          placeholder="What's this about?" style={inputStyle}
          onFocus={e => { e.target.style.borderColor = 'rgba(var(--c-primary)/0.5)'; e.target.style.background = 'rgba(var(--c-primary)/0.07)'; }}
          onBlur={e => { e.target.style.borderColor = 'rgba(var(--c-primary)/0.18)'; e.target.style.background = 'rgba(var(--c-primary)/0.04)'; }} />
      </InputField>
      <InputField label="Message" required>
        <textarea value={form.message} onChange={e => set('message', e.target.value)}
          rows={4} placeholder="Your message..." style={{ ...inputStyle, resize: 'none' }}
          onFocus={e => { e.target.style.borderColor = 'rgba(var(--c-primary)/0.5)'; e.target.style.background = 'rgba(var(--c-primary)/0.07)'; }}
          onBlur={e => { e.target.style.borderColor = 'rgba(var(--c-primary)/0.18)'; e.target.style.background = 'rgba(var(--c-primary)/0.04)'; }} />
      </InputField>

      {status === 'error' && (
        <div className="flex items-center gap-2 text-xs font-mono rounded-xl p-3"
          style={{ color: '#f87171', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
          <AlertCircle className="w-4 h-4 shrink-0" /> {errMsg}
        </div>
      )}

      <button onClick={submit} disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
        style={{
          background: 'linear-gradient(135deg, rgb(var(--c-primary)), rgb(var(--c-secondary)))',
          color: 'white',
        }}>
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4" /> Send Message</>}
      </button>
    </div>
  );
}

export default function Contact() {
  const { data } = useData();
  const c = data.contact || {};
  const h = data.hero || {};

  const info = [
    { icon: Mail,   label: 'Email',    value: c.email,    href: `mailto:${c.email}` },
    { icon: Phone,  label: 'Phone',    value: c.phone,    href: `tel:${c.phone?.replace(/\s/g,'')}` },
    { icon: MapPin, label: 'Location', value: c.location, href: null },
  ];

  return (
    <section id="contact" className="py-20 md:py-28 px-4 sm:px-6 max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.6 }}>
        <h2 className="font-display font-bold text-2xl sm:text-3xl md:text-4xl mb-3 text-center"
          style={{ color: 'var(--col-heading)' }}>
          Get In Touch
        </h2>
        <span className="block h-[3px] w-14 rounded-full mt-3 mb-12 md:mb-14 mx-auto"
          style={{ background: 'linear-gradient(90deg, rgb(var(--c-primary)), rgb(var(--c-secondary)))' }} />
      </motion.div>

      <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
        viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }}
        className="text-center text-base sm:text-lg max-w-xl mx-auto mb-10"
        style={{ color: 'var(--col-muted)' }}>
        Open to research collaborations, internships, and full-time roles in AI/ML and Computer Vision.
      </motion.p>

      {/* Contact info cards */}
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        {info.map((it, i) => {
          const Icon = it.icon;
          const Wrap = it.href ? 'a' : 'div';
          return (
            <motion.div key={it.label} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}>
              <Wrap {...(it.href ? { href: it.href, target: '_blank', rel: 'noopener noreferrer' } : {})}
                className="block glass rounded-2xl p-6 text-center h-full hover:scale-105 transition-transform duration-300">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3"
                  style={{ background: 'rgba(var(--c-primary)/0.10)', border: '1px solid rgba(var(--c-primary)/0.2)' }}>
                  <Icon className="w-5 h-5" style={{ color: 'rgb(var(--c-primary))' }} />
                </div>
                <div className="text-xs font-mono mb-1" style={{ color: 'var(--col-muted)' }}>{it.label}</div>
                <div className="text-sm font-medium break-all" style={{ color: 'var(--col-heading)' }}>{it.value}</div>
              </Wrap>
            </motion.div>
          );
        })}
      </div>

      {/* Message form */}
      <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }} className="mb-8">
        <ContactForm />
      </motion.div>

      {/* Social + Resume */}
      <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.35 }}
        className="flex flex-col items-center gap-6">
        <div className="flex gap-3">
          {h.github && (
            <a href={h.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub"
              className="w-12 h-12 rounded-xl glass flex items-center justify-center transition-all duration-200 hover:scale-110"
              style={{ color: 'var(--col-muted)' }}
              onMouseEnter={e => e.currentTarget.style.color = 'rgb(var(--c-primary))'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--col-muted)'}>
              <GithubIcon className="w-5 h-5" />
            </a>
          )}
          {h.linkedin && (
            <a href={h.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"
              className="w-12 h-12 rounded-xl glass flex items-center justify-center transition-all duration-200 hover:scale-110"
              style={{ color: 'var(--col-muted)' }}
              onMouseEnter={e => e.currentTarget.style.color = 'rgb(var(--c-secondary))'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--col-muted)'}>
              <LinkedinIcon className="w-5 h-5" />
            </a>
          )}
        </div>
        <a href="/resume.pdf" download
          className="inline-flex items-center gap-2 font-bold px-8 py-3.5 rounded-full text-sm transition-all duration-300 hover:scale-105"
          style={{
            background: 'linear-gradient(135deg, rgb(var(--c-primary)), rgb(var(--c-secondary)))',
            color: 'white',
            boxShadow: '0 4px 24px rgba(var(--c-primary)/0.3)',
          }}>
          <Download className="w-4 h-4" /> Download Resume
        </a>
      </motion.div>
    </section>
  );
}
