import { ChevronDown, Sparkles, FileText, ExternalLink, X } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SCENARIO_SOPS } from "../data/sops";
import SOPViewer from "./SOPViewer";

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

function Row({ s, active, onOpenViewer, claimStatus, scenario }) {
  const [open, setOpen] = useState(active);

  // Auto-expand when highlighted
  useEffect(() => {
    if (active) {
      setOpen(true);
    }
  }, [active]);

  return (
    <motion.div
      initial={false}
      animate={{
        borderColor: active ? "#612D91" : undefined,
        boxShadow: active 
          ? "0 0 0 3px rgba(97, 45, 145, 0.1), 0 4px 6px -1px rgba(97, 45, 145, 0.1)" 
          : undefined,
      }}
      transition={{ duration: 0.3 }}
      className={`rounded-lg border-2 ${
        active 
          ? "border-[#612D91] bg-gradient-to-br from-[#F5F3FF] to-[#EDE9FE]" 
          : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
      } shadow-sm overflow-hidden`}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className={`w-full px-4 py-3 flex items-center justify-between transition-colors ${
          active 
            ? "bg-gradient-to-r from-[#F5F3FF]/50 to-transparent hover:from-[#F5F3FF] hover:to-[#EDE9FE]" 
            : "hover:bg-gray-50 dark:hover:bg-gray-800"
        }`}
      >
        <div className="flex items-center gap-3 text-sm">
          <motion.span
            animate={{
              scale: active ? [1, 1.1, 1] : 1,
            }}
            transition={{
              duration: 0.5,
              repeat: active ? Infinity : 0,
              repeatDelay: 2,
            }}
            className={`text-xs font-mono px-2.5 py-1 rounded-md font-semibold ${
              active
                ? "bg-[#612D91] text-white shadow-md"
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
            }`}
          >
            {s.id}
          </motion.span>
          <span className={active ? "font-semibold text-[#612D91] dark:text-[#A64AC9]" : ""}>
            {s.title}
          </span>
          {active && (
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
            >
              <Sparkles className="w-4 h-4 text-[#612D91]" />
            </motion.div>
          )}
        </div>
        <ChevronDown 
          className={`w-4 h-4 transition-transform duration-300 ${
            open ? "rotate-180" : ""
          } ${active ? "text-[#612D91]" : ""}`} 
        />
      </button>
      
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ 
              duration: 0.3,
              ease: "easeInOut"
            }}
            className="overflow-hidden"
          >
            <div className={`px-4 pb-4 pt-2 space-y-3 ${
              active 
                ? "text-[#4B2E83] dark:text-[#A64AC9] bg-white/50" 
                : "text-gray-600 dark:text-gray-300"
            }`}>
              <div className="text-xs leading-relaxed">
                {s.text}
              </div>
              
              {/* Open PDF Viewer Button */}
              <button
                onClick={() => onOpenViewer?.(s.id, s.scenario || null, claimStatus, null)}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium bg-[#612D91] text-white rounded-md hover:bg-[#512579] transition-colors"
              >
                <FileText className="w-3.5 h-3.5" />
                Open Full SOP Document
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
              
              {/* Step Navigation */}
              {s.text && s.text.includes('\n\n') && (
                <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Steps:</p>
                  <div className="flex flex-wrap gap-1">
                    {s.text.split('\n\n').map((step, idx) => (
                      <button
                        key={idx}
                        onClick={() => onOpenViewer?.(s.id, s.scenario || null, claimStatus, idx)}
                        className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
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

export default function SOPReferencePanel({ activeRefs = [], claim, isOpen = false, onClose }) {
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerSopId, setViewerSopId] = useState(null);
  const [viewerScenario, setViewerScenario] = useState(null);
  const [viewerStepIndex, setViewerStepIndex] = useState(null);

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

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 z-40"
          />
          
          {/* Drawer */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-96 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 shadow-2xl z-50 flex flex-col"
          >
            {/* Header with close button */}
            <div className="bg-gradient-to-r from-[#612D91] to-[#A64AC9] text-white px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span className="font-semibold">SOP Reference</span>
                {activeIds.length > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-xs bg-white/20 px-2 py-0.5 rounded-full"
                  >
                    {activeIds.length}
                  </motion.span>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-1 hover:bg-white/10 rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* SOPs list */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {allSOPs.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
                  <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No SOPs referenced yet</p>
                  <p className="text-xs mt-1">SOPs will appear here as AI analyzes the claim</p>
                </div>
              ) : (
                allSOPs.map((s, index) => (
                  <motion.div
                    key={s.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Row 
                      s={s} 
                      active={isActive(s.id)} 
                      onOpenViewer={handleOpenViewer}
                      claimStatus={claimStatus}
                      scenario={scenario}
                    />
                  </motion.div>
                ))
              )}
            </div>

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
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
