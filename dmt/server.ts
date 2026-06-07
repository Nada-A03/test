import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { MigrationObject, DashboardStats } from "./src/types.js";

// Make sure output/data directory exists
const DATA_DIR = path.join(process.cwd(), "data");
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DATA_FILE = path.join(DATA_DIR, "migration.json");

// Helper to normalize progress values
function normalizeProgress(value: any): number {
  if (value === "" || value === null || value === undefined) return 0;
  try {
    const parsed = parseFloat(value);
    if (isNaN(parsed)) return 0;
    if (parsed <= 1 && parsed > 0) {
      return Math.round(parsed * 100);
    }
    return Math.round(parsed);
  } catch {
    return 0;
  }
}

// Initial Seed Data
const INITIAL_SEED_DATA: MigrationObject[] = [
  {
    id: 1,
    stream: "Finance",
    object_type: "Master Data",
    data_object: "General Ledger Accounts (G/L)",
    dependency: "None",
    comment: "Pre-requisite for all financial transactional loads. Charts of Accounts mapped.",
    data_load_responsible: "Sarah Jenkins",
    functional_responsible: "Marcus Vance",
    coe_responsible: "Diana Alvarez",
    success_rate: 99.8,
    status: "COMPLETED",
    overall_progress: 100,
    extract_progress: 100,
    extract_date: "2026-05-10",
    preload_progress: 100,
    preload_date: "2026-05-12",
    preload_reviewed_by: "Marcus Vance",
    load_progress: 100,
    load_date: "2026-05-15",
    loaded_by: "Sarah Jenkins",
    postload_progress: 100,
    postload_date: "2026-05-18",
    postload_reviewed_by: "Diana Alvarez",
    records_to_load: 4500,
    records_loaded: 4491,
    errors: 9
  },
  {
    id: 2,
    stream: "Finance",
    object_type: "Master Data",
    data_object: "Customer Master",
    dependency: "G/L Accounts",
    comment: "Addresses cleansed and normalized. Minor taxonomy differences solved.",
    data_load_responsible: "Sarah Jenkins",
    functional_responsible: "Elena Rostova",
    coe_responsible: "Diana Alvarez",
    success_rate: 98.2,
    status: "IN PROGRESS",
    overall_progress: 80,
    extract_progress: 100,
    extract_date: "2026-05-18",
    preload_progress: 100,
    preload_date: "2026-05-22",
    preload_reviewed_by: "Elena Rostova",
    load_progress: 85,
    load_date: "2026-06-01",
    loaded_by: "Sarah Jenkins",
    postload_progress: 35,
    postload_date: "",
    postload_reviewed_by: "",
    records_to_load: 24500,
    records_loaded: 20825,
    errors: 310
  },
  {
    id: 3,
    stream: "Finance",
    object_type: "Master Data",
    data_object: "Vendor Master",
    dependency: "G/L Accounts",
    comment: "Waiting on ultimate bank account validation from treasury team.",
    data_load_responsible: "Sarah Jenkins",
    functional_responsible: "Marcus Vance",
    coe_responsible: "Diana Alvarez",
    success_rate: 0,
    status: "BLOCKED",
    overall_progress: 45,
    extract_progress: 100,
    extract_date: "2026-05-19",
    preload_progress: 80,
    preload_date: "",
    preload_reviewed_by: "",
    load_progress: 0,
    load_date: "",
    loaded_by: "",
    postload_progress: 0,
    postload_date: "",
    postload_reviewed_by: "",
    records_to_load: 12100,
    records_loaded: 0,
    errors: 0
  },
  {
    id: 4,
    stream: "Logistics",
    object_type: "Master Data",
    data_object: "Material Master Data",
    dependency: "None",
    comment: "Large volume payload. Units of measure mappings completed.",
    data_load_responsible: "Robert Kincaid",
    functional_responsible: "Amit Patel",
    coe_responsible: "Diana Alvarez",
    success_rate: 99.1,
    status: "IN PROGRESS",
    overall_progress: 90,
    extract_progress: 100,
    extract_date: "2026-05-12",
    preload_progress: 100,
    preload_date: "2026-05-16",
    preload_reviewed_by: "Amit Patel",
    load_progress: 95,
    load_date: "2026-05-28",
    loaded_by: "Robert Kincaid",
    postload_progress: 65,
    postload_date: "",
    postload_reviewed_by: "",
    records_to_load: 185000,
    records_loaded: 175750,
    errors: 1250
  },
  {
    id: 5,
    stream: "Logistics",
    object_type: "Transactional",
    data_object: "Inventory Stock Balances",
    dependency: "Material Master, Vendor Master",
    comment: "To be loaded directly before the dry-run, synchronized with physical count.",
    data_load_responsible: "Robert Kincaid",
    functional_responsible: "Amit Patel",
    coe_responsible: "Diana Alvarez",
    success_rate: 0,
    status: "NOT STARTED",
    overall_progress: 10,
    extract_progress: 40,
    extract_date: "",
    preload_progress: 0,
    preload_date: "",
    preload_reviewed_by: "",
    load_progress: 0,
    load_date: "",
    loaded_by: "",
    postload_progress: 0,
    postload_date: "",
    postload_reviewed_by: "",
    records_to_load: 35000,
    records_loaded: 0,
    errors: 0
  },
  {
    id: 6,
    stream: "Sales",
    object_type: "Master Data",
    data_object: "Customer Price Lists",
    dependency: "Customer Master, Material Master Data",
    comment: "Formulas for multi-tier discounts validated in pre-load reviews.",
    data_load_responsible: "Chloe Laurent",
    functional_responsible: "Thomas More",
    coe_responsible: "Diana Alvarez",
    success_rate: 100,
    status: "COMPLETED",
    overall_progress: 100,
    extract_progress: 100,
    extract_date: "2026-05-15",
    preload_progress: 100,
    preload_date: "2026-05-19",
    preload_reviewed_by: "Thomas More",
    load_progress: 100,
    load_date: "2026-05-25",
    loaded_by: "Chloe Laurent",
    postload_progress: 100,
    postload_date: "2026-05-30",
    postload_reviewed_by: "Diana Alvarez",
    records_to_load: 8500,
    records_loaded: 8500,
    errors: 0
  },
  {
    id: 7,
    stream: "HR",
    object_type: "Master Data",
    data_object: "Employee Personal Information",
    dependency: "None",
    comment: "GDPR compliance checks completed and personal items hashed/removed.",
    data_load_responsible: "Siddharth Nair",
    functional_responsible: "Sarah Connor",
    coe_responsible: "Diana Alvarez",
    success_rate: 99.4,
    status: "IN PROGRESS",
    overall_progress: 60,
    extract_progress: 100,
    extract_date: "2026-05-20",
    preload_progress: 90,
    preload_date: "2026-05-25",
    preload_reviewed_by: "Sarah Connor",
    load_progress: 50,
    load_date: "2026-06-03",
    loaded_by: "Siddharth Nair",
    postload_progress: 0,
    postload_date: "",
    postload_reviewed_by: "",
    records_to_load: 4200,
    records_loaded: 2100,
    errors: 12
  }
];

