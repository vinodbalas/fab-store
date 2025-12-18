import SolutionLayout from "../../../components/SolutionLayout";
import { Home, Package } from "lucide-react";

const TP_INVENTORY_NAV_ITEMS = [
  { key: "inventory", label: "Home", icon: Home },
  { key: "inventory/list", label: "Inventory", icon: Package },
];

export default function TPInventoryLayout({ children, onNavigate, active }) {
  return (
    <SolutionLayout
      productName="TP Inventory"
      tagline="Parts & Equipment Management"
      storageKey="tpinventory"
      navItems={TP_INVENTORY_NAV_ITEMS}
      onNavigate={onNavigate}
      active={active}
      footerText="TP Inventory • Powered by Field Service Platform"
      showSettings={false}
    >
      {children}
    </SolutionLayout>
  );
}

