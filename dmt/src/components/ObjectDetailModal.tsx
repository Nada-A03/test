/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { MigrationObject } from "../types";
import { 
  X, Calendar, Activity, Key, Users, MessageSquare, ArrowRight, Sliders, CheckCircle 
} from "lucide-react";

interface ObjectDetailModalProps {
  object: MigrationObject | null;
  onClose: () => void;
  onEditClick: (obj: MigrationObject) => void;
}

export const ObjectDetailModal: React.FC<ObjectDetailModalProps> = ({
  object,
  onClose,
  onEditClick,
}) => {
  const [activeTab, setActiveTab] = useState<"timeline" | "load" | "personnel">("timeline");

  if (!object) return null;

  // Percentage calculations
  const totalRecs = object.records_to_load || 0;
  const loadedRecs = object.records_loaded || 0;
  const loadPercentage = totalRecs > 0 ? Math.round((loadedRecs / totalRecs) * 100) : 0;

  // Custom unified blue/gray color helpers
  const getProgressColorClass = (pct: number) => {
    if (pct === 0) return "text-slate-450 text-slate-400";
    return "text-[#15803d]";
  };

  const getNodeBgClass = (pct: number) => {
    if (pct === 100) return "bg-[#15803d] text-white";
    if (pct === 0) return "bg-slate-200 text-slate-400";
    return "bg-emerald-500 text-white animate-pulse";
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/40 backdrop-blur-sm flex justify-center items-center p-4">
      <div 
        className="w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-2xl relative overflow-hidden text-slate-800 animate-in fade-in zoom-in duration-250 flex flex-col max-h-[85vh]"
        id="object-detail-drawer"
      >
        {/* Color accent header */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#15803d]"></div>

        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-start mt-1 shrink-0">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono tracking-wide uppercase bg-slate-100 text-slate-500 border border-slate-200">
                {object.object_type}
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-[#00468f] mt-2 leading-tight tracking-tight">
              {object.data_object}
            </h2>
            <p className="text-xs text-slate-400 mt-1 font-mono">
              System ID: <span className="font-bold text-[#15803d]">#{object.id}</span>
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-400 hover:text-slate-800 transition-all active:scale-95 outline-none"
            id="close-detail-modal-btn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Controls Nav */}
        <div className="bg-slate-50 border-b border-slate-100 px-6 py-2 flex space-x-1 shrink-0">
          <button
            onClick={() => setActiveTab("timeline")}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all outline-none ${
              activeTab === "timeline" 
                ? "bg-white text-[#15803d] shadow-sm border border-slate-200/60" 
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Timeline & Sequence
          </button>
          <button
            onClick={() => setActiveTab("load")}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all outline-none ${
              activeTab === "load" 
                ? "bg-white text-[#15803d] shadow-sm border border-slate-200/60" 
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Load Metrics & Dependency
          </button>
          <button
            onClick={() => setActiveTab("personnel")}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all outline-none ${
              activeTab === "personnel" 
                ? "bg-white text-[#15803d] shadow-sm border border-slate-200/60" 
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Personnel & Notes
          </button>
        </div>

        {/* Modal Scrollable Core Content */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 font-sans">
          
          {/* Top general KPI mini metrics (Always shown inside content area) */}
          <div className="grid grid-cols-3 gap-4 bg-slate-50/50 p-4 rounded-xl border border-slate-200/60 text-center shrink-0">
            <div>
              <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400 font-mono block">Overall Stage</span>
              <span className={`block text-2xl font-black font-mono mt-1 ${getProgressColorClass(object.overall_progress)}`}>
                {object.overall_progress}%
              </span>
            </div>
            <div className="border-l border-r border-slate-200">
              <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400 font-mono block">Quality Benchmark</span>
              <span className="block text-2xl font-black font-mono mt-1 text-[#15803d]">
                {object.success_rate}%
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400 font-mono block">Audited Errors</span>
              <span className={`block text-2xl font-black font-mono mt-1 ${object.errors > 0 ? "text-red-600 font-bold" : "text-slate-400"}`}>
                {object.errors.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Tab 1: Timeline Content */}
          {activeTab === "timeline" && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold font-mono uppercase text-[#15803d] tracking-wider mb-2 flex items-center space-x-2">
                <Activity className="w-4 h-4" />
                <span>Migration Sequence Benchmarks</span>
              </h4>

              {/* Logical chronological steps */}
              <div className="relative border-l border-slate-200 ml-2.5 pl-6 space-y-6">
                
                {/* Stage 1: Extraction */}
                <div className="relative">
                  <div className={`absolute -left-[30px] top-1 w-5 h-5 rounded-full border-4 border-white shadow-sm flex items-center justify-center text-[9px] font-bold ${getNodeBgClass(object.extract_progress)}`}>
                  </div>
                  <div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 flex items-center space-x-2">
                        <span>1. Extract Phase</span>
                        {object.extract_progress === 100 ? (
                          <span className="text-[9px] px-1.5 py-0.1 rounded bg-slate-50 font-mono font-bold text-[#15803d] border border-slate-200">Completed</span>
                        ) : object.extract_progress === 0 ? (
                          <span className="text-[9px] px-1.5 py-0.1 rounded bg-slate-50 font-mono font-bold text-slate-400 border border-slate-100">Not Started</span>
                        ) : (
                          <span className="text-[9px] px-1.5 py-0.1 rounded bg-green-50 font-mono font-bold text-emerald-600 border border-green-200 animate-pulse">Running ({object.extract_progress}%)</span>
                        )}
                      </span>
                      <span className="text-[10px] font-mono text-slate-405 mt-1 sm:mt-0">
                        Date: {object.extract_date || "Not logged"}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                      Collects core records, sanitizes sources, and audits schema compatibility.
                    </p>
                  </div>
                </div>

                {/* Stage 2: Preload Review */}
                <div className="relative">
                  <div className={`absolute -left-[30px] top-1 w-5 h-5 rounded-full border-4 border-white shadow-sm flex items-center justify-center text-[9px] font-bold ${getNodeBgClass(object.preload_progress)}`}>
                  </div>
                  <div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 flex items-center space-x-2">
                        <span>2. Preload Approved Verify</span>
                        {object.preload_progress === 100 ? (
                          <span className="text-[9px] px-1.5 py-0.1 rounded bg-slate-50 font-mono font-bold text-[#15803d] border border-slate-200">Completed</span>
                        ) : object.preload_progress === 0 ? (
                          <span className="text-[9px] px-1.5 py-0.1 rounded bg-slate-50 font-mono font-bold text-slate-400 border border-slate-100">Not Started</span>
                        ) : (
                          <span className="text-[9px] px-1.5 py-0.1 rounded bg-green-50 font-mono font-bold text-emerald-600 border border-green-200">Reviewing ({object.preload_progress}%)</span>
                        )}
                      </span>
                      <span className="text-[10px] font-mono text-slate-405 mt-1 sm:mt-0">
                        Date: {object.preload_date || "Not logged"}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                      Verifies schema targets and maps files. Reviewed by: <span className="font-semibold text-slate-600">{object.preload_reviewed_by || "TBD"}</span>.
                    </p>
                  </div>
                </div>

                {/* Stage 3: Target Loading */}
                <div className="relative">
                  <div className={`absolute -left-[30px] top-1 w-5 h-5 rounded-full border-4 border-white shadow-sm flex items-center justify-center text-[9px] font-bold ${getNodeBgClass(object.load_progress)}`}>
                  </div>
                  <div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 flex items-center space-x-2">
                        <span>3. Target Loading</span>
                        {object.load_progress === 100 ? (
                          <span className="text-[9px] px-1.5 py-0.1 rounded bg-slate-50 font-mono font-bold text-[#15803d] border border-slate-200">Completed</span>
                        ) : object.load_progress === 0 ? (
                          <span className="text-[9px] px-1.5 py-0.1 rounded bg-slate-50 font-mono font-bold text-slate-400 border border-slate-100">Not Started</span>
                        ) : (
                          <span className="text-[9px] px-1.5 py-0.1 rounded bg-green-50 font-mono font-bold text-emerald-600 border border-green-200">Active ({object.load_progress}%)</span>
                        )}
                      </span>
                      <span className="text-[10px] font-mono text-slate-450 mt-1 sm:mt-0">
                        Date: {object.load_date || "Not logged"}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-505 mt-1 leading-relaxed">
                      Pushes raw data packages directly into final schemas. Loader: <span className="font-semibold text-slate-600">{object.loaded_by || "TBD"}</span>.
                    </p>
                  </div>
                </div>

                {/* Stage 4: Postload Review & Validation */}
                <div className="relative">
                  <div className={`absolute -left-[30px] top-1 w-5 h-5 rounded-full border-4 border-white shadow-sm flex items-center justify-center text-[9px] font-bold ${getNodeBgClass(object.postload_progress)}`}>
                  </div>
                  <div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 flex items-center space-x-2">
                        <span>4. Postload Signoff Validation</span>
                        {object.postload_progress === 100 ? (
                          <span className="text-[9px] px-1.5 py-0.1 rounded bg-slate-50 font-mono font-bold text-[#15803d] border border-slate-200">Completed</span>
                        ) : object.postload_progress === 0 ? (
                          <span className="text-[9px] px-1.5 py-0.1 rounded bg-slate-50 font-mono font-bold text-slate-400 border border-slate-100">Not Started</span>
                        ) : (
                          <span className="text-[9px] px-1.5 py-0.1 rounded bg-green-50 font-mono font-bold text-emerald-600 border border-green-200">In Sign-off ({object.postload_progress}%)</span>
                        )}
                      </span>
                      <span className="text-[10px] font-mono text-slate-405 mt-1 sm:mt-0">
                        Date: {object.postload_date || "Not logged"}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                      Final checks on ledger outputs. Authorized by: <span className="font-semibold text-slate-600">{object.postload_reviewed_by || "COE Lead TBD"}</span>.
                    </p>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* Tab 2: Load Volume details */}
          {activeTab === "load" && (
            <div className="space-y-6 animate-fade-in">
              {/* Load Metrics Row */}
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200/60 flex flex-col space-y-3.5">
                <span className="text-xs font-bold font-mono tracking-wider uppercase text-slate-400 block">Record Volume Progress</span>
                <div className="flex justify-between items-center text-sm">
                  <span className="font-mono text-slate-500">Processed Count</span>
                  <span className="font-mono font-bold text-slate-800">
                    {object.records_loaded.toLocaleString()} <span className="text-slate-400 text-xs">/ {object.records_to_load.toLocaleString()} items</span>
                  </span>
                </div>
                {/* Beautiful simplified progress bar */}
                <div className="w-full">
                  <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#15803d] rounded-full transition-all duration-500"
                      style={{ width: `${loadPercentage}%` }}
                    ></div>
                  </div>
                  <div className="mt-1.5 text-right text-[11px] font-mono font-bold text-[#15803d]">
                    {loadPercentage}% Loaded Complete
                  </div>
                </div>
              </div>

              {/* Dependency Block */}
              <div>
                <h5 className="text-[10px] font-bold font-mono uppercase tracking-wider text-[#15803d] flex items-center space-x-1.5">
                  <Key className="w-3.5 h-3.5" />
                  <span>Object Dependency Schema</span>
                </h5>
                <div className="mt-2.5 text-xs">
                  {object.dependency && object.dependency !== "None" ? (
                    <p className="font-mono text-slate-700 bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg inline-flex items-center space-x-2">
                       <span>Prerequisite:</span>
                      <ArrowRight className="w-3 h-3 text-[#15803d]" />
                      <span className="font-bold text-[#15803d]">{object.dependency}</span>
                    </p>
                  ) : (
                    <p className="text-slate-500 italic">No hard dependency recorded for this specific load module.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Personnel & Comments */}
          {activeTab === "personnel" && (
            <div className="space-y-6">
              
          {/* Personnel List */}
          <div className="space-y-3 p-4 bg-slate-50/50 border border-slate-200 rounded-xl">
            <h5 className="text-[10px] font-bold font-[#15803d] uppercase tracking-wider text-[#15803d] flex items-center space-x-1.5 mb-2">
              <Users className="w-4 h-4" />
              <span>Assigned Task Responsibilities</span>
            </h5>
                
                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between items-center py-1.5 border-b border-slate-200/60">
                    <span className="text-slate-400 text-xs font-medium">Loading Specialist</span>
                    <span className="font-semibold text-slate-800">{object.data_load_responsible || "TBD"}</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-slate-200/60">
                    <span className="text-slate-400 text-xs font-medium">Functional Owner</span>
                    <span className="font-semibold text-slate-800">{object.functional_responsible || "TBD"}</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5">
                    <span className="text-slate-400 text-xs font-medium">COE Representative</span>
                    <span className="font-semibold text-slate-800">{object.coe_responsible || "TBD"}</span>
                  </div>
                </div>
              </div>

              {/* Notes Context */}
              <div>
                <h5 className="text-[10px] font-bold font-mono uppercase tracking-wider text-[#15803d] flex items-center space-x-1.5 mb-2">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Comments & Logistics Comments Log</span>
                </h5>
                <div className="text-xs p-3.5 rounded-lg bg-slate-50 text-slate-650 text-slate-600 border border-slate-200 font-sans leading-relaxed">
                  {object.comment ? object.comment : <span className="text-slate-400 italic">No logs, constraints, or custom commentary comments flagged.</span>}
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Modal action bar footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center shrink-0">
          <span className="text-[10px] text-slate-400 font-mono">
            Cycle sync: 2026-06-07
          </span>

          <div className="flex space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-semibold text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-lg outline-none active:scale-95 transition-all shadow-sm"
              id="detail-close-btn"
            >
              Close
            </button>
            <button
              onClick={() => {
                onClose();
                onEditClick(object);
              }}
              className="flex items-center space-x-1.5 px-4 py-1.5 text-xs font-semibold bg-[#15803d] hover:bg-[#166534] text-white rounded-lg outline-none active:scale-95 transition-all shadow-sm"
              id="detail-edit-shortcut-btn"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Modify Parameter Options</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
