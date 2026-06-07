from fastapi import FastAPI, HTTPException
from fastapi import UploadFile, File
from fastapi.middleware.cors import CORSMiddleware

import pandas as pd

from app.database import get_connection


app = FastAPI(
    title="Data Migration Tracker",
    version="1.0.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {
        "message": "Data Migration Tracker API"
    }


# =====================================================
# Helpers
# =====================================================

def normalize_progress(value):

    if value == "" or value is None:
        return 0

    try:
        value = float(value)

        if value <= 1:
            return round(value * 100)

        return round(value)

    except:
        return 0


def safe_int(value):

    if value == "" or value is None:
        return 0

    try:
        return int(float(value))
    except:
        return 0


def safe_text(value):

    if value is None:
        return ""

    return str(value).strip()

# =====================================================
# Dashboard
# =====================================================

@app.get("/dashboard")
def dashboard():

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT *
        FROM migration_objects
    """)

    rows = [dict(row) for row in cursor.fetchall()]

    conn.close()

    total_objects = len(rows)

    completed_objects = sum(
        1 for row in rows
        if (row["overall_progress"] or 0) == 100
    )

    wip_objects = sum(
        1 for row in rows
        if 0 < (row["overall_progress"] or 0) < 100
    )

    open_objects = sum(
        1 for row in rows
        if (row["overall_progress"] or 0) == 0
    )

    total_records_to_load = sum(
        row["records_to_load"] or 0
        for row in rows
    )

    total_records_loaded = sum(
        row["records_loaded"] or 0
        for row in rows
    )

    total_errors = sum(
        row["errors"] or 0
        for row in rows
    )
    load_completion_pct = round(
    (total_records_loaded / total_records_to_load) * 100,
    2
    )
    error_rate_pct = round(
        (total_errors / total_records_to_load) * 100,
        2
    )
    avg_progress = 0

    if total_objects > 0:
        avg_progress = round(
            sum(
                row["overall_progress"] or 0
                for row in rows
            ) / total_objects,
            2
        )

    return {
        "total_objects": total_objects,
        "completed_objects": completed_objects,
        "wip_objects": wip_objects,
        "open_objects": open_objects,
        "total_records_to_load": total_records_to_load,
        "total_records_loaded": total_records_loaded,
        "total_errors": total_errors,
        "load_completion_pct": load_completion_pct,
        "error_rate_pct": error_rate_pct,
        "average_progress": avg_progress
    }


# =====================================================
# Root
# =====================================================

@app.get("/")
def root():
    return {
        "message": "Data Migration Tracker API"
    }


# =====================================================
# Objects
# =====================================================

@app.get("/objects")
def get_objects():

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT *
        FROM migration_objects
        ORDER BY stream, data_object
    """)

    rows = cursor.fetchall()

    conn.close()

    return [dict(row) for row in rows]


@app.get("/objects/{object_id}")
def get_object(object_id: int):

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT *
        FROM migration_objects
        WHERE id = ?
    """, (object_id,))

    row = cursor.fetchone()

    conn.close()

    if not row:
        raise HTTPException(
            status_code=404,
            detail="Object not found"
        )

    return dict(row)


@app.post("/objects")
def create_object(data: dict):

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO migration_objects (

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

        )
        VALUES (
            ?, ?, ?,
            ?, ?,
            ?, ?, ?,
            ?, ?,
            ?,
            ?, ?,
            ?, ?, ?,
            ?, ?, ?,
            ?, ?, ?,
            ?, ?,
            ?
        )
    """, (

        data.get("stream"),
        data.get("object_type"),
        data.get("data_object"),

        data.get("dependency"),
        data.get("comment"),

        data.get("data_load_responsible"),
        data.get("functional_responsible"),
        data.get("coe_responsible"),

        data.get("success_rate"),
        data.get("status"),

        data.get("overall_progress"),

        data.get("extract_progress"),
        data.get("extract_date"),

        data.get("preload_progress"),
        data.get("preload_date"),
        data.get("preload_reviewed_by"),

        data.get("load_progress"),
        data.get("load_date"),
        data.get("loaded_by"),

        data.get("postload_progress"),
        data.get("postload_date"),
        data.get("postload_reviewed_by"),

        data.get("records_to_load"),
        data.get("records_loaded"),

        data.get("errors")

    ))

    conn.commit()

    new_id = cursor.lastrowid

    conn.close()

    return {
        "message": "Object created successfully",
        "id": new_id
    }


