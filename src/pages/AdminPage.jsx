import { useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useData } from '../context/DataContext';
import { supabase } from '../lib/supabase';
import AdminAuth from '../components/admin/AdminAuth';
import MessagesInbox from '../components/admin/MessagesInbox';
import ImageManager from '../components/admin/ImageManager';
import {
  LogOut, Eye, Download, Upload, RotateCcw,
  User, Cpu, FolderOpen, Trophy, Briefcase, Mail, MessageSquare, Image,
  Plus, Trash2, GripVertical, Save, CheckCircle, ChevronDown, ChevronUp,
} from 'lucide-react';


// ── Reusable input components ────────────────────────────────────────
function Field({ label, value, onChange, type = 'text', rows, placeholder }) {
  const base = 'w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-accent/60 focus:bg-white/8 transition-colors';
  return (
    <div className="mb-4">
      <label className="block text-xs font-mono text-gray-400 mb-1.5">{label}</label>
      {rows ? (
        <textarea className={base} rows={rows} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
      ) : (
        <input className={base} type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
      )}
    </div>
  );
}

function Toggle({ label, checked, onChange }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <button onClick={() => onChange(!checked)} className={`relative w-10 h-5 rounded-full transition-colors duration-300 ${checked ? 'bg-accent' : 'bg-white/15'}`}>
        <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-300 ${checked ? 'translate-x-5' : ''}`} />
      </button>
      <span className="text-sm text-gray-300">{label}</span>
    </div>
  );
}

function TagList({ label, tags, onChange }) {
  const [input, setInput] = useState('');
  const add = () => { if (input.trim()) { onChange([...tags, input.trim()]); setInput(''); } };
  const remove = (i) => onChange(tags.filter((_, idx) => idx !== i));
  return (
    <div className="mb-4">
      <label className="block text-xs font-mono text-gray-400 mb-1.5">{label}</label>
      <div className="flex gap-2 mb-2">
        <input className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-accent/60"
          value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), add())}
          placeholder="Type and press Enter" />
        <button onClick={add} className="px-3 py-2 bg-accent/20 text-accent rounded-lg hover:bg-accent/30 transition-colors">
          <Plus className="w-4 h-4" />
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {tags.map((t, i) => (
          <span key={i} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/8 border border-white/10 text-xs text-gray-300">
            {t}
            <button onClick={() => remove(i)} className="text-gray-500 hover:text-red-400 transition-colors"><Trash2 className="w-3 h-3" /></button>
          </span>
        ))}
      </div>
    </div>
  );
}

function SaveButton({ onSave, saved }) {
  return (
    <button onClick={onSave}
      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${saved ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-accent text-background hover:shadow-[0_0_20px_rgba(62,242,208,0.3)]'}`}>
      {saved ? <><CheckCircle className="w-4 h-4" /> Saved!</> : <><Save className="w-4 h-4" /> Save Changes</>}
    </button>
  );
}

// ── Section editors ──────────────────────────────────────────────────

function HeroEditor() {
  const { data, updateSection } = useData();
  const [local, setLocal] = useState(data.hero);
  const [saved, setSaved] = useState(false);
  const upd = (key, val) => setLocal(p => ({ ...p, [key]: val }));
  const save = () => { updateSection('hero', local); setSaved(true); setTimeout(() => setSaved(false), 2000); };

  return (
    <div>
      <Field label="Full Name" value={local.name} onChange={v => upd('name', v)} />
      <TagList label="Role Phrases (typing animation)" tags={local.roles} onChange={v => upd('roles', v)} />
      <Field label="Bio Text" value={local.bio} onChange={v => upd('bio', v)} rows={4} />
      <TagList label="Skill Chips (below name)" tags={local.chips} onChange={v => upd('chips', v)} />
      <Field label="GitHub URL" value={local.github} onChange={v => upd('github', v)} />
      <Field label="LinkedIn URL" value={local.linkedin} onChange={v => upd('linkedin', v)} />
      <Field label="Location" value={local.location} onChange={v => upd('location', v)} />
      <Toggle label="Show 'Available' badge" checked={local.available} onChange={v => upd('available', v)} />
      <Field label="Availability Text" value={local.availabilityText} onChange={v => upd('availabilityText', v)} />
      <SaveButton onSave={save} saved={saved} />
    </div>
  );
}

