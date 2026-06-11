import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import {
  Lock, Mail, Eye, EyeOff, CheckCircle, AlertCircle,
  Loader2, ShieldCheck, ArrowLeft, RefreshCw, KeyRound,
} from 'lucide-react';

// ── helpers ───────────────────────────────────────────────────────
const gen4 = () => String(Math.floor(1000 + Math.random() * 9000)); // 4-digit OTP

async function saveAndSendOTP(email) {
  // Delete old unused OTPs for this email
  await supabase.from('admin_otps').delete().eq('email', email).eq('used', false);

  const otp = gen4();
  const expires = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 min

  // INSERT triggers the PostgreSQL function which calls Resend server-side
  const { error } = await supabase
    .from('admin_otps')
    .insert([{ email, otp, expires_at: expires }]);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

async function verifyOTP(email, otp) {
  const { data, error } = await supabase
    .from('admin_otps')
    .select('id, expires_at')
    .eq('email', email)
    .eq('otp', otp.trim())
    .eq('used', false)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error || !data) return false;

  // Mark as used
  await supabase.from('admin_otps').update({ used: true }).eq('id', data.id);
  return true;
}

// ── UI atoms ──────────────────────────────────────────────────────
function Field({ label, type = 'text', value, onChange, placeholder, icon: Icon, right, onKeyDown }) {
  return (
    <div>
      {label && <label className="block text-xs font-mono text-slate-400 mb-1.5">{label}</label>}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input type={type} value={value} onChange={e => onChange(e.target.value)}
          onKeyDown={onKeyDown} placeholder={placeholder}
          className="w-full bg-slate-800/60 border border-slate-700/60 rounded-xl px-4 py-3 text-sm
            text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500/60
            focus:bg-slate-800 transition-all duration-200"
          style={{ paddingLeft: Icon ? '2.5rem' : undefined, paddingRight: right ? '2.75rem' : undefined }} />
        {right && <div className="absolute right-3 top-1/2 -translate-y-1/2">{right}</div>}
      </div>
    </div>
  );
}

function Btn({ children, onClick, loading, disabled }) {
  return (
    <button onClick={onClick} disabled={loading || disabled}
      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold
        bg-gradient-to-r from-violet-600 to-indigo-600 text-white
        hover:from-violet-500 hover:to-indigo-500
        hover:shadow-[0_0_28px_rgba(139,92,246,0.4)] hover:scale-[1.02] active:scale-[0.98]
        transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100">
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : children}
    </button>
  );
}

function Msg({ type, text }) {
  if (!text) return null;
  const err = type === 'error';
  return (
    <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
      className={`flex items-start gap-2 p-3 rounded-xl text-xs font-mono border
        ${err ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-green-500/10 border-green-500/20 text-green-400'}`}>
      {err ? <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /> : <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />}
      <span>{text}</span>
    </motion.div>
  );
}

// ── 4-digit OTP boxes ─────────────────────────────────────────────
function OTPBoxes({ value, onChange, disabled }) {
  const refs = useRef([]);
  const digits = value.padEnd(4, ' ').slice(0, 4).split('');

  const handleChange = (i, v) => {
    const clean = v.replace(/\D/g, '').slice(-1);
    const arr = value.padEnd(4, ' ').split('');
    arr[i] = clean || ' ';
    onChange(arr.join('').trimEnd());
    if (clean && i < 3) setTimeout(() => refs.current[i + 1]?.focus(), 0);
  };

  const handleKey = (i, e) => {
    if (e.key === 'Backspace' && !digits[i].trim() && i > 0) refs.current[i - 1]?.focus();
  };

  const handlePaste = (e) => {
    const p = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
    if (p) { onChange(p); e.preventDefault(); }
  };

  return (
    <div className="flex gap-3 justify-center" onPaste={handlePaste}>
      {[0, 1, 2, 3].map(i => (
        <input key={i} ref={el => refs.current[i] = el}
          type="text" inputMode="numeric" maxLength={1}
          value={digits[i].trim()} disabled={disabled}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKey(i, e)}
          className={`w-14 h-16 text-center text-2xl font-bold font-mono text-white
            border-2 rounded-2xl focus:outline-none transition-all duration-200 caret-transparent
            ${digits[i].trim()
              ? 'bg-violet-500/15 border-violet-500/60 shadow-[0_0_16px_rgba(139,92,246,0.2)]'
              : 'bg-slate-800/60 border-slate-700/60'}
            focus:border-violet-400 focus:bg-violet-500/10 disabled:opacity-40`} />
      ))}
    </div>
  );
}

