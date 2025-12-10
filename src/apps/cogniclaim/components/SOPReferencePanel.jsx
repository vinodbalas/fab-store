import { PanelRight, FileText, ExternalLink, X, Sparkles, ChevronDown, BookOpen, Search } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SCENARIO_SOPS } from "../data/sops";
import { SOPViewer } from "./platformComponents";

const DEFAULT_SOPS = [
  { id: "3.1",   title: "Eligibility & Pre-Authorization", text: "Patient eligibility must be confirmed before adjudication. If missing, request payer verification and attach proof." },
  { id: "3.2.1", title: "Missing Pre-Authorization Handling", text: "If pre-auth is not attached, request from provider within 48 hours. Hold claim in pending until received; follow escalation if past due." },
  { id: "4.5.2", title: "Follow-up Escalation Process", text: "If no response after 48 hours, escalate to coding QA and notify payer. Document all attempts in the case log." },
];

// Map document references to scenario SOPs
const getSOPsFromReferences = (references = []) => {
  const sops = [];
  
  references.forEach(ref => {
    // Check if reference matches a scenario SOP page
    Object.entries(SCENARIO_SOPS).forEach(([scenario, sop]) => {
      if (sop.page && ref.includes(sop.page.replace("Page ", "").replace("page ", ""))) {
        // Check if we've already added this SOP
        if (!sops.find(s => s.id === scenario)) {
          sops.push({
            id: scenario,
            title: sop.title,
            text: sop.steps.join("\n\n"),
            page: sop.page,
            scenario: scenario,
          });
        }
      }
    });
  });
  
  return sops;
};