function AboutEditor() {
  const { data, updateSection } = useData();
  const [local, setLocal] = useState(data.about);
  const [saved, setSaved] = useState(false);
  const upd = (k, v) => setLocal(p => ({ ...p, [k]: v }));
  const save = () => { updateSection('about', local); setSaved(true); setTimeout(() => setSaved(false), 2000); };

  return (
    <div>
      <Field label="Paragraph 1" value={local.para1} onChange={v => upd('para1', v)} rows={3} />
      <Field label="Paragraph 2" value={local.para2} onChange={v => upd('para2', v)} rows={3} />
      <Field label="Paragraph 3" value={local.para3} onChange={v => upd('para3', v)} rows={3} />
      <TagList label="Quick Skill Tags" tags={local.quickSkills} onChange={v => upd('quickSkills', v)} />
      <SaveButton onSave={save} saved={saved} />
    </div>
  );
}

function SkillsEditor() {
  const { data, updateSection } = useData();
  const [cats, setCats] = useState(data.skills);
  const [saved, setSaved] = useState(false);
  const [open, setOpen] = useState(0);
  const save = () => { updateSection('skills', cats); setSaved(true); setTimeout(() => setSaved(false), 2000); };

  const addCat = () => setCats(p => [...p, { name: 'New Category', color: 'accent', skills: [] }]);
  const removeCat = (i) => setCats(p => p.filter((_, idx) => idx !== i));
  const updateCat = (i, key, val) => setCats(p => p.map((c, idx) => idx === i ? { ...c, [key]: val } : c));
  const addSkill = (ci) => setCats(p => p.map((c, i) => i === ci ? { ...c, skills: [...c.skills, { name: 'Skill', pct: 70 }] } : c));
  const removeSkill = (ci, si) => setCats(p => p.map((c, i) => i === ci ? { ...c, skills: c.skills.filter((_, idx) => idx !== si) } : c));
  const updateSkill = (ci, si, key, val) => setCats(p => p.map((c, i) => i !== ci ? c : {
    ...c, skills: c.skills.map((s, j) => j === si ? { ...s, [key]: val } : s)
  }));

  return (
    <div>
      <div className="space-y-3 mb-6">
        {cats.map((cat, ci) => (
          <div key={ci} className="border border-white/10 rounded-xl overflow-hidden">
            <div className="flex items-center gap-3 p-4 bg-white/[0.03] cursor-pointer" onClick={() => setOpen(open === ci ? -1 : ci)}>
              <GripVertical className="w-4 h-4 text-gray-600" />
              <span className="flex-1 text-sm font-medium text-white">{cat.name}</span>
              <span className="text-xs text-gray-500">{cat.skills.length} skills</span>
              <button onClick={e => { e.stopPropagation(); removeCat(ci); }} className="text-red-500/50 hover:text-red-400 transition-colors p-1">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              {open === ci ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
            </div>
            {open === ci && (
              <div className="p-4 border-t border-white/10 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono text-gray-400 mb-1">Category Name</label>
                    <input className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-accent/60"
                      value={cat.name} onChange={e => updateCat(ci, 'name', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-gray-400 mb-1">Color</label>
                    <select className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-accent/60"
                      value={cat.color} onChange={e => updateCat(ci, 'color', e.target.value)}>
                      <option value="accent">Cyan (accent)</option>
                      <option value="violet">Violet</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  {cat.skills.map((sk, si) => (
                    <div key={si} className="flex items-center gap-3">
                      <input className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-accent/60"
                        value={sk.name} onChange={e => updateSkill(ci, si, 'name', e.target.value)} placeholder="Skill name" />
                      <div className="flex items-center gap-2 w-28">
                        <input type="range" min="0" max="100" value={sk.pct}
                          onChange={e => updateSkill(ci, si, 'pct', Number(e.target.value))}
                          className="flex-1 accent-cyan-400" />
                        <span className="text-xs text-accent font-mono w-8">{sk.pct}%</span>
                      </div>
                      <button onClick={() => removeSkill(ci, si)} className="text-red-500/50 hover:text-red-400 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button onClick={() => addSkill(ci)} className="flex items-center gap-2 text-xs text-accent/70 hover:text-accent transition-colors mt-2">
                    <Plus className="w-3.5 h-3.5" /> Add Skill
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      <button onClick={addCat} className="flex items-center gap-2 text-sm text-accent/70 hover:text-accent transition-colors mb-6 border border-accent/20 rounded-xl px-4 py-2 hover:bg-accent/5">
        <Plus className="w-4 h-4" /> Add Category
      </button>
      <SaveButton onSave={save} saved={saved} />
    </div>
  );
}

function ProjectsEditor() {
  const { data, updateSection } = useData();
  const [projects, setProjects] = useState(data.projects);
  const [saved, setSaved] = useState(false);
  const [open, setOpen] = useState(null);
  const save = () => { updateSection('projects', projects); setSaved(true); setTimeout(() => setSaved(false), 2000); };

  const addProject = () => {
    const newP = { id: Date.now().toString(), title: 'New Project', tag: 'Category', desc: '', tech: [], accent: '#3ef2d0', github: '', live: '' };
    setProjects(p => [...p, newP]);
    setOpen(newP.id);
  };
  const removeProject = (id) => setProjects(p => p.filter(x => x.id !== id));
  const update = (id, key, val) => setProjects(p => p.map(x => x.id === id ? { ...x, [key]: val } : x));

  return (
    <div>
      <div className="space-y-3 mb-6">
        {projects.map((p) => (
          <div key={p.id} className="border border-white/10 rounded-xl overflow-hidden">
            <div className="flex items-center gap-3 p-4 bg-white/[0.03] cursor-pointer" onClick={() => setOpen(open === p.id ? null : p.id)}>
              <span className="flex-1 text-sm font-medium text-white truncate">{p.title}</span>
              <span className="text-xs px-2 py-0.5 rounded-full border border-white/10 text-gray-400">{p.tag}</span>
              <button onClick={e => { e.stopPropagation(); removeProject(p.id); }} className="text-red-500/50 hover:text-red-400 transition-colors p-1">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              {open === p.id ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
            </div>
            {open === p.id && (
              <div className="p-4 border-t border-white/10 space-y-0">
                <Field label="Title" value={p.title} onChange={v => update(p.id, 'title', v)} />
                <Field label="Tag / Category" value={p.tag} onChange={v => update(p.id, 'tag', v)} />
                <Field label="Description" value={p.desc} onChange={v => update(p.id, 'desc', v)} rows={3} />
                <TagList label="Tech Stack" tags={p.tech} onChange={v => update(p.id, 'tech', v)} />
                <Field label="GitHub URL" value={p.github} onChange={v => update(p.id, 'github', v)} />
                <Field label="Live Demo URL (optional)" value={p.live} onChange={v => update(p.id, 'live', v)} />
                <div className="mb-4">
                  <label className="block text-xs font-mono text-gray-400 mb-1.5">Accent Color</label>
                  <div className="flex items-center gap-3">
                    <input type="color" value={p.accent} onChange={e => update(p.id, 'accent', e.target.value)}
                      className="w-10 h-10 rounded-lg border border-white/10 bg-transparent cursor-pointer" />
                    <span className="text-xs font-mono text-gray-400">{p.accent}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      <button onClick={addProject} className="flex items-center gap-2 text-sm text-accent/70 hover:text-accent transition-colors mb-6 border border-accent/20 rounded-xl px-4 py-2 hover:bg-accent/5">
        <Plus className="w-4 h-4" /> Add Project
      </button>
      <SaveButton onSave={save} saved={saved} />
    </div>
  );
}

function AchievementsEditor() {
  const { data, updateSection } = useData();
  const [items, setItems] = useState(data.achievements);
  const [saved, setSaved] = useState(false);
  const [open, setOpen] = useState(null);
  const save = () => { updateSection('achievements', items); setSaved(true); setTimeout(() => setSaved(false), 2000); };

  const add = () => {
    const n = { id: Date.now().toString(), title: 'New Achievement', org: 'Organization', date: '2025', desc: '' };
    setItems(p => [...p, n]); setOpen(n.id);
  };
  const remove = (id) => setItems(p => p.filter(x => x.id !== id));
  const upd = (id, k, v) => setItems(p => p.map(x => x.id === id ? { ...x, [k]: v } : x));

  return (
    <div>
      <div className="space-y-3 mb-6">
        {items.map(it => (
          <div key={it.id} className="border border-white/10 rounded-xl overflow-hidden">
            <div className="flex items-center gap-3 p-4 bg-white/[0.03] cursor-pointer" onClick={() => setOpen(open === it.id ? null : it.id)}>
              <span className="flex-1 text-sm font-medium text-white truncate">{it.title}</span>
              <span className="text-xs text-gray-500 font-mono">{it.date}</span>
              <button onClick={e => { e.stopPropagation(); remove(it.id); }} className="text-red-500/50 hover:text-red-400 transition-colors p-1"><Trash2 className="w-3.5 h-3.5" /></button>
              {open === it.id ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
            </div>
            {open === it.id && (
              <div className="p-4 border-t border-white/10">
                <Field label="Title" value={it.title} onChange={v => upd(it.id, 'title', v)} />
                <Field label="Organization" value={it.org} onChange={v => upd(it.id, 'org', v)} />
                <Field label="Date" value={it.date} onChange={v => upd(it.id, 'date', v)} />
                <Field label="Description" value={it.desc} onChange={v => upd(it.id, 'desc', v)} rows={3} />
              </div>
            )}
          </div>
        ))}
      </div>
      <button onClick={add} className="flex items-center gap-2 text-sm text-accent/70 hover:text-accent mb-6 border border-accent/20 rounded-xl px-4 py-2 hover:bg-accent/5 transition-colors">
        <Plus className="w-4 h-4" /> Add Achievement
      </button>
      <SaveButton onSave={save} saved={saved} />
    </div>
  );
}

function ExperienceEditor() {
  const { data, updateSection } = useData();
  const [local, setLocal] = useState(data.experience);
  const [saved, setSaved] = useState(false);
  const save = () => { updateSection('experience', local); setSaved(true); setTimeout(() => setSaved(false), 2000); };

  // Work
  const addWork = () => setLocal(p => ({ ...p, work: [...p.work, { id: Date.now().toString(), role: 'Role', org: 'Organization', date: '2025', points: [] }] }));
  const removeWork = (id) => setLocal(p => ({ ...p, work: p.work.filter(x => x.id !== id) }));
  const updWork = (id, k, v) => setLocal(p => ({ ...p, work: p.work.map(x => x.id === id ? { ...x, [k]: v } : x) }));
  const addPoint = (id) => setLocal(p => ({ ...p, work: p.work.map(x => x.id === id ? { ...x, points: [...x.points, 'New bullet point'] } : x) }));
  const removePoint = (id, pi) => setLocal(p => ({ ...p, work: p.work.map(x => x.id === id ? { ...x, points: x.points.filter((_, i) => i !== pi) } : x) }));
  const updPoint = (id, pi, v) => setLocal(p => ({ ...p, work: p.work.map(x => x.id === id ? { ...x, points: x.points.map((pt, i) => i === pi ? v : pt) } : x) }));

  // Education
  const addEdu = () => setLocal(p => ({ ...p, education: [...p.education, { id: Date.now().toString(), role: 'Degree', org: 'Institution', date: '2025', detail: '' }] }));
  const removeEdu = (id) => setLocal(p => ({ ...p, education: p.education.filter(x => x.id !== id) }));
  const updEdu = (id, k, v) => setLocal(p => ({ ...p, education: p.education.map(x => x.id === id ? { ...x, [k]: v } : x) }));

  const inputCls = 'flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-accent/60';

  return (
    <div>
      <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2"><Briefcase className="w-4 h-4 text-accent" /> Work Experience</h3>
      {local.work.map(w => (
        <div key={w.id} className="border border-white/10 rounded-xl p-4 mb-3">
          <div className="grid grid-cols-2 gap-3 mb-3">
            <input className={inputCls} value={w.role} onChange={e => updWork(w.id, 'role', e.target.value)} placeholder="Role" />
            <input className={inputCls} value={w.org} onChange={e => updWork(w.id, 'org', e.target.value)} placeholder="Organization" />
            <input className={inputCls} value={w.date} onChange={e => updWork(w.id, 'date', e.target.value)} placeholder="Date range" />
          </div>
          <div className="space-y-2 mb-2">
            {w.points.map((pt, pi) => (
              <div key={pi} className="flex gap-2">
                <input className={inputCls} value={pt} onChange={e => updPoint(w.id, pi, e.target.value)} />
                <button onClick={() => removePoint(w.id, pi)} className="text-red-500/50 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
            <button onClick={() => addPoint(w.id)} className="text-xs text-accent/70 hover:text-accent flex items-center gap-1 transition-colors">
              <Plus className="w-3 h-3" /> Add bullet
            </button>
          </div>
          <button onClick={() => removeWork(w.id)} className="text-xs text-red-500/50 hover:text-red-400 flex items-center gap-1 transition-colors mt-2">
            <Trash2 className="w-3 h-3" /> Remove entry
          </button>
        </div>
      ))}
      <button onClick={addWork} className="flex items-center gap-2 text-sm text-accent/70 hover:text-accent mb-8 border border-accent/20 rounded-xl px-4 py-2 hover:bg-accent/5 transition-colors">
        <Plus className="w-4 h-4" /> Add Work Entry
      </button>

      <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2"><User className="w-4 h-4 text-violet" /> Education</h3>
      {local.education.map(e => (
        <div key={e.id} className="border border-white/10 rounded-xl p-4 mb-3">
          <div className="grid grid-cols-2 gap-3">
            <input className={inputCls} value={e.role} onChange={ev => updEdu(e.id, 'role', ev.target.value)} placeholder="Degree" />
            <input className={inputCls} value={e.org} onChange={ev => updEdu(e.id, 'org', ev.target.value)} placeholder="Institution" />
            <input className={inputCls} value={e.date} onChange={ev => updEdu(e.id, 'date', ev.target.value)} placeholder="Year" />
            <input className={inputCls} value={e.detail} onChange={ev => updEdu(e.id, 'detail', ev.target.value)} placeholder="Score/GPA" />
          </div>
          <button onClick={() => removeEdu(e.id)} className="text-xs text-red-500/50 hover:text-red-400 flex items-center gap-1 transition-colors mt-3">
            <Trash2 className="w-3 h-3" /> Remove
          </button>
        </div>
      ))}
      <button onClick={addEdu} className="flex items-center gap-2 text-sm text-accent/70 hover:text-accent mb-6 border border-accent/20 rounded-xl px-4 py-2 hover:bg-accent/5 transition-colors">
        <Plus className="w-4 h-4" /> Add Education
      </button>
      <SaveButton onSave={save} saved={saved} />
    </div>
  );
}

function ContactEditor() {
  const { data, updateSection } = useData();
  const [local, setLocal] = useState(data.contact);
  const [saved, setSaved] = useState(false);
  const upd = (k, v) => setLocal(p => ({ ...p, [k]: v }));
  const save = () => { updateSection('contact', local); setSaved(true); setTimeout(() => setSaved(false), 2000); };

  return (
    <div>
      <Field label="Email" value={local.email} onChange={v => upd('email', v)} type="email" />
      <Field label="Phone" value={local.phone} onChange={v => upd('phone', v)} />
      <Field label="Location (display text)" value={local.location} onChange={v => upd('location', v)} />
      <SaveButton onSave={save} saved={saved} />
    </div>
  );
}

// ── Sidebar nav ──────────────────────────────────────────────────────
const SECTIONS = [
  { id: 'hero',         label: 'Hero',         icon: User,          comp: HeroEditor },
  { id: 'about',        label: 'About',         icon: User,          comp: AboutEditor },
  { id: 'skills',       label: 'Skills',        icon: Cpu,           comp: SkillsEditor },
  { id: 'projects',     label: 'Projects',      icon: FolderOpen,    comp: ProjectsEditor },
  { id: 'achievements', label: 'Achievements',  icon: Trophy,        comp: AchievementsEditor },
  { id: 'experience',   label: 'Experience',    icon: Briefcase,     comp: ExperienceEditor },
  { id: 'contact',      label: 'Contact',       icon: Mail,          comp: ContactEditor },
  { id: 'messages',     label: 'Messages',      icon: MessageSquare, comp: MessagesInbox },
  { id: 'images',       label: 'Images',        icon: Image,         comp: ImageManager  },
];


// ── Supabase status pill ─────────────────────────────────────────────
function SyncStatus({ online, saving }) {
  if (saving) return (
    <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">
      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
      <span className="text-[10px] font-mono text-blue-400">Saving…</span>
    </div>
  );
  if (online) return (
    <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-green-500/10 border border-green-500/20">
      <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
      <span className="text-[10px] font-mono text-green-400">Supabase live</span>
    </div>
  );
  return (
    <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-orange-500/10 border border-orange-500/20">
      <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
      <span className="text-[10px] font-mono text-orange-400">Local only</span>
    </div>
  );
}

// ── Main admin shell ─────────────────────────────────────────────────
export default function AdminPage() {
  const [authed, setAuthed]     = useState(false);
  const [checking, setChecking] = useState(true);
  const [activeSection, setActiveSection] = useState('hero');
  const { resetToDefaults, exportJSON, importJSON, online, saving } = useData();

  // ── Force dark mode on admin page (always) ───────────────────────
  useEffect(() => {
    const root = document.documentElement;
    const wasDark = root.classList.contains('dark');
    root.classList.add('dark'); // Admin is always dark
    return () => {
      // Restore user's preference when leaving admin
      const saved = localStorage.getItem('theme');
      if (saved === 'light') root.classList.remove('dark');
      else if (!wasDark) root.classList.remove('dark');
    };
  }, []);

  // Check for existing Supabase session on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      // Only grant access if OTP flow is not pending
      if (session && !sessionStorage.getItem('otp_pending')) setAuthed(true);
      setChecking(false);
    });
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        // Ignore intermediate sign-in during OTP verification flow
        if (!sessionStorage.getItem('otp_pending')) setAuthed(true);
      } else if (event === 'SIGNED_OUT') {
        // Only revoke access if not in OTP flow (OTP flow signs out intentionally)
        if (!sessionStorage.getItem('otp_pending')) setAuthed(false);
      } else {
        setAuthed(!!session);
      }
    });
    return () => subscription.unsubscribe();
  }, []);


  const logout = async () => {
    await supabase.auth.signOut();
    setAuthed(false);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file'; input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const ok = importJSON(ev.target.result);
        alert(ok ? '✅ Data imported!' : '❌ Invalid JSON file.');
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleReset = () => {
    if (confirm('Reset ALL content to defaults? This cannot be undone.')) resetToDefaults();
  };

  // Loading state while checking session
  if (checking) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
    </div>
  );

  // Not authenticated → show the full auth flow
  if (!authed) return <AdminAuth onAuthenticated={() => setAuthed(true)} />;

  const ActiveComp = SECTIONS.find(s => s.id === activeSection)?.comp || HeroEditor;
  const sectionLabel = SECTIONS.find(s => s.id === activeSection)?.label;

  return (
    <div className="min-h-screen flex" style={{ background: '#080a12' }}>
      {/* ── Sidebar ─────────────────────────────────────────────── */}
      <aside className="w-64 shrink-0 flex flex-col border-r border-slate-700/30" style={{ background: '#0c0e1a' }}>
        {/* Logo */}
        <div className="px-5 py-4 border-b border-slate-700/30">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)' }}>
                <span className="text-white text-xs font-bold">M</span>
              </div>
              <span className="font-display font-bold text-white text-sm">Portfolio CMS</span>
            </div>
            <SyncStatus online={online} saving={saving} />
          </div>
          <div className="text-[10px] text-slate-600 font-mono mt-1">Mohammed Anas Khan · Admin</div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          <div className="text-[10px] font-mono text-slate-600 px-3 py-2 uppercase tracking-wider">Content</div>
          {SECTIONS.filter(s => s.id !== 'messages').map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiveSection(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 text-left ${
                activeSection === id
                  ? 'bg-violet-500/15 text-violet-300 border border-violet-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/30'
              }`}>
              <Icon className="w-4 h-4 shrink-0" />
              {label}
              {activeSection === id && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-400" />}
            </button>
          ))}

          <div className="text-[10px] font-mono text-slate-600 px-3 py-2 uppercase tracking-wider mt-2">Inbox & Media</div>
          {SECTIONS.filter(s => s.id === 'messages' || s.id === 'images').map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiveSection(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 text-left ${
                activeSection === id
                  ? 'bg-violet-500/15 text-violet-300 border border-violet-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/30'
              }`}>
              <Icon className="w-4 h-4 shrink-0" />
              {label}
              {activeSection === id && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-400" />}
            </button>
          ))}
        </nav>

        {/* Tools */}
        <div className="p-3 border-t border-slate-700/30 space-y-0.5">
          <Link to="/" target="_blank"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:text-violet-300 hover:bg-violet-500/10 transition-all duration-200">
            <Eye className="w-4 h-4" /> View Portfolio
          </Link>
          <button onClick={exportJSON}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:text-green-400 hover:bg-green-400/5 transition-all duration-200">
            <Download className="w-4 h-4" /> Export JSON
          </button>
          <button onClick={handleImport}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:text-blue-400 hover:bg-blue-400/5 transition-all duration-200">
            <Upload className="w-4 h-4" /> Import JSON
          </button>
          <button onClick={handleReset}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:text-orange-400 hover:bg-orange-400/5 transition-all duration-200">
            <RotateCcw className="w-4 h-4" /> Reset Defaults
          </button>
          <button onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-500/50 hover:text-red-400 hover:bg-red-400/5 transition-all duration-200">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main content ────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto" style={{ background: '#080a12' }}>
        <div className="max-w-3xl mx-auto px-8 py-8">
          <AnimatePresence mode="wait">
            <motion.div key={activeSection}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.25 }}>
              <div className="flex items-center justify-between mb-1">
                <h2 className="font-display text-2xl font-bold text-white">{sectionLabel}</h2>
                <SyncStatus online={online} saving={saving} />
              </div>
              <p className="text-sm text-slate-500 mb-8 font-mono">
                {online ? '🟢 Synced to Supabase · live across all devices' : '🟡 Offline · changes saved locally'}
              </p>
              <ActiveComp />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
