#!/bin/bash
set -e

# Ensure jq is available
if ! command -v jq &> /dev/null; then
  echo "❌ 'jq' is required to parse ngrok API response. Please install it (e.g., brew install jq)."
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

cleanup() {
  echo ""
  echo "🧹 Cleaning up..."
  docker compose down > /dev/null 2>&1 || true
  rm -f "$SCRIPT_DIR/frontend/.env"
}
trap cleanup EXIT

echo "📦 Ensuring JDK 25 is active..."
cd "$SCRIPT_DIR/backend"

SDKMAN_DIR="$HOME/.sdkman"
JAVA_VERSION="25-librca"
JAVA_HOME="$SDKMAN_DIR/candidates/java/$JAVA_VERSION"

# Verify JDK exists
if [ ! -d "$JAVA_HOME" ]; then
  echo "❌ JDK 25 (25-librca) not found at $JAVA_HOME"
  echo "   Please install it with: sdk install java 25-librca"
  exit 1
fi

# Set environment
export JAVA_HOME
export PATH="$JAVA_HOME/bin:$PATH"

# Verify Java
echo "✅ Java version:"
"$JAVA_HOME/bin/java" -version

echo "🏗️  Building Spring Boot image with Cloud Native Buildpack..."
./mvnw spring-boot:build-image

cd "$SCRIPT_DIR"

echo "🚀 Starting Docker services..."
docker compose up -d

echo "⏳ Waiting for ngrok tunnel to initialize..."

NGROK_URL=""
MAX_ATTEMPTS=15
ATTEMPT=0

while [ -z "$NGROK_URL" ] && [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
  sleep 1
  ATTEMPT=$((ATTEMPT + 1))
  echo -n "."

  # Attempt to fetch tunnel URL
  NGROK_URL=$(curl -s --max-time 2 http://localhost:4040/api/tunnels 2>/dev/null | jq -r '.tunnels[0].public_url // empty' 2>/dev/null | xargs)

  if [ -n "$NGROK_URL" ]; then
    break
  fi
done

echo ""  # newline after progress dots

if [ -z "$NGROK_URL" ]; then
  echo "❌ Failed to retrieve ngrok URL after $MAX_ATTEMPTS seconds."
  echo "   Ensure:"
  echo "   - The ngrok container is running"
  echo "   - Port 4040 is published in docker-compose.yml (e.g., ports: - '4040:4040')"
  exit 1
fi

echo "✅ ngrok URL: $NGROK_URL"

cd "$SCRIPT_DIR/frontend"
echo "VITE_BACKEND_URL=$NGROK_URL" > .env
echo "📝 Wrote frontend/.env"

echo "📦 Building Vite frontend..."
npm run build

echo "👁️  Starting preview server (press Ctrl+C to stop)..."
npm run preview