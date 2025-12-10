import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import ClaimContextBar from "./ClaimContextBar";
import UnifiedAIConsole from "./UnifiedAIConsole";
import SOPReferencePanel from "./SOPReferencePanel";
import { SOPViewer } from "./platformComponents";

export default function AIHub({ claim, onBack }) {
  // Start with SOP panel closed; user can open when needed
  const [sopOpen, setSopOpen] = useState(false);
  const [activeRefs, setActiveRefs] = useState([]); // e.g., ["3.2.1"]
  
  // SOP Viewer state
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerSopId, setViewerSopId] = useState(null);
  const [viewerScenario, setViewerScenario] = useState(null);
  const [viewerStepIndex, setViewerStepIndex] = useState(null);

  const handleSOPView = (sopId, scenario, claimStatus, stepIndex) => {
    setViewerSopId(sopId);
    setViewerScenario(scenario || claim?.scenario);
    setViewerStepIndex(stepIndex);
    setViewerOpen(true);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-gray-50 dark:bg-gray-950">
      {/* Top context bar */}
      <ClaimContextBar
        claim={claim}
        onBack={onBack}
        onToggleSop={() => setSopOpen((v) => !v)}
        sopOpen={sopOpen}
      />
      
      {/* Main content area with SOP sidebar on right */}
      <div className="flex flex-1 overflow-hidden">
        {/* Main console - flexes to fill available space */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <UnifiedAIConsole
            claim={claim}
            claimId={claim?.id}
            onSOPView={handleSOPView}
            onSOPReference={setActiveRefs}
          />
        </div>

        {/* SOP Reference Panel - Resizable sidebar */}
        <SOPReferencePanel
          claim={claim}
          activeRefs={activeRefs}
          isOpen={sopOpen}
          onClose={() => setSopOpen(false)}
          itemLabel="claim"
        />
      </div>

      {/* SOP Document Viewer Modal */}
      <AnimatePresence>
        {viewerOpen && (
          <SOPViewer
            sopId={viewerSopId}
            stepIndex={viewerStepIndex}
            scenario={viewerScenario}
            claimStatus={claim?.status}
            onClose={() => {
              setViewerOpen(false);
              setViewerSopId(null);
              setViewerScenario(null);
              setViewerStepIndex(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
