/**
 * TP Inventory - Inventory Data
 */

const categories = ["Parts", "Tools", "Equipment", "Consumables", "Spare Parts"];
const locations = ["Main Warehouse", "North Depot", "South Depot", "Mobile Van 1", "Mobile Van 2"];

export const INVENTORY_ITEMS = Array.from({ length: 40 }, (_, i) => {
  const category = categories[Math.floor(Math.random() * categories.length)];
  const location = locations[Math.floor(Math.random() * locations.length)];
  const quantity = Math.floor(Math.random() * 50);
  const minThreshold = Math.floor(Math.random() * 10) + 5;

  return {
    id: `INV-${String(i + 1).padStart(4, "0")}`,
    partNumber: `PN-${String(i + 1).padStart(6, "0")}`,
    name: `${category} Item ${i + 1}`,
    description: `High-quality ${category.toLowerCase()} for field service operations`,
    category,
    quantity,
    minThreshold,
    unit: category === "Tools" ? "pieces" : "units",
    location,
    cost: parseFloat((Math.random() * 500 + 10).toFixed(2)),
    supplier: `Supplier ${String.fromCharCode(65 + (i % 5))}`,
    lastRestocked: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    status: quantity === 0 ? "Out of Stock" : quantity <= minThreshold ? "Low Stock" : "In Stock",
  };
});

export function getInventoryItemById(id) {
  return INVENTORY_ITEMS.find((item) => item.id === id);
}

export function getInventoryByLocation(location) {
  return INVENTORY_ITEMS.filter((item) => item.location === location);
}

export function getLowStockItems() {
  return INVENTORY_ITEMS.filter((item) => item.quantity <= item.minThreshold);
}

export function getOutOfStockItems() {
  return INVENTORY_ITEMS.filter((item) => item.quantity === 0);
}

