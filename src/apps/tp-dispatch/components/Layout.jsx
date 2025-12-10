import SolutionLayout from "../../../components/SolutionLayout";

export default function TPDispatchLayout({ children, onNavigate, active }) {
  const navItems = [
    { key: "dispatch", label: "Home", icon: "Home" },
    { key: "dispatch/worklist", label: "Work Orders", icon: "List" },
  ];

  return (
    <SolutionLayout
      productName="TP Dispatch"
      tagline="Field Service Management Intelligence"
      navItems={navItems}
      onNavigate={onNavigate}
      active={active}
      footerText="TP Dispatch • Powered by Field Service Platform"
      showSettings={true}
    >
      {children}
    </SolutionLayout>
  );
}

