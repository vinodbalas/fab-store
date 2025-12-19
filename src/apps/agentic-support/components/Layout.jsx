import SolutionLayout from "../../../components/SolutionLayout";
import { Headphones, ActivitySquare, BookOpen, Settings, BarChart3 } from "lucide-react";

const AGENTIC_SUPPORT_NAV_ITEMS = [
  { key: "agentic", label: "Console", icon: Headphones },
  { key: "agentic/watchtower", label: "AI Watchtower", icon: ActivitySquare },
  { key: "agentic/executive", label: "Reports & Analytics", icon: BarChart3 },
  { key: "agentic/knowledge-base", label: "Knowledge Base", icon: BookOpen },
  { key: "agentic/admin", label: "Admin", icon: Settings },
];

export default function AgenticSupportLayout({ children, onNavigate, active }) {
  return (
    <SolutionLayout
      productName="TP FAB Agents"
      tagline="Self-healing workflows for customer & device support"
      storageKey="agenticsupport"
      navItems={AGENTIC_SUPPORT_NAV_ITEMS}
      onNavigate={onNavigate}
      active={active}
      footerText="TP FAB Agents • Powered by AI Console Orchestration"
      showSettings={false}
    >
      {children}
    </SolutionLayout>
  );
}


