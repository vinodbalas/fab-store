# ngrok Demo Setup Guide

Quick guide to set up ngrok tunnels for your TP FAB Agents demo.

## Prerequisites

1. **Install ngrok** (if not already installed):
   ```bash
   brew install ngrok/ngrok/ngrok
   ```

2. **Verify ngrok is configured**:
   ```bash
   ngrok config check
   ```
   Your authtoken is already configured in `~/Library/Application Support/ngrok/ngrok.yml`

## Quick Start (Frontend Only - Recommended for Demo)

For most demos, you only need the frontend tunnel:

```bash
# Option 1: Use the helper script
./start-ngrok-frontend.sh

# Option 2: Direct command
ngrok http 5173
```

This will give you a public HTTPS URL like:
```
https://abc123.ngrok-free.app
```

## Full Setup (Frontend + Backend)

If you need both frontend and backend accessible:

1. **Start your servers** (in separate terminals):
   ```bash
   # Terminal 1: Frontend
   npm run dev

   # Terminal 2: Backend
   cd backend && npm run dev
   ```

2. **Start ngrok tunnels**:
   ```bash
   ./start-ngrok-demo.sh
   ```

   Or manually:
   ```bash
   ngrok start --all
   ```

   This will create two tunnels:
   - Frontend: `https://frontend-xxx.ngrok-free.app`
   - Backend: `https://backend-xxx.ngrok-free.app`

3. **Update frontend to use backend URL**:
   If using backend, update your frontend's API configuration to point to the ngrok backend URL.

## Viewing Tunnel Info

Once ngrok is running, you can view tunnel details at:
```
http://localhost:4040
```

This shows:
- Public URLs
- Request/response logs
- WebSocket connections
- Traffic inspection

## Security Tips for Demo

1. **Basic Auth** (optional, for extra security):
   ```bash
   ngrok http 5173 --basic-auth "demo:your-password"
   ```

2. **Monitor Access**:
   - Check `http://localhost:4040` regularly
   - See who's accessing your demo

3. **Stop When Done**:
   ```bash
   # Kill ngrok
   pkill -f ngrok
   ```

## Troubleshooting

### "ngrok: command not found"
```bash
brew install ngrok/ngrok/ngrok
```

### "Port already in use"
Make sure your dev server is running on port 5173:
```bash
lsof -i :5173
```

### "Tunnel URL not working"
- Check that your dev server is running
- Verify ngrok is connected (check http://localhost:4040)
- Try restarting ngrok

### Browser shows "ngrok warning page"
This is normal for free tier. Click "Visit Site" to proceed. You can add `ngrok-skip-browser-warning: true` header (already configured in vite.config.js).

## Demo Checklist

- [ ] Frontend server running (`npm run dev`)
- [ ] Backend server running (if needed) (`cd backend && npm run dev`)
- [ ] ngrok tunnel started (`./start-ngrok-frontend.sh`)
- [ ] Test the public URL in a browser
- [ ] Share URL with demo audience
- [ ] Monitor access at http://localhost:4040
- [ ] Stop ngrok when demo is complete

## Notes

- Free tier ngrok URLs change each time you restart
- Free tier has session limits (8 hours)
- For static URLs, consider ngrok paid plan
- All traffic is encrypted via HTTPS automatically

