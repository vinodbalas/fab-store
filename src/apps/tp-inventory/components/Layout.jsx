import SolutionLayout from "../../../components/SolutionLayout";

export default function TPInventoryLayout({ children, onNavigate, active }) {
  const navItems = [
    { key: "inventory", label: "Home", icon: "Home" },
    { key: "inventory/list", label: "Inventory", icon: "List" },
  ];

  return (
    <SolutionLayout
      productName="TP Inventory"
      tagline="Parts & Equipment Management"
      navItems={navItems}
      onNavigate={onNavigate}
      active={active}
      footerText="TP Inventory • Powered by Field Service Platform"
      showSettings={true}
    >
      {children}
    </SolutionLayout>
  );
}