// Helper to read database
function getObjectsFromDb(): MigrationObject[] {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(INITIAL_SEED_DATA, null, 2));
    return INITIAL_SEED_DATA;
  }
  try {
    const data = fs.readFileSync(DATA_FILE, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading db file, regenerating defaults", err);
    return INITIAL_SEED_DATA;
  }
}

// Helper to write database
function saveObjectsToDb(objects: MigrationObject[]) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(objects, null, 2));
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "25mb" }));

  // API endpoints

  // 1. Dashboard stats
  app.get("/api/dashboard", (req, res) => {
    const rows = getObjectsFromDb();
    const total_objects = rows.length;

    const completed_objects = rows.filter(row => (row.overall_progress ?? 0) === 100).length;
    const wip_objects = rows.filter(row => {
      const p = row.overall_progress ?? 0;
      return p > 0 && p < 100;
    }).length;
    const open_objects = rows.filter(row => (row.overall_progress ?? 0) === 0).length;

    const total_records_to_load = rows.reduce((acc, row) => acc + (row.records_to_load ?? 0), 0);
    const total_records_loaded = rows.reduce((acc, row) => acc + (row.records_loaded ?? 0), 0);
    const total_errors = rows.reduce((acc, row) => acc + (row.errors ?? 0), 0);

    const load_completion_pct = total_records_to_load > 0 
      ? parseFloat(((total_records_loaded / total_records_to_load) * 100).toFixed(2))
      : 0;

    const error_rate_pct = total_records_to_load > 0
      ? parseFloat(((total_errors / total_records_to_load) * 100).toFixed(2))
      : 0;

    const avg_progress = total_objects > 0
      ? parseFloat((rows.reduce((acc, row) => acc + (row.overall_progress ?? 0), 0) / total_objects).toFixed(2))
      : 0;

    res.json({
      total_objects,
      completed_objects,
      wip_objects,
      open_objects,
      total_records_to_load,
      total_records_loaded,
      total_errors,
      load_completion_pct,
      error_rate_pct,
      average_progress: avg_progress
    });
  });

  // 2. Get all objects sorting by stream, data_object
  app.get("/api/objects", (req, res) => {
    const rows = getObjectsFromDb();
    // Sort logic
    const sorted = [...rows].sort((a, b) => {
      const streamCompare = (a.stream || "").localeCompare(b.stream || "");
      if (streamCompare !== 0) return streamCompare;
      return (a.data_object || "").localeCompare(b.data_object || "");
    });
    res.json(sorted);
  });

  // 3. Get single object
  app.get("/api/objects/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const rows = getObjectsFromDb();
    const object = rows.find(r => r.id === id);
    if (!object) {
      return res.status(404).json({ detail: "Object not found" });
    }
    res.json(object);
  });

  // 4. Create object
  app.post("/api/objects", (req, res) => {
    const data = req.body;
    const rows = getObjectsFromDb();
    
    const newId = rows.length > 0 ? Math.max(...rows.map(r => r.id)) + 1 : 1;

    // Build the fully specified object mirroring database default structures
    const newObj: MigrationObject = {
      id: newId,
      stream: String(data.stream || "Unassigned").trim(),
      object_type: String(data.object_type || "Master Data").trim(),
      data_object: String(data.data_object || "New Object").trim(),
      dependency: String(data.dependency || "None").trim(),
      comment: String(data.comment || "").trim(),
      data_load_responsible: String(data.data_load_responsible || "").trim(),
      functional_responsible: String(data.functional_responsible || "").trim(),
      coe_responsible: String(data.coe_responsible || "").trim(),
      success_rate: normalizeProgress(data.success_rate),
      status: String(data.status || "NOT STARTED").toUpperCase().trim(),
      overall_progress: normalizeProgress(data.overall_progress),
      extract_progress: normalizeProgress(data.extract_progress),
      extract_date: String(data.extract_date || ""),
      preload_progress: normalizeProgress(data.preload_progress),
      preload_date: String(data.preload_date || ""),
      preload_reviewed_by: String(data.preload_reviewed_by || ""),
      load_progress: normalizeProgress(data.load_progress),
      load_date: String(data.load_date || ""),
      loaded_by: String(data.loaded_by || ""),
      postload_progress: normalizeProgress(data.postload_progress),
      postload_date: String(data.postload_date || ""),
      postload_reviewed_by: String(data.postload_reviewed_by || ""),
      records_to_load: parseInt(data.records_to_load) || 0,
      records_loaded: parseInt(data.records_loaded) || 0,
      errors: parseInt(data.errors) || 0
    };

    rows.push(newObj);
    saveObjectsToDb(rows);

    res.json({
      message: "Object created successfully",
      id: newId
    });
  });

  // 5. Update object
  app.put("/api/objects/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const data = req.body;
    const rows = getObjectsFromDb();
    const idx = rows.findIndex(r => r.id === id);
    if (idx === -1) {
      return res.status(404).json({ detail: "Object not found" });
    }

    // Fully replace object properties
    rows[idx] = {
      id,
      stream: String(data.stream || "Unassigned").trim(),
      object_type: String(data.object_type || "Master Data").trim(),
      data_object: String(data.data_object || "").trim(),
      dependency: String(data.dependency || "None").trim(),
      comment: String(data.comment || "").trim(),
      data_load_responsible: String(data.data_load_responsible || "").trim(),
      functional_responsible: String(data.functional_responsible || "").trim(),
      coe_responsible: String(data.coe_responsible || "").trim(),
      success_rate: normalizeProgress(data.success_rate),
      status: String(data.status || "NOT STARTED").toUpperCase().trim(),
      overall_progress: normalizeProgress(data.overall_progress),
      extract_progress: normalizeProgress(data.extract_progress),
      extract_date: String(data.extract_date || ""),
      preload_progress: normalizeProgress(data.preload_progress),
      preload_date: String(data.preload_date || ""),
      preload_reviewed_by: String(data.preload_reviewed_by || ""),
      load_progress: normalizeProgress(data.load_progress),
      load_date: String(data.load_date || ""),
      loaded_by: String(data.loaded_by || ""),
      postload_progress: normalizeProgress(data.postload_progress),
      postload_date: String(data.postload_date || ""),
      postload_reviewed_by: String(data.postload_reviewed_by || ""),
      records_to_load: parseInt(data.records_to_load) || 0,
      records_loaded: parseInt(data.records_loaded) || 0,
      errors: parseInt(data.errors) || 0
    };

    saveObjectsToDb(rows);
    res.json({ message: "Object updated successfully" });
  });

  // 6. Patch object
  app.patch("/api/objects/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const data = req.body;
    const rows = getObjectsFromDb();
    const idx = rows.findIndex(r => r.id === id);
    if (idx === -1) {
      return res.status(404).json({ detail: "Object not found" });
    }

    const current = rows[idx];
    const allowedKeys = Object.keys(current) as Array<keyof MigrationObject>;

    for (const key of allowedKeys) {
      if (key === "id") continue;
      if (data[key] !== undefined) {
        if (["overall_progress", "extract_progress", "preload_progress", "load_progress", "postload_progress", "success_rate"].includes(key)) {
          (current as any)[key] = normalizeProgress(data[key]);
        } else if (["records_to_load", "records_loaded", "errors"].includes(key)) {
          (current as any)[key] = parseInt(data[key]) || 0;
        } else {
          (current as any)[key] = data[key];
        }
      }
    }

    saveObjectsToDb(rows);
    res.json({ message: "Object patched successfully" });
  });

  // 7. Delete object
  app.delete("/api/objects/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const rows = getObjectsFromDb();
    const idx = rows.findIndex(r => r.id === id);
    if (idx === -1) {
      return res.status(404).json({ detail: "Object not found" });
    }

    rows.splice(idx, 1);
    saveObjectsToDb(rows);
    res.json({ message: "Object deleted successfully" });
  });

  // 8. Bulk import spreadsheet object payloads
  app.post("/api/import", (req, res) => {
    const rowsList = req.body;
    if (!Array.isArray(rowsList)) {
      return res.status(400).json({ detail: "Payload must be a JSON array of parsed rows" });
    }

    const rows = getObjectsFromDb();
    let imported = 0;
    let skipped = 0;

    // If the user wants to truncate and reload in import
    // Clear current database items to mimic python logic:
    // "cursor.execute('DELETE FROM migration_objects')"
    rows.length = 0;

    let nextId = 1;

    for (const item of rowsList) {
      const data_object = String(item.data_object || item["Data Object"] || "").trim();
      if (!data_object) {
        skipped++;
        continue;
      }

      const stream = String(item.stream || item["Stream"] || "Unassigned").trim();
      const object_type = String(item.object_type || item["Object Type"] || "Master Data").trim();
      const dependency = String(item.dependency || item["Dependency"] || "None").trim();
      const comment = String(item.comment || item["Comment / Blocker"] || "").trim();
      const data_load_responsible = String(item.data_load_responsible || item["Data Load Responsible"] || "").trim();
      const functional_responsible = String(item.functional_responsible || item["Functional Responsible"] || "").trim();
      const coe_responsible = String(item.coe_responsible || item["COE Responsible"] || "").trim();
      const success_rate = normalizeProgress(item.success_rate || item["Success Rate %"]);
      const status = String(item.status || item["Status"] || "NOT STARTED").toUpperCase().trim();
      const overall_progress = normalizeProgress(item.overall_progress || item["Overall %\nComplete"] || item["Overall Complete %"]);
      const extract_progress = normalizeProgress(item.extract_progress || item["Extract_Progress"]);
      const extract_date = String(item.extract_date || item["Extract_Date"] || "");
      const preload_progress = normalizeProgress(item.preload_progress || item["Preload Approved_Progress"]);
      const preload_date = String(item.preload_date || item["Preload Approved_Date"] || "");
      const preload_reviewed_by = String(item.preload_reviewed_by || item["Preload Approved_Reviewed By"] || "");
      const load_progress = normalizeProgress(item.load_progress || item["Load_Progress"]);
      const load_date = String(item.load_date || item["Load_Date"] || "");
      const loaded_by = String(item.loaded_by || item["Load_Loaded By"] || "");
      const postload_progress = normalizeProgress(item.postload_progress || item["Post Load Review & Sign-off_Progress"]);
      const postload_date = String(item.postload_date || item["Post Load Review & Sign-off_Date"] || "");
      const postload_reviewed_by = String(item.postload_reviewed_by || item["Post Load Review & Sign-off_Reviewed & Sign-off"] || "");
      const records_to_load = parseInt(item.records_to_load || item["Records\nto Load"] || item["Records to Load"]) || 0;
      const records_loaded = parseInt(item.records_loaded || item["Loaded_Records"] || item["Loaded Records"]) || 0;
      const errors = parseInt(item.errors || item["Errors_Records"] || item["Errors"]) || 0;

      rows.push({
        id: nextId++,
        stream,
        object_type,
        data_object,
        dependency,
        comment,
        data_load_responsible,
        functional_responsible,
        coe_responsible,
        success_rate,
        status,
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
      });

      imported++;
    }

    saveObjectsToDb(rows);

    res.json({
      message: "Import completed",
      imported,
      skipped
    });
  });

  // Vite integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://127.0.0.1:${PORT}`);
  });
}

startServer();
