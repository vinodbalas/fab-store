import SolutionLayout from "../../../components/SolutionLayout";
import { Home, ClipboardList } from "lucide-react";

const TP_DISPATCH_NAV_ITEMS = [
  { key: "dispatch", label: "Home", icon: Home },
  { key: "dispatch/worklist", label: "Work Orders", icon: ClipboardList },
];

export default function TPDispatchLayout({ children, onNavigate, active }) {
  return (
    <SolutionLayout
      productName="TP Dispatch"
      tagline="Field Service Management Intelligence"
      storageKey="tpdispatch"
      navItems={TP_DISPATCH_NAV_ITEMS}
      onNavigate={onNavigate}
      active={active}
      footerText="TP Dispatch • Powered by Field Service Platform"
      showSettings={false}
    >
      {children}
    </SolutionLayout>
  );
}

