import SolutionLayout from "../../../components/SolutionLayout";
import { Headphones, ActivitySquare, BookOpen } from "lucide-react";

const AGENTIC_SUPPORT_NAV_ITEMS = [
  { key: "agentic", label: "Console", icon: Headphones },
  { key: "agentic/watchtower", label: "AI Watchtower", icon: ActivitySquare },
  { key: "agentic/knowledge-base", label: "Knowledge Base", icon: BookOpen },
];

export default function AgenticSupportLayout({ children, onNavigate, active }) {
  return (
    <SolutionLayout
      productName="Agentic Support"
      tagline="Self-healing workflows for customer & device support"
      storageKey="agenticsupport"
      navItems={AGENTIC_SUPPORT_NAV_ITEMS}
      onNavigate={onNavigate}
      active={active}
      footerText="Agentic Support • Powered by Agentic Support Orchestration"
      showSettings={false}
    >
      {children}
    </SolutionLayout>
  );
}


