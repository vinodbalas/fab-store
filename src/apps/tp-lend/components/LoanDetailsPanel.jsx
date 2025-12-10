import { useEffect, useState } from "react";
import Tabs from "../../cogniclaim/components/Tabs";
import { SOP_INDEX } from "../data/sops";
import { Clock } from "lucide-react";

const Field = ({ k, v }) => (
  <div>
    <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-0.5">{k}</div>
    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{v || "N/A"}</div>
  </div>
);

function SLATracker({ deadline, daysUntilSLA }) {
  const getColor = () => {
    if (daysUntilSLA === undefined || daysUntilSLA === null) return "text-gray-600";
    if (daysUntilSLA < 0) return "text-red-600";
    if (daysUntilSLA < 7) return "text-orange-600";
    if (daysUntilSLA < 14) return "text-yellow-600";
    return "text-green-600";
  };

  const getText = () => {
    if (daysUntilSLA === undefined || daysUntilSLA === null) return "N/A";
    if (daysUntilSLA < 0) return `${Math.abs(daysUntilSLA)} days overdue`;
    if (daysUntilSLA === 0) return "Due today";
    if (daysUntilSLA === 1) return "Due tomorrow";
    return `${daysUntilSLA} days remaining`;
  };

  return (
    <div className={`p-3 rounded-lg border ${getColor()} border-current/20 bg-current/5`}>
      <div className="flex items-center gap-2">
        <Clock className="w-4 h-4" />
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide">SLA Deadline</div>
          <div className="text-sm font-bold">{deadline || "N/A"}</div>
          <div className="text-xs mt-1">{getText()}</div>
        </div>
      </div>
    </div>
  );
}

export default function LoanDetailsPanel({ loanData, onClose }) {
  const [insights, setInsights] = useState({ loading: true, text: "", confidence: null, ref: "" });
  const [activeLineItem, setActiveLineItem] = useState(null);

  useEffect(() => {
    if (!loanData) return;
    setInsights({ loading: true, text: "", confidence: null, ref: "" });
    const timer = setTimeout(() => {
      const sop = SOP_INDEX[loanData.status];
      const text =
        loanData.status === "Under Review"
          ? `Loan application under review. Next step: Verify all documentation and route to underwriting team.\nWhy: SOP "${sop?.title}" step 1–2.`
          : loanData.status === "Pending Documentation"
          ? `Documentation pending. Next step: Request missing documents from borrower.\nWhy: SOP "${sop?.title}" step 2–3.`
          : loanData.status === "In Underwriting"
          ? `Underwriting in progress. Next step: Complete risk assessment within SLA.\nWhy: SOP "${sop?.title}" step 3–4.`
          : loanData.status === "Conditional Approval"
          ? `Conditional approval issued. Next step: Collect required conditions from borrower.\nWhy: SOP "${sop?.title}" step 4–5.`
          : loanData.status === "Approved"
          ? `Loan approved. Next step: Prepare closing documents and schedule closing.\nWhy: SOP "${sop?.title}" step 5–6.`
          : `Loan denied. Next step: Provide denial letter and document rationale.\nWhy: SOP "${sop?.title}" step 1–2.`;
      setInsights({
        loading: false,
        text,
        confidence: 0.88,
        ref: sop?.link || "#"
      });
    }, 600);
    return () => clearTimeout(timer);
  }, [loanData]);

  if (!loanData) return null;

  const sop = SOP_INDEX[loanData.status];

  const getLineItemNextSteps = (li) => {
    if (!li) return [];

    const steps = [];

    if (li.status === "Rejected" || (loanData.daysUntilSLA ?? 0) < 0) {
      steps.push("Assess impact on loan approval and document rationale for rejection.");
      steps.push("Escalate this line item to underwriting manager if required by SOP.");
    }

    if (li.description === "Property Appraisal") {
      steps.push("Verify appraisal report meets lender requirements and property value.");
      steps.push("If appraisal is low, consider options: renegotiate price or request reconsideration.");
    }

    if (li.description === "Credit Report") {
      steps.push("Review credit score and history for any discrepancies.");
      steps.push("If credit issues found, document and assess impact on loan terms.");
    }

    if (steps.length === 0) {
      steps.push("Verify that documentation for this line item meets lender requirements.");
      steps.push("If complete, align processing for this line with the overall loan status.");
    }

    return steps;
  };

  const DetailsTab = (
    <div className="space-y-4 text-sm">
      <SLATracker 
        deadline={loanData.slaDeadline} 
        daysUntilSLA={loanData.daysUntilSLA} 
      />
      
      <div className="grid grid-cols-2 gap-3">
        <Field k="Loan Number" v={loanData.loanNumber} />
        <Field k="Loan Type" v={loanData.loanType} />
        <Field k="Borrower" v={loanData.borrower} />
        <Field k="Property Type" v={loanData.propertyType} />
        <Field k="Property State" v={loanData.propertyState} />
        <Field k="Status" v={loanData.status} />
        <Field k="Application Date" v={loanData.applicationDate} />
        <Field k="SLA Deadline" v={loanData.slaDeadline} />
        <Field k="Loan Amount" v={`$${loanData.loanAmount?.toLocaleString()}`} />
        <Field k="AI Priority" v={loanData.aiPriority?.toFixed(1)} />
      </div>

      {Array.isArray(loanData.lineItems) && loanData.lineItems.length > 0 && (
        <div className="mt-2">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Line Items ({loanData.lineItems.length})
            </div>
          </div>
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 dark:bg-gray-800/80">
                <tr>
                  <th className="px-2 py-1 text-left font-medium text-gray-600 dark:text-gray-300">Line</th>
                  <th className="px-2 py-1 text-left font-medium text-gray-600 dark:text-gray-300">Description</th>
                  <th className="px-2 py-1 text-left font-medium text-gray-600 dark:text-gray-300">Amount</th>
                  <th className="px-2 py-1 text-left font-medium text-gray-600 dark:text-gray-300">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/80">
                {loanData.lineItems.map((li) => (
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
                    <td className="px-2 py-1 text-gray-800 dark:text-gray-100">
                      {li.amount != null ? `$${li.amount.toLocaleString()}` : "—"}
                    </td>
                    <td className="px-2 py-1">
                      <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                        {li.status || loanData.status}
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
      
      <details className="mt-2">
        <summary className="cursor-pointer underline text-xs">Raw JSON</summary>
        <pre className="mt-2 text-xs overflow-auto">{JSON.stringify(loanData, null, 2)}</pre>
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
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Loan Details</h3>
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

