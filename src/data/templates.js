/**
 * Application Templates
 * Pre-configured templates for different industries and use cases
 */

export const applicationTemplates = [
  // Manufacturing Templates
  {
    id: "template-manufacturing-quality",
    name: "Quality Control System",
    tagline: "Manufacturing quality assurance and inspection",
    category: "Quality Control",
    industry: "Manufacturing",
    status: "Template",
    description: "Pre-configured template for manufacturing quality control, inspection workflows, and defect tracking.",
    highlights: ["Inspection workflows", "Defect tracking", "Quality metrics", "Compliance reporting"],
    tags: ["Manufacturing", "Quality", "Template"],
    accent: "from-[#059669] to-[#10B981]",
    statusColor: "bg-blue-100 text-blue-700",
    categoryColor: "text-emerald-500",
    stack: ["SOP Executor", "Quality Management"],
    platformId: "sop-navigator",
    templateType: "manufacturing",
    templateConfig: {
      itemLabel: "inspection",
      itemLabelPlural: "inspections",
      defaultStatuses: ["Pending", "In Progress", "Passed", "Failed", "Requires Rework"],
      defaultPriorities: ["Critical", "High", "Medium", "Low"],
      defaultFields: ["productId", "batchNumber", "inspector", "defects", "compliance"],
    },
  },
  {
    id: "template-manufacturing-maintenance",
    name: "Equipment Maintenance",
    tagline: "Preventive and corrective maintenance management",
    category: "Maintenance",
    industry: "Manufacturing",
    status: "Template",
    description: "Template for equipment maintenance scheduling, work orders, and maintenance history tracking.",
    highlights: ["Maintenance scheduling", "Work order management", "Asset tracking", "Preventive maintenance"],
    tags: ["Manufacturing", "Maintenance", "Template"],
    accent: "from-[#0EA5E9] to-[#3B82F6]",
    statusColor: "bg-blue-100 text-blue-700",
    categoryColor: "text-blue-500",
    stack: ["Field Service Platform", "Maintenance"],
    platformId: "field-service",
    templateType: "manufacturing",
    templateConfig: {
      itemLabel: "maintenance order",
      itemLabelPlural: "maintenance orders",
      defaultStatuses: ["Scheduled", "In Progress", "Completed", "Deferred"],
      defaultPriorities: ["Emergency", "High", "Medium", "Low"],
      defaultFields: ["equipmentId", "maintenanceType", "technician", "partsRequired", "downtime"],
    },
  },
  // Retail/Commerce Templates
  {
    id: "template-retail-returns",
    name: "Returns & Refunds",
    tagline: "Customer returns and refund processing",
    category: "Returns",
    industry: "Retail",
    status: "Template",
    description: "Template for processing customer returns, refunds, and exchange requests with policy compliance.",
    highlights: ["Return processing", "Refund workflows", "Policy compliance", "Customer satisfaction"],
    tags: ["Retail", "Returns", "Template"],
    accent: "from-[#EC4899] to-[#F472B6]",
    statusColor: "bg-blue-100 text-blue-700",
    categoryColor: "text-pink-500",
    stack: ["SOP Executor", "Customer Service"],
    platformId: "sop-navigator",
    templateType: "retail",
    templateConfig: {
      itemLabel: "return request",
      itemLabelPlural: "return requests",
      defaultStatuses: ["Submitted", "Under Review", "Approved", "Rejected", "Processed"],
      defaultPriorities: ["High", "Medium", "Low"],
      defaultFields: ["orderId", "productId", "reason", "customer", "refundAmount"],
    },
  },
  {
    id: "template-retail-inventory",
    name: "Inventory Management",
    tagline: "Multi-location inventory tracking and optimization",
    category: "Inventory",
    industry: "Retail",
    status: "Template",
    description: "Template for retail inventory management across multiple locations with stock optimization.",
    highlights: ["Multi-location tracking", "Stock optimization", "Reorder alerts", "Inventory analytics"],
    tags: ["Retail", "Inventory", "Template"],
    accent: "from-[#F59E0B] to-[#F97316]",
    statusColor: "bg-blue-100 text-blue-700",
    categoryColor: "text-orange-500",
    stack: ["Field Service Platform", "Inventory"],
    platformId: "field-service",
    templateType: "retail",
    templateConfig: {
      itemLabel: "inventory item",
      itemLabelPlural: "inventory items",
      defaultStatuses: ["In Stock", "Low Stock", "Out of Stock", "On Order"],
      defaultPriorities: ["Critical", "High", "Medium", "Low"],
      defaultFields: ["sku", "location", "quantity", "reorderPoint", "supplier"],
    },
  },
  {
    id: "template-retail-fulfillment",
    name: "Order Fulfillment",
    tagline: "Order processing and fulfillment workflows",
    category: "Fulfillment",
    industry: "Retail",
    status: "Template",
    description: "Template for order fulfillment, picking, packing, and shipping workflows.",
    highlights: ["Order processing", "Picking workflows", "Shipping integration", "Delivery tracking"],
    tags: ["Retail", "Fulfillment", "Template"],
    accent: "from-[#8B5CF6] to-[#A78BFA]",
    statusColor: "bg-blue-100 text-blue-700",
    categoryColor: "text-purple-500",
    stack: ["Field Service Platform", "Fulfillment"],
    platformId: "field-service",
    templateType: "retail",
    templateConfig: {
      itemLabel: "fulfillment order",
      itemLabelPlural: "fulfillment orders",
      defaultStatuses: ["Pending", "Picking", "Packing", "Shipped", "Delivered"],
      defaultPriorities: ["Express", "Standard", "Economy"],
      defaultFields: ["orderId", "customer", "items", "shippingAddress", "carrier"],
    },
  },
];

export function getTemplatesByIndustry(industry) {
  if (industry === "All") return applicationTemplates;
  return applicationTemplates.filter((t) => t.industry === industry);
}

export function getTemplatesByPlatform(platformId) {
  return applicationTemplates.filter((t) => t.platformId === platformId);
}

export function getTemplateById(templateId) {
  return applicationTemplates.find((t) => t.id === templateId);
}

