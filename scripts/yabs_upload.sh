#!/bin/bash

# Default server name is the hostname
SERVER_NAME=${1:-$(hostname)}
API_URL=${2:-"http://localhost:3001/api/benchmarks"}

echo "Running YABS for $SERVER_NAME and uploading to $API_URL..."

# Run YABS with JSON output
# Note: We use -j for JSON and -w to write to a temp file
# Then we add the server_name to the JSON before uploading
TMP_FILE=$(mktemp)
curl -sL yabs.sh | bash -s -- -j > "$TMP_FILE"

# Use python to add server_name to JSON
UPDATED_JSON=$(python3 -c "import json, sys; d=json.load(sys.stdin); d['server_name']='$SERVER_NAME'; print(json.dumps(d))" < "$TMP_FILE")

# Upload to the vault
curl -X POST -H "Content-Type: application/json" -d "$UPDATED_JSON" "$API_URL"

echo "Upload complete!"
rm "$TMP_FILE"
