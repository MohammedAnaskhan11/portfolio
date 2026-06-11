import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import {
  Mail, Trash2, MailOpen, RefreshCw, Inbox,
  Clock, User, ChevronDown, ChevronUp, AlertCircle
} from 'lucide-react';

function timeAgo(ts) {
  const diff = Date.now() - new Date(ts).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export default function MessagesInbox() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [expanded, setExpanded] = useState(null);

  const fetchMessages = async () => {
    setLoading(true); setError('');
    const { data, error: e } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false });
    setLoading(false);
    if (e) { setError(e.message); return; }
    setMessages(data || []);
  };

  useEffect(() => { fetchMessages(); }, []);

  const markRead = async (id) => {
    await supabase.from('messages').update({ read: true }).eq('id', id);
    setMessages(prev => prev.map(m => m.id === id ? { ...m, read: true } : m));
  };

  const deleteMsg = async (id) => {
    if (!confirm('Delete this message?')) return;
    await supabase.from('messages').delete().eq('id', id);
    setMessages(prev => prev.filter(m => m.id !== id));
    if (expanded === id) setExpanded(null);
  };

  const toggle = (id) => {
    setExpanded(prev => prev === id ? null : id);
    const msg = messages.find(m => m.id === id);
    if (msg && !msg.read) markRead(id);
  };

  const unread = messages.filter(m => !m.read).length;

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <RefreshCw className="w-5 h-5 text-violet-400 animate-spin" />
    </div>
  );

  if (error) return (
    <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
      <AlertCircle className="w-4 h-4 shrink-0" />
      <div>
        <p className="font-semibold">Could not load messages</p>
        <p className="text-xs mt-0.5 font-mono">{error}</p>
        <p className="text-xs mt-1">Make sure you've run the SQL to create the messages table in Supabase.</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Inbox className="w-4 h-4 text-violet-400" />
          <span className="text-sm text-slate-400 font-mono">
            {messages.length} total
            {unread > 0 && <span className="ml-2 px-1.5 py-0.5 rounded-full bg-violet-500/20 text-violet-300 text-xs">{unread} unread</span>}
          </span>
        </div>
        <button onClick={fetchMessages} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-violet-400 transition-colors font-mono">
          <RefreshCw className="w-3 h-3" /> Refresh
        </button>
      </div>

      {/* Empty state */}
      {messages.length === 0 && (
        <div className="text-center py-16 text-slate-600">
          <Mail className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm">No messages yet</p>
          <p className="text-xs mt-1">Messages from your portfolio contact form will appear here</p>
        </div>
      )}

      {/* Message list */}
      <div className="space-y-2">
        {messages.map(msg => (
          <div key={msg.id}
            className={`rounded-xl border transition-all duration-200 overflow-hidden
              ${!msg.read ? 'border-violet-500/30 bg-violet-500/5' : 'border-slate-700/40 bg-slate-800/20'}`}>

            {/* Row */}
            <button onClick={() => toggle(msg.id)}
              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/[0.02] transition-colors">
              <div className={`w-2 h-2 rounded-full shrink-0 ${!msg.read ? 'bg-violet-400' : 'bg-slate-600'}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-sm font-semibold ${!msg.read ? 'text-white' : 'text-slate-300'}`}>{msg.name}</span>
                  <span className="text-xs text-slate-500 font-mono">{msg.email}</span>
                  {msg.subject && <span className="text-xs text-violet-400/70 font-mono">· {msg.subject}</span>}
                </div>
                <p className="text-xs text-slate-500 truncate mt-0.5">{msg.message}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] text-slate-600 font-mono">{timeAgo(msg.created_at)}</span>
                {expanded === msg.id ? <ChevronUp className="w-3.5 h-3.5 text-slate-500" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-500" />}
              </div>
            </button>

            {/* Expanded content */}
            <AnimatePresence>
              {expanded === msg.id && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}>
                  <div className="px-4 pb-4 pt-1 border-t border-slate-700/30">
                    <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-3 text-xs text-slate-600 font-mono">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(msg.created_at).toLocaleString()}</span>
                        <span className="flex items-center gap-1"><User className="w-3 h-3" />{msg.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <a href={`mailto:${msg.email}?subject=Re: ${msg.subject || 'Your message'}`}
                          className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-violet-500/15 text-violet-300 hover:bg-violet-500/25 transition-colors font-mono">
                          <Mail className="w-3 h-3" /> Reply
                        </a>
                        <button onClick={() => deleteMsg(msg.id)}
                          className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors font-mono">
                          <Trash2 className="w-3 h-3" /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* SQL reminder if no table */}
      <div className="mt-6 p-4 rounded-xl border border-slate-700/30 bg-slate-800/20 text-xs font-mono text-slate-600">
        <p className="text-slate-500 mb-2">⚙️ Required Supabase SQL (run once):</p>
        <pre className="text-slate-600 leading-relaxed overflow-x-auto">{`CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_insert" ON messages FOR INSERT WITH CHECK (true);
CREATE POLICY "admin_all" ON messages FOR ALL USING (true);`}</pre>
      </div>
    </div>
  );
}