@app.put("/objects/{object_id}")
def update_object(object_id: int, data: dict):

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        "SELECT * FROM migration_objects WHERE id = ?",
        (object_id,)
    )

    existing = cursor.fetchone()

    if not existing:
        conn.close()
        raise HTTPException(
            status_code=404,
            detail="Object not found"
        )

    cursor.execute("""
        UPDATE migration_objects
        SET

            stream = ?,
            object_type = ?,
            data_object = ?,

            dependency = ?,
            comment = ?,

            data_load_responsible = ?,
            functional_responsible = ?,
            coe_responsible = ?,

            success_rate = ?,
            status = ?,

            overall_progress = ?,

            extract_progress = ?,
            extract_date = ?,

            preload_progress = ?,
            preload_date = ?,
            preload_reviewed_by = ?,

            load_progress = ?,
            load_date = ?,
            loaded_by = ?,

            postload_progress = ?,
            postload_date = ?,
            postload_reviewed_by = ?,

            records_to_load = ?,
            records_loaded = ?,

            errors = ?

        WHERE id = ?
    """, (

        data.get("stream"),
        data.get("object_type"),
        data.get("data_object"),

        data.get("dependency"),
        data.get("comment"),

        data.get("data_load_responsible"),
        data.get("functional_responsible"),
        data.get("coe_responsible"),

        data.get("success_rate"),
        data.get("status"),

        data.get("overall_progress"),

        data.get("extract_progress"),
        data.get("extract_date"),

        data.get("preload_progress"),
        data.get("preload_date"),
        data.get("preload_reviewed_by"),

        data.get("load_progress"),
        data.get("load_date"),
        data.get("loaded_by"),

        data.get("postload_progress"),
        data.get("postload_date"),
        data.get("postload_reviewed_by"),

        data.get("records_to_load"),
        data.get("records_loaded"),

        data.get("errors"),

        object_id

    ))

    conn.commit()
    conn.close()

    return {
        "message": "Object updated successfully"
    }


@app.patch("/objects/{object_id}")
def patch_object(object_id: int, data: dict):

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        "SELECT * FROM migration_objects WHERE id = ?",
        (object_id,)
    )

    row = cursor.fetchone()

    if not row:
        conn.close()
        raise HTTPException(
            status_code=404,
            detail="Object not found"
        )

    current = dict(row)

    updates = []

    values = []

    for key, value in data.items():

        if key in current:
            updates.append(f"{key} = ?")
            values.append(value)

    if not updates:
        conn.close()

        return {
            "message": "No fields updated"
        }

    values.append(object_id)

    query = f"""
        UPDATE migration_objects
        SET {', '.join(updates)}
        WHERE id = ?
    """

    cursor.execute(query, values)

    conn.commit()
    conn.close()

    return {
        "message": "Object patched successfully"
    }


@app.delete("/objects/{object_id}")
def delete_object(object_id: int):

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        "SELECT id FROM migration_objects WHERE id = ?",
        (object_id,)
    )

    existing = cursor.fetchone()

    if not existing:
        conn.close()
        raise HTTPException(
            status_code=404,
            detail="Object not found"
        )

    cursor.execute(
        "DELETE FROM migration_objects WHERE id = ?",
        (object_id,)
    )

    conn.commit()
    conn.close()

    return {
        "message": "Object deleted successfully"
    }

# =====================================================
# Import Excel
# =====================================================

@app.post("/import")
async def import_excel(file: UploadFile = File(...)):

    df = pd.read_excel(
        file.file,
        sheet_name="Migration Tracker - TN - SIT1",
        header=[4, 5]
    )

    flattened_columns = []

    for col in df.columns:

        parts = []

        for part in col:

            part = str(part).strip()

            if part != "nan" and "Unnamed" not in part:
                parts.append(part)

        flattened_columns.append("_".join(parts))

    df.columns = flattened_columns

    df = df.fillna("")

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("DELETE FROM migration_objects")
    cursor.execute(
        "DELETE FROM sqlite_sequence WHERE name='migration_objects'"
    )

    imported = 0
    skipped = 0

    for _, row in df.iterrows():

        data_object = safe_text(
            row.get("Data Object", "")
        )

        if not data_object:
            skipped += 1
            continue

        cursor.execute("""
            INSERT INTO migration_objects (

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

            )
            VALUES (
                ?, ?, ?,
                ?, ?,
                ?, ?, ?,
                ?, ?,
                ?,
                ?, ?,
                ?, ?, ?,
                ?, ?, ?,
                ?, ?, ?,
                ?, ?,
                ?
            )
        """, (

            safe_text(row.get("Stream")),
            safe_text(row.get("Object Type")),
            safe_text(row.get("Data Object")),

            safe_text(row.get("Dependency")),
            safe_text(row.get("Comment / Blocker")),

            safe_text(row.get("Data Load Responsible")),
            safe_text(row.get("Functional Responsible")),
            safe_text(row.get("COE Responsible")),

            normalize_progress(
                row.get("Success Rate %")
            ),

            safe_text(
                row.get("Status")
            ),

            normalize_progress(
                row.get("Overall %\nComplete")
            ),

            normalize_progress(
                row.get("Extract_Progress")
            ),

            safe_text(
                row.get("Extract_Date")
            ),

            normalize_progress(
                row.get("Preload Approved_Progress")
            ),

            safe_text(
                row.get("Preload Approved_Date")
            ),

            safe_text(
                row.get("Preload Approved_Reviewed By")
            ),

            normalize_progress(
                row.get("Load_Progress")
            ),

            safe_text(
                row.get("Load_Date")
            ),

            safe_text(
                row.get("Load_Loaded By")
            ),

            normalize_progress(
                row.get("Post Load Review & Sign-off_Progress")
            ),

            safe_text(
                row.get("Post Load Review & Sign-off_Date")
            ),

            safe_text(
                row.get("Post Load Review & Sign-off_Reviewed & Sign-off")
            ),

            safe_int(
                row.get("Records\nto Load")
            ),

            safe_int(
                row.get("Loaded_Records")
            ),

            safe_int(
                row.get("Errors_Records")
            )

        ))

        imported += 1

    conn.commit()
    conn.close()

    return {
        "message": "Import completed",
        "imported": imported,
        "skipped": skipped
    }