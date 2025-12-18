import SolutionLayout from "../../../components/SolutionLayout";
import { Home, ClipboardList } from "lucide-react";

const TP_LEND_NAV_ITEMS = [
  { key: "lend", label: "Home", icon: Home },
  { key: "lend/worklist", label: "Worklist", icon: ClipboardList },
];

export default function TPLendLayout({ children, onNavigate, active }) {
  return (
    <SolutionLayout
      productName="TP Lend"
      tagline="Mortgage Processing Intelligence"
      storageKey="tplend"
      navItems={TP_LEND_NAV_ITEMS}
      footerText="TP Lend • Powered by SOP Executor"
      onNavigate={onNavigate}
      active={active}
      showSettings={false}
    >
      {children}
    </SolutionLayout>
  );
}

