/**
 * AI Watchtower Hub - Complete Interface
 * 
 * Wrapper component that combines UnifiedAIConsole with Reference Panel
 * Similar to AIHub but platform-agnostic
 */

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import UnifiedAIConsole from "./UnifiedAIConsole";
import ReferencePanel from "./ReferencePanel";

export default function AIWatchtowerHub({
  provider,
  itemId,
  item = null,
  contextBar: ContextBar,
  referencePanelType = "sop", // "sop", "asset", "inventory"
}) {
  const [referenceOpen, setReferenceOpen] = useState(false);
  const [activeReferences, setActiveReferences] = useState([]);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerItem, setViewerItem] = useState(null);

  const handleReferenceView = async (referenceId, referenceType) => {
    if (!provider) return;

    const reference = await provider.getReferenceById(referenceId, referenceType);
    if (reference) {
      setViewerItem({ ...reference, type: referenceType });
      setViewerOpen(true);
    }
  };

  const handleReferenceSelect = (references) => {
    setActiveReferences(references || []);
    if (references && references.length > 0) {
      setReferenceOpen(true);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-gray-50 dark:bg-gray-950">
      {/* Context Bar */}
      {ContextBar && (
        <ContextBar
          item={item}
          onToggleReference={() => setReferenceOpen((v) => !v)}
          referenceOpen={referenceOpen}
        />
      )}

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* AI Console */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <UnifiedAIConsole
            provider={provider}
            itemId={itemId}
            item={item}
            onReferenceView={handleReferenceView}
            onReferenceSelect={handleReferenceSelect}
          />
        </div>

        {/* Reference Panel */}
        <ReferencePanel
          provider={provider}
          item={item}
          references={activeReferences}
          isOpen={referenceOpen}
          onClose={() => setReferenceOpen(false)}
          onView={handleReferenceView}
          type={referencePanelType}
        />
      </div>

      {/* Reference Viewer Modal */}
      {viewerOpen && viewerItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{viewerItem.name || viewerItem.id}</h3>
              <button
                onClick={() => setViewerOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="text-sm text-gray-700">
              <pre className="whitespace-pre-wrap">{JSON.stringify(viewerItem, null, 2)}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

