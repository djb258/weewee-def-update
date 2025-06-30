#!/bin/bash

# Trigger Render endpoint with payload
# Usage: ./deploy_render.sh [endpoint] [payload_file]

set -e

# Configuration
RENDER_WEBHOOK_URL="${RENDER_WEBHOOK_URL:-}"
RENDER_API_KEY="${RENDER_API_KEY:-}"

# Default values
ENDPOINT="${1:-webhook}"
PAYLOAD_FILE="${2:-}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required environment variables are set
if [ -z "$RENDER_WEBHOOK_URL" ]; then
    print_error "RENDER_WEBHOOK_URL environment variable is not set"
    exit 1
fi

if [ -z "$RENDER_API_KEY" ]; then
    print_warning "RENDER_API_KEY environment variable is not set"
fi

# Construct the full URL
FULL_URL="${RENDER_WEBHOOK_URL}/${ENDPOINT}"

print_status "Deploying to Render endpoint: $FULL_URL"

# Prepare headers
HEADERS=(
    "-H" "Content-Type: application/json"
    "-H" "Accept: application/json"
)

# Add API key if available
if [ -n "$RENDER_API_KEY" ]; then
    HEADERS+=("-H" "Authorization: Bearer $RENDER_API_KEY")
fi

# Prepare payload
if [ -n "$PAYLOAD_FILE" ] && [ -f "$PAYLOAD_FILE" ]; then
    print_status "Using payload from file: $PAYLOAD_FILE"
    PAYLOAD="@$PAYLOAD_FILE"
else
    print_status "Using default payload"
    PAYLOAD='{"action": "deploy", "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'", "environment": "'${NODE_ENV:-development}'"}'
fi

# Make the request
print_status "Sending deployment request..."
RESPONSE=$(curl -s -w "\n%{http_code}" \
    "${HEADERS[@]}" \
    -X POST \
    -d "$PAYLOAD" \
    "$FULL_URL")

# Extract HTTP status code (last line)
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
# Extract response body (all lines except last)
RESPONSE_BODY=$(echo "$RESPONSE" | head -n -1)

# Check response
if [ "$HTTP_CODE" -eq 200 ] || [ "$HTTP_CODE" -eq 201 ] || [ "$HTTP_CODE" -eq 202 ]; then
    print_status "Deployment successful! (HTTP $HTTP_CODE)"
    echo "$RESPONSE_BODY"
else
    print_error "Deployment failed! (HTTP $HTTP_CODE)"
    echo "$RESPONSE_BODY"
    exit 1
fi