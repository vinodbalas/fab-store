import SolutionLayout from "../../../components/SolutionLayout";
import { Home, ClipboardList } from "lucide-react";

const TP_RESOLVE_NAV_ITEMS = [
  { key: "resolve", label: "Home", icon: Home },
  { key: "resolve/worklist", label: "Worklist", icon: ClipboardList },
];

export default function TPResolveLayout({ children, onNavigate, active }) {
  return (
    <SolutionLayout
      productName="TP Resolve Appeals"
      tagline="Appeals & Grievances Intelligence"
      storageKey="tpresolve"
      navItems={TP_RESOLVE_NAV_ITEMS}
      footerText="TP Resolve Appeals • Powered by SOP Executor"
      onNavigate={onNavigate}
      active={active}
      showSettings={false}
    >
      {children}
    </SolutionLayout>
  );
}

