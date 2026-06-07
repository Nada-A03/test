/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { DashboardStats, MigrationObject } from "../types";
import { CheckCircle, AlertOctagon, TrendingUp, Layers } from "lucide-react";

interface DashboardOverviewProps {
  stats: DashboardStats;
  objects: MigrationObject[];
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({ stats }) => {
  return (
    <div className="space-y-6">
      {/* KPI Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total Objects */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm relative overflow-hidden group">
          <div className="absolute right-0 top-0 h-24 w-24 bg-slate-50 rounded-bl-full pointer-events-none transition-all group-hover:scale-110"></div>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Total Objects</p>
              <h3 className="text-3.5xl font-black text-[#15803d] mt-1.5 tracking-tight">
                {stats.total_objects}
              </h3>
            </div>
            <div className="p-2.5 bg-slate-50 border border-slate-100 text-[#15803d] rounded-lg">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 text-[10px]" style={{ color: "#62748e", fontFamily: "Arial" }}>
            Migration Registry Entries
          </div>
        </div>

        {/* Card 2: Average Progress */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm relative overflow-hidden group">
          <div className="absolute right-0 top-0 h-24 w-24 bg-slate-50 rounded-bl-full pointer-events-none transition-all group-hover:scale-110"></div>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Avg. Progress</p>
              <h3 className="text-3.5xl font-black text-[#15803d] mt-1.5 tracking-tight">
                {stats.average_progress}%
              </h3>
            </div>
            <div className="p-2.5 bg-slate-50 border border-slate-100 text-[#15803d] rounded-lg">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          {/* Progress gauge visual */}
          <div className="mt-4">
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-700 bg-[#15803d]" 
                style={{ width: `${stats.average_progress}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Card 3: Items Loaded */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm relative overflow-hidden group">
          <div className="absolute right-0 top-0 h-24 w-24 bg-slate-50 rounded-bl-full pointer-events-none transition-all group-hover:scale-110"></div>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Records Loaded</p>
              <h3 className="text-3.5xl font-black text-[#15803d] mt-1.5 tracking-tight">
                {stats.total_records_loaded.toLocaleString()}
              </h3>
            </div>
            <div className="p-2.5 bg-slate-50 border border-slate-100 text-[#15803d] rounded-lg">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3.5 flex flex-col space-y-1">
            <div className="flex justify-between text-[11px] text-slate-500 font-medium">
              <span style={{ fontFamily: "Arial" }}>Target Count: {stats.total_records_to_load.toLocaleString()} items</span>
              <span className="font-bold text-[#15803d]">({stats.load_completion_pct}%)</span>
            </div>
          </div>
        </div>

        {/* Card 4: Load Audit & Errors */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm relative overflow-hidden group">
          <div className="absolute right-0 top-0 h-24 w-24 bg-slate-50 rounded-bl-full pointer-events-none transition-all group-hover:scale-110"></div>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Total Errors</p>
              <h3 className={`text-3.5xl font-black mt-1.5 tracking-tight ${stats.total_errors > 0 ? "text-red-600" : "text-slate-700"}`}>
                {stats.total_errors.toLocaleString()}
              </h3>
            </div>
            <div className={`p-2.5 border rounded-lg ${stats.total_errors > 0 ? "bg-red-50 border-red-100 text-red-500" : "bg-slate-50 border-slate-100 text-slate-400"}`}>
              <AlertOctagon className="w-5 h-5" />
            </div>
          </div>
          <p className="mt-3.5 text-[11px] font-medium" style={{ color: "#62748e", fontFamily: "Arial" }}>
            {stats.error_rate_pct}% Global Error Rate
          </p>
        </div>
      </div>
    </div>
  );
};
