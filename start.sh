#!/bin/bash
source ~/.nvm/nvm.sh
export PATH="$HOME/.turso:$PATH"
DIR="$(cd "$(dirname "$0")" && pwd)"

pkill -f "node server.js" 2>/dev/null || true
pkill -f "sqld" 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true
sleep 1

# Start sqld (Turso sync server)
cd "$DIR/backend"
rm -f data.sqld wal.sqld 2>/dev/null
setsid sqld --db-path data.sqld --http-listen-addr 0.0.0.0:8080 > /tmp/sqld.log 2>&1 &
SQLD_PID=$!
echo "sqld started (PID: $SQLD_PID) on port 8080"
sleep 2

# Initialize schema via sqld
echo "Initializing database..."
curl -s -X POST http://localhost:8080 -H 'Content-Type: application/json' -d '{
  "statements": [
    {"q": "CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, email TEXT UNIQUE NOT NULL, password TEXT NOT NULL, name TEXT NOT NULL, created_at TEXT DEFAULT (datetime(\"now\")))"},
    {"q": "CREATE TABLE IF NOT EXISTS cvs (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, title TEXT NOT NULL DEFAULT '\''Moje CV'\'', template TEXT NOT NULL DEFAULT '\''modern'\'', theme TEXT NOT NULL DEFAULT '\''blue'\'', font TEXT NOT NULL DEFAULT '\''Inter'\'', data JSON NOT NULL DEFAULT '\''{}'\'', is_public INTEGER DEFAULT 0, share_link TEXT UNIQUE, created_at TEXT DEFAULT (datetime(\"now\")), updated_at TEXT DEFAULT (datetime(\"now\")), FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE)"},
    {"q": "CREATE TABLE IF NOT EXISTS templates (id TEXT PRIMARY KEY, name TEXT NOT NULL, description TEXT, preview_url TEXT, is_default INTEGER DEFAULT 0)"},
    {"q": "INSERT OR IGNORE INTO templates (id, name, description, is_default) VALUES ('\''modern'\'', '\''Modern'\'', '\''Czysty i nowoczesny design'\'', 1)"},
    {"q": "INSERT OR IGNORE INTO templates (id, name, description, is_default) VALUES ('\''classic'\'', '\''Classic'\'', '\''Tradycyjny układ CV'\'', 0)"},
    {"q": "INSERT OR IGNORE INTO templates (id, name, description, is_default) VALUES ('\''minimal'\'', '\''Minimal'\'', '\''Prosty i elegancki'\'', 0)"},
    {"q": "INSERT OR IGNORE INTO templates (id, name, description, is_default) VALUES ('\''creative'\'', '\''Creative'\'', '\''Dla branż kreatywnych'\'', 0)"},
    {"q": "INSERT OR IGNORE INTO templates (id, name, description, is_default) VALUES ('\''executive'\'', '\''Executive'\'', '\''Dla stanowisk kierowniczych'\'', 0)"}
  ]
}' > /dev/null 2>&1 && echo "Database initialized" || echo "DB init failed"

# Start backend
cd "$DIR/backend"
setsid node server.js > /tmp/cvmaker-backend.log 2>&1 &
BACKEND_PID=$!
echo "Backend started (PID: $BACKEND_PID)"

# Start frontend
cd "$DIR/frontend"
setsid npx vite --host 0.0.0.0 --port 5173 > /tmp/cvmaker-frontend.log 2>&1 &
FRONTEND_PID=$!
echo "Frontend started (PID: $FRONTEND_PID)"

sleep 3

IP=$(hostname -I | awk '{print $1}')
echo ""
echo "╔═══════════════════════════════════════════════╗"
echo "║           CV MAKER - URUCHOMIONY             ║"
echo "╠═══════════════════════════════════════════════╣"
echo "║  Frontend:  http://$IP:5173                  ║"
echo "║  Backend:   http://$IP:3000                  ║"
echo "║  SQL sync:  http://$IP:8080                  ║"
echo "╚═══════════════════════════════════════════════╝"
echo ""
echo "Aby zatrzymać: pkill -f 'node server.js'; pkill -f sqld; pkill -f vite"
