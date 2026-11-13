import React from 'react';
import { FnbTransaction, MasterTransaction } from '../../types';
import { Printer, X, Check } from 'lucide-react';

interface ReceiptModalProps {
  transaction: MasterTransaction;
  fnbData?: FnbTransaction;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ transaction, fnbData, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  const items = fnbData?.orderItems || [];
  const destination = fnbData?.auditedTo || 'Walk-in Client';
  const tableOrRoom = fnbData?.tableOrRoomNo || 'Table 1';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-sm w-full shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top Header */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/80">
          <div className="flex items-center gap-2">
            <Printer className="w-4 h-4 text-gray-700" />
            <span className="text-sm font-bold text-gray-900">Kitchen & Order Receipt</span>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-200/60"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Printable Receipt Paper */}
        <div className="p-6 overflow-y-auto flex-1 font-mono text-xs text-gray-800 space-y-3 bg-[#fdfdfd]">
          {/* Cafe Lupe Brand Receipt Header */}
          <div className="text-center border-b border-dashed border-gray-300 pb-3">
            <h2 className="text-base font-extrabold tracking-tight text-gray-900 uppercase">Cafe Lupe</h2>
            <p className="text-[10px] text-gray-500">Lot 2 Blk 7 Sumulong Hwy, Antipolo, Rizal</p>
            <p className="text-[10px] text-gray-500">Tel: (02) 8633-1456 · VAT Reg TIN: 000-123-456</p>
            <div className="mt-2 text-xs font-bold bg-gray-100 py-1 px-2 rounded-sm inline-block">
              *** KITCHEN ORDER TICKET ***
            </div>
          </div>

          {/* Ticket Metadata */}
          <div className="space-y-1 text-[11px] pb-2 border-b border-dashed border-gray-300">
            <div className="flex justify-between">
              <span className="text-gray-500">TICKET #:</span>
              <span className="font-bold">{transaction.transactionID}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">DATE/TIME:</span>
              <span>{new Date(transaction.transactionDateTime).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">SERVER:</span>
              <span>{transaction.employeeHandler}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">AUDIT TARGET:</span>
              <span className="font-bold text-blue-700">{destination}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">LOCATION/TABLE:</span>
              <span className="font-bold">{tableOrRoom}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">STATUS:</span>
              <span className="uppercase font-bold">{transaction.transactionStatus}</span>
            </div>
          </div>

          {/* Items Table */}
          <div className="pt-1">
            <div className="flex justify-between font-bold text-[11px] border-b border-gray-400 pb-1 mb-2">
              <span>ITEM</span>
              <span className="text-right">QTY x PRICE = TOTAL</span>
            </div>

            <div className="space-y-2">
              {items.length > 0 ? (
                items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-start text-[11px]">
                    <div className="flex-1 pr-2">
                      <div className="font-semibold text-gray-900">{item.name}</div>
                      <div className="text-[10px] text-gray-500">
                        {item.quantity} @ ₱{item.price.toFixed(2)}
                      </div>
                    </div>
                    <div className="font-bold tabular-nums">₱{item.subtotal.toFixed(2)}</div>
                  </div>
                ))
              ) : (
                <div className="flex justify-between text-[11px]">
                  <span>{transaction.outletService}</span>
                  <span className="font-bold tabular-nums">₱{transaction.transactionAmount.toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Summary Totals */}
          <div className="pt-2 border-t border-dashed border-gray-400 space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="tabular-nums">₱{transaction.transactionAmount.toFixed(2)}</span>
            </div>
            {transaction.discount > 0 && (
              <div className="flex justify-between text-red-600">
                <span>Discount / Voucher:</span>
                <span className="tabular-nums">-₱{transaction.discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-extrabold text-gray-900 pt-1 border-t border-gray-300">
              <span>TOTAL AMOUNT:</span>
              <span className="tabular-nums">₱{transaction.totalAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[10px] text-gray-500 pt-1">
              <span>Payment:</span>
              <span>{transaction.paymentChannel} ({transaction.paymentArrangement})</span>
            </div>
          </div>

          {/* Footer note */}
          <div className="text-center text-[10px] text-gray-400 pt-2 border-t border-dashed border-gray-300">
            Thank you for dining at Cafe Lupe!
            <br />
            This document serves as kitchen prep copy.
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex-1 py-3 px-4 rounded-xl bg-[#FF5252] hover:bg-[#ff3b3b] text-[#1A1A1A] font-bold text-xs shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <Printer className="w-4 h-4" />
            Print Kitchen Ticket
          </button>
          <button
            onClick={onClose}
            className="py-3 px-4 rounded-xl bg-white border border-gray-200 text-gray-700 font-semibold text-xs hover:bg-gray-100 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
