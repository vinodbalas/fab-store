import { useState } from "react";
import ClaimContextBar from "./ClaimContextBar";
import UnifiedAIConsole from "./UnifiedAIConsole";
import SOPReferencePanel from "./SOPReferencePanel";

export default function AIHub({ claim, onBack }) {
  const [sopOpen, setSopOpen] = useState(false);     // Start collapsed
  const [activeRefs, setActiveRefs] = useState([]); // e.g., ["3.2.1"]

  return (
    <div className="flex flex-col h-full overflow-hidden bg-gray-50 dark:bg-gray-950">
      {/* Top context bar */}
      <ClaimContextBar
        claim={claim}
        onBack={onBack}
        onToggleSop={() => setSopOpen((v) => !v)}
        sopOpen={sopOpen}
      />
      
      {/* Main content area with SOP drawer on right */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Main console - takes full width when SOP closed */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <UnifiedAIConsole
            claim={claim}
            claimId={claim?.id}
            onSOPView={() => setSopOpen(true)}
            onSOPReference={setActiveRefs}
          />
        </div>

        {/* SOP Reference Panel - Right side drawer (overlays when open) */}
        <SOPReferencePanel
          claim={claim}
          activeRefs={activeRefs}
          isOpen={sopOpen}
          onClose={() => setSopOpen(false)}
        />
      </div>
    </div>
  );
}
