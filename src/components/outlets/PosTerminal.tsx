import React, { useState } from 'react';
import { User, PosOrderItem, PaymentArrangement, PaymentChannel, MasterTransaction, FnbTransaction } from '../../types';
import { store } from '../../db/store';
import { INITIAL_POS_ITEMS } from '../../db/initialData';
import { QrPhModal } from '../common/QrPhModal';
import { Plus, Minus } from 'lucide-react';

interface PosTerminalProps {
  user: User;
  onTransactionCreated: () => void;
  onBackToFnb: () => void;
}

export const PosTerminal: React.FC<PosTerminalProps> = ({ user, onTransactionCreated, onBackToFnb }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [cart, setCart] = useState<PosOrderItem[]>([]);
  const [auditedTo, setAuditedTo] = useState<'Walk-in Client' | 'Function Guest' | 'KTV Room User'>('Walk-in Client');
  const [tableOrRoomNo, setTableOrRoomNo] = useState<string>('Table 4');
  const [customerName, setCustomerName] = useState<string>('');
  const [paymentChannel, setPaymentChannel] = useState<PaymentChannel>('Cash');
  const [paymentArrangement] = useState<PaymentArrangement>('Full Payment');

  // Order placed confirmation modal & Kitchen Receipt modal (matching PDF F&B POS flow)
  const [placedOrder, setPlacedOrder] = useState<{ tx: MasterTransaction; fnb: FnbTransaction; orderNum: string } | null>(null);
  const [showKitchenReceipt, setShowKitchenReceipt] = useState(false);
  const [activeQrTx, setActiveQrTx] = useState<MasterTransaction | null>(null);

  const nextOrderNumber = 1040 + store.getTransactions('fnb').length;

  const categories = ['All', 'Mains', 'Appetizers', 'Beverages', 'KTV Combos'];

  const filteredItems =
    selectedCategory === 'All'
      ? INITIAL_POS_ITEMS
      : INITIAL_POS_ITEMS.filter((i) => i.category === selectedCategory);

  const addToCart = (item: (typeof INITIAL_POS_ITEMS)[0]) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.itemId === item.id);
      if (existing) {
        return prev.map((i) =>
          i.itemId === item.id
            ? { ...i, quantity: i.quantity + 1, subtotal: (i.quantity + 1) * i.price }
            : i
        );
      }
      return [
        ...prev,
        {
          itemId: item.id,
          name: item.name,
          price: item.price,
          quantity: 1,
          subtotal: item.price,
        },
      ];
    });
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((i) => {
          if (i.itemId !== itemId) return i;
          const newQ = i.quantity + delta;
          return { ...i, quantity: newQ, subtotal: newQ * i.price };
        })
        .filter((i) => i.quantity > 0)
    );
  };

  const subtotal = cart.reduce((acc, item) => acc + item.subtotal, 0);
  const totalItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const handlePlaceOrder = () => {
    if (cart.length === 0) return;

    const serviceSummary = cart.map((i) => `${i.quantity}× ${i.name}`).join(', ').slice(0, 72);

    const childData = {
      auditedTo,
      orderItems: cart,
      tableOrRoomNo,
      receiptPrintedAt: new Date().toISOString(),
    };

    const newTx = store.createTransaction({
      outletSlug: 'fnb',
      outletName: 'Restaurant / Food & Beverage',
      outletService: serviceSummary,
      customerName: customerName.trim() || `${tableOrRoomNo} (${auditedTo === 'Walk-in Client' ? 'Walk in' : auditedTo === 'Function Guest' ? 'Function' : 'KTV'})`,
      employeeHandler: user.name,
      employeeId: user.id,
      transactionAmount: subtotal,
      discount: 0,
      paymentArrangement,
      paymentChannel,
      childTableData: childData,
    });

    const fnbChild = store.getOutletChildData('fnb_transactions', newTx.outletRefId);

    onTransactionCreated();
    setCart([]);
    setPlacedOrder({ tx: newTx, fnb: fnbChild, orderNum: `#${nextOrderNumber}` });

    if (paymentChannel === 'QRPh') {
      setActiveQrTx(newTx);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Top Header Row matching PDF */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#1A1A1A]">New order</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Order #{nextOrderNumber} · syncs to F&B and the central database instantly
          </p>
        </div>
        <button
          type="button"
          onClick={onBackToFnb}
          className="px-4 py-2 rounded-xl bg-white border border-gray-300 text-xs font-semibold text-[#1A1A1A] hover:bg-gray-50 transition-colors cursor-pointer min-h-[40px]"
        >
          Back to F&B
        </button>
      </div>

      {/* Split Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left: Category Bar & Menu Grid */}
        <div className="lg:col-span-7 xl:col-span-8 bg-white rounded-2xl p-5 border border-gray-200/90 space-y-5">
          <div>
            <div className="text-xs font-semibold text-gray-500 mb-2">Category</div>
            <div className="inline-flex p-1 bg-gray-100 rounded-xl gap-1 overflow-x-auto max-w-full">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-white text-[#1A1A1A] shadow-2xs'
                      : 'text-gray-600 hover:text-[#1A1A1A]'
                  }`}
                >
                  {cat === 'KTV Combos' ? 'KTV sets' : cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {filteredItems.map((item) => {
              const inCart = cart.find((c) => c.itemId === item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => addToCart(item)}
                  className="text-left p-4 rounded-2xl bg-[#F7F7F7]/70 hover:bg-[#FFE27A]/35 border border-gray-200/90 hover:border-[#1A1A1A]/30 transition-all cursor-pointer flex flex-col justify-between min-h-[104px]"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-bold text-[#1A1A1A] leading-snug">
                      {item.name}
                    </span>
                    {inCart && (
                      <span className="px-1.5 py-0.5 rounded-full bg-[#FFE27A] text-[#1A1A1A] text-[10px] font-extrabold tabular-nums shrink-0">
                        {inCart.quantity}
                      </span>
                    )}
                  </div>
                  <div className="text-sm font-extrabold text-[#1A1A1A] tabular-nums mt-3">
                    ₱{item.price.toLocaleString()}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Order Panel */}
        <div className="lg:col-span-5 xl:col-span-4 bg-white rounded-2xl p-5 border border-gray-200/90 space-y-4">
          <div className="text-sm font-bold text-[#1A1A1A]">Order #{nextOrderNumber}</div>

          {/* Audit To Segmented Control */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Audit to</label>
            <div className="flex p-1 bg-gray-100 rounded-xl gap-1">
              {(['Walk-in Client', 'Function Guest', 'KTV Room User'] as const).map((target) => (
                <button
                  key={target}
                  type="button"
                  onClick={() => setAuditedTo(target)}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer ${
                    auditedTo === target ? 'bg-white text-[#1A1A1A] shadow-2xs' : 'text-gray-600'
                  }`}
                >
                  {target === 'Walk-in Client' ? 'Walk in' : target === 'Function Guest' ? 'Function' : 'KTV room'}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 mb-1">Table / room</label>
              <input
                type="text"
                value={tableOrRoomNo}
                onChange={(e) => setTableOrRoomNo(e.target.value)}
                placeholder="Table 4"
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs text-[#1A1A1A] outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 mb-1">Customer (optional)</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Guest name"
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs text-[#1A1A1A] outline-none"
              />
            </div>
          </div>

          {/* Payment Channel */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 mb-1">Payment channel</label>
            <div className="flex p-1 bg-gray-100 rounded-xl gap-1">
              {(['Cash', 'QRPh'] as const).map((ch) => (
                <button
                  key={ch}
                  type="button"
                  onClick={() => setPaymentChannel(ch)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                    paymentChannel === ch ? 'bg-white text-[#1A1A1A] shadow-2xs' : 'text-gray-600'
                  }`}
                >
                  {ch === 'QRPh' ? 'QR Ph' : 'Cash'}
                </button>
              ))}
            </div>
          </div>

          {/* Cart Items */}
          <div className="border-t border-b border-gray-100 py-3 space-y-2.5 max-h-56 overflow-y-auto">
            {cart.length === 0 ? (
              <div className="py-6 text-center text-xs text-gray-400">
                Select menu items on the left to build this order.
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.itemId} className="flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div className="inline-flex items-center border border-gray-200 rounded-lg bg-gray-50">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.itemId, -1)}
                        className="w-6 h-6 flex items-center justify-center text-gray-600 hover:text-[#1A1A1A] cursor-pointer"
                        aria-label={`Decrease ${item.name}`}
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-5 text-center font-bold tabular-nums">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.itemId, 1)}
                        className="w-6 h-6 flex items-center justify-center text-gray-600 hover:text-[#1A1A1A] cursor-pointer"
                        aria-label={`Increase ${item.name}`}
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <span className="font-medium text-[#1A1A1A] truncate">× {item.name}</span>
                  </div>
                  <span className="font-bold text-[#1A1A1A] tabular-nums shrink-0">
                    ₱{item.subtotal.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* #FFE27A Total Box */}
          <div className="rounded-2xl p-4 bg-[#FFE27A] text-[#1A1A1A]">
            <div className="text-xs font-semibold text-[#1A1A1A]/75">Total</div>
            <div className="text-2xl sm:text-3xl font-extrabold tracking-tight tabular-nums mt-0.5">
              ₱{subtotal.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] font-semibold text-[#1A1A1A]/75 mt-1 tabular-nums">
              {totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'}
            </div>
          </div>

          <div className="space-y-2">
            <button
              type="button"
              onClick={handlePlaceOrder}
              disabled={cart.length === 0}
              className="w-full py-3 px-4 rounded-xl bg-[#FF5252] hover:bg-[#ff3b3b] text-[#1A1A1A] font-bold text-xs transition-colors cursor-pointer disabled:opacity-50 min-h-[42px]"
            >
              Place order
            </button>
            <button
              type="button"
              onClick={() => setCart([])}
              disabled={cart.length === 0}
              className="w-full py-2.5 px-4 rounded-xl bg-white border border-gray-300 text-[#1A1A1A] font-semibold text-xs hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-40 min-h-[40px]"
            >
              Clear order
            </button>
          </div>
        </div>
      </div>

      {/* Order Placed Confirmation Modal (PDF F&B POS Modal 1) */}
      {placedOrder && !showKitchenReceipt && !activeQrTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-sm w-full p-7 border border-gray-200 shadow-2xl text-center">
            <div className="text-xs font-semibold text-gray-500">Order placed</div>
            <div className="text-2xl font-extrabold text-[#1A1A1A] tabular-nums mt-1">
              {placedOrder.orderNum} · ₱{placedOrder.tx.totalAmount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-gray-500 mt-1.5 mb-6">
              Synced to central database ({placedOrder.tx.transactionID})
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setPlacedOrder(null)}
                className="py-2.5 px-3 rounded-xl bg-white border border-gray-300 text-[#1A1A1A] font-semibold text-xs hover:bg-gray-50 cursor-pointer min-h-[42px]"
              >
                New order
              </button>
              <button
                type="button"
                onClick={() => setShowKitchenReceipt(true)}
                className="py-2.5 px-3 rounded-xl bg-[#FF5252] hover:bg-[#ff3b3b] text-[#1A1A1A] font-bold text-xs cursor-pointer min-h-[42px]"
              >
                Print kitchen receipt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Kitchen Receipt Modal (PDF F&B POS Modal 2) */}
      {placedOrder && showKitchenReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 border border-gray-200 shadow-2xl">
            <div className="text-center pb-4 border-b border-dashed border-gray-300">
              <div className="text-xs font-bold tracking-widest uppercase text-[#1A1A1A]">
                KITCHEN RECEIPT
              </div>
              <div className="text-xs text-gray-500 mt-1 font-mono">
                Order {placedOrder.orderNum} · {placedOrder.fnb?.auditedTo || 'Walk in'} ·{' '}
                {new Date(placedOrder.tx.transactionDateTime).toLocaleTimeString([], {
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </div>
              <div className="text-[11px] text-gray-400 font-mono mt-0.5">
                {placedOrder.fnb?.tableOrRoomNo || 'Table 4'} · {placedOrder.tx.transactionID}
              </div>
            </div>

            <div className="py-4 space-y-2 font-mono text-xs text-[#1A1A1A] border-b border-dashed border-gray-300">
              {(placedOrder.fnb?.orderItems || []).map((item, idx) => (
                <div key={idx} className="flex justify-between">
                  <span>
                    {item.quantity} × {item.name}
                  </span>
                  <span className="tabular-nums">₱{item.subtotal.toFixed(2)}</span>
                </div>
              ))}
              <div className="pt-2 border-t border-gray-200 flex justify-between font-bold">
                <span>TOTAL</span>
                <span className="tabular-nums">₱{placedOrder.tx.totalAmount.toFixed(2)}</span>
              </div>
            </div>

            <div className="pt-5 grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => window.print()}
                className="py-2.5 px-4 rounded-xl bg-white border border-gray-300 text-[#1A1A1A] font-semibold text-xs hover:bg-gray-50 cursor-pointer min-h-[42px]"
              >
                Print slip
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowKitchenReceipt(false);
                  setPlacedOrder(null);
                }}
                className="py-2.5 px-4 rounded-xl bg-[#FF5252] hover:bg-[#ff3b3b] text-[#1A1A1A] font-bold text-xs cursor-pointer min-h-[42px]"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Ph Modal if QR Ph channel selected */}
      {activeQrTx && (
        <QrPhModal
          transaction={activeQrTx}
          onClose={() => setActiveQrTx(null)}
          onSuccess={() => onTransactionCreated()}
        />
      )}
    </div>
  );
};
