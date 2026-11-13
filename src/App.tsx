/**
 * Cafe Lupe Centralized Sales Report and Transaction Gateway System
 * Root Application Container
 */

import React, { useState, useEffect } from 'react';
import { User, OutletSlug } from './types';
import { store } from './db/store';
import { LoginView } from './components/auth/LoginView';
import { PendingApprovalView } from './components/auth/PendingApprovalView';
import { OutletWorkspace } from './components/outlets/OutletWorkspace';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AccountantDashboard } from './components/accountant/AccountantDashboard';
import { PhpSqlExportModal } from './components/common/PhpSqlExportModal';
import { ProfileModal } from './components/common/ProfileModal';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('cafelupe_current_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [prefillLoginEmail, setPrefillLoginEmail] = useState('');
  const [simulatedOutletSlug, setSimulatedOutletSlug] = useState<OutletSlug | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  useEffect(() => {
    const unsub = store.subscribe(() => {
      if (currentUser) {
        const fresh = store.getUsers().find((u) => u.id === currentUser.id);
        if (fresh && fresh.approvalStatus !== currentUser.approvalStatus) {
          setCurrentUser(fresh);
          localStorage.setItem('cafelupe_current_user', JSON.stringify(fresh));
        }
      }
    });
    return () => unsub();
  }, [currentUser]);

  const handleLoginSuccess = (user: User) => {
    setPrefillLoginEmail('');
    setCurrentUser(user);
    setSimulatedOutletSlug(null);
    localStorage.setItem('cafelupe_current_user', JSON.stringify(user));
  };

  const handleLogout = (prefillEmail?: string) => {
    setPrefillLoginEmail(typeof prefillEmail === 'string' ? prefillEmail : '');
    setCurrentUser(null);
    setSimulatedOutletSlug(null);
    localStorage.removeItem('cafelupe_current_user');
  };

  if (!currentUser) {
    return <LoginView onLoginSuccess={handleLoginSuccess} initialEmail={prefillLoginEmail} />;
  }

  if (currentUser.approvalStatus === 'pending') {
    return (
      <PendingApprovalView
        user={currentUser}
        onLogout={handleLogout}
        onApproved={(approvedUser) => handleLoginSuccess(approvedUser)}
      />
    );
  }

  if (currentUser.approvalStatus === 'rejected') {
    return (
      <div className="min-h-[100dvh] flex flex-col md:flex-row bg-[#F7F7F7] text-[#1A1A1A]">
        <div className="md:w-1/2 bg-[#FFE27A] px-8 py-12 md:px-16 flex flex-col justify-center">
          <div className="max-w-md">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#1A1A1A]">
              Cafe Lupe
            </h1>
            <p className="text-sm sm:text-base font-medium text-[#1A1A1A]/80 mt-2">
              Centralized sales report and transaction gateway for every outlet.
            </p>
          </div>
        </div>
        <div className="md:w-1/2 flex-1 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white rounded-2xl p-8 border border-gray-200 space-y-4">
            <h2 className="text-xl font-extrabold text-[#1A1A1A]">Registration declined</h2>
            <p className="text-xs text-gray-500">
              Your staff account request was declined by the system administrator.
            </p>
            <button
              type="button"
              onClick={() => handleLogout()}
              className="w-full py-2.5 px-4 rounded-xl bg-[#FF5252] text-[#1A1A1A] font-bold text-xs cursor-pointer"
            >
              Back to log in
            </button>
          </div>
        </div>
      </div>
    );
  }

  const userOutlet =
    store.getOutlets().find((o) => o.id === currentUser.outletId) || store.getOutlets()[0];

  const simulatedOutlet = simulatedOutletSlug
    ? store.getOutletBySlug(simulatedOutletSlug)
    : null;

  const simulationBanner =
    simulatedOutlet && (currentUser.role === 'admin' || currentUser.role === 'owner') ? (
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-2.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3 text-xs font-bold text-[#1A1A1A]">
          <span className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#1A1A1A]" />
            Simulating outlet: {simulatedOutlet.name}
          </span>
          <button
            type="button"
            onClick={() => setSimulatedOutletSlug(null)}
            className="px-3 py-1.5 bg-[#FFE27A] hover:bg-[#fed650] text-[#1A1A1A] rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Exit simulation
          </button>
        </div>
      </div>
    ) : undefined;

  return (
    <>
      {simulatedOutlet ? (
        <OutletWorkspace
          outlet={simulatedOutlet}
          user={currentUser}
          onOpenProfile={() => setShowProfileModal(true)}
          onOpenExport={() => setShowExportModal(true)}
          onLogout={handleLogout}
          topBanner={simulationBanner}
        />
      ) : currentUser.role === 'admin' || currentUser.role === 'owner' ? (
        <AdminDashboard
          adminUser={currentUser}
          onSimulateOutlet={(slug) => setSimulatedOutletSlug(slug)}
          onOpenProfile={() => setShowProfileModal(true)}
          onOpenExport={() => setShowExportModal(true)}
          onLogout={handleLogout}
        />
      ) : currentUser.role === 'accountant' ? (
        <AccountantDashboard
          user={currentUser}
          onOpenProfile={() => setShowProfileModal(true)}
          onOpenExport={() => setShowExportModal(true)}
          onLogout={handleLogout}
        />
      ) : (
        <OutletWorkspace
          outlet={userOutlet}
          user={currentUser}
          onOpenProfile={() => setShowProfileModal(true)}
          onOpenExport={() => setShowExportModal(true)}
          onLogout={handleLogout}
        />
      )}

      {showExportModal && <PhpSqlExportModal onClose={() => setShowExportModal(false)} />}
      {showProfileModal && (
        <ProfileModal
          user={currentUser}
          onClose={() => setShowProfileModal(false)}
          onLogout={handleLogout}
        />
      )}
    </>
  );
}
