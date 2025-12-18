import { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight, FileText, BookOpen, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

/**
 * Knowledge Base Document Viewer
 * Displays knowledge base PDFs with automatic page navigation
 */
export default function KnowledgeDocViewer({ docName, initialPage = 1, onClose, workflow }) {
  const [currentPage, setCurrentPage] = useState(1); // Current index in pages array (1-based)
  const [pageInput, setPageInput] = useState(String(initialPage));

  // Mock document data - in production, this would fetch from your knowledge base
  const getDocumentData = () => {
    if (workflow === 'printer_offline') {
      return {
        title: "Printer Troubleshooting Guide",
        filename: "Printer_Guide.pdf",
        category: "Network & Connectivity",
        version: "v2.3",
        lastUpdated: "Dec 2024",
        totalPages: 45,
        relevantPages: [12, 13, 14, 15],
        pages: [
          {
            pageNum: 12,
            title: "Section 3.2: Network Connectivity Issues",
            content: `When a printer shows offline status, the most common causes are network-related. Follow this systematic approach to diagnose and resolve the issue:

**Step 1: Verify Basic Connectivity**
• Check if the printer is powered on and connected to the network
• Verify the network cable is securely connected (for wired printers)
• Check WiFi signal strength (for wireless printers)

**Step 2: Check IP Address Reachability**
• Open Command Prompt (Windows) or Terminal (Mac)
• Ping the printer's IP address: ping [printer-ip]
• If ping fails, the printer is not reachable on the network

**Step 3: Verify Print Spooler Service**
• Open Services (services.msc on Windows)
• Locate "Print Spooler" service
• Ensure status is "Running"
• If stopped, right-click and select "Start"

**Step 4: Check Printer Queue**
• Open Devices and Printers
• Right-click on the affected printer
• Select "See what's printing"
• Clear any stuck jobs in the queue

**Step 5: Restart Network Components**
If above steps don't resolve the issue:
1. Restart the printer
2. Restart the print server (if applicable)
3. Restart the client workstation

**Expected Resolution Time:** 5-10 minutes
**Success Rate:** 85% of offline printer issues are resolved with these steps`,
            highlighted: true
          },
          {
            pageNum: 13,
            title: "Section 3.2: Network Connectivity Issues (continued)",
            content: `**Advanced Troubleshooting**

If basic steps don't resolve the issue, proceed with advanced diagnostics:

**Network Configuration Issues**
• Verify the printer has a valid IP address
• Check if IP address is in the correct subnet
• Ensure no IP conflicts with other devices
• Verify DNS resolution if using hostname

**Firewall and Security**
• Check if firewall is blocking printer ports (typically 9100, 515, 631)
• Verify printer is not blocked by security policies
• Check if printer requires authentication

**Driver and Software**
• Ensure printer drivers are up to date
• Reinstall printer driver if corrupted
• Check for OS compatibility issues

**Physical Infrastructure**
• Test network port with another device
• Check network switch status lights
• Verify VLAN configuration if applicable

**Escalation Criteria**
Escalate to Level 2 support if:
• Issue persists after all troubleshooting steps
• Multiple printers affected (possible network issue)
• Printer hardware failure suspected
• Security policy changes required`,
            highlighted: true
          },
          {
            pageNum: 14,
            title: "Section 3.3: Common Error Codes",
            content: `**Network Timeout Errors**

**Error: NET_TIMEOUT**
Cause: Printer not responding to network requests
Resolution:
1. Verify network connectivity (ping test)
2. Check printer power and network cable
3. Restart printer and wait 2 minutes for full boot
4. Test from different workstation to isolate issue

**Error: OFFLINE_STATUS**
Cause: Printer reports offline to print server
Resolution:
1. Check print spooler service status
2. Remove and re-add printer connection
3. Verify printer is set as "online" in printer properties
4. Clear print queue and retry

**Error: PORT_UNREACHABLE**
Cause: Cannot connect to printer port
Resolution:
1. Verify correct IP address/hostname
2. Check firewall settings
3. Test telnet connection to port 9100
4. Reconfigure printer port if needed

**Documentation Updates**
Last revised: December 2024
Next review: March 2025
Feedback: support-docs@company.com`,
            highlighted: true
          },
          {
            pageNum: 15,
            title: "Section 3.4: Best Practices",
            content: `**Prevention and Best Practices**

**Proactive Monitoring**
• Set up printer health monitoring
• Enable email alerts for offline status
• Monitor print queue regularly
• Track recurring issues

**Maintenance Schedule**
• Weekly: Check printer queue and clear errors
• Monthly: Verify network connectivity
• Quarterly: Update printer firmware
• Annually: Review and update documentation

**User Training**
• Educate users on basic troubleshooting
• Provide quick reference guides
• Create self-service knowledge base articles
• Encourage prompt issue reporting

**Infrastructure Optimization**
• Use static IP addresses for printers
• Implement proper VLAN segregation
• Maintain updated network documentation
• Regular firmware updates

**Metrics and Reporting**
Track these KPIs:
• Mean Time to Resolution (MTTR)
• First Call Resolution Rate
• Recurring issue frequency
• User satisfaction scores

By following these best practices, you can reduce printer downtime by up to 70% and improve user satisfaction significantly.`,
            highlighted: true
          }
        ]
      };
    } else if (workflow === 'ink_error') {
      return {
        title: "Ink Cartridge Error Resolution",
        filename: "Ink_Error_Resolution.pdf",
        category: "Hardware & Supplies",
        version: "v1.8",
        lastUpdated: "Nov 2024",
        totalPages: 32,
        relevantPages: [8, 9, 10],
        pages: [
          {
            pageNum: 8,
            title: "Section 2.1: Authentication Errors",
            content: `**INK_AUTH_001: Cartridge Not Recognized**

This error occurs when genuine cartridges fail authentication. This is typically a firmware or sensor issue, not a cartridge problem.

**Immediate Actions:**

**Step 1: Physical Inspection**
• Remove the cartridge carefully
• Inspect cartridge contacts for damage or debris
• Clean contacts with lint-free cloth
• Check for protective tape still attached

**Step 2: Cartridge Reseating**
• Firmly press cartridge until you hear a click
• Ensure cartridge is fully seated in slot
• Close cartridge access door completely
• Wait 30 seconds for printer to recognize

**Step 3: Firmware Check**
• Verify printer firmware version
• Check for known firmware bugs with this cartridge model
• Update firmware if update available
• Restart printer after firmware update

**Step 4: Sensor Cleaning**
• Power off printer
• Open cartridge bay
• Use compressed air to clean sensor area
• Wipe sensors gently with alcohol wipe
• Allow to dry completely before testing`,
            highlighted: true
          },
          {
            pageNum: 9,
            title: "Section 2.1: Authentication Errors (continued)",
            content: `**Advanced Resolution Steps**

**Cartridge Verification:**
• Verify cartridge is genuine (not counterfeit)
• Check expiration date on cartridge
• Verify cartridge model matches printer
• Test with different cartridge from same batch

**Printer Reset Procedures:**
1. Power off printer
2. Disconnect power cable for 60 seconds
3. Press and hold power button for 15 seconds (drains residual power)
4. Reconnect power cable
5. Power on and test

**Chip Reset (if applicable):**
• Some cartridges have resetable chips
• Use manufacturer's reset tool if available
• Follow chip reset procedure carefully
• Test after reset

**Warranty Considerations:**
• Check if cartridge is under warranty
• Verify if printer warranty covers this issue
• Document all troubleshooting steps for warranty claim
• Keep original packaging and receipt

**When to Replace:**
Replace cartridge if:
• Physical damage to chip contacts
• Cartridge expired (date code check)
• Multiple genuine cartridges fail
• Printer recognizes other cartridges but not this one`,
            highlighted: true
          },
          {
            pageNum: 10,
            title: "Section 2.2: Ink Level Reporting Issues",
            content: `**Ink Level Detection Problems**

**Symptoms:**
• Printer reports cartridge empty when it's full
• Ink levels not updating after cartridge replacement
• Inconsistent ink level reporting

**Root Causes:**
• Sensor malfunction
• Chip communication error
• Firmware bug
• Cached data not cleared

**Resolution:**

**Quick Fix:**
1. Remove and reseat cartridge
2. Run printer cleaning cycle
3. Print test page
4. Check if levels update

**Deep Troubleshooting:**
1. Clear printer memory:
   • Power off printer
   • Hold power + cancel buttons while powering on
   • Release when display shows factory reset
   
2. Reset ink level monitoring:
   • Access service menu (varies by model)
   • Navigate to "Reset Ink Levels"
   • Confirm reset
   • Test with print job

3. Update printer drivers:
   • Download latest driver from manufacturer
   • Uninstall old driver completely
   • Restart computer
   • Install new driver
   • Test ink level reporting

**Escalation:**
Escalate if:
• Customer has Ink Subscription service (auto-ship eligible)
• Multiple cartridges affected
• Printer hardware failure suspected
• Recurring issue across multiple printers

**Auto-Resolution:**
If customer has Ink Subscription:
• Automatically trigger replacement cartridge shipment
• Provide temporary workaround
• Schedule follow-up after cartridge arrives
• Document issue for trending analysis`,
            highlighted: true
          }
        ]
      };
    }
    return null;
  };

  const document = getDocumentData();

  // Set initial page based on actual page number
  useEffect(() => {
    if (document && initialPage) {
      const pageIndex = document.pages.findIndex(p => p.pageNum === initialPage);
      if (pageIndex >= 0) {
        setCurrentPage(pageIndex + 1); // Convert to 1-based index
        setPageInput(String(initialPage));
      }
    }
  }, [document, initialPage]);

  useEffect(() => {
    if (document && currentPage > 0 && currentPage <= document.pages.length) {
      const actualPageNum = document.pages[currentPage - 1]?.pageNum;
      if (actualPageNum) {
        setPageInput(String(actualPageNum));
      }
    }
  }, [currentPage, document]);

  const handlePageInputChange = (e) => {
    setPageInput(e.target.value);
  };

  const handlePageInputSubmit = (e) => {
    if (e.key === 'Enter' || e.type === 'blur') {
      const pageNum = parseInt(pageInput);
      if (!isNaN(pageNum)) {
        // Find the page in the available pages
        const pageIndex = document.pages.findIndex(p => p.pageNum === pageNum);
        if (pageIndex >= 0) {
          setCurrentPage(pageIndex + 1); // Set to 1-based array index
        } else {
          // Reset to current page number if invalid
          const currentPageNum = document.pages[currentPage - 1]?.pageNum;
          setPageInput(String(currentPageNum || pageNum));
        }
      }
    }
  };

  const goToNextPage = () => {
    if (currentPage < document.pages.length) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  if (!document) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md">
          <p className="text-gray-600">Document not found</p>
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-[#612D91] text-white rounded-md"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const currentPageData = document.pages[currentPage - 1];
  const actualPageNum = currentPageData?.pageNum || currentPage;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-[#612D91] to-[#A64AC9] text-white">
          <div className="flex items-center gap-3">
            <BookOpen className="w-5 h-5" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-base">{document.title}</span>
                <span className="px-2 py-0.5 rounded-full bg-white/20 text-xs font-medium">
                  Knowledge Base
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-white/80 mt-1">
                <span className="flex items-center gap-1">
                  <FileText className="w-3 h-3" />
                  {document.filename}
                </span>
                <span>•</span>
                <span>{document.category}</span>
                <span>•</span>
                <span>{document.version}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Verified Source
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-3">
            <button
              onClick={goToPrevPage}
              disabled={currentPage === 1}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-600">Page</span>
              <input
                type="text"
                value={pageInput}
                onChange={handlePageInputChange}
                onKeyDown={handlePageInputSubmit}
                onBlur={handlePageInputSubmit}
                className="w-12 px-2 py-1 text-center border border-gray-300 rounded focus:ring-2 focus:ring-[#612D91] focus:border-transparent"
              />
              <span className="text-gray-600">of {document.totalPages}</span>
              <span className="text-xs text-gray-500 ml-2">
                (Showing relevant pages: {document.relevantPages.join(', ')})
              </span>
            </div>

            <button
              onClick={goToNextPage}
              disabled={currentPage === document.pages.length}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="text-xs text-gray-500">
            Updated: {document.lastUpdated}
          </div>
        </div>

        {/* Document Content */}
        <div className="flex-1 overflow-y-auto bg-gray-100 p-6">
          <div className="max-w-4xl mx-auto">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`bg-white rounded-lg shadow-lg p-8 ${
                currentPageData?.highlighted ? 'ring-4 ring-yellow-300/50' : ''
              }`}
            >
              {/* Page Header */}
              <div className="border-b border-gray-200 pb-4 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-mono text-gray-500 mb-1">
                      Page {actualPageNum}
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {currentPageData?.title}
                    </h2>
                  </div>
                  {currentPageData?.highlighted && (
                    <span className="px-3 py-1 bg-yellow-100 border border-yellow-300 text-yellow-800 rounded-full text-xs font-semibold flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Matched Section
                    </span>
                  )}
                </div>
              </div>

              {/* Page Content */}
              <div className="prose prose-sm max-w-none">
                <div className="text-gray-800 leading-relaxed whitespace-pre-line">
                  {currentPageData?.content}
                </div>
              </div>

              {/* Page Footer */}
              <div className="mt-8 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{document.title} - {document.version}</span>
                  <span>Page {actualPageNum} of {document.totalPages}</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
          <div className="text-xs text-gray-600">
            <span className="font-semibold">Source:</span> Vector DB: support_docs_v2 • Confidence: 94%
          </div>
          <div className="text-xs text-gray-500">
            Why this document: Matched customer keywords and intent pattern
          </div>
        </div>
      </motion.div>
    </div>
  );
}

