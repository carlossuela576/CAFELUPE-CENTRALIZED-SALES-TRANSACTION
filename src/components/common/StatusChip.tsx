import React from 'react';
import { TransactionStatus } from '../../types';

interface StatusChipProps {
  status: TransactionStatus;
  size?: 'sm' | 'md';
}

export const StatusChip: React.FC<StatusChipProps> = ({ status, size = 'md' }) => {
  const isSm = size === 'sm';
  const sizeClasses = isSm ? 'text-[11px] px-2.5 py-0.5' : 'text-xs px-3 py-1';

  if (status === 'paid') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 font-semibold rounded-full bg-[#FFE27A] text-[#1A1A1A] select-none whitespace-nowrap ${sizeClasses}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-[#1A1A1A]" />
        <span>Paid</span>
      </span>
    );
  }

  if (status === 'pending') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 font-semibold rounded-full bg-white border border-gray-300 text-[#1A1A1A] select-none whitespace-nowrap ${sizeClasses}`}
      >
        <span className="w-1.5 h-1.5 rounded-full border border-[#1A1A1A] bg-white" />
        <span>Pending</span>
      </span>
    );
  }

  // Void
  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold rounded-full bg-[#FF5252] text-[#1A1A1A] select-none whitespace-nowrap ${sizeClasses}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-[#1A1A1A]" />
      <span>Void</span>
    </span>
  );
};
