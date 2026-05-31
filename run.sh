#!/bin/bash
source ~/.nvm/nvm.sh
export PATH="$HOME/.turso:$PATH"
DIR="$(cd "$(dirname "$0")" && pwd)"
NPX=$(which npx)

stop() {
  echo "Zatrzymywanie serwisów..."
  systemctl --user stop cv-sqld cv-api cv-front 2>/dev/null || true
  systemctl --user disable cv-sqld cv-api cv-front 2>/dev/null || true
}

start() {
  echo "Uruchamianie CV MAKER..."

  systemd-run --user --unit=cv-sqld --property=Restart=on-failure \
    sqld --db-path "$DIR/backend/data.sqld" --http-listen-addr 0.0.0.0:8080

  sleep 2

  systemd-run --user --unit=cv-api --working-directory "$DIR/backend" \
    --property=Restart=on-failure \
    node server.js

  sleep 3

  systemd-run --user --unit=cv-front --working-directory "$DIR/frontend" \
    --property=Restart=on-failure \
    $NPX vite --host 0.0.0.0 --port 5173

  sleep 3
}

status() {
  echo ""
  echo "╔═══════════════════════════════════════════════╗"
  echo "║           CV MAKER - STATUS                  ║"
  echo "╠═══════════════════════════════════════════════╣"
  for s in cv-sqld cv-api cv-front; do
    state=$(systemctl --user is-active "$s" 2>/dev/null || echo "dead")
    pid=$(systemctl --user show -p MainPID "$s" 2>/dev/null | cut -d= -f2)
    case "$s" in
      cv-sqld)   desc="SQL database (sqld)   :8080" ;;
      cv-api)    desc="API server (Express)  :3000" ;;
      cv-front)  desc="Frontend (Vite/React) :5173" ;;
    esac
    printf "║  ● %b %b PID: %-5s\n" "$state" "$desc" "$pid"
  done
  IP=$(hostname -I | awk '{print $1}')
  echo "╠═══════════════════════════════════════════════╣"
  echo "║  Frontend:  http://$IP:5173                  ║"
  echo "║  Backend:   http://$IP:3000                  ║"
  echo "║  Login:     test@t.pl / test123              ║"
  echo "╚═══════════════════════════════════════════════╝"
}

case "${1:-start}" in
  start)  stop; start; status ;;
  stop)   stop ;;
  status) status ;;
  *)      echo "Uzycie: $0 {start|stop|status}" ;;
esac
