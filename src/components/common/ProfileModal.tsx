import React from 'react';
import { User } from '../../types';
import { User as UserIcon, Shield, Building2, Mail, Calendar, LogOut, X } from 'lucide-react';

interface ProfileModalProps {
  user: User;
  onClose: () => void;
  onLogout: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ user, onClose, onLogout }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-sm w-full shadow-2xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#FFE27A] flex items-center justify-center text-[#1A1A1A]">
              <UserIcon className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-gray-900">User Profile</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Profile Card */}
        <div className="p-6 space-y-4">
          <div className="text-center pb-2">
            <div className="w-16 h-16 rounded-full bg-slate-900 text-[#FFE27A] text-xl font-bold flex items-center justify-center mx-auto mb-2 shadow-sm">
              {user.name.charAt(0)}
            </div>
            <h4 className="text-base font-bold text-gray-900">{user.name}</h4>
            <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 capitalize">
              Role: {user.role}
            </span>
          </div>

          <div className="bg-gray-50 rounded-2xl p-4 space-y-3 border border-gray-100 text-xs">
            <div className="flex items-center gap-2 text-gray-600">
              <Mail className="w-4 h-4 text-gray-400 shrink-0" />
              <div className="truncate">
                <span className="text-gray-400 block text-[10px] uppercase font-semibold">Email</span>
                <span className="text-gray-800 font-medium truncate">{user.email}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-gray-600">
              <Building2 className="w-4 h-4 text-gray-400 shrink-0" />
              <div>
                <span className="text-gray-400 block text-[10px] uppercase font-semibold">Assigned Outlet</span>
                <span className="text-gray-800 font-medium">{user.outletName || 'All Outlets (HQ / Management)'}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-gray-600">
              <Shield className="w-4 h-4 text-gray-400 shrink-0" />
              <div>
                <span className="text-gray-400 block text-[10px] uppercase font-semibold">Account Status</span>
                <span className="text-emerald-700 font-semibold capitalize">{user.approvalStatus}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
              <div>
                <span className="text-gray-400 block text-[10px] uppercase font-semibold">Member Since</span>
                <span className="text-gray-800 font-medium">{new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <div className="pt-2 space-y-2">
            <button
              onClick={() => {
                onClose();
                onLogout();
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Sign Out of Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
