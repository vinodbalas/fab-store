/**
 * TP Dispatch - Work Orders Data
 */

// Generate mock work orders
const generateWorkOrders = () => {
  const statuses = ["Pending", "Scheduled", "In Progress", "Completed", "Cancelled"];
  const priorities = ["High", "Medium", "Low"];
  const serviceTypes = [
    "Installation",
    "Repair",
    "Maintenance",
    "Inspection",
    "Emergency Service",
    "Upgrade",
  ];
  const customerNames = [
    "Acme Corp",
    "Tech Solutions Inc",
    "Global Industries",
    "Metro Services",
    "Premier Business",
    "Enterprise Systems",
    "City Utilities",
    "Regional Services",
  ];
  const locations = [
    { address: "123 Main St, Downtown", lat: 40.7128, lng: -74.0060 },
    { address: "456 Oak Ave, Midtown", lat: 40.7589, lng: -73.9851 },
    { address: "789 Pine Rd, Uptown", lat: 40.7489, lng: -73.9680 },
    { address: "321 Elm St, Suburbs", lat: 40.6892, lng: -74.0445 },
    { address: "654 Maple Dr, Industrial", lat: 40.6782, lng: -73.9442 },
  ];

  const workOrders = [];
  for (let i = 1; i <= 50; i++) {
    const slaHours = Math.floor(Math.random() * 24) + 1;
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const priority = priorities[Math.floor(Math.random() * priorities.length)];
    const serviceType = serviceTypes[Math.floor(Math.random() * serviceTypes.length)];
    const location = locations[Math.floor(Math.random() * locations.length)];
    const customer = customerNames[Math.floor(Math.random() * customerNames.length)];

    const scheduledTime = status !== "Pending" 
      ? new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000)
      : null;

    workOrders.push({
      id: `WO-${String(i).padStart(4, "0")}`,
      serviceType,
      priority,
      status,
      customer: {
        id: `CUST-${i}`,
        name: customer,
        tier: i % 3 === 0 ? "Premium" : i % 2 === 0 ? "Standard" : "Basic",
      },
      location,
      scheduledTime: scheduledTime?.toISOString(),
      slaHours,
      estimatedDuration: Math.floor(Math.random() * 4) + 1, // hours
      requiredSkills: serviceType === "Installation" 
        ? ["Installation", "Electrical"]
        : serviceType === "Repair"
        ? ["Troubleshooting", "Repair"]
        : ["General"],
      assignedTechnician: status === "In Progress" || status === "Scheduled"
        ? `TECH-${Math.floor(Math.random() * 5) + 1}`
        : null,
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      description: `${serviceType} service required for ${customer}`,
    });
  }

  return workOrders;
};

export const WORK_ORDERS = generateWorkOrders();

export const TECHNICIANS = [
  {
    id: "TECH-001",
    name: "John Martinez",
    skills: ["Installation", "Electrical", "Repair"],
    status: "Available",
    currentLocation: { lat: 40.7128, lng: -74.0060 },
    avatar: "/api/placeholder/64/64",
  },
  {
    id: "TECH-002",
    name: "Sarah Chen",
    skills: ["Troubleshooting", "Repair", "Maintenance"],
    status: "On Assignment",
    currentLocation: { lat: 40.7589, lng: -73.9851 },
    avatar: "/api/placeholder/64/64",
  },
  {
    id: "TECH-003",
    name: "Mike Johnson",
    skills: ["Installation", "Upgrade", "General"],
    status: "Available",
    currentLocation: { lat: 40.7489, lng: -73.9680 },
    avatar: "/api/placeholder/64/64",
  },
  {
    id: "TECH-004",
    name: "Lisa Anderson",
    skills: ["Inspection", "Maintenance", "General"],
    status: "On Assignment",
    currentLocation: { lat: 40.6892, lng: -74.0445 },
    avatar: "/api/placeholder/64/64",
  },
  {
    id: "TECH-005",
    name: "David Kim",
    skills: ["Emergency Service", "Repair", "Troubleshooting"],
    status: "Available",
    currentLocation: { lat: 40.6782, lng: -73.9442 },
    avatar: "/api/placeholder/64/64",
  },
];

export function getWorkOrderById(id) {
  return WORK_ORDERS.find((wo) => wo.id === id);
}

export function getTechnicianById(id) {
  return TECHNICIANS.find((t) => t.id === id);
}

export function getWorkOrdersByStatus(status) {
  return WORK_ORDERS.filter((wo) => wo.status.toLowerCase() === status.toLowerCase());
}

export function getWorkOrdersByPriority(priority) {
  return WORK_ORDERS.filter((wo) => wo.priority.toLowerCase() === priority.toLowerCase());
}

export function getAvailableTechnicians(date, time) {
  return TECHNICIANS.filter((t) => t.status === "Available");
}

export function getScheduleForTechnician(techId) {
  const techWorkOrders = WORK_ORDERS.filter(
    (wo) => wo.assignedTechnician === techId && (wo.status === "Scheduled" || wo.status === "In Progress")
  );
  return techWorkOrders.map((wo) => ({
    technicianId: techId,
    workOrder: wo,
    startTime: wo.scheduledTime,
    endTime: wo.scheduledTime 
      ? new Date(new Date(wo.scheduledTime).getTime() + wo.estimatedDuration * 60 * 60 * 1000).toISOString()
      : null,
  }));
}