function SOPRow({ sop, active, onOpenViewer, claimStatus, scenario, searchQuery = "" }) {
  const [open, setOpen] = useState(active);

  // Auto-expand when highlighted
  useEffect(() => {
    if (active) {
      setOpen(true);
    }
  }, [active]);

  // Highlight search matches
  const highlightText = (text, query) => {
    if (!query) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, i) => 
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={i} className="bg-yellow-200 dark:bg-yellow-900/50 px-0.5 rounded">{part}</mark>
      ) : part
    );
  };

  return (
    <motion.div
      initial={false}
      animate={{
        borderColor: active ? "#612D91" : undefined,
        boxShadow: active 
          ? "0 0 0 2px rgba(97, 45, 145, 0.15), 0 2px 8px -2px rgba(97, 45, 145, 0.2)" 
          : undefined,
      }}
      transition={{ duration: 0.2 }}
      className={`rounded-xl border-2 ${
        active 
          ? "border-[#612D91] bg-gradient-to-br from-[#F5F3FF] to-[#EDE9FE] dark:from-[#612D91]/10 dark:to-[#A64AC9]/10" 
          : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-600"
      } shadow-sm overflow-hidden transition-all`}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className={`w-full px-4 py-3.5 flex items-center justify-between transition-colors ${
          active 
            ? "bg-gradient-to-r from-[#F5F3FF]/50 to-transparent hover:from-[#F5F3FF] hover:to-[#EDE9FE]" 
            : "hover:bg-gray-50 dark:hover:bg-gray-800"
        }`}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <motion.span
            animate={{
              scale: active ? [1, 1.05, 1] : 1,
            }}
            transition={{
              duration: 0.5,
              repeat: active ? Infinity : 0,
              repeatDelay: 2,
            }}
            className={`text-xs font-mono px-2.5 py-1 rounded-md font-semibold shrink-0 ${
              active
                ? "bg-[#612D91] text-white shadow-md"
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
            }`}
          >
            {sop.id}
          </motion.span>
          <div className="flex-1 min-w-0">
            <div className={`text-sm font-medium truncate ${active ? "text-[#612D91] dark:text-[#A64AC9]" : "text-gray-900 dark:text-gray-100"}`}>
              {highlightText(sop.title, searchQuery)}
            </div>
            {sop.page && (
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {sop.page}
              </div>
            )}
          </div>
          {active && (
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
              className="shrink-0"
            >
              <Sparkles className="w-4 h-4 text-[#612D91]" />
            </motion.div>
          )}
        </div>
        <ChevronDown 
          className={`w-4 h-4 transition-transform duration-200 shrink-0 ml-2 ${
            open ? "rotate-180" : ""
          } ${active ? "text-[#612D91]" : "text-gray-400"}`} 
        />
      </button>
      
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ 
              duration: 0.2,
              ease: "easeInOut"
            }}
            className="overflow-hidden"
          >
            <div className={`px-4 pb-4 pt-2 space-y-3 ${
              active 
                ? "text-[#4B2E83] dark:text-[#A64AC9] bg-white/50 dark:bg-gray-900/50" 
                : "text-gray-600 dark:text-gray-300"
            }`}>
              <div className="text-xs leading-relaxed">
                {highlightText(sop.text, searchQuery)}
              </div>
              
              {/* Open PDF Viewer Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenViewer?.(sop.id, sop.scenario || null, claimStatus, null);
                }}
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-semibold bg-gradient-to-r from-[#612D91] to-[#A64AC9] text-white rounded-lg hover:from-[#512579] hover:to-[#8B3AA8] transition-all shadow-md hover:shadow-lg"
              >
                <FileText className="w-3.5 h-3.5" />
                Open Full SOP Document
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
              
              {/* Step Navigation */}
              {sop.text && sop.text.includes('\n\n') && (
                <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Quick Steps:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {sop.text.split('\n\n').map((step, idx) => (
                      <button
                        key={idx}
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenViewer?.(sop.id, sop.scenario || null, claimStatus, idx);
                        }}
                        className="px-2.5 py-1.5 text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors font-medium"
                      >
                        Step {idx + 1}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function SOPReferencePanel({ activeRefs = [], claim, isOpen = false, onClose, itemLabel = "item" }) {
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerSopId, setViewerSopId] = useState(null);
  const [viewerScenario, setViewerScenario] = useState(null);
  const [viewerStepIndex, setViewerStepIndex] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [width, setWidth] = useState(400); // Default width

  const activeIds = activeRefs;
  const claimStatus = claim?.status;
  const scenario = claim?.scenario;

  // Extract scenario SOPs from document references (e.g., "Page 9", "Page 11")
  const scenarioSOPs = useMemo(() => {
    return getSOPsFromReferences(activeIds);
  }, [activeIds]);

  const handleOpenViewer = (sopId, sopScenario, status, stepIndex) => {
    setViewerSopId(sopId);
    setViewerScenario(sopScenario || scenario);
    setViewerStepIndex(stepIndex);
    setViewerOpen(true);
  };

  // Combine default SOPs with scenario SOPs
  const allSOPs = useMemo(() => {
    const combined = [...scenarioSOPs];
    
    // Add default SOPs that aren't already in scenario SOPs
    DEFAULT_SOPS.forEach(defaultSOP => {
      if (!combined.find(s => s.id === defaultSOP.id)) {
        combined.push(defaultSOP);
      }
    });
    
    return combined;
  }, [scenarioSOPs]);

  // Filter SOPs by search query
  const filteredSOPs = useMemo(() => {
    if (!searchQuery) return allSOPs;
    const query = searchQuery.toLowerCase();
    return allSOPs.filter(sop => 
      sop.title.toLowerCase().includes(query) ||
      sop.text.toLowerCase().includes(query) ||
      sop.id.toLowerCase().includes(query) ||
      (sop.page && sop.page.toLowerCase().includes(query))
    );
  }, [allSOPs, searchQuery]);

  // Check if an SOP ID matches any active reference
  const isActive = (sopId) => {
    // Check if it's a direct match
    if (activeIds.includes(sopId)) return true;
    
    // Check if it's a scenario SOP and the reference matches its page
    const scenarioSOP = SCENARIO_SOPS[sopId];
    if (scenarioSOP && scenarioSOP.page) {
      const pageNumber = scenarioSOP.page.replace("Page ", "").replace("page ", "");
      return activeIds.some(ref => ref.includes(pageNumber));
    }
    
    return false;
  };

  // Resize handler
  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e) => {
      const newWidth = window.innerWidth - e.clientX;
      if (newWidth >= 300 && newWidth <= 800) {
        setWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  if (!isOpen) return null;

  return (
    <>
      {/* Resizable Sidebar */}
      <motion.aside
        initial={{ width: 0, opacity: 0 }}
        animate={{ width: width, opacity: 1 }}
        exit={{ width: 0, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="relative bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 shadow-xl flex flex-col h-full shrink-0"
        style={{ width: `${width}px`, minWidth: `${width}px` }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#612D91] to-[#A64AC9] text-white px-4 py-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5" />
            <div>
              <div className="font-semibold text-sm">SOP Reference</div>
              {activeIds.length > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-xs text-white/80 mt-0.5"
                >
                  {activeIds.length} active {activeIds.length === 1 ? 'reference' : 'references'}
                </motion.div>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
            title="Close panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search SOPs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#612D91]/50 dark:focus:ring-[#A64AC9]/50"
            />
          </div>
        </div>

        {/* SOPs list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredSOPs.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium">
                {searchQuery ? "No SOPs match your search" : "No SOPs referenced yet"}
              </p>
              <p className="text-xs mt-1.5">
                {searchQuery 
                  ? "Try a different search term" 
                  : `SOPs will appear here as AI analyzes the ${itemLabel}`}
              </p>
            </div>
          ) : (
            filteredSOPs.map((s, index) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
              >
                <SOPRow 
                  sop={s} 
                  active={isActive(s.id)} 
                  onOpenViewer={handleOpenViewer}
                  claimStatus={claimStatus}
                  scenario={scenario}
                  searchQuery={searchQuery}
                />
              </motion.div>
            ))
          )}
        </div>

        {/* Resize Handle */}
        <div
          onMouseDown={() => setIsResizing(true)}
          className="absolute left-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-[#612D91]/30 transition-colors group"
          title="Drag to resize"
        >
          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-12 bg-[#612D91] rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </motion.aside>

      {/* SOP PDF Viewer Modal */}
      <AnimatePresence>
        {viewerOpen && (
          <SOPViewer
            sopId={viewerSopId}
            stepIndex={viewerStepIndex}
            scenario={viewerScenario}
            claimStatus={claimStatus}
            onClose={() => {
              setViewerOpen(false);
              setViewerSopId(null);
              setViewerScenario(null);
              setViewerStepIndex(null);
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}
