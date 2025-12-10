#!/bin/bash

echo "🔧 Fixing Chrome/ngrok connection issues..."

# 1. Flush DNS cache (requires password)
echo "📡 Flushing DNS cache..."
sudo dscacheutil -flushcache
sudo killall -HUP mDNSResponder
echo "✅ DNS cache flushed"

# 2. Check if Chrome is running
if pgrep -x "Google Chrome" > /dev/null; then
    echo "⚠️  Chrome is running. Please close Chrome completely (Cmd+Q) and run this script again."
    echo "   Or manually clear Chrome cache:"
    echo "   1. Open Chrome"
    echo "   2. Go to chrome://settings/clearBrowserData"
    echo "   3. Select 'Cached images and files' and 'Cookies and other site data'"
    echo "   4. Time range: 'All time'"
    echo "   5. Click 'Clear data'"
else
    echo "✅ Chrome is not running"
fi

# 3. Clear Chrome cache files (if Chrome is closed)
if [ ! -d ~/Library/Caches/Google/Chrome/Default ]; then
    echo "⚠️  Chrome cache directory not found or already cleared"
else
    echo "🗑️  Clearing Chrome cache files..."
    rm -rf ~/Library/Caches/Google/Chrome/Default/Cache/*
    rm -rf ~/Library/Caches/Google/Chrome/Default/Code\ Cache/*
    echo "✅ Chrome cache cleared"
fi

# 4. Test ngrok connection
echo "🌐 Testing ngrok connection..."
if curl -s -o /dev/null -w "%{http_code}" https://india-pikelike-margurite.ngrok-free.dev/ | grep -q "200"; then
    echo "✅ ngrok tunnel is responding (HTTP 200)"
else
    echo "❌ ngrok tunnel is not responding"
fi

echo ""
echo "✨ Done! Now:"
echo "   1. Restart your Vite dev server if it's running"
echo "   2. Open Chrome in Incognito mode (Cmd+Shift+N)"
echo "   3. Visit: https://india-pikelike-margurite.ngrok-free.dev/"
echo "   4. If it works in Incognito, clear Chrome's site data for ngrok-free.dev"

