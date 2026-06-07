import sqlite3

conn = sqlite3.connect("data/migration.db")

cursor = conn.cursor()

cursor.execute("""
CREATE TABLE IF NOT EXISTS migration_objects (

    id INTEGER PRIMARY KEY AUTOINCREMENT,

    stream TEXT,
    object_type TEXT,
    data_object TEXT,

    dependency TEXT,
    comment TEXT,

    data_load_responsible TEXT,
    functional_responsible TEXT,
    coe_responsible TEXT,

    success_rate REAL,
    status TEXT,

    overall_progress REAL,

    extract_progress REAL,
    extract_date TEXT,

    preload_progress REAL,
    preload_date TEXT,
    preload_reviewed_by TEXT,

    load_progress REAL,
    load_date TEXT,
    loaded_by TEXT,

    postload_progress REAL,
    postload_date TEXT,
    postload_reviewed_by TEXT,

    records_to_load INTEGER,
    records_loaded INTEGER,

    errors INTEGER
)
""")

conn.commit()
conn.close()

print("Database created successfully.")