#!/bin/bash

echo "🔧 Fixing Mac browser issues with ngrok..."

# 1. Flush DNS
echo "📡 Flushing DNS cache..."
sudo dscacheutil -flushcache
sudo killall -HUP mDNSResponder
echo "✅ DNS flushed"

# 2. Clear Chrome cache (if Chrome is closed)
echo ""
echo "🌐 Chrome fixes:"
echo "   1. Close Chrome completely (Cmd+Q)"
echo "   2. Open Chrome"
echo "   3. Go to: chrome://settings/clearBrowserData"
echo "   4. Select 'Cached images and files' and 'Cookies and other site data'"
echo "   5. Time range: 'All time'"
echo "   6. Click 'Clear data'"
echo ""
echo "   OR run this command after closing Chrome:"
echo "   rm -rf ~/Library/Caches/Google/Chrome/Default/Cache/*"
echo "   rm -rf ~/Library/Caches/Google/Chrome/Default/Code\\ Cache/*"

# 3. Clear Safari cache
echo ""
echo "🍎 Safari fixes:"
echo "   1. Open Safari"
echo "   2. Safari menu → Settings → Advanced → Show Develop menu"
echo "   3. Develop menu → Empty Caches"
echo "   4. Safari menu → Clear History... → All History"

# 4. Reset network location (if applicable)
echo ""
echo "📶 Network location check:"
current_location=$(networksetup -getcurrentlocation 2>/dev/null)
echo "   Current network location: $current_location"
echo "   If you have multiple locations, try switching:"
echo "   networksetup -switchtolocation 'Automatic'"

# 5. Check for VPN
echo ""
echo "🔒 VPN check:"
if networksetup -listallnetworkservices | grep -q "VPN"; then
    echo "   ⚠️  VPN detected - try disconnecting VPN temporarily"
else
    echo "   ✅ No VPN detected"
fi

# 6. Test connection
echo ""
echo "🧪 Testing connection..."
if curl -s -o /dev/null -w "%{http_code}" https://india-pikelike-margurite.ngrok-free.dev/ | grep -q "200"; then
    echo "   ✅ Server is responding (HTTP 200)"
else
    echo "   ❌ Server not responding"
fi

echo ""
echo "✨ Next steps:"
echo "   1. Clear browser cache (see above)"
echo "   2. Try Incognito/Private mode first"
echo "   3. If Incognito works, clear regular cache"
echo "   4. Check browser extensions (disable all temporarily)"
echo "   5. Try: chrome://net-internals/#dns → Clear host cache"

