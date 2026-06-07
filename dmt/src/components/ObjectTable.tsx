/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { MigrationObject } from "../types";
import { 
  Search, SlidersHorizontal, AlertCircle, CheckCircle2, 
  HelpCircle, ArrowUpDown, Edit2, Trash2, Eye, Play
} from "lucide-react";

interface ObjectTableProps {
  objects: MigrationObject[];
  onEditClick: (obj: MigrationObject) => void;
  onDeleteClick: (id: number) => void;
  setSelectedObject: (obj: MigrationObject) => void;
}

export const ObjectTable: React.FC<ObjectTableProps> = ({
  objects,
  onEditClick,
  onDeleteClick,
  setSelectedObject,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [sortBy, setSortBy] = useState<"data_object" | "progress" | "records" | "errors">("data_object");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Extract unique statuses for filters
  const statuses = useMemo(() => {
    return ["ALL", ...Array.from(new Set(objects.map(o => o.status))).filter(Boolean)];
  }, [objects]);

  // Sort and Filter logic
  const filteredAndSortedObjects = useMemo(() => {
    let result = [...objects];

    // Search filter
    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        o => 
          o.data_object.toLowerCase().includes(term) ||
          o.comment.toLowerCase().includes(term) ||
          o.dependency.toLowerCase().includes(term) ||
          o.data_load_responsible.toLowerCase().includes(term) ||
          o.functional_responsible.toLowerCase().includes(term)
      );
    }

    // Status filter
    if (selectedStatus !== "ALL") {
      result = result.filter(o => o.status === selectedStatus);
    }

    // Sorting
    result.sort((a, b) => {
      let comparison = 0;
      if (sortBy === "data_object") {
        comparison = (a.data_object || "").localeCompare(b.data_object || "");
      } else if (sortBy === "progress") {
        comparison = (a.overall_progress ?? 0) - (b.overall_progress ?? 0);
      } else if (sortBy === "records") {
        comparison = (a.records_to_load ?? 0) - (b.records_to_load ?? 0);
      } else if (sortBy === "errors") {
        comparison = (a.errors ?? 0) - (b.errors ?? 0);
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

    return result;
  }, [objects, searchTerm, selectedStatus, sortBy, sortOrder]);

  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const getStatusTextClass = (status: string, progress: number) => {
    const s = (status || "").toUpperCase();
    if (s === "COMPLETED" || progress === 100) {
      return "text-emerald-600 font-bold";
    } else if (s === "BLOCKED") {
      return "text-slate-500 font-bold";
    } else if (s === "NOT STARTED" || s === "NOT_STARTED" || progress === 0) {
      return "text-slate-400 font-medium";
    } else {
      return "text-blue-600 font-bold";
    }
  };

  const getStatusIcon = (status: string, progress: number) => {
    const s = (status || "").toUpperCase();
    if (s === "COMPLETED" || progress === 100) {
      return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />;
    } else if (s === "BLOCKED") {
      return <AlertCircle className="w-3.5 h-3.5 text-slate-500" />;
    } else if (s === "NOT STARTED" || s === "NOT_STARTED" || progress === 0) {
      return <AlertCircle className="w-3.5 h-3.5 text-slate-400" />;
    } else {
      return <Play className="w-3.5 h-3.5 text-blue-600 fill-blue-500/10" />;
    }
  };

  // Progress coloring helpers
  const getProgressColorClass = (pct: number) => {
    if (pct === 0) return "text-slate-400";
    return "text-[#15803d] font-extrabold";
  };

  const getProgressBarBgClass = (pct: number) => {
    if (pct === 0) return "bg-slate-200";
    return "bg-[#15803d]";
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      {/* Filtering Control Bar */}
      <div className="p-4 bg-slate-50/50 border-b border-slate-200 flex flex-col md:flex-row space-y-3.5 md:space-y-0 md:space-x-3.5 items-center justify-between">
        
        {/* Search Field */}
        <div className="relative w-full md:w-80">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </span>
          <input
            type="text"
            className="w-full pl-9 pr-4 py-1.8 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 placeholder-slate-450 hover:border-slate-300 focus:border-[#16a34a] focus:outline-none transition-all font-sans"
            placeholder="Search data object, responsibles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            id="table-search-input"
          />
        </div>

        {/* Category Dropdowns */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Status Selector */}
          <div className="flex items-center space-x-1.5">
            <span className="text-[10px] font-bold font-mono tracking-wider text-slate-400 uppercase">Status:</span>
            <select
              className="px-2.5 py-1.5 bg-white border border-slate-200 text-slate-600 text-xs rounded-lg hover:border-slate-300 focus:outline-none focus:border-[#16a34a] cursor-pointer"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              id="status-filter-select"
            >
              {statuses.map(st => (
                <option key={st} value={st}>{st === "ALL" ? "ALL" : st}</option>
              ))}
            </select>
          </div>

          {/* Sorter indicator info */}
          <span className="ml-auto md:ml-0 text-[10px] font-mono text-slate-400">
            Showing {filteredAndSortedObjects.length} of {objects.length} records
          </span>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white border-b border-slate-200 text-[11px] font-bold tracking-wider text-slate-400 font-mono select-none">
              <th 
                onClick={() => handleSort("data_object")}
                className="py-3.5 px-4 cursor-pointer hover:bg-slate-50 hover:text-slate-705 transition-colors"
              >
                <div className="flex items-center space-x-1">
                  <span>MIGRATION DATA OBJECT & COMMENTS</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-350" />
                </div>
              </th>
              <th className="py-3.5 px-4 text-slate-400">RESPONSIBLES</th>
              <th className="py-3.5 px-4 text-slate-400">DEPENDENCY</th>
              <th 
                onClick={() => handleSort("progress")}
                className="py-3.5 px-4 cursor-pointer hover:bg-slate-50 hover:text-slate-705 transition-colors text-center"
              >
                <div className="flex items-center justify-center space-x-1">
                  <span>STAGE PROGRESS</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-350" />
                </div>
              </th>
              <th 
                onClick={() => handleSort("records")}
                className="py-3.5 px-4 cursor-pointer hover:bg-slate-50 hover:text-slate-705 transition-colors"
                title="Records fully processed vs requested count"
              >
                <div className="flex items-center space-x-1 justify-end">
                  <span>RECORD PROGRESS (VOLUME)</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-350" />
                </div>
              </th>
              <th className="py-3.5 px-4 text-center text-slate-400">STATUS</th>
              <th className="py-3.5 px-4 text-right text-slate-400">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-600 bg-white">
            {filteredAndSortedObjects.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-sm text-slate-400 font-sans">
                  <SlidersHorizontal className="w-8 h-8 mx-auto text-slate-300 mb-2.5" />
                  No migration objects match the selected qualifiers.
                </td>
              </tr>
            ) : (
              filteredAndSortedObjects.map((obj) => {
                const totalRecs = obj.records_to_load || 0;
                const loadedRecs = obj.records_loaded || 0;
                const loadPct = totalRecs > 0 ? Math.round((loadedRecs / totalRecs) * 100) : 0;
                
                return (
                  <tr 
                    key={obj.id} 
                    className="hover:bg-slate-50/50 transition-colors group cursor-pointer"
                    onClick={() => setSelectedObject(obj)}
                  >
                    {/* Migration Object Name & Description */}
                    <td className="py-3.5 px-4 max-w-sm">
                      <div className="font-extrabold text-[#00468f] text-xs transition-colors font-sans leading-snug group-hover:underline">
                        {obj.data_object}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5 truncate font-sans font-medium" title={obj.comment}>
                        {obj.comment || <span className="text-slate-300 font-normal italic">No logs or comments</span>}
                      </div>
                      <span className="inline-block text-[9px] font-mono font-bold text-slate-400 mt-1 uppercase tracking-wider bg-slate-50 border border-slate-100 px-1.5 py-0.2 rounded">
                        {obj.object_type}
                      </span>
                    </td>

                    {/* Responsibles list */}
                    <td className="py-3.5 px-4 text-xs font-sans">
                      <div className="flex flex-col space-y-0.5 text-slate-500">
                        <div className="flex items-center space-x-1.5" title="Execution Responsible / Loader">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                          <span className="font-semibold text-[10.5px] text-slate-700">{obj.data_load_responsible || "TBD"}</span>
                        </div>
                        <div className="flex items-center space-x-1.5 text-slate-400" title="Business Functional Sign-off Lead">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                          <span className="text-[10px]">{obj.functional_responsible || "TBD"}</span>
                        </div>
                      </div>
                    </td>

                    {/* Dependency */}
                    <td className="py-3.5 px-4 text-xs font-mono text-slate-600">
                      {obj.dependency && obj.dependency !== "None" ? (
                        <span>{obj.dependency}</span>
                      ) : (
                        <span className="text-slate-400 italic">None</span>
                      )}
                    </td>

                    {/* Flow Overall Completion Bar */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex flex-col items-center justify-center w-28 mx-auto">
                        <span className={`text-xs font-mono font-bold ${getProgressColorClass(obj.overall_progress)}`}>
                          {obj.overall_progress}%
                        </span>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mt-1 inline-block">
                          <div 
                            className="h-full bg-[#15803d] rounded-full transition-all duration-500" 
                            style={{ width: `${obj.overall_progress}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>

                    {/* Numeric Records Statistics */}
                    <td className="py-3.5 px-4 font-mono text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="text-xs text-slate-700">
                        <span className="text-slate-800 font-bold">{obj.records_loaded.toLocaleString()}</span>
                        <span className="text-slate-400"> / {obj.records_to_load.toLocaleString()}</span>
                      </div>
                      
                      {/* Standard tiny bar */}
                      <div className="h-1 w-24 bg-slate-100 rounded-full overflow-hidden ml-auto mt-1 flex justify-end">
                        <div 
                          className={`h-full rounded-full transition-all ${getProgressBarBgClass(loadPct)}`} 
                          style={{ width: `${loadPct}%` }}
                        ></div>
                      </div>

                      {/* Error highlights - colored high contrast deep red */}
                      {obj.errors > 0 ? (
                        <span className="inline-flex items-center text-[10px] text-slate-705 bg-slate-50 border border-slate-200 px-1 rounded font-bold font-mono mt-1 select-none">
                          ⚠️ {obj.errors.toLocaleString()} Errs
                        </span>
                      ) : (
                        <span className="text-[9px] text-slate-400 font-medium select-none">Clean load quality</span>
                      )}
                    </td>

                    {/* Status Label (No border/box) */}
                    <td className="py-3.5 px-4 text-center select-none" onClick={(e) => e.stopPropagation()}>
                      <span className={`inline-flex items-center space-x-1.5 text-xs font-bold font-mono ${getStatusTextClass(obj.status, obj.overall_progress)}`}>
                        {getStatusIcon(obj.status, obj.overall_progress)}
                        <span>{(obj.status || "UNKNOWN").toUpperCase()}</span>
                      </span>
                    </td>

                    {/* Action buttons list */}
                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end space-x-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setSelectedObject(obj)}
                          className="p-1.5 bg-white border border-slate-200 hover:border-[#16a34a] text-slate-500 hover:text-[#16a34a] rounded shadow-sm hover:bg-slate-50 transition-colors"
                          title="View detail timelines"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#16a34a]" />
                        </button>
                        <button
                          onClick={() => onEditClick(obj)}
                          className="p-1.5 bg-white border border-slate-200 hover:border-slate-400 text-slate-500 hover:text-slate-800 rounded shadow-sm hover:bg-slate-50 transition-colors"
                          title="Edit migration state"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-slate-600" />
                        </button>
                        <button
                          onClick={() => onDeleteClick(obj.id)}
                          className="p-1.5 bg-white border border-slate-200 hover:border-[#DD4268] hover:bg-rose-50 text-slate-405 hover:text-[#DD4268] rounded shadow-sm transition-colors"
                          title="Delete migration object"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
