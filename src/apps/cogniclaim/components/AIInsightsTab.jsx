import { useEffect, useState } from "react";
import { Sparkles, CheckCircle } from "lucide-react";

export default function AIInsightsTab({ claim }) {
  const [loading, setLoading] = useState(true);
  const [output, setOutput] = useState(null);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setOutput({
        summary:
          "The claim is pending due to missing pre-authorization. According to SOP 3.2.1, pre-auth must be attached within 48 hours for provider reimbursement.",
        nextStep: "Request pre-authorization from provider and set follow-up in 48h.",
        confidence: 0.91,
      });
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, [claim]);

  return (
    <div>
      {loading ? (
        <div className="animate-pulse space-y-2">
          <div className="h-3 bg-gray-200 rounded w-3/4" />
          <div className="h-3 bg-gray-200 rounded w-2/3" />
          <div className="h-3 bg-gray-200 rounded w-1/2" />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#612D91]" />
            <h2 className="font-semibold text-[#612D91]">AI Recommendation</h2>
          </div>

          <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">
            {output.summary}
          </p>

          <div className="text-sm bg-[#612D91]/10 p-3 rounded-md">
            <strong>Next Step:</strong> {output.nextStep}
          </div>

          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Confidence: {(output.confidence * 100).toFixed(0)}%</span>
            <button
              onClick={() => alert("Accepted (mock)")}
              className="flex items-center gap-1 px-2 py-1 bg-[#612D91] text-white text-xs rounded-md"
            >
              <CheckCircle className="w-3 h-3" /> Accept Recommendation
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
