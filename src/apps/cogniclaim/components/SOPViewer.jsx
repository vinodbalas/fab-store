import { useState, useEffect, useRef } from "react";
import { X, ChevronLeft, ChevronRight, Search, BookOpen, FileText, ArrowUp, ArrowDown, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SCENARIO_SOPS, SOP_INDEX, getSOPByScenario, getSOPByStatus } from "../data/sops";

/**
 * SOP PDF Viewer Component
 * Displays SOP documents in a PDF-like viewer with step navigation and highlighting
 */
export default function SOPViewer({ sopId, stepIndex = null, onClose, claimStatus = null, scenario = null }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [highlightedStep, setHighlightedStep] = useState(stepIndex);
  const [searchTerm, setSearchTerm] = useState("");
  const stepRefs = useRef({});
  const viewerRef = useRef(null);

  // Get SOP data
  const getSOPData = () => {
    if (scenario) {
      return getSOPByScenario(scenario);
    } else if (claimStatus) {
      return getSOPByStatus(claimStatus);
    } else if (sopId) {
      // Try to find in scenario SOPs
      const scenarioSOP = SCENARIO_SOPS[sopId];
      if (scenarioSOP) return scenarioSOP;
      
      // Try to find in status SOPs
      const statusSOP = Object.values(SOP_INDEX).find(sop => 
        sop.title.toLowerCase().includes(sopId.toLowerCase())
      );
      if (statusSOP) return statusSOP;
    }
    return null;
  };

  const sopData = getSOPData();

  // Get full SOP document structure (simulating PDF pages)
  const getSOPDocument = () => {
    if (!sopData) return null;

    // Extract page number from document references
    const pageNumber = sopData.page && sopData.page !== "N/A" 
      ? parseInt(sopData.page.replace("Page ", "").replace("page ", "").split("-")[0]) 
      : 1;
    const hasMultiplePages = sopData.page && sopData.page.includes("-") && sopData.page !== "N/A";
    const pageRange = hasMultiplePages 
      ? sopData.page.split("-").map(p => parseInt(p.replace("Page ", "").replace("page ", "").trim()))
      : [pageNumber];
    
    // Build pages array
    const pages = [];
    
    // Page 1: Overview and steps
    pages.push({
      pageNumber: pageRange[0],
      content: {
        header: sopData.title,
        section: "Overview",
        introduction: sopData.fullContent?.introduction || `This Standard Operating Procedure applies to ${sopData.state === "All" ? "all states" : sopData.state} and outlines the process for ${sopData.title.toLowerCase()}.`,
        rationale: sopData.fullContent?.rationale || "Follow these steps carefully to ensure compliance with regulatory requirements and best practices.",
        requirements: sopData.fullContent?.requirements || [],
        paragraphs: [
          sopData.fullContent?.introduction || `This Standard Operating Procedure applies to ${sopData.state === "All" ? "all states" : sopData.state} and outlines the process for ${sopData.title.toLowerCase()}.`,
          sopData.fullContent?.rationale || "Follow these steps carefully to ensure compliance with regulatory requirements and best practices.",
        ],
        steps: sopData.steps.map((step, index) => ({
          stepNumber: index + 1,
          text: step,
          id: `step-${index + 1}`,
        })),
      },
    });
    
    // Additional pages for multi-page SOPs
    if (hasMultiplePages && pageRange.length > 1) {
      for (let i = 1; i < pageRange.length; i++) {
        pages.push({
          pageNumber: pageRange[i],
          content: {
            header: sopData.title,
            section: i === 1 ? "Detailed Procedures" : "Additional Requirements",
            paragraphs: [
              "Refer to the following additional requirements and compliance checks.",
              "Ensure all documentation is complete before proceeding to the next step.",
            ],
            steps: [],
          },
        });
      }
    }
    
    return {
      id: sopId || scenario || claimStatus,
      title: sopData.title,
      state: sopData.state || "All",
      pages,
      denialCodes: sopData.denialCodes || [],
      documentReferences: sopData.documentReferences || [],
      link: sopData.link,
    };
  };

  const document = getSOPDocument();

  // Update highlighted step when stepIndex prop changes
  useEffect(() => {
    if (stepIndex !== null && stepIndex !== undefined) {
      setHighlightedStep(stepIndex);
    }
  }, [stepIndex]);

  useEffect(() => {
    if (highlightedStep !== null && stepRefs.current[`step-${highlightedStep + 1}`]) {
      // Scroll to highlighted step
      const timeoutId = setTimeout(() => {
        stepRefs.current[`step-${highlightedStep + 1}`]?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 100);
      
      return () => clearTimeout(timeoutId);
    }
  }, [highlightedStep, document]);

  if (!document) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-900 rounded-lg p-6 max-w-md">
          <p className="text-gray-600 dark:text-gray-400">SOP not found</p>
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

  const currentPageData = document.pages.find(p => p.pageNumber === currentPage) || document.pages[0];
  const totalPages = document.pages.length;

  const navigateToStep = (stepNum) => {
    setHighlightedStep(stepNum - 1);
    // Ensure we're on the correct page that contains this step
    const targetPage = document.pages.find(p => 
      p.content.steps.some(s => s.stepNumber === stepNum)
    );
    if (targetPage) {
      setCurrentPage(targetPage.pageNumber);
    }
    
    // Scroll to step after page change
    setTimeout(() => {
      const stepElement = stepRefs.current[`step-${stepNum}`];
      if (stepElement) {
        stepElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }, 150);
  };

  // Initialize page to step's page when stepIndex is provided
  useEffect(() => {
    if (stepIndex !== null && document) {
      const stepNum = stepIndex + 1;
      const targetPage = document.pages.find(p => 
        p.content.steps.some(s => s.stepNumber === stepNum)
      );
      if (targetPage) {
        setCurrentPage(targetPage.pageNumber);
      }
    }
  }, [stepIndex, document]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-[#612D91] to-[#A64AC9] text-white">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5" />
            <div>
              <h2 className="font-semibold text-lg">{document.title}</h2>
              <p className="text-xs text-white/80">{document.state} • {document.pages.length} {document.pages.length === 1 ? 'page' : 'pages'}</p>
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
        <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-gray-600 dark:text-gray-400 px-3">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search steps..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-[#612D91]"
              />
            </div>
            {document.link && (
              <a
                href={document.link}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 text-sm bg-[#612D91] text-white rounded-md hover:bg-[#512579] transition-colors flex items-center gap-2"
              >
                <BookOpen className="w-4 h-4" />
                Open Full Document
              </a>
            )}
          </div>
        </div>

        {/* PDF-like Content Area */}
        <div 
          ref={viewerRef}
          className="flex-1 overflow-y-auto bg-gray-100 dark:bg-gray-950 p-8"
        >
          <div className="max-w-4xl mx-auto bg-white dark:bg-gray-900 shadow-lg rounded-lg p-8 min-h-full">
            {/* Page Content */}
            <div className="mb-8">
              {/* Header Section */}
              <div className="border-b-2 border-[#612D91] pb-4 mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {currentPageData.content.header}
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Page {currentPageData.pageNumber} • {document.state}
                </p>
              </div>

              {/* Section Title */}
              {currentPageData.content.section && (
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                  {currentPageData.content.section}
                </h2>
              )}

              {/* Introduction */}
              {currentPageData.content.introduction && (
                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded-r-lg">
                  <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-2">Introduction</h3>
                  <p className="text-sm text-blue-800 dark:text-blue-300 leading-relaxed">
                    {currentPageData.content.introduction}
                  </p>
                </div>
              )}

              {/* Rationale */}
              {currentPageData.content.rationale && (
                <div className="mb-6 p-4 bg-purple-50 dark:bg-purple-900/20 border-l-4 border-purple-500 rounded-r-lg">
                  <h3 className="text-sm font-semibold text-purple-900 dark:text-purple-200 mb-2">Rationale</h3>
                  <p className="text-sm text-purple-800 dark:text-purple-300 leading-relaxed">
                    {currentPageData.content.rationale}
                  </p>
                </div>
              )}

              {/* Requirements */}
              {currentPageData.content.requirements && currentPageData.content.requirements.length > 0 && (
                <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-200 mb-3">Requirements</h3>
                  <ul className="list-disc list-inside space-y-2">
                    {currentPageData.content.requirements.map((req, idx) => (
                      <li key={idx} className="text-sm text-gray-700 dark:text-gray-300">
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Paragraphs */}
              {currentPageData.content.paragraphs.map((para, idx) => (
                <p key={idx} className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                  {para}
                </p>
              ))}

              {/* Steps */}
              {currentPageData.content.steps.length > 0 && (
                <div className="mt-6 space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-[#612D91]" />
                    Procedure Steps
                  </h3>
                  {currentPageData.content.steps
                    .filter(step => 
                      !searchTerm || 
                      step.text.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((step) => {
                      const isHighlighted = highlightedStep !== null && step.stepNumber === (highlightedStep + 1);
                      return (
                        <div
                          key={step.stepNumber}
                          ref={(el) => {
                            if (el) stepRefs.current[step.id] = el;
                          }}
                          className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                            isHighlighted
                              ? "border-[#612D91] bg-[#F5F3FF] dark:bg-[#4B2E83]/30 shadow-lg ring-4 ring-[#612D91]/20"
                              : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600"
                          }`}
                          onClick={() => navigateToStep(step.stepNumber)}
                          title={isHighlighted ? "This step is highlighted" : "Click to highlight this step"}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                                isHighlighted
                                  ? "bg-[#612D91] text-white"
                                  : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                              }`}
                            >
                              {step.stepNumber}
                            </div>
                            <p
                              className={`flex-1 text-gray-800 dark:text-gray-200 leading-relaxed ${
                                isHighlighted ? "font-medium" : ""
                              }`}
                            >
                              {step.text}
                            </p>
                            {isHighlighted && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="text-[#612D91]"
                              >
                                <Sparkles className="w-5 h-5" />
                              </motion.div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}

              {/* Denial Codes Section */}
              {document.denialCodes && document.denialCodes.length > 0 && currentPage === 1 && (
                <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
                    Related Denial Codes
                  </h3>
                  <div className="space-y-2">
                    {document.denialCodes.map((dc, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="font-mono text-sm font-bold text-red-600 dark:text-red-400">
                          {dc.code}
                        </span>
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {dc.description}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Page Footer */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-8 text-center text-xs text-gray-500 dark:text-gray-400">
              {document.title} • Page {currentPageData.pageNumber} of {totalPages}
            </div>
          </div>
        </div>

        {/* Step Navigation Sidebar */}
        {document.pages.some(p => p.content.steps.length > 0) && (
          <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-6 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <span>Quick Navigation:</span>
                <div className="flex items-center gap-1">
                  {document.pages.flatMap(page => page.content.steps).map((step) => (
                    <button
                      key={step.stepNumber}
                      onClick={() => navigateToStep(step.stepNumber)}
                      className={`px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                        highlightedStep !== null && step.stepNumber === highlightedStep + 1
                          ? "bg-[#612D91] text-white"
                          : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                      }`}
                    >
                      Step {step.stepNumber}
                    </button>
                  ))}
                </div>
              </div>
              <button
                onClick={() => {
                  if (highlightedStep !== null) {
                    const totalSteps = document.pages.reduce((sum, p) => sum + p.content.steps.length, 0);
                    const nextStep = (highlightedStep + 1) % totalSteps;
                    navigateToStep(nextStep + 1);
                  } else if (document.pages[0].content.steps.length > 0) {
                    navigateToStep(1);
                  }
                }}
                className="px-3 py-1.5 text-sm bg-[#612D91] text-white rounded-md hover:bg-[#512579] transition-colors flex items-center gap-2"
              >
                <ArrowDown className="w-4 h-4" />
                Next Step
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

