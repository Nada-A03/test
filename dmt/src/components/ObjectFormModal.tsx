/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { MigrationObject } from "../types";
import { X, Save, Sliders, Layout, Users, BarChart, Calculator, CheckCircle } from "lucide-react";

interface ObjectFormModalProps {
  object: MigrationObject | null; // Null means CREATE mode, object means EDIT mode
  onClose: () => void;
  onSave: (data: Partial<MigrationObject>) => void;
}

export const ObjectFormModal: React.FC<ObjectFormModalProps> = ({
  object,
  onClose,
  onSave,
}) => {
  const isEditMode = !!object;

  const [activeTab, setActiveTab] = useState<"general" | "personnel" | "sequence" | "metrics">("general");

  // Form State
  const [stream, setStream] = useState("Global");
  const [objectType, setObjectType] = useState("Master Data");
  const [dataObject, setDataObject] = useState("");
  const [dependency, setDependency] = useState("None");
  const [comment, setComment] = useState("");
  const [dataLoadResponsible, setDataLoadResponsible] = useState("");
  const [functionalResponsible, setFunctionalResponsible] = useState("");
  const [coeResponsible, setCoeResponsible] = useState("");
  const [successRate, setSuccessRate] = useState(0);
  const [status, setStatus] = useState("NOT STARTED");
  const [overallProgress, setOverallProgress] = useState(0);

  // Timelines Sliders
  const [extractProgress, setExtractProgress] = useState(0);
  const [extractDate, setExtractDate] = useState("");
  const [preloadProgress, setPreloadProgress] = useState(0);
  const [preloadDate, setPreloadDate] = useState("");
  const [preloadReviewedBy, setPreloadReviewedBy] = useState("");
  const [loadProgress, setLoadProgress] = useState(0);
  const [loadDate, setLoadDate] = useState("");
  const [loadedBy, setLoadedBy] = useState("");
  const [postloadProgress, setPostloadProgress] = useState(0);
  const [postloadDate, setPostloadDate] = useState("");
  const [postloadReviewedBy, setPostloadReviewedBy] = useState("");

  // Target records volumetrics
  const [recordsToLoad, setRecordsToLoad] = useState(0);
  const [recordsLoaded, setRecordsLoaded] = useState(0);
  const [errors, setErrors] = useState(0);

  // Initialize form state
  useEffect(() => {
    if (object) {
      setStream(object.stream || "Global");
      setObjectType(object.object_type || "Master Data");
      setDataObject(object.data_object || "");
      setDependency(object.dependency || "None");
      setComment(object.comment || "");
      setDataLoadResponsible(object.data_load_responsible || "");
      setFunctionalResponsible(object.functional_responsible || "");
      setCoeResponsible(object.coe_responsible || "");
      setSuccessRate(object.success_rate || 0);
      setStatus(object.status || "NOT STARTED");
      setOverallProgress(object.overall_progress || 0);

      setExtractProgress(object.extract_progress || 0);
      setExtractDate(object.extract_date || "");
      setPreloadProgress(object.preload_progress || 0);
      setPreloadDate(object.preload_date || "");
      setPreloadReviewedBy(object.preload_reviewed_by || "");
      setLoadProgress(object.load_progress || 0);
      setLoadDate(object.load_date || "");
      setLoadedBy(object.loaded_by || "");
      setPostloadProgress(object.postload_progress || 0);
      setPostloadDate(object.postload_date || "");
      setPostloadReviewedBy(object.postload_reviewed_by || "");

      setRecordsToLoad(object.records_to_load || 0);
      setRecordsLoaded(object.records_loaded || 0);
      setErrors(object.errors || 0);
    } else {
      // Clear form
      setStream("Global");
      setObjectType("Master Data");
      setDataObject("");
      setDependency("None");
      setComment("");
      setDataLoadResponsible("");
      setFunctionalResponsible("");
      setCoeResponsible("");
      setSuccessRate(0);
      setStatus("NOT STARTED");
      setOverallProgress(0);

      setExtractProgress(0);
      setExtractDate("");
      setPreloadProgress(0);
      setPreloadDate("");
      setPreloadReviewedBy("");
      setLoadProgress(0);
      setLoadDate("");
      setLoadedBy("");
      setPostloadProgress(0);
      setPostloadDate("");
      setPostloadReviewedBy("");

      setRecordsToLoad(0);
      setRecordsLoaded(0);
      setErrors(0);
    }
  }, [object]);

  // Smart feature: average progression stages
  const handleAutoCalculateProgress = () => {
    const totalProg = Math.round(
      (extractProgress + preloadProgress + loadProgress + postloadProgress) / 4
    );
    setOverallProgress(totalProg);

    // auto set status based on overall progress
    if (totalProg === 100) {
      setStatus("COMPLETED");
    } else if (totalProg > 0 && status === "NOT STARTED") {
      setStatus("IN PROGRESS");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dataObject.trim()) {
      alert("Please specify a data object name before saving");
      return;
    }

    // Auto set status if complete
    let currentStatus = status;
    if (overallProgress === 100) {
      currentStatus = "COMPLETED";
    }

    onSave({
      stream,
      object_type: objectType,
      data_object: dataObject.trim(),
      dependency,
      comment: comment.trim(),
      data_load_responsible: dataLoadResponsible.trim(),
      functional_responsible: functionalResponsible.trim(),
      coe_responsible: coeResponsible.trim(),
      success_rate: Number(successRate) || 0,
      status: currentStatus,
      overall_progress: Number(overallProgress) || 0,
      extract_progress: Number(extractProgress) || 0,
      extract_date: extractDate,
      preload_progress: Number(preloadProgress) || 0,
      preload_date: preloadDate,
      preload_reviewed_by: preloadReviewedBy.trim(),
      load_progress: Number(loadProgress) || 0,
      load_date: loadDate,
      loaded_by: loadedBy.trim(),
      postload_progress: Number(postloadProgress) || 0,
      postload_date: postloadDate,
      postload_reviewed_by: postloadReviewedBy.trim(),
      records_to_load: Number(recordsToLoad) || 0,
      records_loaded: Number(recordsLoaded) || 0,
      errors: Number(errors) || 0,
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-955 bg-slate-950/40 backdrop-blur-sm flex justify-center items-center p-4">
      <div 
        className="w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-2xl relative overflow-hidden text-slate-700 font-sans"
        id="object-form-container"
      >
        {/* Branding indicator */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#15803d] via-[#16a34a] to-[#DD4268]"></div>

        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center mt-1">
          <div>
            <h2 className="text-lg font-extrabold text-[#15803d] tracking-tight">
              {isEditMode ? "Modify Migration Parameter Set" : "Initialize New Migration Object"}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {isEditMode ? `Updating database object #${object?.id}` : "Configure new flow streams and timelines parameters"}
            </p>
          </div>
          <button 
            onClick={onClose}
            type="button" 
            className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-405 hover:text-slate-800 transition-all outline-none"
            id="close-form-modal-btn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="bg-slate-50/70 px-6 border-b border-slate-200 text-xs flex space-x-1.5 pt-2 select-none">
          <button
            type="button"
            onClick={() => setActiveTab("general")}
            className={`px-4 py-3.5 font-bold flex items-center space-x-2 border-b-2 tracking-wide transition-all outline-none ${activeTab === "general" ? "border-[#15803d] text-[#15803d]" : "border-transparent text-slate-500 hover:text-slate-800"}`}
            id="tab-general"
          >
            <Layout className="w-4 h-4" />
            <span>General Info</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("personnel")}
            className={`px-4 py-3.5 font-bold flex items-center space-x-2 border-b-2 tracking-wide transition-all outline-none ${activeTab === "personnel" ? "border-[#15803d] text-[#15803d]" : "border-transparent text-slate-500 hover:text-slate-800"}`}
            id="tab-personnel"
          >
            <Users className="w-4 h-4" />
            <span>Responsible Team</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("sequence")}
            className={`px-4 py-3.5 font-bold flex items-center space-x-2 border-b-2 tracking-wide transition-all outline-none ${activeTab === "sequence" ? "border-[#15803d] text-[#15803d]" : "border-transparent text-slate-500 hover:text-slate-800"}`}
            id="tab-sequence"
          >
            <Sliders className="w-4 h-4" />
            <span>Timelines Sequence</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("metrics")}
            className={`px-4 py-3.5 font-bold flex items-center space-x-2 border-b-2 tracking-wide transition-all outline-none ${activeTab === "metrics" ? "border-[#15803d] text-[#15803d]" : "border-transparent text-slate-500 hover:text-slate-800"}`}
            id="tab-metrics"
          >
            <BarChart className="w-4 h-4" />
            <span>Metrics Control</span>
          </button>
        </div>

        {/* Form Wrap */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 max-h-[58vh] overflow-y-auto space-y-4 text-xs font-sans">
            
            {/* TAB: GENERAL */}
            {activeTab === "general" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  {/* Object Type Selector */}
                  <div>
                    <label className="block text-[10px] font-bold font-mono text-slate-400 uppercase tracking-wider mb-1.5">Object data type</label>
                    <select
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-[#00468f] focus:ring-1 focus:ring-[#00468f]/5"
                      value={objectType}
                      onChange={(e) => setObjectType(e.target.value)}
                    >
                      <option value="Master Data">Master Data</option>
                      <option value="Transactional">Transactional Data</option>
                      <option value="Configuration">Configuration</option>
                      <option value="Metadata">Metadata Structure</option>
                    </select>
                  </div>
                </div>

                {/* Data Object Name */}
                <div>
                  <label className="block text-[10px] font-bold font-mono text-slate-400 uppercase tracking-wider mb-1.5">Migration object name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Finance customer billing entries"
                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#00468f] focus:ring-1 focus:ring-[#00468f]/5"
                    value={dataObject}
                    onChange={(e) => setDataObject(e.target.value)}
                    id="form-data-object-input"
                  />
                </div>

                {/* Hard Dependencies */}
                <div>
                  <label className="block text-[10px] font-bold font-mono text-slate-400 uppercase tracking-wider mb-1.5">Structural reliance dependency</label>
                  <input
                    type="text"
                    placeholder="e.g. Master GL accounts, Material master data (enter 'None' if independent)"
                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#00468f] focus:ring-1 focus:ring-[#00468f]/5"
                    value={dependency}
                    onChange={(e) => setDependency(e.target.value)}
                  />
                </div>

                {/* Comment Logs */}
                <div>
                  <label className="block text-[10px] font-bold font-mono text-slate-400 uppercase tracking-wider mb-1.5">SIT1 operational log & comments</label>
                  <textarea
                    rows={4}
                    placeholder="Provide comments, blocker updates, details, or mapping specs..."
                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#00468f] focus:ring-1 focus:ring-[#00468f]/5"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  ></textarea>
                </div>
              </div>
            )}

            {/* TAB: PERSONNEL */}
            {activeTab === "personnel" && (
              <div className="space-y-4">
                <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-slate-400">Provide staff assignments for accountability checks</span>
                
                {/* Data Load Responsible */}
                <div>
                  <label className="block text-[10px] font-bold font-mono text-slate-400 uppercase tracking-wider mb-1.5">Data load technician / specialist</label>
                  <input
                    type="text"
                    placeholder="Who executes the migration load script (e.g. Sarah Jenkins)"
                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#00468f] focus:ring-1 focus:ring-[#00468f]/5"
                    value={dataLoadResponsible}
                    onChange={(e) => setDataLoadResponsible(e.target.value)}
                  />
                </div>

                {/* Functional Lead */}
                <div>
                  <label className="block text-[10px] font-bold font-mono text-slate-400 uppercase tracking-wider mb-1.5">Business functional lead owner</label>
                  <input
                    type="text"
                    placeholder="Business validator who signs off files (e.g. Marcus Vance)"
                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#00468f] focus:ring-1 focus:ring-[#00468f]/5"
                    value={functionalResponsible}
                    onChange={(e) => setFunctionalResponsible(e.target.value)}
                  />
                </div>

                {/* COE Responsible */}
                <div>
                  <label className="block text-[10px] font-bold font-mono text-slate-400 uppercase tracking-wider mb-1.5">COE Quality governor reviewer</label>
                  <input
                    type="text"
                    placeholder="COE governor audit specialist (e.g. Diana Alvarez)"
                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#00468f] focus:ring-1 focus:ring-[#00468f]/5"
                    value={coeResponsible}
                    onChange={(e) => setCoeResponsible(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* TAB: TIMELINE SEQUENCE */}
            {activeTab === "sequence" && (
              <div className="space-y-5">
                <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <div>
                    <span className="font-bold text-slate-700 block text-xs">Phase completion controllers</span>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">Update sequence values below. Overall progress can be auto estimated.</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAutoCalculateProgress}
                    className="px-3 py-1.5 bg-white border border-slate-200 text-[#00468f] hover:bg-slate-50 rounded-lg font-bold flex items-center space-x-1 outline-none transition-all active:scale-95 shadow-sm"
                    id="auto-calculate-progress-btn"
                  >
                    <Calculator className="w-3.5 h-3.5 text-[#00468f]" />
                    <span>Auto Guess Overall %</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Phase 1: extraction */}
                  <div className="p-3 bg-slate-50/50 rounded-lg border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="flex justify-between items-center text-[10px] font-bold font-mono text-slate-500 uppercase mb-1">
                        <span>1. Extract progress</span>
                        <span className="text-[#0080d4]">{extractProgress}%</span>
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        className="w-full accent-[#0080d4]"
                        value={extractProgress}
                        onChange={(e) => setExtractProgress(Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold font-mono text-slate-400 uppercase mb-1.5">Extraction date</label>
                      <input
                        type="date"
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 text-xs focus:outline-none"
                        value={extractDate}
                        onChange={(e) => setExtractDate(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Phase 2: pre-load validation */}
                  <div className="p-3 bg-slate-50/50 rounded-lg border border-slate-200 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="flex justify-between items-center text-[10px] font-bold font-mono text-slate-500 uppercase mb-1">
                          <span>2. Preload verify progress</span>
                          <span className="text-[#0080d4]">{preloadProgress}%</span>
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="5"
                          className="w-full accent-[#0080d4]"
                          value={preloadProgress}
                          onChange={(e) => setPreloadProgress(Number(e.target.value))}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold font-mono text-slate-400 uppercase mb-1.5">Verification date</label>
                        <input
                          type="date"
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 text-xs focus:outline-none"
                          value={preloadDate}
                          onChange={(e) => setPreloadDate(e.target.value)}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold font-mono text-slate-400 uppercase mb-1">Preload validator specialist name</label>
                      <input
                        type="text"
                        placeholder="Lead who reviewed mapping fields sheet"
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-700"
                        value={preloadReviewedBy}
                        onChange={(e) => setPreloadReviewedBy(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Phase 3: target loading */}
                  <div className="p-3 bg-slate-50/50 rounded-lg border border-slate-200 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="flex justify-between items-center text-[10px] font-bold font-mono text-[#00468f] uppercase mb-1">
                          <span>3. Loading progress</span>
                          <span className="text-[#00468f]">{loadProgress}%</span>
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="5"
                          className="w-full accent-[#00468f]"
                          value={loadProgress}
                          onChange={(e) => setLoadProgress(Number(e.target.value))}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold font-mono text-slate-400 uppercase mb-1.5">Loading data date</label>
                        <input
                          type="date"
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 text-xs focus:outline-none"
                          value={loadDate}
                          onChange={(e) => setLoadDate(e.target.value)}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold font-mono text-slate-400 uppercase mb-1">Target loader technician name</label>
                      <input
                        type="text"
                        placeholder="Execution loader (who initialized target script)"
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-700"
                        value={loadedBy}
                        onChange={(e) => setLoadedBy(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Phase 4: postload review */}
                  <div className="p-3 bg-slate-50/50 rounded-lg border border-slate-200 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="flex justify-between items-center text-[10px] font-bold font-mono text-slate-500 uppercase mb-1">
                          <span>4. Postload validation</span>
                          <span className="text-[#0080d4]">{postloadProgress}%</span>
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="5"
                          className="w-full accent-[#0080d4]"
                          value={postloadProgress}
                          onChange={(e) => setPostloadProgress(Number(e.target.value))}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold font-mono text-slate-400 uppercase mb-1.5">Postload validation date</label>
                        <input
                          type="date"
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 text-xs focus:outline-none"
                          value={postloadDate}
                          onChange={(e) => setPostloadDate(e.target.value)}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold font-mono text-slate-400 uppercase mb-1">Postload validation lead auditor</label>
                      <input
                        type="text"
                        placeholder="Governor specialist signing off target balances"
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-700"
                        value={postloadReviewedBy}
                        onChange={(e) => setPostloadReviewedBy(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: METRICS */}
            {activeTab === "metrics" && (
              <div className="space-y-4">
                
                {/* Global Overall Progression */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between my-2">
                  <div className="mb-2 sm:mb-0">
                    <span className="block font-bold text-slate-800">Set Global State Parameters</span>
                    <span className="text-[10px] text-slate-400 block leading-tight mt-0.5">Define absolute complete progress manually or via slider</span>
                  </div>
                  <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg w-16 text-center font-bold"
                      value={overallProgress}
                      onChange={(e) => setOverallProgress(Math.min(parseInt(e.target.value) || 0, 100))}
                    />
                    <span className="text-slate-400 font-bold">% Complete</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Status Selection */}
                  <div>
                    <label className="block text-[10px] font-bold font-mono text-slate-400 uppercase tracking-wider mb-1.5">SIT1 validation status</label>
                    <select
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-[#00468f] focus:ring-1 focus:ring-[#00468f]/5"
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      id="form-status-select"
                    >
                      <option value="NOT STARTED">NOT STARTED</option>
                      <option value="IN PROGRESS">IN PROGRESS</option>
                      <option value="COMPLETED">COMPLETED</option>
                      <option value="BLOCKED">BLOCKED</option>
                    </select>
                  </div>

                  {/* Clean Load success rate */}
                  <div>
                    <label className="block text-[10px] font-bold font-mono text-slate-400 uppercase tracking-wider mb-1.5">Audit success rate (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-[#00468f] focus:ring-1 focus:ring-[#00468f]/5"
                      value={successRate}
                      onChange={(e) => setSuccessRate(Math.min(parseFloat(e.target.value) || 0, 100))}
                    />
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-4 space-y-4">
                  <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-slate-400 block">Record load parameters</span>
                  
                  <div className="grid grid-cols-3 gap-4">
                    {/* Records to Load */}
                    <div>
                      <label className="block text-[9px] font-bold font-mono text-slate-400 uppercase tracking-wider mb-1.5">Total to Load</label>
                      <input
                        type="number"
                        min="0"
                        className="w-full px-3 py-1.8 bg-white border border-slate-200 rounded-lg text-slate-705 focus:outline-none focus:border-[#00468f]"
                        value={recordsToLoad}
                        onChange={(e) => setRecordsToLoad(parseInt(e.target.value) || 0)}
                      />
                    </div>

                    {/* Records Loaded */}
                    <div>
                      <label className="block text-[9px] font-bold font-mono text-slate-400 uppercase tracking-wider mb-1.5">Loaded Successfully</label>
                      <input
                        type="number"
                        min="0"
                        className="w-full px-3 py-1.8 bg-white border border-slate-200 rounded-lg text-slate-705 focus:outline-none focus:border-[#00468f]"
                        value={recordsLoaded}
                        onChange={(e) => setRecordsLoaded(parseInt(e.target.value) || 0)}
                      />
                    </div>

                    {/* Errors count */}
                    <div>
                      <label className="block text-[9px] font-bold font-mono text-slate-400 uppercase tracking-wider mb-1.5">Failed Errors</label>
                      <input
                        type="number"
                        min="0"
                        className="w-full px-3 py-1.8 bg-white border border-slate-200 rounded-lg text-[#DD4268] focus:outline-none focus:border-red-400"
                        value={errors}
                        onChange={(e) => setErrors(parseInt(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                </div>

              </div>
            )}

          </div>

          {/* Modal Actions Footer Bar */}
          <div className="p-4 bg-slate-50/60 border-t border-slate-200 flex justify-between items-center">
            {activeTab !== "metrics" ? (
              <button
                type="button"
                onClick={() => {
                  if (activeTab === "general") setActiveTab("personnel");
                  else if (activeTab === "personnel") setActiveTab("sequence");
                  else if (activeTab === "sequence") setActiveTab("metrics");
                }}
                className="px-4 py-1.8 bg-white border border-slate-205 hover:bg-slate-50 hover:border-slate-300 text-slate-600 font-bold transition-all active:scale-95 text-xs rounded-lg outline-none cursor-pointer shadow-sm"
              >
                Next tab
              </button>
            ) : (
              <div className="text-[10px] text-slate-400 font-mono flex items-center space-x-1">
                <CheckCircle className="w-3.5 h-3.5 text-[#15803d]" />
                <span>Validation checklist ready</span>
              </div>
            )}

            <div className="flex space-x-2 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-1.8 text-xs font-semibold text-slate-505 text-slate-500 hover:text-slate-800 hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-lg transition-all active:scale-95 outline-none select-none"
                id="cancel-form-btn"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center space-x-1.5 px-6 py-1.8 text-xs font-semibold bg-[#15803d] hover:bg-[#166534] text-white rounded-lg active:scale-95 transition-all outline-none shadow-sm shadow-emerald-100/50"
                id="save-form-btn"
              >
                <Save className="w-3.5 h-3.5 text-white" />
                <span>Save Record</span>
              </button>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
};
