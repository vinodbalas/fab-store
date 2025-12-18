import { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Upload,
  FileText,
  Database,
  CheckCircle2,
  Loader2,
  Trash2,
  Edit,
  Search,
  BookOpen,
  Layers,
  Store,
  Sparkles,
  X,
  Printer,
  Wifi,
  Download,
  Shield,
  Gauge,
  HardDrive,
  Mail,
  Cloud,
  Settings,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// In-memory storage (replace with real DB/API later)
const STORAGE_KEY = "agenticSupport.knowledgeBase";

// Get category-specific icon
function getCategoryIcon(categoryId) {
  const iconMap = {
    "cat-printer-troubleshooting": Printer,
    "cat-network-connectivity": Wifi,
    "cat-software-installation": Download,
    "cat-account-authentication": Shield,
    "cat-hardware-diagnostics": Settings,
    "cat-email-communication": Mail,
    "cat-security-antivirus": Shield,
    "cat-performance-optimization": Gauge,
    "cat-backup-recovery": HardDrive,
    "cat-cloud-services": Cloud,
  };
  return iconMap[categoryId] || BookOpen;
}

function loadKnowledgeBase() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : { categories: [] };
  } catch {
    return { categories: [] };
  }
}

function saveKnowledgeBase(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// Get embedded seed content as fallback (ensures we always have content to vectorize)
function getSeedContent(categoryId) {
  const seedContent = {
    "cat-printer-troubleshooting": `PRINTER TROUBLESHOOTING GUIDE
Version 2.1 | Last Updated: January 2025

SECTION 1: PRINTER OFFLINE ISSUES

SYMPTOMS:
- Printer appears offline in print queue
- Print jobs remain in queue and do not print
- Error message: "Printer is offline or not connected"
- Network printer not discoverable

ROOT CAUSES:
1. Network connectivity issues
2. Printer power state
3. Print spooler service failure
4. Firewall blocking printer ports
5. Incorrect printer driver installation

TROUBLESHOOTING STEPS:

Step 1: Verify Physical Connection
- Ensure printer is powered on (check LED indicators)
- Verify network cable is securely connected (for wired printers)
- Check wireless connection status on printer display panel
- Confirm printer is on the same network segment as the computer

Step 2: Check Network Connectivity
- Ping printer IP address: ping [printer-ip]
- Verify printer IP is in correct subnet range
- Check router/switch port status
- Review network configuration on printer (Settings > Network > TCP/IP)

Step 3: Restart Print Spooler Service
Windows:
1. Open Services (services.msc)
2. Locate "Print Spooler" service
3. Right-click > Restart
4. Verify status shows "Running"

macOS:
1. Open Terminal
2. Run: sudo launchctl stop org.cups.cupsd
3. Run: sudo launchctl start org.cups.cupsd

SECTION 2: INK CARTRIDGE ERRORS

SYMPTOMS:
- "Genuine cartridge not recognized" error
- "Ink cartridge error" message
- Printer refuses to print despite cartridge being installed
- Low ink warnings persist after cartridge replacement

ROOT CAUSES:
1. Non-genuine or incompatible cartridge
2. Dirty cartridge contacts
3. Firmware version mismatch
4. Cartridge chip authentication failure
5. Cartridge not properly seated

TROUBLESHOOTING STEPS:

Step 1: Verify Cartridge Authenticity
- Check cartridge packaging for genuine manufacturer logo
- Verify part number matches printer model requirements
- Review manufacturer's compatible cartridge list
- Contact vendor if cartridge authenticity is questionable

Step 2: Clean Cartridge Contacts
- Power off printer
- Remove cartridge carefully
- Use lint-free cloth slightly dampened with distilled water
- Gently wipe gold contacts on cartridge (do not touch with fingers)
- Allow to air dry completely (5-10 minutes)
- Reinstall cartridge firmly until it clicks into place

SECTION 3: PAPER JAM RESOLUTION

SYMPTOMS:
- Paper jam error message on printer display
- Paper stuck in paper path
- Multiple paper jam errors in succession
- Printer stops mid-print with jam indication

ROOT CAUSES:
1. Foreign objects in paper path
2. Worn or damaged paper rollers
3. Incorrect paper type or size loaded
4. Paper path obstruction from previous jam
5. Paper sensor malfunction

TROUBLESHOOTING STEPS:

Step 1: Power Off and Clear Paper Path
- Turn off printer immediately
- Unplug power cord (wait 30 seconds)
- Open all access panels (front, rear, top)
- Remove paper trays
- Gently pull out any visible paper (pull in direction of paper flow, never force)
- Check for torn paper fragments

Step 2: Inspect Paper Path
- Use flashlight to inspect entire paper path
- Look for small paper fragments, labels, or foreign objects
- Check rollers for damage or debris
- Verify paper guides are properly aligned
- Clean any visible debris with lint-free cloth`,

    "cat-network-connectivity": `NETWORK CONNECTIVITY TROUBLESHOOTING GUIDE
Version 1.8 | Last Updated: January 2025

SECTION 1: WIRELESS CONNECTION ISSUES

SYMPTOMS:
- Device cannot connect to Wi-Fi network
- Intermittent connection drops
- "Cannot connect to network" error message
- Slow or unstable wireless connection
- Device shows connected but no internet access

ROOT CAUSES:
1. Incorrect Wi-Fi password
2. Router/access point configuration issues
3. Signal interference or weak signal strength
4. Network adapter driver problems
5. IP address conflicts
6. Router firmware issues

TROUBLESHOOTING STEPS:

Step 1: Verify Network Credentials
- Confirm SSID (network name) is correct
- Verify Wi-Fi password (case-sensitive)
- Check if network requires WPA2/WPA3 encryption
- Ensure device supports network security protocol

Step 2: Check Signal Strength
- Move device closer to router/access point
- Check signal strength indicator (should be 3+ bars)
- Identify and remove sources of interference:
  * Microwave ovens
  * Bluetooth devices
  * Other 2.4GHz/5GHz devices
  * Physical obstructions (walls, metal objects)

SECTION 2: ETHERNET CABLE CONNECTION PROBLEMS

SYMPTOMS:
- "Network cable unplugged" error
- No link light on network port
- Intermittent connection with cable
- Slow wired connection speeds
- Device shows "Limited connectivity"

ROOT CAUSES:
1. Damaged or faulty Ethernet cable
2. Loose cable connection
3. Faulty network port (device or switch)
4. Incorrect cable type (Cat5 vs Cat6)
5. Network switch/router port failure

TROUBLESHOOTING STEPS:

Step 1: Physical Cable Inspection
- Check cable for visible damage (kinks, cuts, fraying)
- Verify cable is fully inserted at both ends
- Ensure cable clicks into place (RJ-45 connector)
- Try different Ethernet cable if available
- Test cable with cable tester if available

Step 2: Verify Port Status
- Check link/activity lights on network port
- Link light should be solid (connection established)
- Activity light should blink (data transmission)
- Try different port on switch/router
- Test with known working device`,

    "cat-software-installation": `SOFTWARE INSTALLATION & UPDATE TROUBLESHOOTING GUIDE
Version 2.3 | Last Updated: January 2025

SECTION 1: INSTALLATION FAILURES

SYMPTOMS:
- Installation wizard fails to start
- "Installation failed" error messages
- Installation hangs or freezes
- "Insufficient permissions" errors
- Software installs but won't launch

ROOT CAUSES:
1. Insufficient user permissions
2. Incompatible system requirements
3. Corrupted installation files
4. Antivirus blocking installation
5. Insufficient disk space
6. Conflicting software already installed

TROUBLESHOOTING STEPS:

Step 1: Verify System Requirements
- Check minimum system requirements:
  * Operating system version
  * RAM requirements
  * Processor speed
  * Available disk space
  * Required .NET Framework or runtime versions
- Compare with current system specifications
- Upgrade system if requirements not met

Step 2: Check User Permissions
- Verify user has Administrator rights
- Right-click installer > "Run as Administrator"
- Check User Account Control (UAC) settings
- Temporarily disable UAC if needed (re-enable after)
- Use administrator account for installation

SECTION 2: UPDATE FAILURES

SYMPTOMS:
- Software update fails to download
- Update installation errors
- "Update already installed" when it's not
- Update causes software to stop working
- Automatic updates not functioning

ROOT CAUSES:
1. Network connectivity issues
2. Update server unavailable
3. Corrupted update cache
4. Insufficient permissions
5. Software running during update
6. Previous update partially installed

TROUBLESHOOTING STEPS:

Step 1: Check Network Connectivity
- Verify internet connection is active
- Test connection to update server
- Check firewall allows update traffic
- Try updating from different network
- Verify proxy settings if applicable`,

    "cat-account-authentication": `ACCOUNT & AUTHENTICATION TROUBLESHOOTING GUIDE
Version 1.9 | Last Updated: January 2025

SECTION 1: PASSWORD RESET ISSUES

SYMPTOMS:
- Cannot reset password via self-service portal
- Password reset email not received
- "Invalid reset link" or "Link expired" errors
- Password reset fails after entering new password
- Account locked after multiple reset attempts

ROOT CAUSES:
1. Email delivery delays or spam filtering
2. Expired or invalid reset token
3. Account locked due to security policies
4. Password doesn't meet complexity requirements
5. Email address not verified or incorrect

TROUBLESHOOTING STEPS:

Step 1: Check Email Delivery
- Check spam/junk folder for reset email
- Verify email address is correct in account
- Wait 5-10 minutes for email delivery
- Check email server status if corporate email
- Try alternative email address if available

Step 2: Verify Reset Link Validity
- Click reset link immediately (tokens expire quickly)
- Ensure link wasn't partially copied (check full URL)
- Try requesting new reset link if current expired
- Clear browser cache and cookies
- Try reset link in different browser

SECTION 2: MULTI-FACTOR AUTHENTICATION (MFA) PROBLEMS

SYMPTOMS:
- MFA code not received
- "Invalid MFA code" errors
- Authenticator app not working
- Backup codes not accepted
- MFA device lost or stolen

ROOT CAUSES:
1. Time synchronization issues
2. Incorrect MFA code entry
3. Authenticator app not properly configured
4. SMS delivery delays
5. Device time zone mismatch

TROUBLESHOOTING STEPS:

Step 1: Verify Time Synchronization
- Check device system time is correct
- Ensure time zone is set correctly
- Sync device time with internet time server
- Restart authenticator app after time sync
- Verify authenticator app time matches system time`,

    "cat-hardware-diagnostics": `HARDWARE DIAGNOSTICS & TROUBLESHOOTING GUIDE
Version 2.0 | Last Updated: January 2025

SECTION 1: DISPLAY & MONITOR ISSUES

SYMPTOMS:
- Blank or black screen
- Flickering display
- Distorted or garbled image
- Wrong resolution or colors
- Monitor not detected

ROOT CAUSES:
1. Loose or damaged video cable
2. Faulty graphics card or driver
3. Monitor power or backlight failure
4. Incorrect display settings
5. Hardware incompatibility

TROUBLESHOOTING STEPS:

Step 1: Check Physical Connections
- Verify video cable is securely connected at both ends
- Check cable for visible damage (bent pins, fraying)
- Try different video cable if available
- Test different video port (HDMI, DisplayPort, VGA)
- Ensure monitor power cable is connected

Step 2: Test Monitor Independently
- Connect monitor to different device
- Verify monitor works with other source
- Check monitor on-screen display (OSD) menu
- Test monitor with different cable
- If monitor fails on all devices, monitor is faulty

SECTION 2: KEYBOARD & MOUSE PROBLEMS

SYMPTOMS:
- Keys not responding
- Mouse cursor not moving
- Intermittent input issues
- Wrong characters typed
- Input device not recognized

ROOT CAUSES:
1. USB port failure
2. Driver issues
3. Physical damage to device
4. Wireless connectivity problems
5. Power/battery issues (wireless devices)

TROUBLESHOOTING STEPS:

Step 1: Check USB Connection
- Try different USB port
- Test USB port with other device
- Check USB cable for damage
- Try USB 2.0 port if using USB 3.0
- Verify USB port is not disabled in BIOS

Step 2: Test Device on Different Computer
- Connect keyboard/mouse to different device
- Verify device works on other computer
- If works elsewhere, issue is with original device
- If fails on both, device is likely faulty
- Note which device has the problem`,

    "cat-email-communication": `EMAIL & COMMUNICATION TROUBLESHOOTING GUIDE
Version 1.7 | Last Updated: January 2025

SECTION 1: EMAIL DELIVERY ISSUES

SYMPTOMS:
- Emails not sending
- Emails not being received
- "Message could not be sent" errors
- Emails stuck in outbox
- Delivery failure notifications

ROOT CAUSES:
1. Incorrect SMTP server settings
2. Authentication failures
3. Firewall blocking email ports
4. Email server downtime
5. Quota or storage limits exceeded

TROUBLESHOOTING STEPS:

Step 1: Verify SMTP Settings
- Check SMTP server address (e.g., smtp.company.com)
- Verify port number (usually 587 for TLS, 465 for SSL, 25 for unencrypted)
- Confirm authentication is enabled
- Verify username and password are correct
- Test with different email client

Step 2: Check Firewall and Ports
- Ensure ports 25, 465, 587 are not blocked
- Check corporate firewall rules
- Test email from different network
- Verify antivirus isn't blocking email traffic
- Review email server status page

Step 3: Verify Account Status
- Check email account is not locked or suspended
- Verify account storage quota not exceeded
- Review account activity logs
- Confirm account hasn't been compromised
- Contact email administrator if needed

SECTION 2: OUTLOOK CONFIGURATION PROBLEMS

SYMPTOMS:
- Outlook won't connect to email server
- "Cannot connect to server" errors
- Profile corruption issues
- Calendar sync failures
- Contacts not syncing

TROUBLESHOOTING STEPS:

Step 1: Repair Outlook Profile
- Close Outlook completely
- Open Control Panel > Mail
- Click "Show Profiles"
- Select profile and click "Properties"
- Click "Repair" or recreate profile

Step 2: Check Exchange/Office 365 Connection
- Verify server URL is correct
- Check autodiscover settings
- Test connection to Exchange server
- Verify Office 365 subscription is active
- Review connection status in Outlook

SECTION 3: CALENDAR SYNC ISSUES

SYMPTOMS:
- Calendar events not appearing
- Duplicate calendar entries
- Meeting invitations not received
- Calendar sync errors
- Time zone mismatches

ROOT CAUSES:
1. Sync service not running
2. Calendar permissions issues
3. Time zone configuration errors
4. Multiple calendar conflicts
5. Server-side sync problems

TROUBLESHOOTING STEPS:

Step 1: Restart Calendar Sync
- Close calendar application
- Restart sync service (varies by platform)
- Clear calendar cache
- Re-enable calendar sync
- Test with test event

Step 2: Verify Time Zone Settings
- Check system time zone is correct
- Verify calendar time zone matches
- Review meeting time zone settings
- Update time zone if changed
- Test calendar after correction`,

    "cat-security-antivirus": `SECURITY & ANTIVIRUS TROUBLESHOOTING GUIDE
Version 2.2 | Last Updated: January 2025

SECTION 1: ANTIVIRUS DETECTION ISSUES

SYMPTOMS:
- Antivirus not detecting threats
- False positive detections
- Antivirus disabled or not running
- Update failures
- Scan hangs or freezes

ROOT CAUSES:
1. Outdated virus definitions
2. Antivirus service stopped
3. Conflicting security software
4. Corrupted antivirus installation
5. System resource limitations

TROUBLESHOOTING STEPS:

Step 1: Update Virus Definitions
- Open antivirus application
- Navigate to Update section
- Click "Check for Updates"
- Wait for update to complete
- Verify definition version is current

Step 2: Restart Antivirus Service
Windows:
- Open Services (services.msc)
- Locate antivirus service (varies by vendor)
- Right-click > Restart
- Verify service status is "Running"

Step 3: Run Full System Scan
- Schedule full system scan
- Ensure scan includes all drives
- Review scan results for threats
- Quarantine or remove detected items
- Restart system if required

SECTION 2: MALWARE REMOVAL

SYMPTOMS:
- System behaving strangely
- Unwanted pop-ups or ads
- Browser redirects
- Slow system performance
- Unauthorized software installations

ROOT CAUSES:
1. Malware infection
2. Adware or spyware
3. Browser hijackers
4. Trojan or rootkit
5. Phishing attacks

TROUBLESHOOTING STEPS:

Step 1: Boot into Safe Mode
- Restart computer
- Press F8 (or Shift+Restart) during boot
- Select "Safe Mode with Networking"
- Log in and run antivirus scan
- Remove detected threats

Step 2: Use Malware Removal Tools
- Download reputable malware removal tool
- Examples: Malwarebytes, AdwCleaner
- Run tool in Safe Mode
- Follow removal instructions
- Restart and verify system is clean

SECTION 3: FIREWALL CONFIGURATION

SYMPTOMS:
- Applications blocked by firewall
- Cannot access network resources
- Firewall blocking legitimate traffic
- Port access denied errors
- Network connectivity issues

ROOT CAUSES:
1. Overly restrictive firewall rules
2. Incorrect port configurations
3. Firewall blocking required services
4. Multiple firewall conflicts
5. Policy misconfiguration

TROUBLESHOOTING STEPS:

Step 1: Review Firewall Rules
- Open Windows Firewall (or third-party)
- Check Inbound and Outbound rules
- Verify required applications are allowed
- Review blocked connections log
- Add exceptions for legitimate apps

Step 2: Test with Firewall Temporarily Disabled
- Disable firewall temporarily
- Test application connectivity
- If works, firewall is blocking
- Re-enable firewall
- Add proper exception rule`,

    "cat-performance-optimization": `PERFORMANCE OPTIMIZATION TROUBLESHOOTING GUIDE
Version 1.9 | Last Updated: January 2025

SECTION 1: SLOW BOOT TIMES

SYMPTOMS:
- Computer takes excessive time to start
- Boot process hangs or freezes
- Multiple restarts required
- Slow login after boot
- System unresponsive during startup

ROOT CAUSES:
1. Too many startup programs
2. Slow storage device (HDD vs SSD)
3. Corrupted system files
4. Insufficient RAM
5. Background services loading slowly

TROUBLESHOOTING STEPS:

Step 1: Disable Unnecessary Startup Programs
Windows:
- Open Task Manager (Ctrl+Shift+Esc)
- Go to "Startup" tab
- Disable non-essential programs
- Restart and measure boot time
- Re-enable critical programs if needed

macOS:
- System Preferences > Users & Groups
- Select user > Login Items
- Remove unnecessary startup items
- Restart and test

Step 2: Check Disk Health
- Run disk health check utility
- Check for disk errors
- Defragment HDD (if applicable)
- Consider upgrading to SSD
- Verify disk has free space

SECTION 2: HIGH CPU USAGE

SYMPTOMS:
- System running slowly
- Fan running constantly
- Applications freezing
- High CPU percentage in Task Manager
- System overheating

ROOT CAUSES:
1. Background processes consuming CPU
2. Malware or virus activity
3. Resource-intensive applications
4. System updates running
5. Driver or software conflicts

TROUBLESHOOTING STEPS:

Step 1: Identify CPU-Heavy Processes
- Open Task Manager
- Sort by CPU usage
- Identify processes using most CPU
- Research process if unknown
- End process if safe to do so

Step 2: Update or Reinstall Problematic Software
- Check for software updates
- Update to latest version
- Reinstall if update doesn't help
- Check for known performance issues
- Contact software vendor if needed

SECTION 3: MEMORY (RAM) OPTIMIZATION

SYMPTOMS:
- System running out of memory
- Applications closing unexpectedly
- "Low memory" warnings
- Slow performance with multiple apps
- Excessive disk swapping

ROOT CAUSES:
1. Insufficient RAM for workload
2. Memory leaks in applications
3. Too many applications running
4. Browser tabs consuming memory
5. System cache issues

TROUBLESHOOTING STEPS:

Step 1: Close Unnecessary Applications
- Close unused applications
- Reduce browser tabs
- Close background processes
- Free up system memory
- Monitor memory usage

Step 2: Check for Memory Leaks
- Monitor memory usage over time
- Identify applications with increasing memory
- Update or restart problematic apps
- Report memory leaks to vendors
- Consider adding more RAM if needed`,

    "cat-backup-recovery": `BACKUP & RECOVERY TROUBLESHOOTING GUIDE
Version 1.8 | Last Updated: January 2025

SECTION 1: BACKUP FAILURES

SYMPTOMS:
- Backup jobs failing
- "Backup incomplete" errors
- Backup taking too long
- Backup files corrupted
- Insufficient space for backup

ROOT CAUSES:
1. Insufficient storage space
2. Network connectivity issues
3. Backup service not running
4. Corrupted backup files
5. Permission or access issues

TROUBLESHOOTING STEPS:

Step 1: Verify Storage Space
- Check available space on backup destination
- Ensure sufficient space for full backup
- Free up space if needed
- Consider using compression
- Verify backup destination is accessible

Step 2: Check Backup Service Status
Windows:
- Open Services (services.msc)
- Locate backup service (Windows Backup, etc.)
- Verify service is running
- Restart service if stopped
- Check service logs for errors

Step 3: Test Backup Destination
- Verify backup location is accessible
- Test write permissions
- Check network path if remote backup
- Verify cloud storage credentials
- Test with small backup first

SECTION 2: RESTORE PROBLEMS

SYMPTOMS:
- Cannot restore files from backup
- Restore process fails
- Files missing after restore
- Corrupted files after restore
- Restore taking excessive time

ROOT CAUSES:
1. Backup file corruption
2. Incompatible backup format
3. Insufficient permissions
4. Target location issues
5. Backup version mismatch

TROUBLESHOOTING STEPS:

Step 1: Verify Backup Integrity
- Check backup file size matches expected
- Verify backup file is not corrupted
- Test backup file can be opened
- Check backup logs for errors
- Verify backup completion status

Step 2: Test Restore to Different Location
- Try restoring to different folder
- Verify restore process works
- Check file permissions after restore
- Compare restored files with originals
- Document any discrepancies

SECTION 3: CLOUD BACKUP SYNC ISSUES

SYMPTOMS:
- Files not syncing to cloud
- Sync conflicts
- Duplicate files in cloud
- Slow sync speeds
- Sync service errors

ROOT CAUSES:
1. Network connectivity problems
2. Cloud service outages
3. Authentication failures
4. Storage quota exceeded
5. File conflict resolution issues

TROUBLESHOOTING STEPS:

Step 1: Check Cloud Service Status
- Visit cloud provider status page
- Verify service is operational
- Check for scheduled maintenance
- Review service announcements
- Wait for service restoration if outage

Step 2: Verify Sync Settings
- Check sync folder configuration
- Verify files are in sync folder
- Review sync exclusion rules
- Check sync bandwidth limits
- Restart sync service`,

    "cat-cloud-services": `CLOUD SERVICES TROUBLESHOOTING GUIDE
Version 1.6 | Last Updated: January 2025

SECTION 1: OFFICE 365 CONNECTIVITY ISSUES

SYMPTOMS:
- Cannot sign in to Office 365
- Applications not connecting
- Sync failures
- "Service unavailable" errors
- Authentication timeouts

ROOT CAUSES:
1. Incorrect credentials
2. Office 365 service outage
3. Network connectivity problems
4. License or subscription issues
5. Multi-factor authentication problems

TROUBLESHOOTING STEPS:

Step 1: Verify Office 365 Service Status
- Visit Microsoft 365 Service Health
- Check for active incidents
- Review service status dashboard
- Wait for resolution if outage
- Check estimated resolution time

Step 2: Test Authentication
- Try signing in via web portal
- Verify credentials are correct
- Check if account is locked
- Review MFA requirements
- Test from different device

Step 3: Clear Office Cache
- Close all Office applications
- Clear Office credential cache
- Sign out and sign back in
- Restart Office applications
- Test connectivity after cache clear

SECTION 2: GOOGLE WORKSPACE SYNC PROBLEMS

SYMPTOMS:
- Google Drive not syncing
- Gmail not loading
- Calendar events missing
- Contacts not updating
- Google Workspace apps not working

ROOT CAUSES:
1. Sync service not running
2. Authentication token expired
3. Storage quota exceeded
4. Network connectivity issues
5. Browser cache problems

TROUBLESHOOTING STEPS:

Step 1: Restart Google Sync
- Sign out of Google account
- Clear browser cache and cookies
- Sign back into Google account
- Re-authorize sync permissions
- Test sync functionality

Step 2: Check Storage Quota
- Review Google Drive storage usage
- Verify quota not exceeded
- Free up space if needed
- Upgrade storage plan if required
- Test sync after quota resolved

SECTION 3: AWS/AZURE CONNECTION ISSUES

SYMPTOMS:
- Cannot connect to cloud resources
- API authentication failures
- Service timeouts
- Access denied errors
- Configuration errors

ROOT CAUSES:
1. Incorrect access credentials
2. IAM role or policy issues
3. Network security group rules
4. Service region unavailability
5. API rate limiting

TROUBLESHOOTING STEPS:

Step 1: Verify IAM Permissions
- Review IAM user or role permissions
- Check policy attachments
- Verify resource access policies
- Test with minimal required permissions
- Update policies if needed

Step 2: Check Network Configuration
- Review security group rules
- Verify VPC configuration
- Check network ACLs
- Test connectivity from different network
- Review firewall rules`
  };

  return seedContent[categoryId] || "";
}

// Seed knowledge base with pre-populated categories and documents
async function seedKnowledgeBase() {
  const existing = loadKnowledgeBase();
  
  // Only seed if knowledge base is empty
  if (existing.categories.length > 0) {
    return existing;
  }

  const categoryDefs = [
    {
      id: "cat-printer-troubleshooting",
      title: "Printer Troubleshooting",
      description: "Comprehensive troubleshooting guide for printer-related issues including offline problems, ink cartridge errors, paper jams, slow printing, and print quality issues. Covers network printers, local printers, and common resolution steps.",
      documentName: "printer-troubleshooting.txt",
    },
    {
      id: "cat-network-connectivity",
      title: "Network Connectivity",
      description: "Troubleshooting guide for network and connectivity problems including Wi-Fi connection issues, Ethernet cable problems, IP configuration, DNS resolution, and VPN connection failures. Covers both wired and wireless network troubleshooting.",
      documentName: "network-connectivity.txt",
    },
    {
      id: "cat-software-installation",
      title: "Software Installation & Updates",
      description: "Guide for software installation, update, and compatibility issues. Covers installation failures, update problems, compatibility issues, license activation, and uninstallation procedures. Includes dependency and permission troubleshooting.",
      documentName: "software-installation.txt",
    },
    {
      id: "cat-account-authentication",
      title: "Account & Authentication",
      description: "Troubleshooting guide for user account and authentication problems including password resets, multi-factor authentication (MFA), single sign-on (SSO) failures, account lockouts, and certificate/token authentication errors.",
      documentName: "account-authentication.txt",
    },
    {
      id: "cat-hardware-diagnostics",
      title: "Hardware Diagnostics",
      description: "Comprehensive hardware troubleshooting guide covering display/monitor issues, keyboard/mouse problems, storage device failures, memory (RAM) issues, power supply problems, and motherboard/boot failures. Includes diagnostic procedures and hardware testing steps.",
      documentName: "hardware-diagnostics.txt",
    },
    {
      id: "cat-email-communication",
      title: "Email & Communication",
      description: "Troubleshooting guide for email and communication issues including email delivery problems, Outlook/Thunderbird configuration, calendar sync issues, meeting scheduling problems, and instant messaging connectivity. Covers both desktop and web-based email clients.",
      documentName: "email-communication.txt",
    },
    {
      id: "cat-security-antivirus",
      title: "Security & Antivirus",
      description: "Comprehensive security troubleshooting guide covering antivirus issues, malware removal, firewall configuration, security policy conflicts, certificate errors, and data encryption problems. Includes best practices for endpoint protection and threat detection.",
      documentName: "security-antivirus.txt",
    },
    {
      id: "cat-performance-optimization",
      title: "Performance Optimization",
      description: "Guide for system and application performance issues including slow boot times, high CPU/memory usage, disk optimization, browser performance, application freezing, and general system sluggishness. Includes optimization techniques and resource management.",
      documentName: "performance-optimization.txt",
    },
    {
      id: "cat-backup-recovery",
      title: "Backup & Recovery",
      description: "Troubleshooting guide for backup and data recovery issues including backup failures, restore problems, cloud backup sync issues, data corruption, file recovery procedures, and disaster recovery planning. Covers both local and cloud backup solutions.",
      documentName: "backup-recovery.txt",
    },
    {
      id: "cat-cloud-services",
      title: "Cloud Services",
      description: "Guide for cloud service issues including Office 365, Google Workspace, AWS, Azure connectivity problems, sync failures, authentication issues, storage quota problems, and API integration errors. Covers SaaS platform troubleshooting and configuration.",
      documentName: "cloud-services.txt",
    },
  ];

  const categories = [];

  // Load and process each document
  for (const def of categoryDefs) {
    const category = {
      id: def.id,
      title: def.title,
      description: def.description,
      createdAt: new Date().toISOString(),
      intents: [],
      vectors: [],
      documentCount: 0,
    };

    try {
      // Use embedded seed content directly (most reliable)
      const text = getSeedContent(def.id);
      
      if (text && text.trim().length > 100) {
        // Vectorize the document - this should create many vectors
        const vectors = await vectorizeText(text, category.id);
        
        if (vectors.length > 0) {
          category.vectors = vectors;
          category.documentCount = 1;
          category.lastUpdated = new Date().toISOString();
          console.log(`✅ Seeded ${def.title}: ${vectors.length} vectors created`);
        } else {
          console.warn(`⚠️ No vectors created for ${def.title}`);
        }
      } else {
        console.warn(`⚠️ No content available for ${def.title}`);
      }
    } catch (error) {
      console.error(`❌ Error processing ${def.documentName}:`, error);
    }

    categories.push(category);
  }

  const seeded = { categories };
  saveKnowledgeBase(seeded);
  console.log(`Knowledge base seeded with ${categories.length} categories`);
  return seeded;
}

// PDF text extraction (mock for now, structure ready for real pdf-parse)
async function extractTextFromPDF(file) {
  // TODO: Replace with real pdf-parse library
  // For now, handle text files directly and mock PDF extraction
  
  // If it's a text file, read it directly (useful for testing with .txt files)
  if (file.type === "text/plain" || file.name.endsWith('.txt')) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }
  
  // For PDF files, simulate extraction (in production, use pdf-parse)
  return new Promise((resolve) => {
    setTimeout(() => {
      // Mock extracted text - in production, use pdf-parse or similar
      // This is a placeholder - real PDFs will extract much more text
      const mockText = `
        Printer Troubleshooting Guide
        
        Section 1: Printer Offline Issues
        - Check network connectivity
        - Verify printer is powered on
        - Restart print spooler service
        - Check firewall settings
        
        Section 2: Ink Cartridge Errors
        - Verify cartridge is genuine
        - Clean cartridge contacts
        - Reset printer firmware
        - Check for firmware updates
        
        Section 3: Paper Jam Resolution
        - Remove all paper from trays
        - Check for foreign objects
        - Clean paper path
        - Recalibrate paper sensors
      `;
      resolve(mockText);
    }, 1500);
  });
}

