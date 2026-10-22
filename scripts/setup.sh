#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
export npm_config_cache="${npm_config_cache:-/workspace/.cache/npm}"
export NEXT_TELEMETRY_DISABLED=1
npm ci --no-fund --no-audit
if [ ! -e .env.local ]; then
  (umask 077; printf '%s\n' 'RFQ_STAGING_MODE=true' 'RFQ_STORE_DIR=.local/rfq' 'SEO_INDEXABLE=false' 'SITE_URL=https://staging.lanfor.example' 'NEXT_TELEMETRY_DISABLED=1' > .env.local)
fi
npm run build
