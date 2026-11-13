import React from 'react';

interface StatTileProps {
  label: string;
  value: string | number;
  sub?: string;
  isHighlight?: boolean;
}

export const StatTile: React.FC<StatTileProps> = ({
  label,
  value,
  sub,
  isHighlight = false,
}) => {
  if (isHighlight) {
    return (
      <div className="rounded-2xl p-5 bg-[#FFE27A] text-[#1A1A1A] flex flex-col justify-between min-h-[124px]">
        <div className="text-xs font-semibold text-[#1A1A1A]/75">{label}</div>
        <div className="mt-2">
          <div className="text-2xl sm:text-3xl font-extrabold tracking-tight tabular-nums text-[#1A1A1A]">
            {value}
          </div>
          {sub && <div className="text-xs font-medium text-[#1A1A1A]/75 mt-1">{sub}</div>}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl p-5 bg-white border border-gray-200/90 flex flex-col justify-between min-h-[124px]">
      <div className="text-xs font-semibold text-gray-500">{label}</div>
      <div className="mt-2">
        <div className="text-2xl sm:text-3xl font-extrabold tracking-tight tabular-nums text-[#1A1A1A]">
          {value}
        </div>
        {sub && <div className="text-xs font-medium text-gray-500 mt-1">{sub}</div>}
      </div>
    </div>
  );
};
