import sqlite3

conn = sqlite3.connect("data/migration.db")

cursor = conn.cursor()

cursor.execute("""
INSERT INTO migration_objects (
    stream,
    object_type,
    data_object,
    overall_progress
)
VALUES (
    'Finance',
    'Master Data',
    'Customer',
    25
)
""")

conn.commit()
conn.close()