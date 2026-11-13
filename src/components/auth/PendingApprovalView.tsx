import React, { useState } from 'react';
import { User } from '../../types';
import { store } from '../../db/store';
import { CheckCircle2, Clock, XCircle, Search } from 'lucide-react';

interface PendingApprovalViewProps {
  user: User;
  onLogout: (prefillEmail?: string) => void;
  onApproved: (approvedUser: User) => void;
}

type LookupState =
  | { kind: 'found'; user: User; checkedAt: string }
  | { kind: 'not_found'; email: string; checkedAt: string }
  | null;

export const PendingApprovalView: React.FC<PendingApprovalViewProps> = ({
  user,
  onLogout,
  onApproved,
}) => {
  const [lookupEmail, setLookupEmail] = useState(user.email);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [lookupResult, setLookupResult] = useState<LookupState>(null);

  const handleCheckStatus = (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError(null);

    const trimmed = lookupEmail.trim();
    if (!trimmed) {
      setEmailError('Please enter your registered email address.');
      return;
    }

    const found = store.findUserByEmail(trimmed);
    const checkedAt = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    if (!found) {
      setLookupResult({ kind: 'not_found', email: trimmed, checkedAt });
      return;
    }

    setLookupResult({ kind: 'found', user: found, checkedAt });
  };

  return (
    <div className="min-h-[100dvh] flex flex-col md:flex-row bg-[#F7F7F7] text-[#1A1A1A] selection:bg-[#FFE27A] selection:text-[#1A1A1A]">
      {/* Left 50% Gold Brand Panel */}
      <div className="md:w-1/2 bg-[#FFE27A] px-8 py-12 md:px-16 flex flex-col justify-center">
        <div className="max-w-md">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#1A1A1A]">
            Cafe Lupe
          </h1>
          <p className="text-sm sm:text-base font-medium text-[#1A1A1A]/80 mt-2 leading-relaxed">
            Centralized sales report and transaction gateway for every outlet.
          </p>
        </div>
      </div>

      {/* Right 50% Waiting for approval card */}
      <div className="md:w-1/2 flex-1 flex items-center justify-center p-6 sm:p-10 bg-[#F7F7F7]">
        <div className="w-full max-w-md bg-white rounded-2xl p-7 sm:p-8 border border-gray-200/90">
          <div className="text-xs font-semibold text-gray-500">Waiting for approval</div>
          <h2 className="text-xl font-extrabold text-[#1A1A1A] tracking-tight mt-1">
            Pending approval
          </h2>
          <p className="text-xs text-gray-500 mt-2 leading-relaxed">
            Your account request for{' '}
            <strong className="text-[#1A1A1A]">{user.outletName || 'Cafe Lupe'}</strong> was sent
            to the admin. Enter your registered email below to check your current approval status.
          </p>

          <form onSubmit={handleCheckStatus} className="mt-5 space-y-3">
            <div>
              <label
                htmlFor="pending-lookup-email"
                className="block text-xs font-semibold text-gray-600 mb-1.5"
              >
                Registered email
              </label>
              <input
                id="pending-lookup-email"
                type="email"
                value={lookupEmail}
                onChange={(e) => {
                  setLookupEmail(e.target.value);
                  setEmailError(null);
                }}
                placeholder="ana.reyes@cafelupe.ph"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:border-[#1A1A1A] text-sm sm:text-xs text-[#1A1A1A] bg-white outline-none transition-colors"
                required
              />
            </div>

            {emailError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-medium">
                {emailError}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-[#FF5252] hover:bg-[#ff3b3b] text-[#1A1A1A] font-bold text-xs transition-colors cursor-pointer min-h-[42px] inline-flex items-center justify-center gap-2"
            >
              <Search className="w-3.5 h-3.5" />
              Check approval status
            </button>
          </form>

          {lookupResult && (
            <div className="mt-4 rounded-xl border border-gray-200 bg-[#F7F7F7] p-4 space-y-3">
              {lookupResult.kind === 'not_found' ? (
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FF5252] text-[#1A1A1A]">
                      <XCircle className="w-3 h-3" />
                      Not found
                    </span>
                    <span className="text-[11px] text-gray-500 tabular-nums">
                      Checked {lookupResult.checkedAt}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 pt-1">
                    No account request was found for{' '}
                    <strong className="text-[#1A1A1A]">{lookupResult.email}</strong>.
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between gap-2">
                    {lookupResult.user.approvalStatus === 'approved' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FFE27A] text-[#1A1A1A]">
                        <CheckCircle2 className="w-3 h-3" />
                        Approved
                      </span>
                    )}
                    {lookupResult.user.approvalStatus === 'pending' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white border border-gray-300 text-[#1A1A1A]">
                        <Clock className="w-3 h-3" />
                        Pending
                      </span>
                    )}
                    {lookupResult.user.approvalStatus === 'rejected' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FF5252] text-[#1A1A1A]">
                        <XCircle className="w-3 h-3" />
                        Declined
                      </span>
                    )}
                    <span className="text-[11px] text-gray-500 tabular-nums">
                      Checked {lookupResult.checkedAt}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs pt-1 border-t border-gray-200/80">
                    <div>
                      <span className="block text-[11px] text-gray-500">Staff</span>
                      <span className="font-semibold text-[#1A1A1A] truncate block">
                        {lookupResult.user.name}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[11px] text-gray-500">Outlet</span>
                      <span className="font-semibold text-[#1A1A1A] truncate block">
                        {lookupResult.user.outletName || lookupResult.user.role}
                      </span>
                    </div>
                  </div>

                  {lookupResult.user.approvalStatus === 'pending' && (
                    <p className="text-[11px] text-gray-500 leading-relaxed">
                      Your request is still awaiting administrator approval. Check back shortly.
                    </p>
                  )}

                  {lookupResult.user.approvalStatus === 'approved' && (
                    <div className="pt-1">
                      {lookupResult.user.id === user.id ? (
                        <button
                          type="button"
                          onClick={() => onApproved(lookupResult.user)}
                          className="w-full py-2 px-3 rounded-xl bg-[#FFE27A] hover:bg-[#fed650] text-[#1A1A1A] font-bold text-xs transition-colors cursor-pointer"
                        >
                          Enter {lookupResult.user.outletName || 'workspace'}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onLogout(lookupResult.user.email)}
                          className="w-full py-2 px-3 rounded-xl bg-[#FFE27A] hover:bg-[#fed650] text-[#1A1A1A] font-bold text-xs transition-colors cursor-pointer"
                        >
                          Log in as {lookupResult.user.email}
                        </button>
                      )}
                    </div>
                  )}

                  {lookupResult.user.approvalStatus === 'rejected' && (
                    <p className="text-[11px] text-red-700 leading-relaxed">
                      This account request was declined by an administrator. Please contact your
                      supervisor.
                    </p>
                  )}
                </>
              )}
            </div>
          )}

          <div className="mt-4">
            <button
              type="button"
              onClick={() => onLogout()}
              className="w-full py-2.5 px-4 rounded-xl bg-white border border-gray-300 hover:bg-gray-50 text-[#1A1A1A] font-semibold text-xs transition-colors cursor-pointer min-h-[42px]"
            >
              Back to log in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
