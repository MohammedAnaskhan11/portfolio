import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import {
  Upload, Trash2, Image, Loader2, CheckCircle,
  AlertCircle, X, GripVertical, Edit3, Save,
} from 'lucide-react';

const BUCKET = 'achievement-images';

// ── fetch all images stored in Supabase ───────────────────────────
async function fetchImages() {
  const { data, error } = await supabase.storage.from(BUCKET).list('', {
    sortBy: { column: 'created_at', order: 'desc' },
  });
  if (error || !data) return [];

  // Filter only image files
  const imgs = data.filter(f => f.name && /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(f.name));

  return imgs.map(f => {
    const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(f.name);
    return {
      name: f.name,
      url: publicUrl,
      caption: f.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '),
      sub: '',
    };
  });
}

async function uploadImage(file) {
  const ext  = file.name.split('.').pop();
  const name = `ach_${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(name, file, { upsert: false });
  if (error) return { ok: false, error: error.message };
  const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(name);
  return { ok: true, name, url: publicUrl };
}

async function deleteImage(name) {
  const { error } = await supabase.storage.from(BUCKET).remove([name]);
  return !error;
}

// ── individual image card ─────────────────────────────────────────
function ImageCard({ img, onDelete }) {
  const [deleting, setDel] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Delete "${img.name}"?`)) return;
    setDel(true);
    await onDelete(img.name);
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(img.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div layout initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.25 }}
      className="relative group rounded-xl overflow-hidden border border-slate-700/40 bg-slate-800/30">

      {/* Thumbnail */}
      <div className="aspect-video overflow-hidden bg-slate-900">
        <img src={img.url} alt={img.caption}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={e => { e.target.style.display = 'none'; }} />
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-white text-xs font-medium truncate capitalize">{img.caption}</p>
        <p className="text-slate-500 text-[10px] font-mono mt-0.5 truncate">{img.name}</p>
      </div>

      {/* Actions overlay */}
      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
        <button onClick={copyUrl}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600/90 text-white text-xs font-mono hover:bg-violet-500 transition-colors">
          {copied ? <CheckCircle className="w-3 h-3" /> : <Image className="w-3 h-3" />}
          {copied ? 'Copied!' : 'Copy URL'}
        </button>
        <button onClick={handleDelete} disabled={deleting}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600/90 text-white text-xs font-mono hover:bg-red-500 transition-colors disabled:opacity-50">
          {deleting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
          {deleting ? 'Deleting…' : 'Delete'}
        </button>
      </div>
    </motion.div>
  );
}

