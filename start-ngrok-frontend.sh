#!/bin/bash

# Start ngrok for frontend only (simpler for demo)

echo "🚀 Starting ngrok tunnel for frontend (port 5173)..."
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
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo "📡 Starting ngrok tunnel..."
echo "   Your demo URL will be shown below"
echo ""
echo "Press Ctrl+C to stop ngrok"
echo ""

ngrok http 5173 --config="$HOME/Library/Application Support/ngrok/ngrok.yml"

