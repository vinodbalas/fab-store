export default function SOPTab({ claim }) {
    const sop = [
      { id: "3.1", title: "Eligibility & Pre-Authorization", matched: false },
      { id: "3.2.1", title: "Missing Pre-Authorization Handling", matched: true },
      { id: "3.3", title: "Provider Documentation Request", matched: false },
    ];
  
    return (
      <div className="text-sm space-y-3">
        <div className="font-semibold text-[#612D91]">Relevant SOP Steps</div>
        <ul className="space-y-2">
          {sop.map((s) => (
            <li
              key={s.id}
              className={`p-3 rounded-md border ${
                s.matched
                  ? "border-[#612D91] bg-[#612D91]/10"
                  : "border-gray-200 dark:border-gray-700"
              }`}
            >
              <div className="font-medium">
                Step {s.id} {s.matched && "✅"}
              </div>
              <div className="text-xs opacity-80">{s.title}</div>
            </li>
          ))}
        </ul>
      </div>
    );
  }
  