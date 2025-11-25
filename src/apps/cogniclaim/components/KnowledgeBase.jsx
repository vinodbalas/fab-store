import { useState, useMemo, useEffect } from "react";
import { Search, BookOpen, FileText, MapPin, Tag, ChevronRight, X, Grid, List as ListIcon, Brain, Sparkles, Store } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SCENARIO_SOPS, SOP_INDEX, getAllHealthcareSOPs } from "../data/sops";
import { aiAPI } from "../services/api";
import SOPViewer from "./SOPViewer";

/**
 * Knowledge Base Component
 * Displays all SOPs in a searchable, filterable interface
 */
export default function KnowledgeBase({ onNavigate }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedState, setSelectedState] = useState("All");
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'list'
  const [selectedSOP, setSelectedSOP] = useState(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [useSemanticSearch, setUseSemanticSearch] = useState(false);
  const [semanticResults, setSemanticResults] = useState([]);
  const [loadingSemantic, setLoadingSemantic] = useState(false);
  const [contextualSuggestions, setContextualSuggestions] = useState([]);

  // Get all SOPs
  const allSOPs = useMemo(() => {
    const sops = [];
    
    // Add scenario SOPs
    Object.entries(SCENARIO_SOPS).forEach(([key, sop]) => {
      sops.push({
        ...sop,
        id: key,
        source: "scenario",
        key,
      });
    });
    
    // Add healthcare SOPs
    const healthcareSOPs = getAllHealthcareSOPs();
    if (healthcareSOPs) {
      Object.entries(healthcareSOPs).forEach(([key, sop]) => {
        sops.push({
          ...sop,
          id: sop.id || key,
          source: "healthcare",
          key,
        });
      });
    }
    
    // Add status SOPs
    Object.entries(SOP_INDEX).forEach(([key, sop]) => {
      sops.push({
        ...sop,
        id: key,
        source: "status",
        key,
      });
    });
    
    return sops;
  }, []);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(["All"]);
    allSOPs.forEach(sop => {
      if (sop.category) cats.add(sop.category);
    });
    return Array.from(cats).sort();
  }, [allSOPs]);

  // Get unique states
  const states = useMemo(() => {
    const stateSet = new Set(["All"]);
    allSOPs.forEach(sop => {
      if (sop.state) {
        if (sop.state === "All") stateSet.add("All");
        else stateSet.add(sop.state);
      }
    });
    return Array.from(stateSet).sort();
  }, [allSOPs]);

  // Filter SOPs
  const filteredSOPs = useMemo(() => {
    return allSOPs.filter(sop => {
      // Search filter
      const matchesSearch = !searchTerm || 
        sop.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sop.steps?.some(step => step.toLowerCase().includes(searchTerm.toLowerCase())) ||
        sop.fullContent?.introduction?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sop.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sop.denialCodes?.some(dc => dc.code?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                   dc.description?.toLowerCase().includes(searchTerm.toLowerCase()));

      // Category filter
      const matchesCategory = selectedCategory === "All" || sop.category === selectedCategory;

      // State filter
      const matchesState = selectedState === "All" || 
        sop.state === selectedState || 
        sop.state === "All";

      return matchesSearch && matchesCategory && matchesState;
    });
  }, [allSOPs, searchTerm, selectedCategory, selectedState]);

  // Handle SOP click
  const handleSOPClick = (sop) => {
    setSelectedSOP(sop);
    setViewerOpen(true);
  };

  // Close viewer
  const handleCloseViewer = () => {
    setViewerOpen(false);
    setSelectedSOP(null);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("All");
    setSelectedState("All");
  };

  const hasActiveFilters = searchTerm || selectedCategory !== "All" || selectedState !== "All";

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">
              Knowledge Base
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Browse and search Standard Operating Procedures for claims processing
            </p>
          </div>
          {onNavigate && (
            <button
              onClick={() => onNavigate("store")}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-[#612D91] to-[#A64AC9] rounded-lg hover:shadow-lg transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <Store className="w-4 h-4" />
              Back to Store
            </button>
          )}
        </div>

        {/* Search, Filters, and View Controls in One Line */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Bar */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search SOPs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#612D91] dark:focus:ring-[#A64AC9] focus:border-transparent"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div className="w-40 sm:w-48">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#612D91] dark:focus:ring-[#A64AC9]"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* State Filter */}
          <div className="w-40 sm:w-48">
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#612D91] dark:focus:ring-[#A64AC9]"
            >
              {states.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>

          {/* Clear Filters Button (only show if filters are active) */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="px-3 py-2.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors whitespace-nowrap"
            >
              Clear
            </button>
          )}

          {/* View Mode Toggle */}
          <button
            onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
            className="p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors flex-shrink-0"
            title={viewMode === "grid" ? "Switch to list view" : "Switch to grid view"}
          >
            {viewMode === "grid" ? <ListIcon className="w-5 h-5" /> : <Grid className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Results Count */}
      <div className="px-6 py-3 bg-gray-100 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Showing <span className="font-semibold text-gray-900 dark:text-gray-100">{filteredSOPs.length}</span> of{" "}
          <span className="font-semibold text-gray-900 dark:text-gray-100">{allSOPs.length}</span> SOPs
        </p>
      </div>

      {/* SOPs List/Grid */}
      <div className="flex-1 overflow-y-auto p-6">
        {filteredSOPs.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No SOPs found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {hasActiveFilters 
                ? "Try adjusting your filters or search terms"
                : "No SOPs are available"}
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-[#612D91] dark:bg-[#A64AC9] text-white rounded-lg hover:bg-[#4B2E83] dark:hover:bg-[#8B3DA9] transition-colors"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSOPs.map((sop, index) => (
              <SOPCard key={sop.id || sop.key || index} sop={sop} onClick={() => handleSOPClick(sop)} />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredSOPs.map((sop, index) => (
              <SOPListItem key={sop.id || sop.key || index} sop={sop} onClick={() => handleSOPClick(sop)} />
            ))}
          </div>
        )}
      </div>

      {/* SOP Viewer Modal */}
      <AnimatePresence>
        {viewerOpen && selectedSOP && (
          <SOPViewer
            sopId={selectedSOP.source === "scenario" ? selectedSOP.key : (selectedSOP.id || selectedSOP.key)}
            scenario={selectedSOP.source === "scenario" ? selectedSOP.key : null}
            onClose={handleCloseViewer}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * SOP Card Component (Grid View)
 */
function SOPCard({ sop, onClick }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      onClick={onClick}
      className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5 cursor-pointer hover:shadow-lg transition-all duration-200 hover:border-[#612D91] dark:hover:border-[#A64AC9]"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2">
            {sop.title || "Untitled SOP"}
          </h3>
          {sop.id && (
            <p className="text-xs text-gray-500 dark:text-gray-400 font-mono mb-2">
              {sop.id}
            </p>
          )}
        </div>
        <FileText className="w-5 h-5 text-[#612D91] dark:text-[#A64AC9] flex-shrink-0 ml-2" />
      </div>

      {sop.category && (
        <div className="flex items-center gap-2 mb-2">
          <Tag className="w-3 h-3 text-gray-400" />
          <span className="text-xs text-gray-600 dark:text-gray-400">{sop.category}</span>
        </div>
      )}

      {sop.state && (
        <div className="flex items-center gap-2 mb-3">
          <MapPin className="w-3 h-3 text-gray-400" />
          <span className="text-xs text-gray-600 dark:text-gray-400">{sop.state}</span>
        </div>
      )}

      {sop.fullContent?.introduction && (
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-3">
          {sop.fullContent.introduction}
        </p>
      )}

      {sop.steps && sop.steps.length > 0 && (
        <div className="mb-3">
          <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">
            {sop.steps.length} step{sop.steps.length > 1 ? "s" : ""}
          </p>
        </div>
      )}

      {sop.denialCodes && sop.denialCodes.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {sop.denialCodes.slice(0, 3).map((dc, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded"
            >
              {dc.code}
            </span>
          ))}
          {sop.denialCodes.length > 3 && (
            <span className="px-2 py-0.5 text-xs text-gray-500 dark:text-gray-400">
              +{sop.denialCodes.length - 3} more
            </span>
          )}
        </div>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
        <span className="text-xs text-gray-500 dark:text-gray-400">Click to view</span>
        <ChevronRight className="w-4 h-4 text-gray-400" />
      </div>
    </motion.div>
  );
}

/**
 * SOP List Item Component (List View)
 */
function SOPListItem({ sop, onClick }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      onClick={onClick}
      className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 cursor-pointer hover:shadow-md transition-all duration-200 hover:border-[#612D91] dark:hover:border-[#A64AC9]"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {sop.title || "Untitled SOP"}
            </h3>
            {sop.category && (
              <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                {sop.category}
              </span>
            )}
            {sop.state && sop.state !== "All" && (
              <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {sop.state}
              </span>
            )}
          </div>
          {sop.id && (
            <p className="text-xs text-gray-500 dark:text-gray-400 font-mono mb-2">
              {sop.id}
            </p>
          )}
          {sop.fullContent?.introduction && (
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
              {sop.fullContent.introduction}
            </p>
          )}
          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
            {sop.steps && (
              <span>{sop.steps.length} step{sop.steps.length > 1 ? "s" : ""}</span>
            )}
            {sop.denialCodes && sop.denialCodes.length > 0 && (
              <span>{sop.denialCodes.length} denial code{sop.denialCodes.length > 1 ? "s" : ""}</span>
            )}
            {sop.page && (
              <span>Page {sop.page.replace("Page ", "")}</span>
            )}
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 ml-4" />
      </div>
    </motion.div>
  );
}

