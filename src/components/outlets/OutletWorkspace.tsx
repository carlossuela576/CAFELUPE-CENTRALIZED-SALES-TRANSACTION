import React, { useState, useEffect } from 'react';
import { Outlet, User, MasterTransaction, TransactionStatus, PaymentChannel, VoidRequest } from '../../types';
import { store } from '../../db/store';
import { SidebarShell, SidebarNavItem } from '../common/SidebarShell';
import { StatTile } from '../common/StatTile';
import { StatusChip } from '../common/StatusChip';
import { OutletTransactionForm } from './OutletTransactionForm';
import { PosTerminal } from './PosTerminal';
import { QrPhModal } from '../common/QrPhModal';
import { ReceiptModal } from '../common/ReceiptModal';
import {
  LayoutGrid,
  Clock,
  XCircle,
  Plus,
  Search,
  Edit3,
  QrCode,
  CheckCircle,
  Eye,
  Lock,
  UtensilsCrossed,
} from 'lucide-react';

interface OutletWorkspaceProps {
  outlet: Outlet;
  user: User;
  onOpenProfile: () => void;
  onOpenExport: () => void;
  onLogout: () => void;
  topBanner?: React.ReactNode;
}

export const OutletWorkspace: React.FC<OutletWorkspaceProps> = ({
  outlet,
  user,
  onOpenProfile,
  onOpenExport,
  onLogout,
  topBanner,
}) => {
  const [activeNav, setActiveNav] = useState<'dashboard' | 'history' | 'voids'>('dashboard');
  const [viewMode, setViewMode] = useState<'main' | 'create' | 'pos'>('main');
  const [transactions, setTransactions] = useState<MasterTransaction[]>([]);
  const [voidRequests, setVoidRequests] = useState<VoidRequest[]>([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | TransactionStatus>('all');
  const [selectedTxId, setSelectedTxId] = useState<string | null>(null);

  // Modals
  const [qrModalTx, setQrModalTx] = useState<MasterTransaction | null>(null);
  const [receiptTx, setReceiptTx] = useState<{ tx: MasterTransaction; fnb?: any } | null>(null);
  const [editingTx, setEditingTx] = useState<MasterTransaction | null>(null);
  const [editAmount, setEditAmount] = useState<number>(0);
  const [editDiscount, setEditDiscount] = useState<number>(0);
  const [editCustomer, setEditCustomer] = useState<string>('');
  const [editLockError, setEditLockError] = useState<string | null>(null);

  const [voidingTx, setVoidingTx] = useState<MasterTransaction | null>(null);
  const [voidReason, setVoidReason] = useState<string>('Customer cancelled');
  const [voidNote, setVoidNote] = useState<string>('');
  const [detailTx, setDetailTx] = useState<{ tx: MasterTransaction; childData: any } | null>(null);

  const loadData = () => {
    setTransactions(store.getTransactions(outlet.slug));
    setVoidRequests(store.getVoidRequests().filter((v) => v.outletName === outlet.name));
  };

  useEffect(() => {
    loadData();
    setViewMode('main');
    setSelectedTxId(null);
    const unsubscribe = store.subscribe(() => loadData());
    return () => unsubscribe();
  }, [outlet.slug]);

  const paidTransactions = transactions.filter((t) => t.transactionStatus === 'paid');
  const pendingTransactions = transactions.filter((t) => t.transactionStatus === 'pending');

  const totalSales = paidTransactions.reduce((acc, t) => acc + t.totalAmount, 0);
  const pendingAmount = pendingTransactions.reduce((acc, t) => acc + t.totalAmount, 0);

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const filteredTransactions = transactions.filter((t) => {
    const matchesStatus = statusFilter === 'all' || t.transactionStatus === statusFilter;
    const matchesSearch =
      !searchQuery ||
      t.transactionID.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.outletService.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleTransactionCreated = (newTxId: string, channel: PaymentChannel) => {
    setViewMode('main');
    loadData();
    const created = store.getTransactionById(newTxId);
    if (created && channel === 'QRPh' && created.transactionStatus === 'pending') {
      setQrModalTx(created);
    }
  };

  const handleStartEdit = (tx: MasterTransaction) => {
    const lockRes = store.acquireLock(tx.transactionID, user.id, user.name);
    if (!lockRes.acquired) {
      setEditLockError(`Locked by ${lockRes.currentLockOwner || 'another clerk'} (NFR6).`);
      setTimeout(() => setEditLockError(null), 4000);
      return;
    }
    setEditingTx(tx);
    setEditAmount(tx.transactionAmount);
    setEditDiscount(tx.discount);
    setEditCustomer(tx.customerName);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTx) return;
    const res = store.updatePendingTransaction(
      editingTx.transactionID,
      {
        customerName: editCustomer,
        transactionAmount: editAmount,
        discount: editDiscount,
      },
      user.id
    );
    if (res.success) {
      setEditingTx(null);
    } else {
      setEditLockError(res.error || 'Failed to save changes.');
    }
  };

  const handleCancelEdit = () => {
    if (editingTx) {
      store.releaseLock(editingTx.transactionID, user.id);
      setEditingTx(null);
    }
  };

  const handleSubmitVoid = (e: React.FormEvent) => {
    e.preventDefault();
    if (!voidingTx || !voidReason) return;
    store.createVoidRequest(
      voidingTx.transactionID,
      user.id,
      user.name,
      user.role,
      voidReason,
      voidNote
    );
    setVoidingTx(null);
    setActiveNav('voids');
  };

  const handleHeaderRequestVoid = () => {
    const target =
      (selectedTxId && transactions.find((t) => t.transactionID === selectedTxId)) ||
      transactions.find((t) => t.transactionStatus !== 'void');
    if (target) {
      setVoidReason('Customer cancelled');
      setVoidNote('');
      setVoidingTx(target);
    }
  };

  const navItems: SidebarNavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
    { id: 'history', label: 'History', icon: Clock },
    {
      id: 'voids',
      label: 'Void requests',
      icon: XCircle,
      badge: voidRequests.filter((v) => v.status === 'pending').length,
    },
  ];

  // 4th Outlet-Specific Operational Status Tile (per PDF)
  const renderOperationalTile = () => {
    let title = 'Status';
    let rows: Array<{ label: string; sub: string }> = [];

    switch (outlet.slug) {
      case 'pickleball':
        title = 'Courts';
        rows = [
          { label: 'Al fresco · Ground floor', sub: '24/7 operational' },
          { label: 'Indoor · 2nd floor', sub: 'Available now' },
        ];
        break;
      case 'hostel':
        title = 'Online bookings';
        rows = [
          { label: 'Agoda', sub: 'Synced today' },
          { label: 'Traveloka', sub: 'Connected' },
          { label: 'Walk in', sub: 'Small & Suite rooms' },
        ];
        break;
      case 'gym':
        title = 'Memberships';
        rows = [
          { label: 'Active members', sub: '48 active' },
          { label: 'Boxing & Muay Thai', sub: 'Trainer on duty' },
        ];
        break;
      case 'pool':
        title = 'Pool today';
        rows = [
          { label: 'Hostel guests', sub: 'Complimentary' },
          { label: 'Walk ins open', sub: 'Mon–Thu (₱300 / ₱150)' },
        ];
        break;
      case 'ktv':
        title = 'Rooms';
        rows = [
          { label: 'Small room A & B', sub: 'Up to 10 pax · ₱5k' },
          { label: 'Large room', sub: '20–25+ pax · ₱15k' },
        ];
        break;
      case 'fnb':
        title = 'POS orders';
        rows = [
          { label: 'Kitchen tickets', sub: `${transactions.length} recorded` },
          { label: 'Central database', sub: 'Synced live' },
        ];
        break;
      case 'billiards':
        title = 'Tables';
        rows = [
          { label: 'Table 1', sub: 'Active floor' },
          { label: 'Table 2', sub: 'Available now' },
        ];
        break;
      case 'tabletennis':
        title = 'Tables';
        rows = [
          { label: 'Table 1 & 2', sub: 'Upstairs arena' },
          { label: 'Table 3', sub: 'Available now' },
        ];
        break;
      case 'parking':
        title = 'Lot today';
        rows = [
          { label: 'Checked in guests', sub: 'Free (₱0)' },
          { label: 'Outsiders', sub: '₱30 – ₱40 day rate' },
        ];
        break;
      case 'events':
        title = 'Upcoming';
        rows = [
          { label: 'Pre-Christmas party', sub: 'Grand Terrace' },
          { label: 'Film / TV shoots', sub: 'Location packages open' },
        ];
        break;
      default:
        title = 'Outlet';
        rows = [{ label: outlet.name, sub: 'Active' }];
    }

    return (
      <div className="rounded-2xl p-5 bg-white border border-gray-200/90 flex flex-col justify-between min-h-[124px]">
        <div className="text-xs font-semibold text-gray-500 mb-2">{title}</div>
        <div className="space-y-1.5">
          {rows.map((r, i) => (
            <div key={i} className="flex items-baseline justify-between gap-2 text-xs">
              <span className="font-bold text-[#1A1A1A] truncate">{r.label}</span>
              <span className="text-[11px] text-gray-500 shrink-0">{r.sub}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderTransactionTable = (rows: MasterTransaction[], showVoidFilter: boolean) => (
    <div className="bg-white rounded-2xl border border-gray-200/90 overflow-hidden">
      {/* Header Row */}
      <div className="p-4 sm:px-6 sm:py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="text-sm font-bold text-[#1A1A1A]">
          {activeNav === 'dashboard' ? 'Recent transactions' : 'All transactions'}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {activeNav === 'history' && (
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search ID or customer..."
                className="pl-8 pr-3 py-1.5 rounded-xl border border-gray-200 text-xs text-[#1A1A1A] outline-none focus:border-[#1A1A1A] w-48"
              />
            </div>
          )}

          <div className="inline-flex p-1 bg-gray-100 rounded-xl gap-0.5">
            {(['all', 'paid', 'pending', ...(showVoidFilter ? ['void'] : [])] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st as any)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize cursor-pointer transition-all ${
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
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
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
            {rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-10 text-center text-gray-400">
                  No transactions found.
                </td>
              </tr>
            ) : (
              rows.map((tx) => {
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
                    <td className="py-3.5 px-4 font-bold text-[#1A1A1A]">
                      {tx.customerName}
                      {tx.lockedBy && (
                        <span className="ml-1.5 inline-flex items-center gap-1 text-[10px] text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">
                          <Lock className="w-2.5 h-2.5" /> Locked
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-gray-600 max-w-xs truncate">
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
                          onClick={() => {
                            const child = store.getOutletChildData(tx.outletRefTable, tx.outletRefId);
                            setDetailTx({ tx, childData: child });
                          }}
                          className="p-1.5 rounded-lg text-gray-500 hover:text-[#1A1A1A] hover:bg-gray-100 cursor-pointer"
                          title="View relational child record"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        {tx.transactionStatus === 'pending' && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleStartEdit(tx)}
                              className="p-1.5 rounded-lg text-gray-600 hover:text-[#1A1A1A] hover:bg-gray-100 cursor-pointer"
                              title="Edit pending transaction"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            {tx.paymentChannel === 'QRPh' && (
                              <button
                                type="button"
                                onClick={() => setQrModalTx(tx)}
                                className="p-1.5 rounded-lg text-gray-700 hover:bg-[#FFE27A]/60 cursor-pointer"
                                title="Open QR Ph Scan"
                              >
                                <QrCode className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => store.markAsPaid(tx.transactionID, user.name)}
                              className="p-1.5 rounded-lg text-emerald-700 hover:bg-emerald-50 cursor-pointer"
                              title="Mark as Paid"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                        {tx.outletSlug === 'fnb' && (
                          <button
                            type="button"
                            onClick={() => {
                              const child = store.getOutletChildData('fnb_transactions', tx.outletRefId);
                              setReceiptTx({ tx, fnb: child });
                            }}
                            className="p-1.5 rounded-lg text-gray-600 hover:bg-gray-100 cursor-pointer"
                            title="Kitchen receipt"
                          >
                            <UtensilsCrossed className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {tx.transactionStatus !== 'void' && (
                          <button
                            type="button"
                            onClick={() => {
                              setVoidReason('Customer cancelled');
                              setVoidNote('');
                              setVoidingTx(tx);
                            }}
                            className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 cursor-pointer"
                            title="Request void"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile List Item View (per Figma Mobile List Item spec) */}
      <div className="md:hidden divide-y divide-gray-100">
        {rows.length === 0 ? (
          <div className="py-8 text-center text-xs text-gray-400">No transactions found.</div>
        ) : (
          rows.map((tx) => (
            <div key={tx.transactionID} className="p-4 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="font-bold text-sm text-[#1A1A1A] truncate">{tx.customerName}</div>
                  <div className="text-xs text-gray-500 truncate mt-0.5">
                    {tx.outletService} ·{' '}
                    {new Date(tx.transactionDateTime).toLocaleTimeString([], {
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-extrabold text-sm text-[#1A1A1A] tabular-nums">
                    ₱{tx.totalAmount.toLocaleString()}
                  </div>
                  <div className="mt-1">
                    <StatusChip status={tx.transactionStatus} size="sm" />
                  </div>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-2 border-t border-gray-100 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    const child = store.getOutletChildData(tx.outletRefTable, tx.outletRefId);
                    setDetailTx({ tx, childData: child });
                  }}
                  className="px-2.5 py-1 rounded-lg bg-gray-100 text-[#1A1A1A] font-medium"
                >
                  Details
                </button>
                {tx.transactionStatus === 'pending' && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleStartEdit(tx)}
                      className="px-2.5 py-1 rounded-lg bg-gray-100 text-[#1A1A1A] font-semibold"
                    >
                      Edit
                    </button>
                    {tx.paymentChannel === 'QRPh' && (
                      <button
                        type="button"
                        onClick={() => setQrModalTx(tx)}
                        className="px-2.5 py-1 rounded-lg bg-[#FFE27A] text-[#1A1A1A] font-bold"
                      >
                        Scan QR
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => store.markAsPaid(tx.transactionID, user.name)}
                      className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-semibold"
                    >
                      Mark paid
                    </button>
                  </>
                )}
                {tx.transactionStatus !== 'void' && (
                  <button
                    type="button"
                    onClick={() => {
                      setVoidReason('Customer cancelled');
                      setVoidNote('');
                      setVoidingTx(tx);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-red-50 text-red-700 font-semibold ml-auto"
                  >
                    Void
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <SidebarShell
      brandSubLabel={outlet.name}
      navItems={navItems}
      activeNavId={activeNav}
      onSelectNav={(id) => {
        setActiveNav(id as any);
        setViewMode('main');
      }}
      user={user}
      onOpenProfile={onOpenProfile}
      onOpenExport={onOpenExport}
      onLogout={onLogout}
      topBanner={topBanner}
    >
      {editLockError && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-semibold">
          {editLockError}
        </div>
      )}

      {/* VIEW MODE: CREATE TRANSACTION */}
      {viewMode === 'create' ? (
        <OutletTransactionForm
          outlet={outlet}
          user={user}
          onSuccess={handleTransactionCreated}
          onCancel={() => setViewMode('main')}
        />
      ) : viewMode === 'pos' && outlet.slug === 'fnb' ? (
        /* VIEW MODE: F&B POS */
        <PosTerminal
          user={user}
          onTransactionCreated={loadData}
          onBackToFnb={() => setViewMode('main')}
        />
      ) : activeNav === 'dashboard' ? (
        /* TAB 1: DASHBOARD */
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-[#1A1A1A]">Dashboard</h1>
              <p className="text-xs text-gray-500 mt-0.5">
                {todayFormatted} · {outlet.name} clerk
              </p>
            </div>
            <div className="flex items-center gap-2.5">
              {outlet.slug === 'fnb' && (
                <button
                  type="button"
                  onClick={() => setViewMode('pos')}
                  className="px-4 py-2.5 rounded-xl bg-white border border-gray-300 text-xs font-bold text-[#1A1A1A] hover:bg-gray-50 transition-colors cursor-pointer min-h-[42px]"
                >
                  Open POS
                </button>
              )}
              <button
                type="button"
                onClick={() => setViewMode('create')}
                className="px-4 py-2.5 rounded-xl bg-[#FF5252] hover:bg-[#ff3b3b] text-[#1A1A1A] text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer min-h-[42px]"
              >
                <Plus className="w-4 h-4" />
                Create transaction
              </button>
            </div>
          </div>

          {/* 4-Tile Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatTile
              label="Today's sales"
              value={`₱${totalSales.toLocaleString()}`}
              sub={`${transactions.length} transactions`}
              isHighlight={true}
            />
            <StatTile
              label="Paid"
              value={paidTransactions.length}
              sub={`₱${totalSales.toLocaleString()} collected`}
            />
            <StatTile
              label="Pending"
              value={pendingTransactions.length}
              sub={`₱${pendingAmount.toLocaleString()} awaiting payment`}
            />
            {renderOperationalTile()}
          </div>

          {/* Recent Transactions */}
          {renderTransactionTable(filteredTransactions.slice(0, 8), false)}
        </div>
      ) : activeNav === 'history' ? (
        /* TAB 2: HISTORY */
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-[#1A1A1A]">
                Transaction history
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                {todayFormatted} · {outlet.name} clerk
              </p>
            </div>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleHeaderRequestVoid}
                disabled={transactions.filter((t) => t.transactionStatus !== 'void').length === 0}
                className="px-4 py-2.5 rounded-xl bg-white border border-gray-300 text-xs font-semibold text-[#1A1A1A] hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50 min-h-[42px]"
              >
                Request void
              </button>
              <button
                type="button"
                onClick={() => setViewMode('create')}
                className="px-4 py-2.5 rounded-xl bg-[#FF5252] hover:bg-[#ff3b3b] text-[#1A1A1A] text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer min-h-[42px]"
              >
                <Plus className="w-4 h-4" />
                Create transaction
              </button>
            </div>
          </div>

          {renderTransactionTable(filteredTransactions, true)}
        </div>
      ) : (
        /* TAB 3: VOID REQUESTS */
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-[#1A1A1A]">
                Void requests
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Deletion requests sent to Admin for approval ({outlet.name})
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200/90 overflow-hidden">
            {voidRequests.length === 0 ? (
              <div className="py-12 text-center text-xs text-gray-400">
                No void requests submitted from this outlet yet.
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {voidRequests.map((v) => (
                  <div key={v.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="font-bold text-[#1A1A1A] font-mono">
                        {v.transactionId} · ₱{v.amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                      </div>
                      <div className="text-gray-600 mt-0.5">
                        Reason: {v.reason} {v.note ? `— ${v.note}` : ''}
                      </div>
                      <div className="text-[11px] text-gray-400 mt-0.5">
                        Requested by {v.requestedByName} · {new Date(v.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold capitalize self-start sm:self-center ${
                        v.status === 'approved'
                          ? 'bg-[#FF5252] text-[#1A1A1A]'
                          : v.status === 'rejected'
                          ? 'bg-gray-100 text-gray-600'
                          : 'bg-[#FFE27A] text-[#1A1A1A]'
                      }`}
                    >
                      {v.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* REQUEST VOID MODAL (Exact PDF Style) */}
      {voidingTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-gray-200 shadow-2xl">
            <h3 className="text-base font-extrabold text-[#1A1A1A]">Request void</h3>

            <div className="mt-3 p-3.5 rounded-xl bg-[#FFE27A] text-[#1A1A1A] text-xs">
              <div className="font-bold font-mono">
                {voidingTx.transactionID} · {voidingTx.customerName}
              </div>
              <div className="text-[#1A1A1A]/80 mt-0.5">
                {voidingTx.outletService} · ₱{voidingTx.totalAmount.toLocaleString('en-PH', { minimumFractionDigits: 2 })} ·{' '}
                <span className="capitalize">{voidingTx.transactionStatus}</span>
              </div>
            </div>

            <form onSubmit={handleSubmitVoid} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-gray-600 mb-1">Reason</label>
                <select
                  value={voidReason}
                  onChange={(e) => setVoidReason(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-300 bg-white text-[#1A1A1A] outline-none"
                  required
                >
                  <option value="Customer cancelled">Customer cancelled</option>
                  <option value="Duplicate entry">Duplicate entry</option>
                  <option value="Incorrect service selected">Incorrect service selected</option>
                  <option value="Other adjustment">Other adjustment</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-600 mb-1">Notes (optional)</label>
                <textarea
                  value={voidNote}
                  onChange={(e) => setVoidNote(e.target.value)}
                  placeholder="Add a short note for the admin"
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-[#1A1A1A] outline-none"
                />
              </div>

              <p className="text-[11px] text-gray-500">
                Sent to Admin for approval. The transaction is kept until the request is approved.
              </p>

              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setVoidingTx(null)}
                  className="py-2.5 px-4 rounded-xl bg-white border border-gray-300 text-[#1A1A1A] font-semibold cursor-pointer min-h-[42px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-4 rounded-xl bg-[#FF5252] hover:bg-[#ff3b3b] text-[#1A1A1A] font-bold cursor-pointer min-h-[42px]"
                >
                  Send request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT PENDING TRANSACTION MODAL (FR9, NFR6) */}
      {editingTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-gray-200 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <div>
                <h3 className="text-base font-extrabold text-[#1A1A1A]">Edit pending transaction</h3>
                <p className="text-[11px] text-gray-500 font-mono">
                  {editingTx.transactionID} · 120s edit lock active
                </p>
              </div>
              <button type="button" onClick={handleCancelEdit} className="text-gray-400 hover:text-[#1A1A1A]">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-gray-600 font-semibold mb-1">Customer name</label>
                <input
                  type="text"
                  value={editCustomer}
                  onChange={(e) => setEditCustomer(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-300"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-600 font-semibold mb-1">Amount (₱)</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={editAmount}
                    onChange={(e) => setEditAmount(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-gray-300 font-bold tabular-nums"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-600 font-semibold mb-1">Discount (₱)</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={editDiscount}
                    onChange={(e) => setEditDiscount(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-gray-300 tabular-nums"
                  />
                </div>
              </div>
              <div className="p-3 bg-[#FFE27A] rounded-xl flex justify-between font-bold text-[#1A1A1A]">
                <span>Revised total</span>
                <span className="tabular-nums">₱{Math.max(0, editAmount - editDiscount).toLocaleString()}</span>
              </div>
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="py-2.5 px-4 rounded-xl bg-white border border-gray-300 text-[#1A1A1A] font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-4 rounded-xl bg-[#FF5252] text-[#1A1A1A] font-bold cursor-pointer"
                >
                  Save changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RELATIONAL CHILD DETAIL MODAL (R3, R4) */}
      {detailTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 border border-gray-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-[#1A1A1A]">Relational record</h3>
                <p className="text-[11px] text-gray-500 font-mono">
                  {detailTx.tx.transactionID} → {detailTx.tx.outletRefTable} ({detailTx.tx.outletRefId})
                </p>
              </div>
              <button type="button" onClick={() => setDetailTx(null)} className="text-gray-400 hover:text-[#1A1A1A]">
                ✕
              </button>
            </div>

            <div className="bg-[#F7F7F7] rounded-2xl p-4 space-y-1.5 font-mono text-xs">
              {detailTx.childData ? (
                Object.entries(detailTx.childData).map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4 border-b border-gray-200/70 pb-1 last:border-0">
                    <span className="text-gray-500">{k}</span>
                    <span className="font-bold text-[#1A1A1A] text-right truncate max-w-xs">
                      {typeof v === 'object' ? JSON.stringify(v) : String(v)}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-gray-400">Child record linked.</div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setDetailTx(null)}
              className="w-full py-2.5 rounded-xl bg-[#1A1A1A] text-white text-xs font-bold cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {qrModalTx && (
        <QrPhModal
          transaction={qrModalTx}
          onClose={() => setQrModalTx(null)}
          onSuccess={() => loadData()}
        />
      )}

      {receiptTx && (
        <ReceiptModal
          transaction={receiptTx.tx}
          fnbData={receiptTx.fnb}
          onClose={() => setReceiptTx(null)}
        />
      )}
    </SidebarShell>
  );
};