// ── STEP 1: Login ─────────────────────────────────────────────────
function StepLogin({ onOTPSent, onForgot }) {
  const [email, setEmail]   = useState('');
  const [pw, setPw]         = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoad]  = useState(false);
  const [error, setError]   = useState('');

  const submit = async () => {
    if (!email || !pw) return setError('Please enter your email and password.');
    setLoad(true); setError('');

    // Block AdminPage from granting access during OTP flow
    sessionStorage.setItem('otp_pending', 'true');

    // 1. Verify credentials
    const { error: authErr } = await supabase.auth.signInWithPassword({ email, password: pw });
    if (authErr) {
      sessionStorage.removeItem('otp_pending');
      setError(authErr.message.includes('Invalid') ? 'Incorrect email or password.' : authErr.message);
      setLoad(false); return;
    }

    // 2. Sign out — session only created after OTP
    await supabase.auth.signOut();

    // 3. Generate OTP, save to DB, trigger sends email via database
    const { ok, error: saveErr } = await saveAndSendOTP(email);
    if (!ok) {
      sessionStorage.removeItem('otp_pending');
      setError(`OTP failed: ${saveErr}. Run the required SQL in Supabase first.`);
      setLoad(false); return;
    }

    onOTPSent(email, pw);
    setLoad(false);
  };

  return (
    <motion.div key="login" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }} className="space-y-4">
      <Field label="Email" type="email" icon={Mail} value={email} onChange={setEmail}
        placeholder="your@email.com" onKeyDown={e => e.key === 'Enter' && submit()} />
      <Field label="Password" type={showPw ? 'text' : 'password'} icon={Lock} value={pw} onChange={setPw}
        placeholder="••••••••" onKeyDown={e => e.key === 'Enter' && submit()}
        right={
          <button onClick={() => setShowPw(s => !s)} className="text-slate-500 hover:text-slate-300 transition-colors">
            {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        } />
      <Msg type="error" text={error} />
      <Btn onClick={submit} loading={loading}>Continue → Send OTP</Btn>
      <button onClick={onForgot} className="w-full text-center text-xs text-slate-500 hover:text-violet-400 transition-colors font-mono py-1">
        Forgot password?
      </button>
    </motion.div>
  );
}

