import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Zap, Package, AlertTriangle, CheckCircle2, ArrowRight, TrendingDown } from "lucide-react";
import { INVENTORY_ITEMS, getLowStockItems, getOutOfStockItems } from "../data/inventory";
import InventoryCard from "../../../platforms/field-service/components/InventoryCard";

export default function TPInventoryHomeDashboard({ onSelectItem, onNavigate }) {
  const [stats, setStats] = useState({
    totalItems: 0,
    inStock: 0,
    lowStock: 0,
    outOfStock: 0,
    totalValue: 0,
  });
  const [lowStockItems, setLowStockItems] = useState([]);
  const [outOfStockItems, setOutOfStockItems] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  function loadData() {
    const lowStock = getLowStockItems();
    const outOfStock = getOutOfStockItems();
    const totalValue = INVENTORY_ITEMS.reduce((sum, item) => sum + (item.quantity * item.cost), 0);

    setStats({
      totalItems: INVENTORY_ITEMS.length,
      inStock: INVENTORY_ITEMS.filter((item) => item.quantity > item.minThreshold).length,
      lowStock: lowStock.length,
      outOfStock: outOfStock.length,
      totalValue: parseFloat(totalValue.toFixed(2)),
    });

    setLowStockItems(lowStock.slice(0, 6));
    setOutOfStockItems(outOfStock.slice(0, 6));
  }

  return (
    <div className="space-y-6 p-6">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 p-8 text-white shadow-lg"
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-xl bg-white/20 backdrop-blur-sm">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">TP Inventory</h1>
                <p className="text-blue-100 text-sm">Parts, tools, and equipment management</p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-4">
              <span className="px-3 py-1 rounded-full bg-white/20 text-xs font-semibold">Live Demo</span>
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="text-2xl font-bold">{stats.totalItems}</div>
            <div className="text-xs text-blue-100 mt-1">Total Items</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="text-2xl font-bold">{stats.inStock}</div>
            <div className="text-xs text-blue-100 mt-1">In Stock</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="text-2xl font-bold text-amber-300">{stats.lowStock}</div>
            <div className="text-xs text-blue-100 mt-1">Low Stock</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="text-2xl font-bold text-red-300">{stats.outOfStock}</div>
            <div className="text-xs text-blue-100 mt-1">Out of Stock</div>
          </div>
        </div>

        {/* Total Value */}
        <div className="mt-4 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-100">Total Inventory Value</span>
            <span className="text-xl font-bold">${stats.totalValue.toLocaleString()}</span>
          </div>
        </div>
      </motion.div>

      {/* Alerts */}
      {outOfStockItems.length > 0 && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h2 className="text-lg font-semibold text-red-900">Out of Stock Items</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {outOfStockItems.map((item) => (
              <InventoryCard key={item.id} item={item} onSelect={onSelectItem} />
            ))}
          </div>
        </div>
      )}

      {/* Low Stock Items */}
      {lowStockItems.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-amber-600" />
            Low Stock Items
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lowStockItems.map((item) => (
              <InventoryCard key={item.id} item={item} onSelect={onSelectItem} />
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.button
          onClick={() => onNavigate("inventory/list")}
          className="p-4 rounded-xl border border-gray-200 bg-white hover:shadow-md transition-shadow text-left"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">View All Inventory</h3>
              <p className="text-sm text-gray-600 mt-1">Browse and manage all inventory items</p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400" />
          </div>
        </motion.button>
      </div>
    </div>
  );
}

