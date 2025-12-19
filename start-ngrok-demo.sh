#!/bin/bash

# ngrok Demo Setup Script
# This script starts ngrok tunnels for frontend and backend

echo "🚀 Starting ngrok tunnels for demo..."
echo ""

# Check if ngrok is installed
if ! command -v ngrok &> /dev/null; then
    echo "❌ ngrok is not installed. Please install it first:"
    echo "   brew install ngrok/ngrok/ngrok"
    exit 1
fi

# Check if frontend is running
if ! lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Frontend server (port 5173) is not running."
    echo "   Start it with: npm run dev"
    echo ""
fi

# Check if backend is running
if ! lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Backend server (port 3001) is not running."
    echo "   Start it with: cd backend && npm run dev"
    echo ""
fi

# Start ngrok with both tunnels
echo "📡 Starting ngrok tunnels..."
echo "   Frontend: https://your-frontend-url.ngrok-free.app"
echo "   Backend:  https://your-backend-url.ngrok-free.app"
echo ""
echo "Press Ctrl+C to stop ngrok"
echo ""

ngrok start --all --config="$HOME/Library/Application Support/ngrok/ngrok.yml"

