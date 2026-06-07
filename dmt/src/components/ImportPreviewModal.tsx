/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from "react";
import * as XLSX from "xlsx";
import { X, Upload, CheckCircle2, AlertTriangle, FileSpreadsheet } from "lucide-react";

interface ImportPreviewModalProps {
  onClose: () => void;
  onImportComplete: (count: number) => void;
}

export const ImportPreviewModal: React.FC<ImportPreviewModalProps> = ({
  onClose,
  onImportComplete,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [errorsList, setErrorsList] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Drag states
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Convert Excel Sheet Row to our expected internal Schema
  const mapExcelRowToSchema = (row: any) => {
    // Standard normalizer for nested/complex header keys from Excel
    const getValue = (keys: string[]): string => {
      for (const k of keys) {
        if (row[k] !== undefined && row[k] !== null && row[k] !== "") {
          return String(row[k]).trim();
        }
      }
      return "";
    };

    const getNumber = (keys: string[]): number => {
      const val = getValue(keys);
      if (!val) return 0;
      const num = parseFloat(val);
      return isNaN(num) ? 0 : num;
    };

    // Extract core fields based on the python backend keys mapping
    const data_object = getValue(["Data Object", "data_object", "Data_Object", "Object Name"]);
    const stream = getValue(["Stream", "stream", "Stream Name"]);
    const object_type = getValue(["Object Type", "object_type", "Object_Type", "Category"]);
    const dependency = getValue(["Dependency", "dependency", "Dependency Object"]);
    const comment = getValue(["Comment / Blocker", "Comment / Blocker_Records", "comment", "Comment", "Blocker", "Comment / Blocker_Progress"]);
    const data_load_responsible = getValue(["Data Load Responsible", "data_load_responsible", "Data_Load_Responsible"]);
    const functional_responsible = getValue(["Functional Responsible", "functional_responsible", "Functional_Responsible"]);
    const coe_responsible = getValue(["COE Responsible", "coe_responsible", "COE_Responsible"]);

    const success_rate = getNumber(["Success Rate %", "success_rate", "Success_Rate_Pct", "Success Rate"]);
    const status = getValue(["Status", "status", "Load Status"]);
    
    // Percent complete key map
    const overall_progress = getNumber([
      "Overall %\nComplete", 
      "Overall Complete %", 
      "Overall % Complete",
      "overall_progress", 
      "Overall Progress %",
      "Overall_Progress"
    ]);

    const extract_progress = getNumber(["Extract_Progress", "Extract Progress %", "extract_progress"]);
    const extract_date = getValue(["Extract_Date", "Extract Date", "extract_date"]);

    const preload_progress = getNumber(["Preload Approved_Progress", "Preload Approved Progress", "Preload_Progress", "preload_progress"]);
    const preload_date = getValue(["Preload Approved_Date", "Preload Approved Date", "preload_date"]);
    const preload_reviewed_by = getValue(["Preload Approved_Reviewed By", "Preload Approved Reviewed By", "preload_reviewed_by"]);

    const load_progress = getNumber(["Load_Progress", "Load Progress %", "load_progress"]);
    const load_date = getValue(["Load_Date", "Load Date", "load_date"]);
    const loaded_by = getValue(["Load_Loaded By", "Load Loaded By", "loaded_by"]);

    const postload_progress = getNumber(["Post Load Review & Sign-off_Progress", "Post Load Progress", "post_load_progress", "postload_progress"]);
    const postload_date = getValue(["Post Load Review & Sign-off_Date", "Post Load Date", "postload_date"]);
    const postload_reviewed_by = getValue(["Post Load Review & Sign-off_Reviewed & Sign-off", "Post Load Reviewed", "postload_reviewed_by"]);

    const records_to_load = getNumber(["Records\nto Load", "Records to Load", "records_to_load", "Total Records"]);
    const records_loaded = getNumber(["Loaded_Records", "Loaded Records", "records_loaded"]);
    const errors = getNumber(["Errors_Records", "Errors Records", "errors_count", "errors", "Errors"]);

    return {
      stream: stream || "Finance",
      object_type: objectTypeNormalizer(object_type),
      data_object,
      dependency: dependency || "None",
      comment,
      data_load_responsible,
      functional_responsible,
      coe_responsible,
      success_rate,
      status: status || "NOT STARTED",
      overall_progress,
      extract_progress,
      extract_date,
      preload_progress,
      preload_date,
      preload_reviewed_by,
      load_progress,
      load_date,
      loaded_by,
      postload_progress,
      postload_date,
      postload_reviewed_by,
      records_to_load,
      records_loaded,
      errors
    };
  };

  const objectTypeNormalizer = (val: string) => {
    if (!val) return "Master Data";
    const v = val.toLowerCase();
    if (v.includes("trans")) return "Transactional";
    if (v.includes("config")) return "Configuration";
    if (v.includes("meta")) return "Metadata";
    return "Master Data";
  };

  const processFile = (file: File) => {
    setIsValidating(true);
    setErrorsList([]);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) throw new Error("No data readable from the selected file");

        const workbook = XLSX.read(data, { type: "binary", cellDates: true });
        
        // Find sheet: default to user's sheet "Migration Tracker - TN - SIT1" OR first sheet
        let sheetName = "";
        if (workbook.SheetNames.includes("Migration Tracker - TN - SIT1")) {
          sheetName = "Migration Tracker - TN - SIT1";
        } else {
          sheetName = workbook.SheetNames[0];
        }

        const sheet = workbook.Sheets[sheetName];
        
        // SheetJS conversion
        const rawJsonList: any[] = XLSX.utils.sheet_to_json(sheet, { defval: "" });

        if (rawJsonList.length === 0) {
          throw new Error(`The spreadsheet sheet "${sheetName}" is currently empty.`);
        }

        // Map and validate rows
        const formattedRows: any[] = [];
        const logs: string[] = [];
        
        for (let i = 0; i < rawJsonList.length; i++) {
          const rowItem = rawJsonList[i];
          const mapped = mapExcelRowToSchema(rowItem);
          
          if (!mapped.data_object) {
            logs.push(`Row ${i + 1}: Skipped (Missing 'Data Object' name parameter)`);
            continue;
          }

          formattedRows.push(mapped);
        }

        setParsedRows(formattedRows);
        setErrorsList(logs);
      } catch (err: any) {
        setErrorsList([`Failed spreadsheet parsing: ${err.message || "Unknown error"}`]);
      } finally {
        setIsValidating(false);
      }
    };

    reader.onerror = () => {
      setErrorsList(["Error during raw file upload streaming"]);
      setIsValidating(false);
    };

    reader.readAsBinaryString(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  // Submit parsed items to the server-side API
  const handleCommitImport = async () => {
    if (parsedRows.length === 0) return;

    setIsValidating(true);
    try {
      const response = await fetch("/api/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsedRows),
      });

      if (!response.ok) {
        throw new Error("API responded with an error during mass commit");
      }

      const result = await response.json();
      onImportComplete(result.imported || parsedRows.length);
    } catch (err: any) {
      alert(`Import error: ${err.message || "Failed to transmit spreadsheet details"}`);
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/40 backdrop-blur-sm flex justify-center items-center p-4">
      <div 
        className="w-full max-w-2xl bg-white border border-slate-205 rounded-2xl shadow-2xl relative overflow-hidden text-slate-800 animate-in fade-in duration-150"
        id="import-preview-drawer"
      >
        {/* Accent strip */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#DD4268] via-[#16a34a] to-[#15803d]"></div>

        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center mt-1">
          <div>
            <h2 className="text-lg font-extrabold text-[#15803d] tracking-tight">
              Data Migration CSV / Excel Importer
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Supports Excel sheets containing streams and corresponding progression indexes
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-405 hover:text-slate-800 transition-all outline-none"
            id="close-import-modal-btn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto text-xs font-sans">
          
          {parsedRows.length === 0 ? (
            /* Zone empty drag - drop */
            <div 
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${dragActive ? "border-[#16a34a] bg-[#16a34a]/5 text-[#15803d]" : "border-slate-200 hover:border-slate-350 text-slate-500 hover:bg-slate-50/50"}`}
              id="drag-drop-upload-zone"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls, .csv"
                className="hidden"
                onChange={handleFileChange}
              />
              <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-[#16a34a] border border-slate-200 mb-3.5">
                <Upload className="w-6 h-6 text-[#16a34a]" />
              </div>
              <p className="text-slate-700 font-bold leading-normal">
                Drag & drop your excel template here, or <span className="text-[#16a34a] hover:underline">browse files</span>
              </p>
              <p className="text-[10px] text-slate-400 mt-2 font-mono">
                Formats: Microsoft Excel (.xlsx, .xls) or raw Comma Separated Val (.csv)
              </p>

              {/* Guide columns matching python */}
              <div className="mt-6 border-t border-slate-200 pt-4.5 text-left text-slate-500 text-[10.5px]">
                <span className="font-bold font-mono tracking-wider text-slate-400 block mb-2 uppercase">Supported Columns Mapping:</span>
                <p className="leading-relaxed">
                  Excel sheets containing headers like <span className="text-[#00468f] bg-slate-50 border border-slate-200 px-1.5 rounded font-bold font-mono">Stream</span>,{" "}
                  <span className="text-[#00468f] bg-slate-50 border border-slate-200 px-1.5 rounded font-bold font-mono font-mono">Data Object</span>,{" "}
                  <span className="text-[#00468f] bg-slate-50 border border-slate-200 px-1.5 rounded font-bold font-mono">Status</span>, {" "}
                  <span className="text-[#00468f] bg-slate-50 border border-slate-200 px-1.5 rounded font-bold font-mono">records_to_load</span>, and progression percent parameters.
                </p>
              </div>
            </div>
          ) : (
            /* Parsed rows preview */
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3.5 bg-emerald-50 border border-emerald-250 border-emerald-200 rounded-xl text-emerald-800">
                <div className="flex items-center space-x-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <div>
                    <span className="font-bold block text-slate-800 text-[12px]">Spreadsheet successfully parsed!</span>
                    <span className="text-[10px] block mt-0.2 text-emerald-600 font-medium">{parsedRows.length} migration objects ready to bulk commit.</span>
                  </div>
                </div>
                <button
                  onClick={() => setParsedRows([])}
                  className="px-2.5 py-1 bg-white border border-slate-200 text-slate-600 rounded font-bold hover:bg-slate-50 hover:text-slate-800 transition-all text-[11px] shadow-sm"
                >
                  Change File
                </button>
              </div>

              {/* Logs warnings */}
              {errorsList.length > 0 && (
                <div className="p-3 bg-amber-50 border border-amber-200 text-amber-850 text-amber-800 rounded-xl max-h-24 overflow-y-auto font-mono text-[10px]">
                  <div className="flex items-center space-x-1.5 font-bold mb-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Parsed file exceptions:</span>
                  </div>
                  <ul className="list-disc pl-4 space-y-0.5">
                    {errorsList.slice(0, 10).map((err, id) => (
                      <li key={id}>{err}</li>
                    ))}
                    {errorsList.length > 10 && <li>...and {errorsList.length - 10} other minor entries</li>}
                  </ul>
                </div>
              )}

              {/* Mini Table preview */}
              <div className="border border-slate-200 rounded-lg overflow-hidden max-h-48 overflow-y-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-[10px] font-mono font-bold text-slate-400 border-b border-slate-200 select-none">
                    <tr>
                      <th className="p-2">Stream</th>
                      <th className="p-2">Objects</th>
                      <th className="p-2 select-none">Status</th>
                      <th className="p-2 text-right">Progress</th>
                      <th className="p-2 text-right">Volumetry</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150 bg-white text-[11px] font-sans text-slate-600">
                    {parsedRows.slice(0, 15).map((row, index) => (
                      <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-2 font-mono text-[10.5px]">
                          <span className="bg-slate-50 px-1.5 py-0.2 border border-slate-200 rounded text-[#16a34a] font-bold uppercase">{row.stream}</span>
                        </td>
                        <td className="p-2 font-bold text-[#00468f]">{row.data_object}</td>
                        <td className="p-2 uppercase font-mono text-[9px] font-semibold">{row.status}</td>
                        <td className="p-2 text-right font-mono font-bold text-slate-700">{row.overall_progress}%</td>
                        <td className="p-2 text-right font-mono text-slate-400">{row.records_loaded.toLocaleString()} / {row.records_to_load.toLocaleString()}</td>
                      </tr>
                    ))}
                    {parsedRows.length > 15 && (
                      <tr className="bg-slate-50 text-center text-[10px]">
                        <td colSpan={5} className="p-2 text-slate-4s00 font-mono text-slate-400 border-t border-slate-200">
                          + {parsedRows.length - 15} additional objects listed inside the workbook...
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

        {/* Modal actions footer */}
        <div className="p-4 bg-slate-50/60 border-t border-slate-200 flex justify-between items-center">
          <span className="text-[10px] text-slate-400 font-mono">
            Requires active database mapping approvals.
          </span>

          <div className="flex space-x-2">
            <button
              onClick={onClose}
              className="px-4.5 py-1.8 text-xs font-semibold text-slate-500 hover:text-slate-800 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-lg transition-all active:scale-95 outline-none font-semibold shadow-sm"
              id="import-cancel-btn"
            >
              Cancel
            </button>
            <button
              onClick={handleCommitImport}
              disabled={parsedRows.length === 0 || isValidating}
              className="flex items-center space-x-1.5 px-6 py-1.8 text-xs font-semibold bg-[#15803d] hover:bg-[#166534] disabled:opacity-50 disabled:pointer-events-none text-white rounded-lg active:scale-95 transition-all outline-none shadow-sm shadow-emerald-100/50"
              id="import-commit-btn"
            >
              {isValidating ? (
                <span>Executing bulk sync...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>Commit {parsedRows.length} Objects</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
