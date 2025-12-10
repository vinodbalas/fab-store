import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Plus, Rocket, Code, Sparkles, Edit, Trash2, Eye, Copy } from "lucide-react";
import { useAuth } from "../auth/AuthContext";

export default function MySpace({ onLaunchBuilder, onEditApp, onViewApp }) {
  const { user } = useAuth();
  const [filter, setFilter] = useState("all"); // "all", "published", "workspace"

  // Load user's apps from localStorage (in real app, this would be from backend)
  const [userApps, setUserApps] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("fabStore.userApps");
      return stored ? JSON.parse(stored) : [];
    }
    return [];
  });

  const filteredApps = useMemo(() => {
    if (filter === "all") return userApps;
    if (filter === "published") return userApps.filter((app) => app.status === "Published");
    if (filter === "workspace") return userApps.filter((app) => app.status === "Workspace");
    return userApps;
  }, [userApps, filter]);

  const publishedCount = userApps.filter((app) => app.status === "Published").length;
  const workspaceCount = userApps.filter((app) => app.status === "Workspace").length;

  const handleDeleteApp = (appId) => {
    if (confirm("Are you sure you want to delete this app?")) {
      const updated = userApps.filter((app) => app.id !== appId);
      setUserApps(updated);
      if (typeof window !== "undefined") {
        localStorage.setItem("fabStore.userApps", JSON.stringify(updated));
      }
    }
  };

  return (
    <div className="px-4 md:px-10 py-8">
      <div className="rounded-[32px] bg-white/95 border border-white/40 shadow-[0_45px_85px_rgba(15,10,45,0.15)] p-6 md:p-10 space-y-6 backdrop-blur">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.35em] text-[#5C36C8]">My Space</div>
            <h1 className="text-3xl font-bold text-gray-900 mt-2">Your Applications</h1>
            <p className="text-sm text-gray-600 mt-1">
              Manage your published solutions and apps under development
            </p>
          </div>
          <button
            onClick={onLaunchBuilder}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#612D91] to-[#A64AC9] text-white font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            <Plus className="w-5 h-5" />
            Create New App
          </button>
        </div>

        {/* Stats & Filters */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100">
            <Rocket className="w-4 h-4 text-emerald-600" />
            <span className="text-sm font-semibold text-gray-700">
              {publishedCount} Published
            </span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100">
            <Code className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-semibold text-gray-700">
              {workspaceCount} In Development
            </span>
          </div>
          <div className="ml-auto flex gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === "all"
                  ? "bg-[#612D91] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter("published")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === "published"
                  ? "bg-[#612D91] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Published
            </button>
            <button
              onClick={() => setFilter("workspace")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === "workspace"
                  ? "bg-[#612D91] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              In Development
            </button>
          </div>
        </div>

        {/* Apps Grid */}
        {filteredApps.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#612D91] to-[#A64AC9] mb-4">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {filter === "all" ? "No apps yet" : filter === "published" ? "No published apps" : "No apps in development"}
            </h3>
            <p className="text-gray-600 mb-6">
              {filter === "all"
                ? "Create your first app using the AI-powered builder"
                : filter === "published"
                ? "Publish an app to see it here"
                : "Start building an app to see it here"}
            </p>
            {filter === "all" && (
              <button
                onClick={onLaunchBuilder}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#612D91] to-[#A64AC9] text-white font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                <Plus className="w-5 h-5" />
                Create Your First App
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredApps.map((app) => (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-gray-200 bg-white p-6 hover:shadow-lg transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-gray-900">{app.name}</h3>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          app.status === "Published"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {app.status === "Published" ? (
                          <>
                            <Rocket className="w-3 h-3 inline mr-1" />
                            Published
                          </>
                        ) : (
                          <>
                            <Code className="w-3 h-3 inline mr-1" />
                            In Development
                          </>
                        )}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{app.tagline || app.description}</p>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="font-medium">Platform:</span>
                    <span>{app.platformName || "SOP Executor"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="font-medium">Industry:</span>
                    <span>{app.industry || "Cross-Industry"}</span>
                  </div>
                  {app.lastModified && (
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span className="font-medium">Last modified:</span>
                      <span>{new Date(app.lastModified).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                  {app.status === "Workspace" ? (
                    <>
                      <button
                        onClick={() => onEditApp?.(app)}
                        className="flex-1 px-3 py-2 rounded-lg bg-[#612D91] text-white text-sm font-medium hover:bg-[#5B2E90] transition-colors"
                      >
                        <Edit className="w-4 h-4 inline mr-1" />
                        Continue Building
                      </button>
                      <button
                        onClick={() => onViewApp?.(app)}
                        className="px-3 py-2 rounded-lg border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
                        title="Preview"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => onViewApp?.(app)}
                        className="flex-1 px-3 py-2 rounded-lg bg-[#612D91] text-white text-sm font-medium hover:bg-[#5B2E90] transition-colors"
                      >
                        <Eye className="w-4 h-4 inline mr-1" />
                        View in Store
                      </button>
                      <button
                        onClick={() => onEditApp?.(app)}
                        className="px-3 py-2 rounded-lg border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => handleDeleteApp(app.id)}
                    className="px-3 py-2 rounded-lg border border-red-200 text-red-700 text-sm font-medium hover:bg-red-50 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

