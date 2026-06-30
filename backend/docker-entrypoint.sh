#!/usr/bin/env bash
set -e

# ------------------------------------------------------------------
# docker-entrypoint.sh
# Supports two commands:
#   serve  – start the PHP built-in server (default)
#   worker – start a queue worker
# ------------------------------------------------------------------

PORT="${PORT:-10000}"

case "${1:-serve}" in
    serve)
        echo "Starting Laravel on 0.0.0.0:${PORT}"
        exec php artisan serve --host=0.0.0.0 --port="${PORT}"
        ;;
    worker)
        echo "Starting queue worker"
        exec php artisan queue:work --tries=1 --timeout=0
        ;;
    *)
        # Allow arbitrary artisan commands or shell pass-through
        exec "$@"
        ;;
esac