// Vectorization service (structured for real ML, mock for now)
async function vectorizeText(text, categoryId) {
  // TODO: Replace with real embedding model (OpenAI, Cohere, etc.)
  // For now, simulate vectorization by chunking text intelligently
  
  // First, split by major sections (marked by SECTION, ===, or similar)
  const sections = text.split(/(?:^|\n)(?:SECTION|===|##)/i);
  
  let chunks = [];
  
  // Process each section
  sections.forEach((section) => {
    if (!section.trim()) return;
    
    // Split section by double newlines (paragraphs)
    const paragraphs = section.split(/\n\n+/).filter(p => p.trim().length > 30);
    
    // Also split long paragraphs by sentences if they're too long
    paragraphs.forEach((para) => {
      const trimmed = para.trim();
      
      // If paragraph is very long (>500 chars), split by sentences
      if (trimmed.length > 500) {
        const sentences = trimmed.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 20);
        
        // Group sentences into chunks of 2-3 sentences (or ~200-400 chars)
        let currentChunk = '';
        sentences.forEach((sentence) => {
          if (currentChunk.length + sentence.length < 400) {
            currentChunk += (currentChunk ? ' ' : '') + sentence;
          } else {
            if (currentChunk.trim().length > 30) {
              chunks.push(currentChunk.trim());
            }
            currentChunk = sentence;
          }
        });
        if (currentChunk.trim().length > 30) {
          chunks.push(currentChunk.trim());
        }
      } else if (trimmed.length > 30) {
        // Keep shorter paragraphs as-is
        chunks.push(trimmed);
      }
    });
  });
  
  // Filter out very short chunks and deduplicate
  chunks = chunks
    .filter((chunk) => chunk.trim().length > 30)
    .filter((chunk, idx, arr) => arr.indexOf(chunk) === idx); // Remove duplicates

  console.log(`📊 Vectorization for ${categoryId}:`, {
    textLength: text.length,
    sectionsFound: sections.length,
    chunksCreated: chunks.length,
    sampleChunk: chunks[0]?.substring(0, 100)
  });

  // Simulate embedding generation delay (longer for more chunks)
  await new Promise((resolve) => setTimeout(resolve, 1000 + chunks.length * 100));

  // Return vectorized chunks (in production, each chunk would have a real embedding vector)
  return chunks.map((chunk, idx) => ({
    id: `${categoryId}-vec-${Date.now()}-${idx + 1}`,
    text: chunk,
    embedding: null, // Placeholder for real embedding vector
    metadata: {
      categoryId,
      chunkIndex: idx,
      chunkLength: chunk.length,
      createdAt: new Date().toISOString(),
    },
  }));
}

export default function KnowledgeBase({ onNavigate }) {
  const [kb, setKb] = useState(loadKnowledgeBase());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [vectorCount, setVectorCount] = useState(null);
  const [isSeeding, setIsSeeding] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("name"); // name, vectors, documents, date
  const [filterBy, setFilterBy] = useState("all"); // all, with-vectors, without-vectors
  const [uploadingCategoryId, setUploadingCategoryId] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editCategoryForm, setEditCategoryForm] = useState({ title: "", description: "" });

  // Seed knowledge base on mount if empty
  useEffect(() => {
    const seedIfEmpty = async () => {
      const current = loadKnowledgeBase();
      console.log("🔍 Checking knowledge base:", { 
        categoriesCount: current.categories.length,
        isSeeding 
      });
      
      // Check if we have all 10 categories (5 original + 5 new)
      const expectedCategoryIds = [
        "cat-printer-troubleshooting",
        "cat-network-connectivity",
        "cat-software-installation",
        "cat-account-authentication",
        "cat-hardware-diagnostics",
        "cat-email-communication",
        "cat-security-antivirus",
        "cat-performance-optimization",
        "cat-backup-recovery",
        "cat-cloud-services",
      ];
      
      const hasAllCategories = expectedCategoryIds.every(id => 
        current.categories.some(cat => cat.id === id)
      );
      
      if (current.categories.length === 0 || !hasAllCategories) {
        console.log("🌱 Starting knowledge base seeding...");
        setIsSeeding(true);
        try {
          // Clear existing data and re-seed
          localStorage.removeItem(STORAGE_KEY);
          const seeded = await seedKnowledgeBase();
          console.log("✅ Seeding complete:", seeded);
          setKb(seeded);
        } catch (error) {
          console.error("❌ Failed to seed knowledge base:", error);
        } finally {
          setIsSeeding(false);
        }
      } else {
        console.log("ℹ️ Knowledge base already has all categories, skipping seed");
      }
    };
    seedIfEmpty();
  }, []); // Run only once on mount

  const [newCategory, setNewCategory] = useState({
    title: "",
    description: "",
  });

  const handleCreateCategory = () => {
    if (!newCategory.title.trim()) return;

    const category = {
      id: `cat-${Date.now()}`,
      title: newCategory.title,
      description: newCategory.description,
      createdAt: new Date().toISOString(),
      intents: [],
      vectors: [],
      documentCount: 0,
    };

    const updated = {
      ...kb,
      categories: [...kb.categories, category],
    };

    setKb(updated);
    saveKnowledgeBase(updated);
    setNewCategory({ title: "", description: "" });
    setShowCreateModal(false);
  };

  const handleFileSelect = async (event, categoryId) => {
    const file = event.target.files?.[0];
    if (!file || !categoryId) return;

    // Accept both PDF and text files (text files useful for testing)
    const isPDF = file.type === "application/pdf" || file.name.endsWith('.pdf');
    const isTXT = file.type === "text/plain" || file.name.endsWith('.txt');
    
    if (!isPDF && !isTXT) {
      alert("Please upload a PDF or TXT file");
      return;
    }

    setUploadingCategoryId(categoryId);
    setUploading(true);
    setProcessing(true);
    setVectorCount(null);

    try {
      // Step 1: Extract text from PDF
      const extractedText = await extractTextFromPDF(file);

      // Step 2: Vectorize the text
      const vectors = await vectorizeText(extractedText, categoryId);

      // Step 3: Store vectors in category
      const updated = {
        ...kb,
        categories: kb.categories.map((cat) =>
          cat.id === categoryId
            ? {
                ...cat,
                vectors: [...cat.vectors, ...vectors],
                documentCount: cat.documentCount + 1,
                lastUpdated: new Date().toISOString(),
              }
            : cat
        ),
      };

      setKb(updated);
      saveKnowledgeBase(updated);
      setVectorCount(vectors.length);
      setProcessing(false);
      
      // Show success message
      setTimeout(() => {
        setVectorCount(null);
      }, 3000);
    } catch (error) {
      console.error("Error processing PDF:", error);
      alert("Failed to process PDF. Please try again.");
      setProcessing(false);
    } finally {
      setUploading(false);
      setUploadingCategoryId(null);
      // Reset file input
      event.target.value = "";
    }
  };

  const handleDeleteCategory = (categoryId) => {
    if (!confirm("Delete this category and all its knowledge?")) return;

    const updated = {
      ...kb,
      categories: kb.categories.filter((cat) => cat.id !== categoryId),
    };

    setKb(updated);
    saveKnowledgeBase(updated);
    if (selectedCategory?.id === categoryId) {
      setSelectedCategory(null);
    }
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setEditCategoryForm({
      title: category.title,
      description: category.description || "",
    });
  };

  const handleUpdateCategory = () => {
    if (!editingCategory || !editCategoryForm.title.trim()) return;

    const updated = {
      ...kb,
      categories: kb.categories.map((cat) =>
        cat.id === editingCategory.id
          ? {
              ...cat,
              title: editCategoryForm.title.trim(),
              description: editCategoryForm.description.trim(),
              lastUpdated: new Date().toISOString(),
            }
          : cat
      ),
    };

    setKb(updated);
    saveKnowledgeBase(updated);
    setEditingCategory(null);
    setEditCategoryForm({ title: "", description: "" });
  };

  const totalVectors = kb.categories.reduce(
    (sum, cat) => sum + (cat.vectors?.length || 0),
    0
  );

  // Filter and sort categories
  const filteredAndSortedCategories = useMemo(() => {
    let filtered = [...kb.categories];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (cat) =>
          cat.title.toLowerCase().includes(query) ||
          cat.description?.toLowerCase().includes(query)
      );
    }

    // Filter by vector/document status
    if (filterBy === "with-vectors") {
      filtered = filtered.filter((cat) => (cat.vectors?.length || 0) > 0);
    } else if (filterBy === "without-vectors") {
      filtered = filtered.filter((cat) => (cat.vectors?.length || 0) === 0);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "vectors":
          return (b.vectors?.length || 0) - (a.vectors?.length || 0);
        case "documents":
          return (b.documentCount || 0) - (a.documentCount || 0);
        case "date":
          return new Date(b.createdAt) - new Date(a.createdAt);
        case "name":
        default:
          return a.title.localeCompare(b.title);
      }
    });

    return filtered;
  }, [kb.categories, searchQuery, sortBy, filterBy]);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#612D91] via-[#7B3FE4] to-[#C26BFF] flex items-center justify-center shadow-md">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              Knowledge Base
            </h1>
            <p className="text-xs sm:text-sm text-gray-500">
              Manage categories, upload documents, and vectorize knowledge for
              agentic workflows
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate?.("store")}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-medium text-gray-700 bg-white hover:bg-gray-50 rounded-lg border border-gray-200 shadow-sm"
          >
            <Store className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Store</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-gray-200 bg-white px-4 py-3">
          <div className="text-[11px] uppercase tracking-wide text-gray-500">
            Categories
          </div>
          <div className="mt-1 text-2xl font-bold text-gray-900">
            {kb.categories.length}
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white px-4 py-3">
          <div className="text-[11px] uppercase tracking-wide text-gray-500">
            Total Vectors
          </div>
          <div className="mt-1 text-2xl font-bold text-indigo-600">
            {totalVectors}
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white px-4 py-3">
          <div className="text-[11px] uppercase tracking-wide text-gray-500">
            Documents
          </div>
          <div className="mt-1 text-2xl font-bold text-gray-900">
            {kb.categories.reduce((sum, cat) => sum + cat.documentCount, 0)}
          </div>
        </div>
      </div>

      {/* Categories List */}
      <div className="rounded-2xl bg-white border border-gray-200 shadow-sm">
        {/* Header with Search and Filters */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-900">
              Categories
              {filteredAndSortedCategories.length !== kb.categories.length && (
                <span className="ml-2 text-xs font-normal text-gray-500">
                  ({filteredAndSortedCategories.length} of {kb.categories.length})
                </span>
              )}
            </h2>
            <div className="flex items-center gap-2">
              {kb.categories.length === 0 && (
                <button
                  onClick={async () => {
                    setIsSeeding(true);
                    try {
                      localStorage.removeItem(STORAGE_KEY);
                      const seeded = await seedKnowledgeBase();
                      setKb(seeded);
                      console.log("Manual seed complete:", seeded);
                    } catch (error) {
                      console.error("Manual seed failed:", error);
                    } finally {
                      setIsSeeding(false);
                    }
                  }}
                  disabled={isSeeding}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 text-white text-xs font-medium hover:bg-purple-700 disabled:opacity-50"
                >
                  {isSeeding ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Seeding...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      Seed Knowledge Base
                    </>
                  )}
                </button>
              )}
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-700"
              >
                <Plus className="w-3.5 h-3.5" />
                New Category
              </button>
            </div>
          </div>

          {/* Search and Filter Bar */}
          {kb.categories.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search categories by name or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    title="Clear search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Filter Dropdown */}
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
              >
                <option value="all">All Categories</option>
                <option value="with-vectors">With Vectors</option>
                <option value="without-vectors">Without Vectors</option>
              </select>

              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
              >
                <option value="name">Sort by Name</option>
                <option value="vectors">Sort by Vectors</option>
                <option value="documents">Sort by Documents</option>
                <option value="date">Sort by Date</option>
              </select>
            </div>
          )}
        </div>

        <div className="p-6">
          {kb.categories.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              {isSeeding ? (
                <>
                  <Loader2 className="w-12 h-12 mx-auto mb-3 opacity-50 animate-spin" />
                  <p className="text-sm">Seeding knowledge base...</p>
                  <p className="text-xs mt-1">
                    Creating categories and vectorizing documents
                  </p>
                </>
              ) : (
                <>
                  <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">No categories yet</p>
                  <p className="text-xs mt-1">
                    Create a category to start building your knowledge base
                  </p>
                </>
              )}
            </div>
          ) : filteredAndSortedCategories.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No categories match your search</p>
              <p className="text-xs mt-1">
                Try adjusting your search or filter criteria
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredAndSortedCategories.map((category, idx) => {
                const hasVectors = (category.vectors?.length || 0) > 0;
                const vectorCount = category.vectors?.length || 0;
                const docCount = category.documentCount || 0;
                
                // Color scheme based on vector count
                const getColorScheme = () => {
                  if (vectorCount === 0) return { bg: "from-gray-50 to-gray-100", border: "border-gray-200", accent: "text-gray-500" };
                  if (vectorCount < 10) return { bg: "from-blue-50 to-indigo-50", border: "border-blue-200", accent: "text-blue-600" };
                  if (vectorCount < 30) return { bg: "from-indigo-50 to-purple-50", border: "border-indigo-300", accent: "text-indigo-600" };
                  return { bg: "from-purple-50 to-pink-50", border: "border-purple-300", accent: "text-purple-600" };
                };
                
                const colors = getColorScheme();
                
                return (
                  <motion.div
                    key={category.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className={`group relative rounded-xl border-2 overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] ${
                      selectedCategory?.id === category.id
                        ? `${colors.border} bg-gradient-to-br ${colors.bg} shadow-lg scale-[1.02]`
                        : `border-gray-200 bg-white hover:${colors.border}`
                    }`}
                    onClick={() => setSelectedCategory(category)}
                  >
                    {/* Gradient Header */}
                    <div className={`bg-gradient-to-br ${colors.bg} px-4 pt-4 pb-3`}>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          {(() => {
                            const CategoryIcon = getCategoryIcon(category.id);
                            return (
                              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-sm`}>
                                <CategoryIcon className="w-5 h-5 text-white" />
                              </div>
                            );
                          })()}
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-bold text-gray-900 truncate group-hover:text-indigo-700 transition-colors">
                              {category.title}
                            </h3>
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCategory(category.id);
                          }}
                          className="ml-2 p-1.5 rounded-lg hover:bg-red-100 text-red-500 hover:text-red-700 transition-colors flex-shrink-0 opacity-0 group-hover:opacity-100"
                          title="Delete category"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="px-4 py-3 bg-white">
                      <p className="text-xs text-gray-600 line-clamp-2 mb-3 leading-relaxed">
                        {category.description || "No description"}
                      </p>
                      
                      {/* Stats Row */}
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-3 text-[11px]">
                          <span className={`flex items-center gap-1.5 ${colors.accent}`}>
                            <div className={`w-2 h-2 rounded-full bg-gradient-to-r from-indigo-400 to-purple-500 ${hasVectors ? 'animate-pulse' : ''}`} />
                            <span className="font-bold">{vectorCount}</span>
                            <span className="text-gray-400">vectors</span>
                          </span>
                          <span className="flex items-center gap-1.5 text-gray-600">
                            <FileText className="w-3.5 h-3.5 text-gray-400" />
                            <span className="font-semibold">{docCount}</span>
                            <span className="text-gray-400">docs</span>
                          </span>
                        </div>
                        {hasVectors && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 text-[10px] font-semibold border border-emerald-200">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
                            Ready
                          </span>
                        )}
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
                        {/* Edit Category Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditCategory(category);
                          }}
                          className="flex items-center justify-center gap-1.5 w-full px-3 py-2 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 text-gray-700 text-xs font-medium transition-colors border border-gray-200"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          Edit Category
                        </button>
                        
                        {/* Upload Document Button */}
                        <input
                          type="file"
                          accept=".pdf,.txt"
                          onChange={(e) => handleFileSelect(e, category.id)}
                          className="hidden"
                          id={`file-upload-${category.id}`}
                          disabled={uploadingCategoryId === category.id && (uploading || processing)}
                        />
                        <label
                          htmlFor={`file-upload-${category.id}`}
                          className={`flex items-center justify-center gap-1.5 w-full px-3 py-2 rounded-lg text-xs font-medium transition-colors border ${
                            uploadingCategoryId === category.id && (uploading || processing)
                              ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200"
                              : "bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 text-indigo-700 cursor-pointer border-indigo-200"
                          }`}
                        >
                          {uploadingCategoryId === category.id && (uploading || processing) ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <Upload className="w-3.5 h-3.5" />
                              {hasVectors ? "Add Document" : "Upload Document"}
                            </>
                          )}
                        </label>
                      </div>
                    </div>
                    
                    {/* Hover Accent Bar */}
                    <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300`} />
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Processing Indicator */}
      {(uploading || processing) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-6 right-6 bg-white border border-gray-200 shadow-lg rounded-xl p-4 z-50"
        >
          <div className="flex items-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
            <div>
              <p className="text-sm font-semibold text-gray-900">Processing Document</p>
              <p className="text-xs text-gray-500">Extracting text and vectorizing...</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Success Toast */}
      {vectorCount !== null && !processing && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="fixed bottom-6 right-6 bg-emerald-50 border border-emerald-200 shadow-lg rounded-xl p-4 z-50"
        >
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <div>
              <p className="text-sm font-semibold text-emerald-900">Vectorization Complete</p>
              <p className="text-xs text-emerald-700">
                Created <strong>{vectorCount}</strong> vector embeddings
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Create Category Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6 border border-gray-200"
            >
              <h2 className="text-base font-semibold text-gray-900 mb-4">
                Create New Category
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={newCategory.title}
                    onChange={(e) =>
                      setNewCategory({ ...newCategory, title: e.target.value })
                    }
                    placeholder="e.g., Printer Troubleshooting"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={newCategory.description}
                    onChange={(e) =>
                      setNewCategory({
                        ...newCategory,
                        description: e.target.value,
                      })
                    }
                    placeholder="Describe what this category covers..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewCategory({ title: "", description: "" });
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateCategory}
                  disabled={!newCategory.title.trim()}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Category Modal */}
      <AnimatePresence>
        {editingCategory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6 border border-gray-200"
            >
              <h2 className="text-base font-semibold text-gray-900 mb-4">
                Edit Category
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={editCategoryForm.title}
                    onChange={(e) =>
                      setEditCategoryForm({ ...editCategoryForm, title: e.target.value })
                    }
                    placeholder="e.g., Printer Troubleshooting"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={editCategoryForm.description}
                    onChange={(e) =>
                      setEditCategoryForm({
                        ...editCategoryForm,
                        description: e.target.value,
                      })
                    }
                    placeholder="Describe what this category covers..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button
                  onClick={() => {
                    setEditingCategory(null);
                    setEditCategoryForm({ title: "", description: "" });
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateCategory}
                  disabled={!editCategoryForm.title.trim()}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save Changes
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

