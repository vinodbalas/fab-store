import { Sparkles, Store } from "lucide-react";

export default function FabStoreEntry() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B0B1F] via-[#1B1040] to-[#4C1D95] text-white flex items-center justify-center px-6 py-10">
      <div className="max-w-4xl w-full space-y-10 text-center">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-sm font-semibold tracking-wide uppercase">
            <Sparkles className="w-4 h-4 text-amber-300" />
            FAB Store Preview
          </div>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight">
            Discover every TP.ai solution in one curated marketplace.
          </h1>
          <p className="text-base md:text-lg text-white/80 max-w-3xl mx-auto">
            We’re elevating the Cogniclaim login into the new FAB Store experience. This will soon be the central hub
            for apps like Assist, Collect, Banking, Cogniclaim, and more. Legacy access is temporarily hidden while we
            stage the store experience.
          </p>
        </div>

        <div className="bg-white/10 border border-white/20 rounded-3xl p-6 md:p-10 backdrop-blur">
          <div className="flex flex-col md:flex-row items-center justify-center gap-6">
            <div className="p-4 rounded-2xl bg-white/10">
              <Store className="w-12 h-12 text-amber-200" />
            </div>
            <div className="text-left max-w-xl">
              <h2 className="text-2xl font-semibold mb-2">What’s coming?</h2>
              <ul className="text-white/80 text-sm md:text-base space-y-1 list-disc list-inside">
                <li>FAB Store home with featured apps and categories.</li>
                <li>Dedicated cards for Assist, Collect, Banking, Cogniclaim, and upcoming TP.ai launches.</li>
                <li>Deep links into each solution plus roadmap visibility.</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="text-sm text-white/70">
          Need the legacy Cogniclaim login? Flip the feature flag in <code className="font-mono">App.jsx</code> to
          re-enable it temporarily while we finish the FAB Store entry point.
        </div>
      </div>
    </div>
  );
}

