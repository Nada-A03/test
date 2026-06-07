/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Database, Upload, Plus, Download, RefreshCw, Layers } from "lucide-react";

interface HeaderProps {
  onAddClick: () => void;
  onImportClick: () => void;
  onDownloadTemplate: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onAddClick,
  onImportClick,
  onDownloadTemplate,
  onRefresh,
  isRefreshing,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 text-slate-800 shadow-sm shrink-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Branding Logo & Title */}
        <div className="flex items-center">
          <div className="flex items-center space-x-3.5">
            <span className="font-extrabold text-3xl tracking-tight text-[#00468f] select-none" id="aistudio-custom-logo">
              DMT
            </span>
            <span className="text-slate-400 font-light text-[10px] font-mono border border-slate-200 px-1 py-0.2 rounded bg-slate-50 self-center">
              SIT1 v1.0
            </span>
          </div>
        </div>

        {/* Action Panel */}
        <div className="flex items-center space-x-2.5">
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center justify-center w-9 h-9 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-50 active:scale-95 transition-all outline-none border border-slate-200 hover:border-slate-300 disabled:opacity-50"
            title="Refresh migration grid states"
            id="refresh-btn"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-[#16a34a]" : ""}`} />
          </button>

          <button
            onClick={onDownloadTemplate}
            className="hidden md:flex items-center space-x-2 px-3 h-9 text-slate-600 hover:text-slate-900 bg-white text-xs font-semibold rounded-lg hover:bg-slate-50 active:scale-95 border border-slate-200 hover:border-slate-300 transition-all outline-none"
            title="Download an Excel template matching our columns schema"
            id="download-template-btn"
          >
            <Download className="w-4 h-4 text-[#16a34a]" />
            <span>Schema CSV Template</span>
          </button>

          <button
            onClick={onImportClick}
            className="flex items-center space-x-2 px-3.5 h-9 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 rounded-lg border border-slate-200 hover:border-slate-300 active:scale-95 transition-all outline-none shadow-sm"
            id="import-excel-btn"
          >
            <Upload className="w-3.5 h-3.5 text-slate-500" />
            <span>Import Spreadsheet</span>
          </button>

          <button
            onClick={onAddClick}
            className="flex items-center space-x-2 px-4 h-9 bg-[#00468f] hover:bg-[#00356b] text-xs font-semibold text-white rounded-lg shadow-sm shadow-blue-100 active:scale-95 transition-all outline-none"
            id="add-object-btn"
          >
            <Plus className="w-4 h-4 text-white" />
            <span>New Data Object</span>
          </button>
        </div>
      </div>
    </header>
  );
};
