import { useEffect, useState } from "react";
import Tabs from "../../cogniclaim/components/Tabs";
import { SOP_INDEX } from "../data/sops";
import DeadlineTracker from "./DeadlineTracker";

const Field = ({ k, v }) => (
  <div>
    <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-0.5">{k}</div>
    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{v || "N/A"}</div>
  </div>
);

export default function CaseDetailsPanel({ caseData, onClose }) {
  const [insights, setInsights] = useState({ loading: true, text: "", confidence: null, ref: "" });
  const [activeLineItem, setActiveLineItem] = useState(null);

  useEffect(() => {
    if (!caseData) return;
    setInsights({ loading: true, text: "", confidence: null, ref: "" });
    const timer = setTimeout(() => {
      const sop = SOP_INDEX[caseData.status];
      const text =
        caseData.status === "Filed"
          ? `Case filed successfully. Next step: Verify all documentation and route to investigation team.\nWhy: SOP "${sop?.title}" step 1–2.`
          : caseData.status === "Under Investigation"
          ? `Investigation in progress. Next step: Complete review within 30 days per regulatory requirements.\nWhy: SOP "${sop?.title}" step 2–4.`
          : caseData.status === "Awaiting Response"
          ? `Awaiting complainant response. Next step: Follow up if no response within deadline.\nWhy: SOP "${sop?.title}" step 3–4.`
          : caseData.status === "Resolved"
          ? `Case resolved. Next step: Document resolution and notify complainant.\nWhy: SOP "${sop?.title}" step 1–2.`
          : `Case escalated. Next step: Prepare for external review and notify complainant.\nWhy: SOP "${sop?.title}" step 1–3.`;
      setInsights({
        loading: false,
        text,
        confidence: 0.88,
        ref: sop?.link || "#"
      });
    }, 600);
    return () => clearTimeout(timer);
  }, [caseData]);

  if (!caseData) return null;

  const sop = SOP_INDEX[caseData.status];

  const getLineItemNextSteps = (li) => {
    if (!li) return [];

    const steps = [];

    if (li.status === "Overdue" || (caseData.daysUntilDeadline ?? 0) < 0) {
      steps.push("Assess regulatory breach risk and document rationale for late action.");
      steps.push("Escalate this line item to compliance / legal if required by SOP.");
    }

    if (li.issueType === "Coverage Denial") {
      steps.push("Confirm denial rationale and gather supporting clinical / benefit evidence.");
      steps.push("Draft appeal language specific to this service line and send for review.");
    }

    if (li.issueType === "Quality of Care" || li.issueType === "Access to Care") {
      steps.push("Log this concern in the quality tracking system with this line item as reference.");
      steps.push("Check if immediate member outreach is required per SOP.");
    }

    if (steps.length === 0) {
      steps.push("Verify that documentation for this line item meets regulatory requirements.");
      steps.push("If complete, align resolution for this line with the overall case disposition.");
    }

    return steps;
  };

  const DetailsTab = (
    <div className="space-y-4 text-sm">
      <DeadlineTracker 
        deadline={caseData.filingDeadline} 
        daysUntilDeadline={caseData.daysUntilDeadline} 
      />
      
      <div className="grid grid-cols-2 gap-3">
        <Field k="Case Number" v={caseData.caseNumber} />
        <Field k="Type" v={caseData.type} />
        <Field k="Complainant" v={caseData.complainant?.name} />
        <Field k="Member ID" v={caseData.complainant?.memberId} />
        <Field k="Issue Type" v={caseData.issueType} />
        <Field k="Status" v={caseData.status} />
        <Field k="Jurisdiction" v={caseData.jurisdiction} />
        <Field k="Regulatory Body" v={caseData.regulatoryBody} />
        <Field k="Filing Date" v={caseData.filingDate} />
        <Field k="Filing Deadline" v={caseData.filingDeadline} />
        <Field k="Disputed Amount" v={`$${caseData.amount?.toLocaleString()}`} />
        <Field k="Priority" v={caseData.priority} />
      </div>

      {Array.isArray(caseData.lineItems) && caseData.lineItems.length > 0 && (
        <div className="mt-2">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Line Items ({caseData.lineItems.length})
            </div>
          </div>
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 dark:bg-gray-800/80">
                <tr>
                  <th className="px-2 py-1 text-left font-medium text-gray-600 dark:text-gray-300">Line</th>
                  <th className="px-2 py-1 text-left font-medium text-gray-600 dark:text-gray-300">Description</th>
                  <th className="px-2 py-1 text-left font-medium text-gray-600 dark:text-gray-300">Issue Type</th>
                  <th className="px-2 py-1 text-left font-medium text-gray-600 dark:text-gray-300">Amount</th>
                  <th className="px-2 py-1 text-left font-medium text-gray-600 dark:text-gray-300">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/80">
                {caseData.lineItems.map((li) => (
                  <tr
                    key={li.lineId}
                    className={`cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/70 ${
                      activeLineItem?.lineId === li.lineId ? "bg-gray-50 dark:bg-gray-800" : ""
                    }`}
                    onClick={() =>
                      setActiveLineItem((prev) => (prev?.lineId === li.lineId ? null : li))
                    }
                  >
                    <td className="px-2 py-1 font-medium text-gray-800 dark:text-gray-100">{li.lineId}</td>
                    <td className="px-2 py-1 text-gray-700 dark:text-gray-300">{li.description}</td>
                    <td className="px-2 py-1 text-gray-700 dark:text-gray-300">{li.issueType}</td>
                    <td className="px-2 py-1 text-gray-800 dark:text-gray-100">
                      {li.amount != null ? `$${li.amount.toLocaleString()}` : "—"}
                    </td>
                    <td className="px-2 py-1">
                      <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                        {li.status || caseData.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {activeLineItem && (
            <div className="mt-3 p-3 rounded-lg bg-[#F5F3FF] dark:bg-[#4B2E83]/30 border border-[#612D91]/20">
              <div className="text-xs font-semibold text-[#612D91] dark:text-[#D1C4F3] uppercase tracking-wide mb-1">
                Next steps for {activeLineItem.lineId}
              </div>
              <div className="text-[11px] text-gray-700 dark:text-gray-200 mb-1">
                {activeLineItem.description}
              </div>
              <ul className="list-disc list-inside space-y-1 text-[11px] text-gray-800 dark:text-gray-100">
                {getLineItemNextSteps(activeLineItem).map((s, idx) => (
                  <li key={idx}>{s}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      
      {caseData.originalDecision && (
        <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Original Decision</div>
          <div className="space-y-1 text-sm">
            <div><span className="font-medium">Date:</span> {caseData.originalDecision.date}</div>
            <div><span className="font-medium">Type:</span> {caseData.originalDecision.decisionType}</div>
            <div><span className="font-medium">Reason:</span> {caseData.originalDecision.reason}</div>
          </div>
        </div>
      )}
      
      <details className="mt-2">
        <summary className="cursor-pointer underline text-xs">Raw JSON</summary>
        <pre className="mt-2 text-xs overflow-auto">{JSON.stringify(caseData, null, 2)}</pre>
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
          <div className="pt-3 flex items-center gap-2">
            <button
              onClick={() => {
                console.log("AI insight accepted (demo)");
              }}
              className="px-3 py-2 text-sm rounded-md text-white"
              style={{ backgroundColor: "#612D91" }}
            >
              Accept Recommendation
            </button>
            <span className="text-[11px] text-gray-500 dark:text-gray-400">
              Demo only – no real action taken
            </span>
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
    <div className="bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 w-96 flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Case Details</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <Tabs
          tabs={[
            { id: "details", label: "Details", content: DetailsTab },
            { id: "ai", label: "AI Insights", content: AiTab },
            { id: "sop", label: "SOP", content: SopTab },
          ]}
        />
      </div>
    </div>
  );
}

