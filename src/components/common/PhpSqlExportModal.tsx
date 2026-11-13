import React, { useState } from 'react';
import { store } from '../../db/store';
import { Database, FileCode, Copy, Download, Check, X } from 'lucide-react';

interface PhpSqlExportModalProps {
  onClose: () => void;
}

export const PhpSqlExportModal: React.FC<PhpSqlExportModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'sql' | 'php'>('sql');
  const [copied, setCopied] = useState(false);

  const sqlContent = store.generateMySQLSchema();
  const phpContent = store.generatePHPService();

  const currentContent = activeTab === 'sql' ? sqlContent : phpContent;
  const currentFileName = activeTab === 'sql' ? 'cafelupe_schema.sql' : 'TransactionService.php';

  const handleCopy = () => {
    navigator.clipboard.writeText(currentContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([currentContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = currentFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-gray-100 flex flex-col h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/70">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#FFE27A] flex items-center justify-center text-[#1A1A1A]">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 leading-tight">
                PHP & MySQL Production Artifacts
              </h3>
              <p className="text-xs text-gray-500">
                Ready-to-deploy backend code for XAMPP / Apache / MySQL
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied!' : 'Copy Code'}
            </button>
            <button
              onClick={handleDownload}
              className="px-3.5 py-1.5 rounded-lg bg-[#FF5252] text-[#1A1A1A] text-xs font-bold hover:bg-[#ff3b3b] flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              Download {activeTab.toUpperCase()}
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-200/50 transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="px-6 pt-3 pb-2 border-b border-gray-100 flex items-center gap-2 bg-white">
          <button
            onClick={() => setActiveTab('sql')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'sql'
                ? 'bg-[#1A1A1A] text-white shadow-xs'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200/70'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            MySQL Relational Schema (database.sql)
          </button>
          <button
            onClick={() => setActiveTab('php')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'php'
                ? 'bg-[#1A1A1A] text-white shadow-xs'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200/70'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            PHP 8 Service Class (TransactionService.php)
          </button>
        </div>

        {/* Code Content */}
        <div className="flex-1 p-4 bg-slate-950 overflow-auto">
          <pre className="font-mono text-xs text-emerald-400 leading-relaxed whitespace-pre selection:bg-emerald-800 selection:text-white">
            {currentContent}
          </pre>
        </div>

        {/* Footer info */}
        <div className="px-6 py-2.5 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
          <span>
            Compliant with requirements R1, R3, R4, NFR7-NFR9 and clean OOP PHP conventions.
          </span>
          <span className="font-mono text-gray-400">Total lines: {currentContent.split('\n').length}</span>
        </div>
      </div>
    </div>
  );
};
