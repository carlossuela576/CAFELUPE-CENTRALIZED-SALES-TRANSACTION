import React, { useState, useEffect } from 'react';
import { User } from '../../types';
import { store } from '../../db/store';
import { ChevronDown, ChevronUp, Key, CheckCircle2, Clock, XCircle, Search } from 'lucide-react';

interface LoginViewProps {
  onLoginSuccess: (user: User) => void;
  initialEmail?: string;
}

type AuthMode = 'login' | 'register' | 'status';

type StatusLookupState =
  | { kind: 'found'; user: User; checkedAt: string }
  | { kind: 'not_found'; email: string; checkedAt: string }
  | null;

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess, initialEmail = '' }) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showCredsDrawer, setShowCredsDrawer] = useState(false);

  // Registration state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPass, setRegPass] = useState('');
  const [regOutletId, setRegOutletId] = useState('out-pickleball');

  // Approval status lookup state
  const [statusEmail, setStatusEmail] = useState('');
  const [statusResult, setStatusResult] = useState<StatusLookupState>(null);

  useEffect(() => {
    if (initialEmail) {
      setEmail(initialEmail);
      setMode('login');
    }
  }, [initialEmail]);

  const outlets = store.getOutlets();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError('Please enter both your email and password.');
      return;
    }

    const res = store.authenticate(email, password);
    if (!res.user) {
      setError(res.error || 'Invalid credentials.');
      return;
    }

    onLoginSuccess(res.user);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!regName.trim() || !regEmail.trim() || !regPass) {
      setError('All registration fields are required.');
      return;
    }

    const existing = store.findUserByEmail(regEmail);
    if (existing) {
      setError('An account with this email already exists. Log in or check its approval status.');
      return;
    }

    const newUser = store.registerUser(regName.trim(), regEmail.trim(), regPass, regOutletId);
    onLoginSuccess(newUser);
  };

  const handleStatusCheck = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmed = statusEmail.trim();
    if (!trimmed) {
      setError('Please enter your registered email address.');
      return;
    }

    const found = store.findUserByEmail(trimmed);
    const checkedAt = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    if (!found) {
      setStatusResult({ kind: 'not_found', email: trimmed, checkedAt });
      return;
    }

    setStatusResult({ kind: 'found', user: found, checkedAt });
  };

  const handleQuickFill = (presetEmail: string) => {
    setMode('login');
    setEmail(presetEmail);
    setPassword('password123');
    setError(null);
    setShowCredsDrawer(false);
  };

  return (
    <div className="min-h-[100dvh] flex flex-col md:flex-row bg-[#F7F7F7] text-[#1A1A1A] selection:bg-[#FFE27A] selection:text-[#1A1A1A]">
      {/* Left 50% Gold Brand Panel (per PDF Access flow) */}
      <div className="md:w-1/2 bg-[#FFE27A] px-8 py-12 md:px-16 flex flex-col justify-between">
        <div className="hidden md:block" />

        <div className="max-w-md">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#1A1A1A]">
            Cafe Lupe
          </h1>
          <p className="text-sm sm:text-base font-medium text-[#1A1A1A]/80 mt-2 leading-relaxed">
            Centralized sales report and transaction gateway for every outlet.
          </p>
        </div>

        {/* Discrete Credentials Helper Drawer for Evaluation */}
        <div className="mt-8 md:mt-0">
          <button
            type="button"
            onClick={() => setShowCredsDrawer(!showCredsDrawer)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1A1A1A]/75 hover:text-[#1A1A1A] cursor-pointer py-1.5"
          >
            <Key className="w-3.5 h-3.5" />
            <span>Staff credentials directory</span>
            {showCredsDrawer ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>

          {showCredsDrawer && (
            <div className="mt-2 p-3.5 bg-white/95 rounded-2xl border border-[#1A1A1A]/15 space-y-2.5 text-xs max-w-md shadow-sm">
              <div className="text-[11px] text-gray-500">
                All seeded accounts use password{' '}
                <span className="font-mono font-bold text-[#1A1A1A]">password123</span>. Click to
                fill:
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {[
                  { label: 'Admin', email: 'admin@cafelupe.com' },
                  { label: 'Accountant', email: 'accountant@cafelupe.com' },
                  { label: 'Pickleball', email: 'pickleball@cafelupe.com' },
                  { label: 'Hostel', email: 'hostel@cafelupe.com' },
                  { label: 'Gym', email: 'gym@cafelupe.com' },
                  { label: 'Pool', email: 'pool@cafelupe.com' },
                  { label: 'KTV', email: 'ktv@cafelupe.com' },
                  { label: 'F&B / POS', email: 'fnb@cafelupe.com' },
                  { label: 'Billiards', email: 'billiards@cafelupe.com' },
                  { label: 'Table Tennis', email: 'tabletennis@cafelupe.com' },
                  { label: 'Parking', email: 'parking@cafelupe.com' },
                  { label: 'Events', email: 'events@cafelupe.com' },
                ].map((item) => (
                  <button
                    key={item.email}
                    type="button"
                    onClick={() => handleQuickFill(item.email)}
                    className="px-2.5 py-1.5 rounded-lg bg-[#F7F7F7] hover:bg-[#FFE27A] text-left transition-colors cursor-pointer truncate border border-gray-200"
                  >
                    <span className="font-bold text-[#1A1A1A] block truncate text-[11px]">
                      {item.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right 50% Clean Form Panel */}
      <div className="md:w-1/2 flex-1 flex items-center justify-center p-6 sm:p-10 bg-[#F7F7F7]">
        {mode === 'login' && (
          <div className="w-full max-w-md bg-white rounded-2xl p-7 sm:p-8 border border-gray-200/90">
            <h2 className="text-xl font-extrabold text-[#1A1A1A] tracking-tight">Log in</h2>
            <p className="text-xs text-gray-500 mt-1 mb-6 leading-relaxed">
              Use your staff credentials. You are sent to your own outlet automatically.
            </p>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ana.reyes@cafelupe.ph"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:border-[#1A1A1A] text-sm sm:text-xs text-[#1A1A1A] bg-white outline-none transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:border-[#1A1A1A] text-sm sm:text-xs text-[#1A1A1A] bg-white outline-none transition-colors"
                  required
                />
              </div>

              <div className="pt-2 space-y-2.5">
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-xl bg-[#FF5252] hover:bg-[#ff3b3b] text-[#1A1A1A] font-bold text-xs transition-colors cursor-pointer min-h-[42px]"
                >
                  Log in
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setMode('register');
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-white border border-gray-300 hover:bg-gray-50 text-[#1A1A1A] font-semibold text-xs transition-colors cursor-pointer min-h-[42px]"
                >
                  Create an account
                </button>
              </div>
            </form>

            <div className="mt-4 pt-3 border-t border-gray-100 text-center">
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setStatusResult(null);
                  setStatusEmail(email);
                  setMode('status');
                }}
                className="text-xs font-semibold text-gray-600 hover:text-[#1A1A1A] underline underline-offset-4 cursor-pointer"
              >
                Check approval status by email
              </button>
            </div>
          </div>
        )}

        {mode === 'register' && (
          <div className="w-full max-w-md bg-white rounded-2xl p-7 sm:p-8 border border-gray-200/90">
            <h2 className="text-xl font-extrabold text-[#1A1A1A] tracking-tight">Create account</h2>

            {error && (
              <div className="mt-3 p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-3.5 mt-5">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Full name</label>
                <input
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Ana Reyes"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:border-[#1A1A1A] text-sm sm:text-xs text-[#1A1A1A] bg-white outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Email</label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="ana.reyes@cafelupe.ph"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:border-[#1A1A1A] text-sm sm:text-xs text-[#1A1A1A] bg-white outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Outlet</label>
                <div className="relative">
                  <select
                    value={regOutletId}
                    onChange={(e) => setRegOutletId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:border-[#1A1A1A] text-sm sm:text-xs text-[#1A1A1A] bg-white appearance-none pr-8 outline-none cursor-pointer"
                  >
                    {outlets.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-3 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Password</label>
                <input
                  type="password"
                  value={regPass}
                  onChange={(e) => setRegPass(e.target.value)}
                  placeholder="••••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:border-[#1A1A1A] text-sm sm:text-xs text-[#1A1A1A] bg-white outline-none"
                  required
                />
              </div>

              <p className="text-[11px] text-gray-500 pt-1">
                An admin must approve your account before you can log in.
              </p>

              <div className="pt-1 space-y-2.5">
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-xl bg-[#FF5252] hover:bg-[#ff3b3b] text-[#1A1A1A] font-bold text-xs transition-colors cursor-pointer min-h-[42px]"
                >
                  Request account
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setMode('login');
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-white border border-gray-300 hover:bg-gray-50 text-[#1A1A1A] font-semibold text-xs transition-colors cursor-pointer min-h-[42px]"
                >
                  Back to log in
                </button>
              </div>
            </form>
          </div>
        )}

        {mode === 'status' && (
          <div className="w-full max-w-md bg-white rounded-2xl p-7 sm:p-8 border border-gray-200/90">
            <h2 className="text-xl font-extrabold text-[#1A1A1A] tracking-tight">
              Check approval status
            </h2>
            <p className="text-xs text-gray-500 mt-1 mb-5 leading-relaxed">
              Enter the email you used when requesting your staff account.
            </p>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleStatusCheck} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Registered email
                </label>
                <input
                  type="email"
                  value={statusEmail}
                  onChange={(e) => setStatusEmail(e.target.value)}
                  placeholder="ana.reyes@cafelupe.ph"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:border-[#1A1A1A] text-sm sm:text-xs text-[#1A1A1A] bg-white outline-none transition-colors"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-[#FF5252] hover:bg-[#ff3b3b] text-[#1A1A1A] font-bold text-xs transition-colors cursor-pointer min-h-[42px] inline-flex items-center justify-center gap-2"
              >
                <Search className="w-3.5 h-3.5" />
                Check approval status
              </button>
            </form>

            {statusResult && (
              <div className="mt-4 rounded-xl border border-gray-200 bg-[#F7F7F7] p-4 space-y-3">
                {statusResult.kind === 'not_found' ? (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FF5252] text-[#1A1A1A]">
                        <XCircle className="w-3 h-3" />
                        Not found
                      </span>
                      <span className="text-[11px] text-gray-500 tabular-nums">
                        Checked {statusResult.checkedAt}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 pt-1">
                      No account request was found for{' '}
                      <strong className="text-[#1A1A1A]">{statusResult.email}</strong>.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between gap-2">
                      {statusResult.user.approvalStatus === 'approved' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FFE27A] text-[#1A1A1A]">
                          <CheckCircle2 className="w-3 h-3" />
                          Approved
                        </span>
                      )}
                      {statusResult.user.approvalStatus === 'pending' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white border border-gray-300 text-[#1A1A1A]">
                          <Clock className="w-3 h-3" />
                          Pending
                        </span>
                      )}
                      {statusResult.user.approvalStatus === 'rejected' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FF5252] text-[#1A1A1A]">
                          <XCircle className="w-3 h-3" />
                          Declined
                        </span>
                      )}
                      <span className="text-[11px] text-gray-500 tabular-nums">
                        Checked {statusResult.checkedAt}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs pt-1 border-t border-gray-200/80">
                      <div>
                        <span className="block text-[11px] text-gray-500">Staff</span>
                        <span className="font-semibold text-[#1A1A1A] truncate block">
                          {statusResult.user.name}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[11px] text-gray-500">Outlet</span>
                        <span className="font-semibold text-[#1A1A1A] truncate block">
                          {statusResult.user.outletName || statusResult.user.role}
                        </span>
                      </div>
                    </div>

                    {statusResult.user.approvalStatus === 'approved' && (
                      <button
                        type="button"
                        onClick={() => {
                          setEmail(statusResult.user.email);
                          setPassword('');
                          setError(null);
                          setMode('login');
                        }}
                        className="w-full py-2 px-3 rounded-xl bg-[#FFE27A] hover:bg-[#fed650] text-[#1A1A1A] font-bold text-xs transition-colors cursor-pointer"
                      >
                        Use email to log in
                      </button>
                    )}

                    {statusResult.user.approvalStatus === 'pending' && (
                      <p className="text-[11px] text-gray-500 leading-relaxed">
                        Your request is awaiting administrator approval.
                      </p>
                    )}

                    {statusResult.user.approvalStatus === 'rejected' && (
                      <p className="text-[11px] text-red-700 leading-relaxed">
                        This account request was declined by the administrator.
                      </p>
                    )}
                  </>
                )}
              </div>
            )}

            <div className="mt-4">
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setMode('login');
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-white border border-gray-300 hover:bg-gray-50 text-[#1A1A1A] font-semibold text-xs transition-colors cursor-pointer min-h-[42px]"
              >
                Back to log in
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
