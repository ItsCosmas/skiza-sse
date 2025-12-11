#!/bin/bash
set -e

# --- Cleanup function ---
cleanup() {
  echo ""
  echo "🛑 Stopping Docker services..."
  docker compose down
}
trap cleanup EXIT

# --- Prerequisites ---
echo "📦 Ensuring JDK 25 is active..."
cd backend

# Source SDKMAN! if available
export SDKMAN_DIR="$HOME/.sdkman"
if [ -s "$SDKMAN_DIR/bin/sdkman-init.sh" ]; then
  source "$SDKMAN_DIR/bin/sdkman-init.sh"
else
  echo "❌ SDKMAN! not found. Please install SDKMAN! or manually use JDK 25."
  exit 1
fi

sdk use java 25-librca
export JAVA_HOME="$SDKMAN_DIR/candidates/java/current"

echo "🏗️  Building Spring Boot image with Cloud Native Buildpack..."
./mvnw spring-boot:build-image

# Navigate Back to parent directory
cd ..

# --- Start services ---
echo "🚀 Starting Docker services..."
docker compose up -d

# --- Fetch ngrok URL ---
echo "⏳ Waiting for ngrok tunnel to initialize..."
sleep 6

echo "🔗 Fetching public ngrok URL..."
NGROK_URL=$(curl -s http://localhost:4040/api/tunnels | jq -r '.tunnels[0].public_url // empty' | xargs)

if [ -z "$NGROK_URL" ]; then
  echo "❌ Failed to retrieve ngrok URL. Ensure port 4040 is exposed in docker-compose.yml."
  exit 1
fi

echo "✅ ngrok URL: $NGROK_URL"

# --- Configure frontend ---
cd frontend
echo "VITE_BACKEND_URL=$NGROK_URL" > .env
echo "📝 Wrote frontend/.env"

# --- Build and preview ---
echo "📦 Building Vite frontend..."
npm run build

echo "👁️  Starting preview server (press Ctrl+C to stop)..."
npm run preview