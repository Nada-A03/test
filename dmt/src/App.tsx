/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { MigrationObject, DashboardStats } from "./types";
import { Header } from "./components/Header";
import { DashboardOverview } from "./components/DashboardOverview";
import { ObjectTable } from "./components/ObjectTable";
import { ObjectDetailModal } from "./components/ObjectDetailModal";
import { ObjectFormModal } from "./components/ObjectFormModal";
import { ImportPreviewModal } from "./components/ImportPreviewModal";
import { Database, AlertTriangle, CheckCircle, RefreshCw, Layers } from "lucide-react";

export default function App() {
  // Database States
  const [objects, setObjects] = useState<MigrationObject[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    total_objects: 0,
    completed_objects: 0,
    wip_objects: 0,
    open_objects: 0,
    total_records_to_load: 0,
    total_records_loaded: 0,
    total_errors: 0,
    load_completion_pct: 0,
    error_rate_pct: 0,
    average_progress: 0,
  });

  // UI Control States
  const [selectedObject, setSelectedObject] = useState<MigrationObject | null>(null);
  const [editObject, setEditObject] = useState<MigrationObject | null>(null);
  const [showCreateObject, setShowCreateObject] = useState(false);
  const [showImportSpreadsheet, setShowImportSpreadsheet] = useState(false);

  // Spinner & Toasts
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error" | "info"; message: string } | null>(null);

  // Fetch all objects and statistics from server-side API
  const loadData = async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      // Parallel fetch
      const [objectsRes, statsRes] = await Promise.all([
        fetch("/api/objects"),
        fetch("/api/dashboard")
      ]);

      if (!objectsRes.ok || !statsRes.ok) {
        throw new Error("Failed to connect to the backend server.");
      }

      const objectsData = await objectsRes.json();
      const statsData = await statsRes.json();

      setObjects(objectsData);
      setStats(statsData);
    } catch (err: any) {
      showNotification("error", err.message || "An error occurred while communicating with DMT database.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Run on mount
  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadData(true);
    showNotification("info", "Syncing database data cycle...");
  };

  // Helper notification trigger
  const showNotification = (type: "success" | "error" | "info", message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  // 1. Create Object
  const handleCreateObject = async (payload: Partial<MigrationObject>) => {
    try {
      const res = await fetch("/api/objects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Could not register object in backend database");

      showNotification("success", "Migration object successfully active");
      setShowCreateObject(false);
      loadData(false);
    } catch (err: any) {
      showNotification("error", err.message || "Could not insert object.");
    }
  };

  // 2. Update Object
  const handleUpdateObject = async (payload: Partial<MigrationObject>) => {
    if (!editObject) return;
    try {
      const res = await fetch(`/api/objects/${editObject.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Could not update object properties");

      showNotification("success", `Object #${editObject.id} parameters successfully synced`);
      setEditObject(null);
      loadData(false);
    } catch (err: any) {
      showNotification("error", err.message || "Could not save properties.");
    }
  };

  // 3. Delete Object
  const handleDeleteObject = async (id: number) => {
    if (!confirm(`Are you sure you want to permanently clear migration object #${id}?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/objects/${id}`, {
        method: "DELETE"
      });

      if (!res.ok) throw new Error("Deletion failed on server side");

      showNotification("success", `Migration object #${id} successfully cleared from records`);
      // Safe close view details drawer if they deleted the opened item
      if (selectedObject?.id === id) {
        setSelectedObject(null);
      }
      loadData(false);
    } catch (err: any) {
      showNotification("error", err.message || "Failed to clear record.");
    }
  };

  // 4. Excel Template Downloader (Generates real CSV layout based on python xlsx expectations)
  const handleDownloadTemplate = () => {
    const headers = [
      "Stream", "Object Type", "Data Object", "Dependency", "Comment / Blocker",
      "Data Load Responsible", "Functional Responsible", "COE Responsible",
      "Success Rate %", "Status", "Overall %\nComplete", "Extract_Progress", "Extract_Date",
      "Preload Approved_Progress", "Preload Approved_Date", "Preload Approved_Reviewed By",
      "Load_Progress", "Load_Date", "Load_Loaded By", "Post Load Review & Sign-off_Progress",
      "Post Load Review & Sign-off_Date", "Post Load Review & Sign-off_Reviewed & Sign-off",
      "Records\nto Load", "Loaded_Records", "Errors_Records"
    ];

    const sampleRow = [
      "Finance", "Master Data", "General Ledger Accounts test", "None", "Mapping of ledger items completed and checked",
      "Sarah Jenkins", "Marcus Vance", "Diana Alvarez", "99", "COMPLETED", "100", "100", "2026-06-01",
      "100", "2026-06-03", "Marcus Vance", "100", "2026-06-05", "Sarah Jenkins", "100", "2026-06-07",
      "Diana Alvarez", "1500", "1490", "10"
    ];

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.map(h => `"${h.replace(/"/g, '""')}"`).join(","), sampleRow.map(r => `"${r.replace(/"/g, '""')}"`).join(",")].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "DMT_Migration_Template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification("info", "Template CSV file downloaded to browser.");
  };

  // 5. Mass import spreadsheets Complete hooks
  const handleImportComplete = (count: number) => {
    setShowImportSpreadsheet(false);
    showNotification("success", `Spreadsheet bulk imported successfully: loaded ${count} records!`);
    loadData(false);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col font-sans selection:bg-[#0080d4]/10 selection:text-slate-900">
      
      {/* Header Panel */}
      <Header
        onAddClick={() => setShowCreateObject(true)}
        onImportClick={() => setShowImportSpreadsheet(true)}
        onDownloadTemplate={handleDownloadTemplate}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />

      {/* Main Core Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Toast Notifier */}
        {notification && (
          <div className="fixed top-20 right-6 z-50 flex items-center space-x-3 p-4 rounded-xl border shadow-lg bg-white animate-in slide-in-from-right-10 duration-200 border-slate-200">
            <div className={`p-1.5 rounded-lg ${notification.type === "success" ? "bg-emerald-50 text-emerald-600" : notification.type === "error" ? "bg-rose-50 text-rose-600" : "bg-green-50 text-emerald-600"}`}>
              {notification.type === "success" ? (
                <CheckCircle className="w-4.5 h-4.5" />
              ) : (
                <AlertTriangle className="w-4.5 h-4.5" />
              )}
            </div>
            <p className="text-xs font-bold text-slate-700 pr-2">{notification.message}</p>
          </div>
        )}

        {isLoading ? (
          /* High-end loading animation */
          <div className="flex flex-col items-center justify-center py-28 space-y-4">
            <div className="relative w-14 h-14 flex items-center justify-center">
              {/* Spinning Ring using specified corporate colors */}
              <div className="absolute inset-0 rounded-full border-4 border-slate-100"></div>
              <div className="absolute inset-0 rounded-full border-4 border-t-[#15803d] border-r-[#DD4268] border-b-[#16a34a] animate-spin"></div>
              <Layers className="w-5 h-5 text-slate-400" />
            </div>
            <p className="text-xs font-mono font-bold uppercase tracking-widest text-[#15803d] animate-pulse">
              Syncing DMT parameters...
            </p>
          </div>
        ) : (
          <>
            {/* Visual Analytics section */}
            <DashboardOverview stats={stats} objects={objects} />

            {/* Master Grid Title */}
            <div className="border-t border-slate-200 pt-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4">
                <div>
                  <h3 className="text-lg font-black text-[#00468f] tracking-tight">Migration Data Grid</h3>
                  <p className="text-xs text-slate-500 mt-1">Filter, search, and click parameters rows to examine multi-phase progression cycles</p>
                </div>
              </div>

              {/* Collaborative spreadsheet-like Table */}
              <ObjectTable
                objects={objects}
                onEditClick={(obj) => setEditObject(obj)}
                onDeleteClick={handleDeleteObject}
                setSelectedObject={(obj) => setSelectedObject(obj)}
              />
            </div>
          </>
        )}
      </main>

      {/* Modal: View parameters detail */}
      {selectedObject && (
        <ObjectDetailModal
          object={selectedObject}
          onClose={() => setSelectedObject(null)}
          onEditClick={(obj) => setEditObject(obj)}
        />
      )}

      {/* Modal: Initialize New Object */}
      {showCreateObject && (
        <ObjectFormModal
          object={null}
          onClose={() => setShowCreateObject(false)}
          onSave={handleCreateObject}
        />
      )}

      {/* Modal: Modify Parameter Set */}
      {editObject && (
        <ObjectFormModal
          object={editObject}
          onClose={() => setEditObject(null)}
          onSave={handleUpdateObject}
        />
      )}

      {/* Modal: Spreadsheet Mass Importer */}
      {showImportSpreadsheet && (
        <ImportPreviewModal
          onClose={() => setShowImportSpreadsheet(false)}
          onImportComplete={handleImportComplete}
        />
      )}

      {/* Outer subtle decoration footer */}
      <footer className="py-6 border-t border-slate-200 bg-white text-center text-[10px] font-mono text-slate-400">
        <p>© 2026 DMT - Data Migration Tracker. Built with React & Tailwind CSS.</p>
      </footer>
    </div>
  );
}
