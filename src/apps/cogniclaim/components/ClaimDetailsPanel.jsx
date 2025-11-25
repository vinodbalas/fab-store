import { useEffect, useState } from "react";
import Tabs from "./Tabs";
import { SOP_INDEX } from "../data/sops";

export default function ClaimDetailsPanel({ claim, onClose }) {
  // --- Mock AI generation ---
  const [insights, setInsights] = useState({ loading: true, text: "", confidence: null, ref: "" });

  useEffect(() => {
    if (!claim) return;
    setInsights({ loading: true, text: "", confidence: null, ref: "" });
    const timer = setTimeout(() => {
      // Simple deterministic mock based on status
      const sop = SOP_INDEX[claim.status];
      const text =
        claim.status === "Information Needed"
          ? `Likely blocker: Missing documentation from provider.\nNext step: Trigger provider info request and set 48h follow-up.\nWhy: SOP "${sop?.title}" step 1–2.`
          : claim.status === "Pending Review"
          ? `Likely blocker: Auth/coding verification.\nNext step: Validate pre-auth and code modifiers; if missing, request resubmission.\nWhy: SOP "${sop?.title}" step 1–3.`
          : claim.status === "Under Process"
          ? `Likely blocker: Awaiting adjudication checks.\nNext step: Run policy-limit validation and prepare summary for approver.\nWhy: SOP "${sop?.title}" step 1 & 3.`
          : `Escalation in effect.\nNext step: Ensure complete artifacts and route to L2 clinical reviewer.\nWhy: SOP "${sop?.title}" step 1–2.`;
      setInsights({
        loading: false,
        text,
        confidence: 0.88,
        ref: sop?.link || "#"
      });
    }, 600); // quick “AI thinking” feel
    return () => clearTimeout(timer);
  }, [claim]);

  if (!claim) return null;

  const sop = SOP_INDEX[claim.status];

  const DetailsTab = (
    <div className="space-y-3 text-sm">
      <div className="grid grid-cols-2 gap-3">
        <Field k="Claim ID" v={claim.id} />
        <Field k="Member" v={claim.member} />
        <Field k="Provider" v={claim.provider} />
        <Field k="Status" v={claim.status} />
        <Field k="Amount" v={`$${claim.amount.toLocaleString()}`} />
        <Field k="Date" v={claim.date} />
      </div>
      <details className="mt-2">
        <summary className="cursor-pointer underline">Raw JSON</summary>
        <pre className="mt-2 text-xs overflow-auto">{JSON.stringify(claim, null, 2)}</pre>
      </details>
    </div>
  );

  const AiTab = (
    <div className="text-sm">
      {insights.loading ? (
        <div className="animate-pulse space-y-2">
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
        </div>
      ) : (
        <div className="space-y-3">
          <p className="whitespace-pre-line">{insights.text}</p>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            Confidence: {(insights.confidence * 100).toFixed(0)}%
          </div>
          <a href={insights.ref} target="_blank" rel="noreferrer" className="text-xs underline text-[#612D91]">
            View SOP reference
          </a>
          <div className="pt-3">
            <button
              onClick={() => {
                // In the real app, this will POST to your backend to accept the recommendation
                alert("Action recorded (demo)");
              }}
              className="px-3 py-2 text-sm rounded-md text-white"
              style={{ backgroundColor: "#612D91" }}
            >
              Accept Recommendation
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const SopTab = (
    <div className="text-sm space-y-2">
      <div className="font-medium">{sop?.title || "SOP not found for this status"}</div>
      <ol className="list-decimal ml-5 space-y-1">
        {(sop?.steps || []).map((s, i) => <li key={i}>{s}</li>)}
      </ol>
      {sop?.link && (
        <a href={sop.link} target="_blank" rel="noreferrer" className="underline text-[#612D91] text-xs">
          Open full SOP
        </a>
      )}
    </div>
  );

  return (
    <div className="h-full">
      {/* Title bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <div>
          <div className="text-sm opacity-70">Claim</div>
          <div className="text-lg font-semibold">{claim.id}</div>
        </div>
        <button
          onClick={onClose}
          className="px-3 py-1 rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 text-sm"
        >
          Close
        </button>
      </div>

      {/* Tabs */}
      <Tabs
        initial={0}
        tabs={[
          { label: "Details",    content: DetailsTab },
          { label: "AI Insights",content: AiTab },
          { label: "SOP",        content: SopTab },
        ]}
      />
    </div>
  );
}

function Field({ k, v }) {
  return (
    <div>
      <div className="text-xs uppercase opacity-60">{k}</div>
      <div className="font-medium">{v}</div>
    </div>
  );
}
