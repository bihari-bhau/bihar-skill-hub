# Bihar Skill Hub — Database

## Default: SQLite (Zero Setup)

By default the project uses **SQLite** — no installation needed.
Django automatically creates `database/db.sqlite3` when you run migrations.

The database file lives here:
```
bihar-skill-hub/
└── database/
    └── db.sqlite3     ← auto-created on first migration
```

---

## How to point Django at this folder

In `backend/settings.py`, the database path is already set to:

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR.parent / 'database' / 'db.sqlite3',
    }
}
```

---

## Upgrade to PostgreSQL (Production)

1. Install PostgreSQL and create a database:
```sql
CREATE DATABASE bihar_skill_hub;
CREATE USER bsh_user WITH PASSWORD 'yourpassword';
GRANT ALL PRIVILEGES ON DATABASE bihar_skill_hub TO bsh_user;
```

2. Install the Python adapter:
```bash
pip install psycopg2-binary
```

3. Update `backend/.env`:
```
DB_NAME=bihar_skill_hub
DB_USER=bsh_user
DB_PASSWORD=yourpassword
DB_HOST=localhost
DB_PORT=5432
```

4. Uncomment the PostgreSQL block in `backend/settings.py` and comment out SQLite.

---

## Backup SQLite database

```bash
# From bihar-skill-hub/ root:
cp database/db.sqlite3 database/db_backup_$(date +%Y%m%d).sqlite3
```
