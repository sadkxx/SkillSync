#!/usr/bin/env sh
set -eu

cd /app/backend

echo "Starting SkillSync backend on port ${PORT:-8080}"
python -c "from app.main import app; print('SkillSync import ok')"
exec python -m uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8080}"
