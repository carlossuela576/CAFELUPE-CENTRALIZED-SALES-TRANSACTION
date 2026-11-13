import React, { useState, useEffect } from 'react';
import { User, MasterTransaction, TransactionStatus } from '../../types';
import { store } from '../../db/store';
import { SidebarShell, SidebarNavItem } from '../common/SidebarShell';
import { StatTile } from '../common/StatTile';
import { StatusChip } from '../common/StatusChip';
import { BarChart3, Clock, Edit3, XCircle } from 'lucide-react';

interface AccountantDashboardProps {
  user: User;
  onOpenProfile: () => void;
  onOpenExport: () => void;
  onLogout: () => void;
}

const SHORT_OUTLET_LABELS: Record<string, string> = {
  pickleball: 'Pickle',
  hostel: 'Hostel',
  gym: 'Gym',
  pool: 'Pool',
  ktv: 'KTV',
  fnb: 'F&B',
  billiards: 'Billiards',
  tabletennis: 'TT',
  parking: 'Park',
  events: 'Events',
};

export const AccountantDashboard: React.FC<AccountantDashboardProps> = ({
  user,
  onOpenProfile,
  onOpenExport,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'history'>('summary');
  const [timeFilter, setTimeFilter] = useState<'day' | 'week' | 'month' | 'year'>('day');
  const [statusFilter, setStatusFilter] = useState<'all' | TransactionStatus>('all');
  const [selectedTxId, setSelectedTxId] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<MasterTransaction[]>([]);

  // Accountant Edit Request Modal (FR92)
  const [editingTx, setEditingTx] = useState<MasterTransaction | null>(null);
  const [newStatus, setNewStatus] = useState<TransactionStatus>('paid');
  const [newAmount, setNewAmount] = useState<number>(0);
  const [editNote, setEditNote] = useState<string>('');

  // Accountant Void Request Modal (FR93)
  const [voidingTx, setVoidingTx] = useState<MasterTransaction | null>(null);
  const [voidReason, setVoidReason] = useState<string>('Customer cancelled');
  const [voidNote, setVoidNote] = useState<string>('');

  const loadData = () => {
    setTransactions(store.getTransactions());
  };

  useEffect(() => {
    loadData();
    const unsub = store.subscribe(() => loadData());
    return () => unsub();
  }, []);

  const now = Date.now();
  const filteredByTime = transactions.filter((t) => {
    const txTime = new Date(t.transactionDateTime).getTime();
    const diffHours = (now - txTime) / (1000 * 60 * 60);
    if (timeFilter === 'day') return diffHours <= 24;
    if (timeFilter === 'week') return diffHours <= 24 * 7;
    if (timeFilter === 'month') return diffHours <= 24 * 30;
    return diffHours <= 24 * 365;
  });

  const paidItems = filteredByTime.filter((t) => t.transactionStatus === 'paid');
  const pendingItems = filteredByTime.filter((t) => t.transactionStatus === 'pending');

  const paidSales = paidItems.reduce((acc, t) => acc + t.totalAmount, 0);
  const pendingSales = pendingItems.reduce((acc, t) => acc + t.totalAmount, 0);
  const totalSales = paidSales + pendingSales;

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  // Outlet-by-outlet totals across all 10 core outlets
  const allOutlets = store.getOutlets();
  const outletBars = allOutlets.map((o) => {
    const oTx = filteredByTime.filter((t) => t.outletSlug === o.slug && t.transactionStatus !== 'void');
    const paid = oTx
      .filter((t) => t.transactionStatus === 'paid')
      .reduce((acc, t) => acc + t.totalAmount, 0);
    const pending = oTx
      .filter((t) => t.transactionStatus === 'pending')
      .reduce((acc, t) => acc + t.totalAmount, 0);
    return {
      slug: o.slug,
      shortName: SHORT_OUTLET_LABELS[o.slug] || o.name.slice(0, 8),
      fullName: o.name,
      paid,
      pending,
      total: paid + pending,
    };
  });

  const maxOutletVal = Math.max(1, ...outletBars.map((b) => b.total));

  const historyRows = transactions.filter(
    (t) => statusFilter === 'all' || t.transactionStatus === statusFilter
  );

  const navItems: SidebarNavItem[] = [
    { id: 'summary', label: 'Summary', icon: BarChart3 },
    { id: 'history', label: 'History', icon: Clock },
  ];

  const handleOpenEditFor = (tx?: MasterTransaction) => {
    const target =
      tx ||
      (selectedTxId && transactions.find((t) => t.transactionID === selectedTxId)) ||
      transactions[0];
    if (!target) return;
    setEditingTx(target);
    setNewStatus(target.transactionStatus);
    setNewAmount(target.transactionAmount);
    setEditNote('');
  };

  const handleOpenVoidFor = (tx?: MasterTransaction) => {
    const target =
      tx ||
      (selectedTxId && transactions.find((t) => t.transactionID === selectedTxId)) ||
      transactions.find((t) => t.transactionStatus !== 'void');
    if (!target) return;
    setVoidingTx(target);
    setVoidReason('Customer cancelled');
    setVoidNote('');
  };

  const handleSubmitEditRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTx || !editNote) return;
    store.createEditRequest(
      editingTx.transactionID,
      user.id,
      user.name,
      {
        transactionStatus: newStatus,
        transactionAmount: newAmount,
        totalAmount: Math.max(0, newAmount - editingTx.discount),
      },
      editNote
    );
    setEditingTx(null);
  };

  const handleSubmitVoidRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!voidingTx || !voidReason) return;
    store.createVoidRequest(
      voidingTx.transactionID,
      user.id,
      user.name,
      'accountant',
      voidReason,
      voidNote
    );
    setVoidingTx(null);
  };

  return (
    <SidebarShell
      brandSubLabel="Accountant"
      navItems={navItems}
      activeNavId={activeTab}
      onSelectNav={(id) => setActiveTab(id as any)}
      user={user}
      onOpenProfile={onOpenProfile}
      onOpenExport={onOpenExport}
      onLogout={onLogout}
    >
      {activeTab === 'summary' ? (
        <div className="space-y-6">
          {/* Header with Period Segmented Control (FR91) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-[#1A1A1A]">
                Sales summary
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">All outlets · {todayFormatted}</p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-500">Period</span>
              <div className="inline-flex p-1 bg-white border border-gray-200 rounded-xl gap-0.5">
                {(['day', 'week', 'month', 'year'] as const).map((period) => (
                  <button
                    key={period}
                    type="button"
                    onClick={() => setTimeFilter(period)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold capitalize cursor-pointer transition-all ${
                      timeFilter === period
                        ? 'bg-[#FFE27A] text-[#1A1A1A] font-bold'
                        : 'text-gray-600 hover:text-[#1A1A1A]'
                    }`}
                  >
                    {period}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 3-Tile KPI Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatTile
              label="Total sales"
              value={`₱${totalSales.toLocaleString()}`}
              sub={`${filteredByTime.length} transactions`}
              isHighlight={true}
            />
            <StatTile
              label="Paid"
              value={`₱${paidSales.toLocaleString()}`}
              sub={`${paidItems.length} transactions`}
            />
            <StatTile
              label="Pending"
              value={`₱${pendingSales.toLocaleString()}`}
              sub={`${pendingItems.length} transactions`}
            />
          </div>

          {/* 2-Column Sales by Outlet Bar Chart + Listed Summary (matching PDF) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            {/* Bar Chart Card */}
            <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-gray-200/90 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-sm font-bold text-[#1A1A1A]">Sales by outlet</h2>
                <div className="flex items-center gap-3 text-[11px] text-gray-500">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-xs bg-[#FFE27A]" />
                    Paid
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-xs bg-[#FF5252]" />
                    Pending
                  </span>
                </div>
              </div>

              <div className="h-56 flex items-end justify-between gap-2 pt-4 border-b border-gray-100 pb-2">
                {outletBars.map((bar) => {
                  const paidPct = Math.round((bar.paid / maxOutletVal) * 100);
                  const pendingPct = Math.round((bar.pending / maxOutletVal) * 100);
                  return (
                    <div
                      key={bar.slug}
                      className="flex-1 flex flex-col items-center justify-end h-full group"
                      title={`${bar.fullName}: ₱${bar.total.toLocaleString()}`}
                    >
                      <div className="w-full max-w-[32px] flex flex-col justify-end h-full gap-0.5">
                        {bar.pending > 0 && (
                          <div
                            className="w-full bg-[#FF5252] rounded-t-sm transition-all duration-200"
                            style={{ height: `${Math.max(4, pendingPct)}%` }}
                          />
                        )}
                        {bar.paid > 0 && (
                          <div
                            className="w-full bg-[#FFE27A] rounded-t-sm transition-all duration-200"
                            style={{ height: `${Math.max(4, paidPct)}%` }}
                          />
                        )}
                        {bar.total === 0 && (
                          <div className="w-full bg-gray-100 rounded-t-sm h-1" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between gap-2 pt-2">
                {outletBars.map((bar) => (
                  <div
                    key={bar.slug}
                    className="flex-1 text-center text-[10px] font-semibold text-gray-500 truncate"
                  >
                    {bar.shortName}
                  </div>
                ))}
              </div>
            </div>

            {/* Listed Summary Card */}
            <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-gray-200/90">
              <h2 className="text-sm font-bold text-[#1A1A1A] mb-4">Listed summary</h2>
              <div className="divide-y divide-gray-100 text-xs">
                {outletBars.map((bar) => (
                  <div key={bar.slug} className="py-2 flex items-center justify-between">
                    <span className="font-medium text-gray-700">{bar.fullName}</span>
                    <span className="font-bold text-[#1A1A1A] tabular-nums">
                      ₱{bar.total.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* TAB 2: TRANSACTION HISTORY (FR89, FR92, FR93) */
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-[#1A1A1A]">
                Transaction history
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                All outlets · request edits or voids for admin approval
              </p>
            </div>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => handleOpenEditFor()}
                className="px-4 py-2.5 rounded-xl bg-white border border-gray-300 text-xs font-semibold text-[#1A1A1A] hover:bg-gray-50 cursor-pointer min-h-[42px]"
              >
                Request edit
              </button>
              <button
                type="button"
                onClick={() => handleOpenVoidFor()}
                className="px-4 py-2.5 rounded-xl bg-[#FF5252] hover:bg-[#ff3b3b] text-[#1A1A1A] text-xs font-bold cursor-pointer min-h-[42px]"
              >
                Request void
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200/90 overflow-hidden">
            <div className="p-4 sm:px-6 border-b border-gray-100 flex items-center justify-between gap-3">
              <div className="text-sm font-bold text-[#1A1A1A]">All transactions</div>
              <div className="inline-flex p-1 bg-gray-100 rounded-xl gap-0.5">
                {(['all', 'paid', 'pending', 'void'] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize cursor-pointer ${
                      statusFilter === st
                        ? 'bg-white text-[#1A1A1A] shadow-2xs'
                        : 'text-gray-500 hover:text-[#1A1A1A]'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                    <th className="py-3 px-6">ID</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Service</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4">Time</th>
                    <th className="py-3 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs">
                  {historyRows.map((tx) => {
                    const isSelected = selectedTxId === tx.transactionID;
                    return (
                      <tr
                        key={tx.transactionID}
                        onClick={() => setSelectedTxId(tx.transactionID)}
                        className={`transition-colors cursor-pointer ${
                          isSelected ? 'bg-[#FFE27A]/20' : 'hover:bg-gray-50/70'
                        }`}
                      >
                        <td className="py-3.5 px-6 font-mono text-gray-500 whitespace-nowrap">
                          {tx.transactionID}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-[#1A1A1A]">{tx.customerName}</td>
                        <td className="py-3.5 px-4 text-gray-600 max-w-xs truncate">
                          <span className="font-semibold text-[#1A1A1A]">{tx.outletName.split(' ')[0]}</span> ·{' '}
                          {tx.outletService}
                        </td>
                        <td className="py-3.5 px-4 text-right font-bold text-[#1A1A1A] tabular-nums whitespace-nowrap">
                          ₱{tx.totalAmount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <StatusChip status={tx.transactionStatus} size="sm" />
                        </td>
                        <td className="py-3.5 px-4 text-gray-500 whitespace-nowrap tabular-nums">
                          {new Date(tx.transactionDateTime).toLocaleTimeString([], {
                            hour: 'numeric',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="py-3.5 px-6 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <div className="inline-flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleOpenEditFor(tx)}
                              className="p-1.5 rounded-lg text-gray-600 hover:bg-gray-100 cursor-pointer"
                              title="Request edit (FR92)"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            {tx.transactionStatus !== 'void' && (
                              <button
                                type="button"
                                onClick={() => handleOpenVoidFor(tx)}
                                className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 cursor-pointer"
                                title="Request void (FR93)"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Accountant Edit Request Modal (FR92) */}
      {editingTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-gray-200 shadow-2xl">
            <h3 className="text-base font-extrabold text-[#1A1A1A]">Request edit</h3>
            <div className="mt-3 p-3.5 rounded-xl bg-[#FFE27A] text-[#1A1A1A] text-xs">
              <div className="font-bold font-mono">
                {editingTx.transactionID} · {editingTx.customerName}
              </div>
              <div className="text-[#1A1A1A]/80 mt-0.5">
                {editingTx.outletName} · ₱{editingTx.totalAmount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
              </div>
            </div>
            <form onSubmit={handleSubmitEditRequest} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-gray-600 mb-1">Target status</label>
                <select
                  value={newStatus}
                  onChange={(e: any) => setNewStatus(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-300 bg-white"
                >
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                  <option value="void">Void</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-gray-600 mb-1">Amount (₱)</label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={newAmount}
                  onChange={(e) => setNewAmount(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-gray-300 font-bold tabular-nums"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold text-gray-600 mb-1">Audit note *</label>
                <textarea
                  value={editNote}
                  onChange={(e) => setEditNote(e.target.value)}
                  placeholder="Explain the adjustment for the admin"
                  rows={2}
                  className="w-full p-2.5 rounded-xl border border-gray-300"
                  required
                />
              </div>
              <p className="text-[11px] text-gray-500">
                Sent to Admin for approval before changes apply (FR92).
              </p>
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setEditingTx(null)}
                  className="py-2.5 rounded-xl bg-white border border-gray-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2.5 rounded-xl bg-[#FF5252] text-[#1A1A1A] font-bold cursor-pointer"
                >
                  Send request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Accountant Void Request Modal (FR93) */}
      {voidingTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-gray-200 shadow-2xl">
            <h3 className="text-base font-extrabold text-[#1A1A1A]">Request void</h3>
            <div className="mt-3 p-3.5 rounded-xl bg-[#FFE27A] text-[#1A1A1A] text-xs">
              <div className="font-bold font-mono">
                {voidingTx.transactionID} · {voidingTx.customerName}
              </div>
              <div className="text-[#1A1A1A]/80 mt-0.5">
                {voidingTx.outletName} · ₱{voidingTx.totalAmount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
              </div>
            </div>
            <form onSubmit={handleSubmitVoidRequest} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-gray-600 mb-1">Reason *</label>
                <select
                  value={voidReason}
                  onChange={(e) => setVoidReason(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-300 bg-white"
                  required
                >
                  <option value="Customer cancelled">Customer cancelled</option>
                  <option value="Duplicate entry">Duplicate entry</option>
                  <option value="Bank reconciliation mismatch">Bank reconciliation mismatch</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-gray-600 mb-1">Notes (optional)</label>
                <textarea
                  value={voidNote}
                  onChange={(e) => setVoidNote(e.target.value)}
                  placeholder="Add a short note for the admin"
                  rows={2}
                  className="w-full p-2.5 rounded-xl border border-gray-300"
                />
              </div>
              <p className="text-[11px] text-gray-500">
                Sent to Admin for approval. Accountants cannot delete transactions directly (FR93).
              </p>
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setVoidingTx(null)}
                  className="py-2.5 rounded-xl bg-white border border-gray-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2.5 rounded-xl bg-[#FF5252] text-[#1A1A1A] font-bold cursor-pointer"
                >
                  Send request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </SidebarShell>
  );
};
