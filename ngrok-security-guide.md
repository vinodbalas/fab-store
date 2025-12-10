# ngrok Security Best Practices

## ✅ What You Should Do

1. **Use ngrok Authentication (Recommended)**
   ```bash
   # Add basic auth to protect your tunnel
   ngrok http 5173 --basic-auth "username:password"
   ```

2. **Use IP Restrictions (if on paid plan)**
   - Restrict access to specific IP addresses
   - Only allow your team's IPs

3. **Don't Share URLs Publicly**
   - Only share with trusted people
   - Use secure channels (not public forums/social media)

4. **Use ngrok's Web Interface Password**
   ```bash
   # Set password for local ngrok web interface (port 4040)
   ngrok http 5173 --web-addr localhost:4040
   ```

5. **Monitor ngrok Dashboard**
   - Check http://localhost:4040 regularly
   - See who's accessing your tunnel
   - Monitor request logs

6. **Use Environment-Specific Configs**
   - Don't expose production databases
   - Use mock/test data in dev
   - Never expose real API keys

7. **Stop ngrok When Not Using**
   ```bash
   # Kill ngrok when done
   pkill -f "ngrok http"
   ```

## ⚠️ Risks to Be Aware Of

- **Free tier URLs expire** - but while active, anyone with URL can access
- **No built-in rate limiting** on free tier
- **WebSocket connections** can be exploited if not secured
- **Local file system** is NOT exposed (only the app on port 5173)

## 🔒 For Production/Demos

- Use ngrok paid plan with static domains + IP restrictions
- Or use Cloudflare Tunnel (free, more secure)
- Or deploy to a proper hosting service

## 🛡️ Quick Security Checklist

- [ ] Use basic auth if sharing with others
- [ ] Don't expose real production data
- [ ] Monitor access logs
- [ ] Stop tunnel when not in use
- [ ] Use HTTPS (ngrok provides this automatically)
- [ ] Keep ngrok updated