// ── Upload drop zone ──────────────────────────────────────────────
function UploadZone({ onUploaded }) {
  const inputRef    = useRef();
  const [drag, setDrag]       = useState(false);
  const [uploading, setUpload] = useState(false);
  const [progress, setProg]   = useState([]);

  const handleFiles = async (files) => {
    const valid = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (!valid.length) return;
    setUpload(true);
    setProg(valid.map(f => ({ name: f.name, status: 'uploading' })));

    const results = [];
    for (let i = 0; i < valid.length; i++) {
      const res = await uploadImage(valid[i]);
      setProg(p => p.map((x, j) => j === i ? { ...x, status: res.ok ? 'done' : 'error' } : x));
      if (res.ok) results.push(res);
    }

    setTimeout(() => {
      setUpload(false);
      setProg([]);
      if (results.length) onUploaded();
    }, 1000);
  };

  return (
    <div>
      {/* Drop zone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={e => { e.preventDefault(); setDrag(false); handleFiles(e.dataTransfer.files); }}
        className={`relative flex flex-col items-center justify-center gap-3 p-8 rounded-2xl border-2 border-dashed
          cursor-pointer transition-all duration-200
          ${drag ? 'border-violet-400 bg-violet-500/10 scale-[1.02]' : 'border-slate-600 hover:border-violet-500/60 hover:bg-violet-500/5'}`}>

        <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
          <Upload className="w-5 h-5 text-violet-400" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-slate-300">Drop images here or click to browse</p>
          <p className="text-xs text-slate-500 mt-1 font-mono">JPG · PNG · WebP · GIF · SVG</p>
        </div>
        <input ref={inputRef} type="file" multiple accept="image/*"
          className="hidden" onChange={e => handleFiles(e.target.files)} />
      </div>

      {/* Upload progress */}
      <AnimatePresence>
        {progress.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="mt-3 space-y-1.5">
            {progress.map((p, i) => (
              <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/60 border border-slate-700/40">
                {p.status === 'uploading' && <Loader2 className="w-3.5 h-3.5 text-violet-400 animate-spin shrink-0" />}
                {p.status === 'done'      && <CheckCircle className="w-3.5 h-3.5 text-green-400 shrink-0" />}
                {p.status === 'error'     && <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />}
                <span className="text-xs font-mono text-slate-400 truncate">{p.name}</span>
                <span className={`ml-auto text-[10px] font-mono ${p.status === 'done' ? 'text-green-400' : p.status === 'error' ? 'text-red-400' : 'text-violet-400'}`}>
                  {p.status === 'uploading' ? 'uploading…' : p.status === 'done' ? 'done ✓' : 'failed ✗'}
                </span>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main ImageManager ─────────────────────────────────────────────
export default function ImageManager() {
  const [images, setImages]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  const load = async () => {
    setLoading(true); setError('');
    const imgs = await fetchImages();
    setImages(imgs);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (name) => {
    await deleteImage(name);
    setImages(prev => prev.filter(i => i.name !== name));
  };

  // Setup error — bucket doesn't exist yet
  const bucketMissing = error?.includes('bucket') || error?.includes('not found');

  return (
    <div className="space-y-6">
      {/* Setup notice */}
      <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-amber-300 mb-1">One-time setup required</p>
            <p className="text-xs text-slate-400 font-mono leading-relaxed">
              Go to{' '}
              <a href="https://supabase.com/dashboard/project/kellarbpqpgpxzimzsmv/storage/buckets"
                target="_blank" rel="noreferrer" className="text-violet-400 underline">
                Supabase → Storage
              </a>
              {' '}→ New bucket → Name it{' '}
              <span className="text-white font-bold">achievement-images</span>
              {' '}→ toggle <span className="text-white">Public</span> → Create.
              Then come back and upload!
            </p>
          </div>
        </div>
      </div>

      {/* Upload zone */}
      <div>
        <h3 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
          <Upload className="w-4 h-4 text-violet-400" /> Upload Achievement Photos
        </h3>
        <UploadZone onUploaded={load} />
      </div>

      {/* Gallery */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2">
            <Image className="w-4 h-4 text-violet-400" />
            Uploaded Images
            {!loading && <span className="text-[10px] font-mono text-slate-500 ml-1">({images.length})</span>}
          </h3>
          <button onClick={load} className="text-xs text-slate-500 hover:text-slate-300 font-mono transition-colors">
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-5 h-5 text-violet-400 animate-spin" />
          </div>
        ) : images.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-slate-700/40 rounded-xl">
            <Image className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-sm text-slate-500 font-mono">No images yet</p>
            <p className="text-xs text-slate-600 mt-1">Upload achievement photos above</p>
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-2 gap-3">
            <AnimatePresence>
              {images.map(img => (
                <ImageCard key={img.name} img={img} onDelete={handleDelete} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* How it works */}
      <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/30">
        <p className="text-xs font-bold text-slate-400 mb-2">How images appear on your portfolio</p>
        <ol className="text-xs text-slate-500 font-mono space-y-1 list-decimal list-inside">
          <li>Upload photos here → they go to Supabase Storage</li>
          <li>Public CDN URL is generated automatically</li>
          <li>Achievements section carousel reads from Storage</li>
          <li>Delete here → removed from carousel instantly</li>
        </ol>
      </div>
    </div>
  );
}