// ── STEP 2: OTP entry ─────────────────────────────────────────────
function StepOTP({ email, password, onSuccess, onBack }) {
  const [otp, setOtp]          = useState('');
  const [loading, setLoad]     = useState(false);
  const [resending, setResend] = useState(false);
  const [resent, setResent]    = useState(false);
  const [error, setError]      = useState('');
  const [timeLeft, setTime]    = useState(600);

  useEffect(() => {
    const t = setInterval(() => setTime(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, []);

  const fmt = s => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;

  const verify = async (code) => {
    const token = (code ?? otp).replace(/\s/g, '');
    if (token.length < 4) return setError('Enter all 4 digits.');
    setLoad(true); setError('');

    const valid = await verifyOTP(email, token);
    if (!valid) { setError('Wrong or expired OTP. Try again or resend.'); setLoad(false); return; }

    // OTP valid → clear pending flag → sign in with password to create real session
    sessionStorage.removeItem('otp_pending');
    const { error: authErr } = await supabase.auth.signInWithPassword({ email, password });
    if (authErr) { setError('Session error: ' + authErr.message); setLoad(false); return; }

    onSuccess();
  };

  const handleChange = (val) => {
    setOtp(val); setError('');
    if (val.replace(/\s/g,'').length === 4) verify(val);
  };

  const resend = async () => {
    setResend(true); setError(''); setResent(false); setOtp('');
    const { ok, error: e } = await saveAndSendOTP(email);
    setResend(false);
    if (!ok) { setError('Resend failed: ' + e); return; }
    setResent(true); setTime(600);
    setTimeout(() => setResent(false), 5000);
  };

  return (
    <motion.div key="otp" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }} className="space-y-5">
      <div className="text-center">
        <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mx-auto mb-3">
          <ShieldCheck className="w-5 h-5 text-violet-400" />
        </div>
        <p className="text-sm text-slate-300">4-digit OTP sent to</p>
        <p className="text-sm font-mono text-violet-300 mt-0.5 break-all">{email}</p>
        <p className="text-xs text-slate-500 mt-2">
          Check your Gmail · expires in{' '}
          <span className={`font-mono font-bold ${timeLeft < 60 ? 'text-red-400' : 'text-slate-400'}`}>
            {fmt(timeLeft)}
          </span>
        </p>
      </div>

      <OTPBoxes value={otp} onChange={handleChange} disabled={loading} />

      <Msg type="error" text={error} />
      {resent && <Msg type="success" text="New OTP sent! Check your inbox." />}

      <Btn onClick={() => verify()} loading={loading} disabled={timeLeft === 0}>
        <KeyRound className="w-4 h-4" /> Verify &amp; Enter Admin
      </Btn>

      {timeLeft === 0 && (
        <p className="text-center text-xs text-red-400 font-mono">OTP expired — resend below</p>
      )}

      <div className="flex items-center justify-between text-xs font-mono">
        <button onClick={onBack} className="text-slate-500 hover:text-slate-300 flex items-center gap-1 transition-colors">
          <ArrowLeft className="w-3 h-3" /> Back
        </button>
        <button onClick={resend} disabled={resending}
          className="text-slate-500 hover:text-violet-400 flex items-center gap-1 transition-colors disabled:opacity-40">
          <RefreshCw className={`w-3 h-3 ${resending ? 'animate-spin' : ''}`} />
          {resending ? 'Sending…' : 'Resend OTP'}
        </button>
      </div>
    </motion.div>
  );
}

// ── Forgot password ───────────────────────────────────────────────
function StepForgot({ onBack }) {
  const [email, setEmail] = useState('');
  const [loading, setL]   = useState(false);
  const [sent, setSent]   = useState(false);
  const [error, setError] = useState('');

  const send = async () => {
    if (!email) return setError('Please enter your email.');
    setL(true); setError('');
    const { error: e } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/admin`,
    });
    setL(false);
    if (e) { setError(e.message); return; }
    setSent(true);
  };

  if (sent) return (
    <motion.div initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }} className="text-center space-y-4 py-4">
      <div className="w-14 h-14 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto">
        <Mail className="w-6 h-6 text-green-400" />
      </div>
      <div>
        <p className="text-white font-semibold mb-1">Check your inbox</p>
        <p className="text-sm text-slate-400">Reset link sent to <span className="text-violet-400 font-mono">{email}</span></p>
      </div>
      <button onClick={onBack} className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1 mx-auto transition-colors">
        <ArrowLeft className="w-3 h-3" /> Back to login
      </button>
    </motion.div>
  );

  return (
    <motion.div key="forgot" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }} className="space-y-4">
      <div>
        <p className="text-sm text-white font-semibold mb-1">Forgot password?</p>
        <p className="text-xs text-slate-500">Enter your email and we'll send a reset link.</p>
      </div>
      <Field label="Email" type="email" icon={Mail} value={email} onChange={setEmail}
        placeholder="your@email.com" onKeyDown={e => e.key === 'Enter' && send()} />
      <Msg type="error" text={error} />
      <Btn onClick={send} loading={loading}>Send Reset Link</Btn>
      <button onClick={onBack} className="w-full text-center text-xs text-slate-500 hover:text-slate-300 flex items-center justify-center gap-1 transition-colors font-mono">
        <ArrowLeft className="w-3 h-3" /> Back
      </button>
    </motion.div>
  );
}

// ── Reset password ────────────────────────────────────────────────
function StepReset({ onDone }) {
  const [pw, setPw]       = useState('');
  const [pw2, setPw2]     = useState('');
  const [show, setShow]   = useState(false);
  const [loading, setL]   = useState(false);
  const [error, setError] = useState('');
  const [done, setDone]   = useState(false);

  const reset = async () => {
    if (!pw || !pw2)   return setError('Fill both fields.');
    if (pw !== pw2)    return setError('Passwords do not match.');
    if (pw.length < 8) return setError('Minimum 8 characters.');
    setL(true); setError('');
    const { error: e } = await supabase.auth.updateUser({ password: pw });
    setL(false);
    if (e) { setError(e.message); return; }
    await supabase.auth.signOut();
    setDone(true);
    setTimeout(onDone, 2500);
  };

  if (done) return (
    <motion.div initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }} className="text-center py-6">
      <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
      <p className="text-white font-semibold">Password updated!</p>
      <p className="text-xs text-slate-500 mt-1">Redirecting…</p>
    </motion.div>
  );

  return (
    <motion.div key="reset" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} className="space-y-4">
      <p className="text-sm text-white font-semibold">Set new password</p>
      <Field label="New Password" type={show ? 'text' : 'password'} icon={Lock} value={pw} onChange={setPw}
        placeholder="Min 8 characters"
        right={<button onClick={() => setShow(s => !s)} className="text-slate-500 hover:text-slate-300">{show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>} />
      <Field label="Confirm" type={show ? 'text' : 'password'} icon={Lock} value={pw2} onChange={setPw2}
        placeholder="Repeat password" onKeyDown={e => e.key === 'Enter' && reset()} />
      <Msg type="error" text={error} />
      <Btn onClick={reset} loading={loading}>Update Password</Btn>
    </motion.div>
  );
}

// ── Root ──────────────────────────────────────────────────────────
const STEP = { LOGIN:'login', OTP:'otp', FORGOT:'forgot', RESET:'reset' };

export default function AdminAuth({ onAuthenticated }) {
  const [step, setStep]     = useState(STEP.LOGIN);
  const [email, setEmail]   = useState('');
  const [password, setPass] = useState('');

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setStep(STEP.RESET);
    });
    return () => subscription.unsubscribe();
  }, []);

  const titles = {
    [STEP.LOGIN]: 'Admin Login',
    [STEP.OTP]:   'Enter OTP',
    [STEP.FORGOT]:'Reset Password',
    [STEP.RESET]: 'New Password',
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#080a12' }}>
      <motion.div initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} className="w-full max-w-sm">

        {/* Header */}
        <div className="text-center mb-8">
          <motion.div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center border border-violet-500/20"
            style={{ background:'linear-gradient(135deg,rgba(139,92,246,0.15),rgba(99,102,241,0.1))' }}
            animate={{ boxShadow:['0 0 20px rgba(139,92,246,0.08)','0 0 40px rgba(139,92,246,0.28)','0 0 20px rgba(139,92,246,0.08)'] }}
            transition={{ duration:3, repeat:Infinity }}>
            <Lock className="w-6 h-6 text-violet-400" />
          </motion.div>
          <h1 className="font-display text-2xl font-bold text-white">{titles[step]}</h1>
          <p className="text-slate-500 text-sm mt-1 font-mono">Mohammed Anas Khan · CMS</p>

          {(step === STEP.LOGIN || step === STEP.OTP) && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300
                ${step === STEP.OTP ? 'bg-violet-500/30 text-violet-300' : 'bg-violet-600 text-white'}`}>
                {step === STEP.OTP ? <CheckCircle className="w-3.5 h-3.5" /> : '1'}
              </div>
              <div className={`w-8 h-px transition-colors duration-500 ${step === STEP.OTP ? 'bg-violet-500' : 'bg-slate-700'}`} />
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300
                ${step === STEP.OTP ? 'bg-violet-600 text-white' : 'bg-slate-700 text-slate-500'}`}>
                2
              </div>
            </div>
          )}
        </div>

        {/* Card */}
        <div className="rounded-2xl p-6 border border-slate-700/40"
          style={{ background:'rgba(15,18,30,0.9)', backdropFilter:'blur(20px)' }}>
          <AnimatePresence mode="wait">
            {step === STEP.LOGIN && (
              <StepLogin key="login"
                onOTPSent={(em, pw) => { setEmail(em); setPass(pw); setStep(STEP.OTP); }}
                onForgot={() => setStep(STEP.FORGOT)} />
            )}
            {step === STEP.OTP && (
              <StepOTP key="otp"
                email={email} password={password}
                onSuccess={onAuthenticated}
                onBack={() => setStep(STEP.LOGIN)} />
            )}
            {step === STEP.FORGOT && <StepForgot key="forgot" onBack={() => setStep(STEP.LOGIN)} />}
            {step === STEP.RESET  && <StepReset  key="reset"  onDone={() => setStep(STEP.LOGIN)} />}
          </AnimatePresence>
        </div>

        <p className="text-center text-xs text-slate-700 mt-5 font-mono">
          Email + 4-Digit OTP · Two-Factor Auth
        </p>
      </motion.div>
    </div>
  );
}
