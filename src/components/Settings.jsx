import { useDemoMode } from "../contexts/DemoModeContext";
import { useAuth } from "../auth/AuthContext";

export default function Settings() {
  const { isDemoMode, toggleDemoMode } = useDemoMode();
  const { login, logout, isAuthenticated } = useAuth();

  return (
    <div className="p-6 space-y-6">
      <header>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Settings</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Lightweight controls for the recovery build. Replace with the full panel once available.
        </p>
      </header>

      <section className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/60 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900 dark:text-white">Demo mode</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Toggles demo labels and mock data.</p>
          </div>
          <button
            type="button"
            onClick={toggleDemoMode}
            className={`px-4 py-2 rounded-full text-sm font-semibold ${
              isDemoMode ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-700"
            }`}
          >
            {isDemoMode ? "Enabled" : "Disabled"}
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900 dark:text-white">Authentication state</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Fake sign-in/out to preview the FAB Store flow.
            </p>
          </div>
          <button
            type="button"
            onClick={() => (isAuthenticated ? logout() : login())}
            className="px-4 py-2 rounded-full text-sm font-semibold bg-[#612D91] text-white"
          >
            {isAuthenticated ? "Sign out" : "Sign in"}
          </button>
        </div>
      </section>
    </div>
  );
}

