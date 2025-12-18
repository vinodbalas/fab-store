/**
 * AI-Native Visual App Builder
 * 
 * Low-code/no-code builder with AI-powered app generation and drag-and-drop
 * Inspired by ToolJet and modern AI-native platforms
 */

import { useState, useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Save,
  Eye,
  Sparkles,
  Layers,
  Database,
  Zap,
  Palette,
  Code,
  ChevronRight,
  Plus,
  Trash2,
  Copy,
  Settings,
  Brain,
  Lightbulb,
  Wand2,
  ChevronDown,
  ChevronUp,
  FileText,
  Grid,
  Layout,
  Component,
  Search,
  Monitor,
  Tablet,
  Smartphone,
  Split,
  Maximize2,
  Minimize2,
  FilePlus,
  Edit,
  Move,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Link,
  Image,
  Video,
  Type,
  Hash,
  Calendar,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  User,
  Lock,
  Unlock,
  CheckSquare,
  Radio,
  ToggleLeft,
  Check,
  BarChart3,
  PieChart,
  LineChart,
  TrendingUp,
  Upload,
  Tag,
  Badge,
  AlertCircle,
  CheckCircle,
  Loader2,
  Clock,
  Bell,
  Sliders,
  GripVertical,
  GripHorizontal,
  Menu,
  ArrowRight,
  ChevronLeft,
  Circle,
  Square,
  List,
  Sidebar,
  Star,
  Folder,
  Play,
  MousePointer,
  AlertTriangle,
} from "lucide-react";
import { DndContext, DragOverlay, useSensor, useSensors, PointerSensor, KeyboardSensor, closestCenter, useDroppable, useDraggable } from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { usePermissions } from "../hooks/usePermissions";
import { useAuth } from "../auth/AuthContext";

// Component Templates - Pre-built blocks
const COMPONENT_TEMPLATES = {
  "dashboard-layout": {
    name: "Dashboard Layout",
    icon: Grid,
    category: "Templates",
    description: "Complete dashboard with metrics and charts",
    components: [
      { id: "comp-1", type: "container", name: "Header", props: {} },
      { id: "comp-2", type: "grid", name: "Metrics Grid", props: { columns: 4 } },
      { id: "comp-3", type: "chart", name: "Analytics Chart", props: {} },
      { id: "comp-4", type: "data-table", name: "Data Table", props: {} },
    ],
  },
  "form-layout": {
    name: "Form Layout",
    icon: FileText,
    category: "Templates",
    description: "Complete form with validation",
    components: [
      { id: "comp-1", type: "container", name: "Form Container", props: {} },
      { id: "comp-2", type: "form", name: "Input Form", props: {} },
    ],
  },
  "detail-view": {
    name: "Detail View",
    icon: Layers,
    category: "Templates",
    description: "Detail page with cards and sections",
    components: [
      { id: "comp-1", type: "section", name: "Header Section", props: {} },
      { id: "comp-2", type: "metric-card", name: "Key Metrics", props: {} },
      { id: "comp-3", type: "container", name: "Details Container", props: {} },
    ],
  },
};

// Component Library - Reordered: Layout first, then Platform, then UI
const COMPONENT_LIBRARY = {
  layout: {
    "app-header": {
      name: "App Header",
      icon: Layers,
      category: "Layout",
      description: "Application header with branding, navbar, avatar",
      properties: {
        showLogo: { type: "boolean", default: true, label: "Show Logo" },
        showNavbar: { type: "boolean", default: true, label: "Show Navbar" },
        showAvatar: { type: "boolean", default: true, label: "Show User Avatar" },
        showLoginInfo: { type: "boolean", default: true, label: "Show Login Info" },
        backgroundColor: { type: "color", default: "#ffffff", label: "Background" },
        sticky: { type: "boolean", default: true, label: "Sticky Header" },
      },
    },
    "toolbar": {
      name: "Toolbar",
      icon: Settings,
      category: "Layout",
      description: "Action toolbar with buttons",
      properties: {
        showSearch: { type: "boolean", default: false, label: "Show Search" },
        showActions: { type: "boolean", default: true, label: "Show Action Buttons" },
        backgroundColor: { type: "color", default: "#f9fafb", label: "Background" },
        padding: { type: "number", default: 12, label: "Padding" },
      },
    },
    "container": {
      name: "Container",
      icon: Layout,
      category: "Layout",
      description: "Content container",
      properties: {
        padding: { type: "number", default: 16, label: "Padding" },
        margin: { type: "number", default: 0, label: "Margin" },
        backgroundColor: { type: "color", default: "#ffffff", label: "Background" },
        borderRadius: { type: "number", default: 8, label: "Border Radius" },
      },
    },
    "grid": {
      name: "Grid",
      icon: Grid,
      category: "Layout",
      description: "Grid layout",
      properties: {
        columns: { type: "number", default: 3, label: "Columns", min: 1, max: 12 },
        gap: { type: "number", default: 16, label: "Gap" },
        responsive: { type: "boolean", default: true, label: "Responsive" },
      },
    },
    "section": {
      name: "Section",
      icon: Layers,
      category: "Layout",
      description: "Page section",
      properties: {
        padding: { type: "number", default: 24, label: "Padding" },
        backgroundColor: { type: "color", default: "#f9fafb", label: "Background" },
      },
    },
    "side-nav": {
      name: "Left Sidebar Nav",
      icon: Layout,
      category: "Layout",
      description: "Left navigation rail for app pages",
      properties: {
        items: {
          type: "text",
          default: "Home, Claims, AI Watchtower, SLA & Operations, Knowledge Hub",
          label: "Nav Items (comma-separated)",
        },
      },
    },
  },
  platform: {
    "sop-reasoning-card": {
      name: "SOP Reasoning Card",
      icon: Brain,
      category: "Platform (SOP Executor)",
      description: "AI reasoning card with SOP matching",
      platform: "sop-executor",
    },
    "sop-viewer": {
      name: "SOP Viewer",
      icon: Layers,
      category: "Platform (SOP Executor)",
      description: "Document viewer for SOPs",
      platform: "sop-executor",
    },
    "work-order-card": {
      name: "Work Order Card",
      icon: Zap,
      category: "Platform (Field Service)",
      description: "Field service work order display",
      platform: "field-service",
    },
    "asset-card": {
      name: "Asset Card",
      icon: Database,
      category: "Platform (Field Service)",
      description: "Asset information card",
      platform: "field-service",
    },
  },
  "form-controls": {
    "button": {
      name: "Button",
      icon: MousePointer,
      category: "Form Controls",
      description: "Clickable button",
      properties: {
        label: { type: "text", default: "Click Me", label: "Button Label" },
        variant: { type: "select", default: "primary", label: "Variant", options: ["primary", "secondary", "outline", "ghost", "danger"] },
        size: { type: "select", default: "medium", label: "Size", options: ["small", "medium", "large"] },
        disabled: { type: "boolean", default: false, label: "Disabled" },
        fullWidth: { type: "boolean", default: false, label: "Full Width" },
        icon: { type: "text", default: "", label: "Icon Name (optional)" },
      },
    },
    "input": {
      name: "Text Input",
      icon: Type,
      category: "Form Controls",
      description: "Single-line text input",
      properties: {
        placeholder: { type: "text", default: "Enter text...", label: "Placeholder" },
        label: { type: "text", default: "Label", label: "Field Label" },
        required: { type: "boolean", default: false, label: "Required" },
        disabled: { type: "boolean", default: false, label: "Disabled" },
        maxLength: { type: "number", default: null, label: "Max Length", min: 1 },
        type: { type: "select", default: "text", label: "Input Type", options: ["text", "email", "password", "number", "tel", "url"] },
      },
    },
    "textarea": {
      name: "Textarea",
      icon: FileText,
      category: "Form Controls",
      description: "Multi-line text input",
      properties: {
        placeholder: { type: "text", default: "Enter text...", label: "Placeholder" },
        label: { type: "text", default: "Label", label: "Field Label" },
        rows: { type: "number", default: 4, label: "Rows", min: 2, max: 20 },
        required: { type: "boolean", default: false, label: "Required" },
        disabled: { type: "boolean", default: false, label: "Disabled" },
        resize: { type: "select", default: "vertical", label: "Resize", options: ["none", "vertical", "horizontal", "both"] },
      },
    },
    "dropdown": {
      name: "Dropdown",
      icon: List,
      category: "Form Controls",
      description: "Select dropdown",
      properties: {
        label: { type: "text", default: "Select option", label: "Field Label" },
        options: { type: "text", default: "Option 1, Option 2, Option 3", label: "Options (comma-separated)" },
        required: { type: "boolean", default: false, label: "Required" },
        disabled: { type: "boolean", default: false, label: "Disabled" },
        multiple: { type: "boolean", default: false, label: "Multiple Selection" },
        searchable: { type: "boolean", default: false, label: "Searchable" },
      },
    },
    "checkbox": {
      name: "Checkbox",
      icon: CheckSquare,
      category: "Form Controls",
      description: "Checkbox input",
      properties: {
        label: { type: "text", default: "Checkbox label", label: "Label" },
        checked: { type: "boolean", default: false, label: "Checked by default" },
        disabled: { type: "boolean", default: false, label: "Disabled" },
      },
    },
    "radio": {
      name: "Radio Button",
      icon: Circle,
      category: "Form Controls",
      description: "Radio button group",
      properties: {
        label: { type: "text", default: "Select option", label: "Group Label" },
        options: { type: "text", default: "Option 1, Option 2, Option 3", label: "Options (comma-separated)" },
        defaultValue: { type: "text", default: "", label: "Default Value" },
        disabled: { type: "boolean", default: false, label: "Disabled" },
        layout: { type: "select", default: "vertical", label: "Layout", options: ["vertical", "horizontal"] },
      },
    },
    "switch": {
      name: "Switch/Toggle",
      icon: ToggleLeft,
      category: "Form Controls",
      description: "Toggle switch",
      properties: {
        label: { type: "text", default: "Toggle switch", label: "Label" },
        checked: { type: "boolean", default: false, label: "Checked by default" },
        disabled: { type: "boolean", default: false, label: "Disabled" },
        size: { type: "select", default: "medium", label: "Size", options: ["small", "medium", "large"] },
      },
    },
    "date-picker": {
      name: "Date Picker",
      icon: Calendar,
      category: "Form Controls",
      description: "Date selection input",
      properties: {
        label: { type: "text", default: "Select date", label: "Field Label" },
        required: { type: "boolean", default: false, label: "Required" },
        disabled: { type: "boolean", default: false, label: "Disabled" },
        mode: { type: "select", default: "single", label: "Mode", options: ["single", "range"] },
        format: { type: "text", default: "MM/DD/YYYY", label: "Date Format" },
      },
    },
    "file-upload": {
      name: "File Upload",
      icon: Upload,
      category: "Form Controls",
      description: "File upload input",
      properties: {
        label: { type: "text", default: "Upload file", label: "Field Label" },
        accept: { type: "text", default: "*/*", label: "Accepted Types" },
        multiple: { type: "boolean", default: false, label: "Multiple Files" },
        maxSize: { type: "number", default: 10, label: "Max Size (MB)", min: 1 },
        required: { type: "boolean", default: false, label: "Required" },
        disabled: { type: "boolean", default: false, label: "Disabled" },
      },
    },
    "slider": {
      name: "Slider",
      icon: Sliders,
      category: "Form Controls",
      description: "Range slider input",
      properties: {
        label: { type: "text", default: "Select value", label: "Field Label" },
        min: { type: "number", default: 0, label: "Min Value" },
        max: { type: "number", default: 100, label: "Max Value" },
        step: { type: "number", default: 1, label: "Step", min: 0.1 },
        defaultValue: { type: "number", default: 50, label: "Default Value" },
        disabled: { type: "boolean", default: false, label: "Disabled" },
        showValue: { type: "boolean", default: true, label: "Show Value" },
      },
    },
    "rating": {
      name: "Rating",
      icon: Star,
      category: "Form Controls",
      description: "Star rating input",
      properties: {
        label: { type: "text", default: "Rating", label: "Field Label" },
        max: { type: "number", default: 5, label: "Max Rating", min: 1, max: 10 },
        defaultValue: { type: "number", default: 0, label: "Default Value" },
        disabled: { type: "boolean", default: false, label: "Disabled" },
        allowHalf: { type: "boolean", default: false, label: "Allow Half Stars" },
      },
    },
  },
  "data-display": {
    "data-table": {
      name: "Data Table",
      icon: Layers,
      category: "Data Display",
      description: "Sortable, filterable data table",
      properties: {
        showSearch: { type: "boolean", default: true, label: "Show Search" },
        showPagination: { type: "boolean", default: true, label: "Show Pagination" },
        pageSize: { type: "number", default: 10, label: "Page Size", min: 5, max: 100 },
        striped: { type: "boolean", default: false, label: "Striped Rows" },
        bordered: { type: "boolean", default: true, label: "Bordered" },
        sortable: { type: "boolean", default: true, label: "Sortable" },
        selectable: { type: "boolean", default: false, label: "Row Selection" },
      },
    },
    "list": {
      name: "List",
      icon: List,
      category: "Data Display",
      description: "Item list display",
      properties: {
        layout: { type: "select", default: "vertical", label: "Layout", options: ["vertical", "horizontal"] },
        bordered: { type: "boolean", default: false, label: "Bordered" },
        striped: { type: "boolean", default: false, label: "Striped" },
        size: { type: "select", default: "medium", label: "Size", options: ["small", "medium", "large"] },
      },
    },
    "card": {
      name: "Card",
      icon: CreditCard,
      category: "Data Display",
      description: "Content card container",
      properties: {
        title: { type: "text", default: "Card Title", label: "Title" },
        showHeader: { type: "boolean", default: true, label: "Show Header" },
        showFooter: { type: "boolean", default: false, label: "Show Footer" },
        bordered: { type: "boolean", default: true, label: "Bordered" },
        shadow: { type: "select", default: "sm", label: "Shadow", options: ["none", "sm", "md", "lg"] },
        hoverable: { type: "boolean", default: false, label: "Hoverable" },
      },
    },
    "badge": {
      name: "Badge",
      icon: Badge,
      category: "Data Display",
      description: "Status badge",
      properties: {
        text: { type: "text", default: "Badge", label: "Badge Text" },
        variant: { type: "select", default: "default", label: "Variant", options: ["default", "primary", "success", "warning", "danger", "info"] },
        size: { type: "select", default: "medium", label: "Size", options: ["small", "medium", "large"] },
        dot: { type: "boolean", default: false, label: "Dot Style" },
      },
    },
    "tag": {
      name: "Tag",
      icon: Tag,
      category: "Data Display",
      description: "Tag/label display",
      properties: {
        text: { type: "text", default: "Tag", label: "Tag Text" },
        color: { type: "color", default: "#3b82f6", label: "Color" },
        closable: { type: "boolean", default: false, label: "Closable" },
        size: { type: "select", default: "medium", label: "Size", options: ["small", "medium", "large"] },
      },
    },
    "metric-card": {
      name: "Metric Card",
      icon: TrendingUp,
      category: "Data Display",
      description: "Display key metrics",
      properties: {
        title: { type: "text", default: "Metric", label: "Title" },
        value: { type: "text", default: "1,234", label: "Value" },
        showIcon: { type: "boolean", default: true, label: "Show Icon" },
        showTrend: { type: "boolean", default: false, label: "Show Trend" },
        backgroundColor: { type: "color", default: "#ffffff", label: "Background" },
        borderColor: { type: "color", default: "#e5e7eb", label: "Border" },
      },
    },
    "stat-card": {
      name: "Stat Card",
      icon: BarChart3,
      category: "Data Display",
      description: "Statistics card with icon",
      properties: {
        title: { type: "text", default: "Total", label: "Title" },
        value: { type: "text", default: "0", label: "Value" },
        change: { type: "text", default: "+12%", label: "Change" },
        icon: { type: "text", default: "TrendingUp", label: "Icon Name" },
        trend: { type: "select", default: "up", label: "Trend", options: ["up", "down", "neutral"] },
      },
    },
    "timeline": {
      name: "Timeline",
      icon: Clock,
      category: "Data Display",
      description: "Timeline/activity feed",
      properties: {
        mode: { type: "select", default: "left", label: "Mode", options: ["left", "right", "alternate"] },
        showTime: { type: "boolean", default: true, label: "Show Time" },
        pending: { type: "boolean", default: false, label: "Show Pending" },
      },
    },
  },
  "charts-graphs": {
    "bar-chart": {
      name: "Bar Chart",
      icon: BarChart3,
      category: "Charts & Graphs",
      description: "Bar chart visualization",
      properties: {
        title: { type: "text", default: "Bar Chart", label: "Chart Title" },
        showLegend: { type: "boolean", default: true, label: "Show Legend" },
        showGrid: { type: "boolean", default: true, label: "Show Grid" },
        height: { type: "number", default: 300, label: "Height", min: 200, max: 800 },
        stacked: { type: "boolean", default: false, label: "Stacked Bars" },
        horizontal: { type: "boolean", default: false, label: "Horizontal" },
      },
    },
    "line-chart": {
      name: "Line Chart",
      icon: LineChart,
      category: "Charts & Graphs",
      description: "Line chart visualization",
      properties: {
        title: { type: "text", default: "Line Chart", label: "Chart Title" },
        showLegend: { type: "boolean", default: true, label: "Show Legend" },
        showGrid: { type: "boolean", default: true, label: "Show Grid" },
        height: { type: "number", default: 300, label: "Height", min: 200, max: 800 },
        smooth: { type: "boolean", default: false, label: "Smooth Lines" },
        showPoints: { type: "boolean", default: true, label: "Show Data Points" },
      },
    },
    "pie-chart": {
      name: "Pie Chart",
      icon: PieChart,
      category: "Charts & Graphs",
      description: "Pie chart visualization",
      properties: {
        title: { type: "text", default: "Pie Chart", label: "Chart Title" },
        showLegend: { type: "boolean", default: true, label: "Show Legend" },
        height: { type: "number", default: 300, label: "Height", min: 200, max: 800 },
        donut: { type: "boolean", default: false, label: "Donut Style" },
        showLabels: { type: "boolean", default: true, label: "Show Labels" },
      },
    },
    "area-chart": {
      name: "Area Chart",
      icon: TrendingUp,
      category: "Charts & Graphs",
      description: "Area chart visualization",
      properties: {
        title: { type: "text", default: "Area Chart", label: "Chart Title" },
        showLegend: { type: "boolean", default: true, label: "Show Legend" },
        showGrid: { type: "boolean", default: true, label: "Show Grid" },
        height: { type: "number", default: 300, label: "Height", min: 200, max: 800 },
        stacked: { type: "boolean", default: false, label: "Stacked Areas" },
      },
    },
    "gauge": {
      name: "Gauge",
      icon: Circle,
      category: "Charts & Graphs",
      description: "Gauge/speedometer chart",
      properties: {
        title: { type: "text", default: "Gauge", label: "Chart Title" },
        min: { type: "number", default: 0, label: "Min Value" },
        max: { type: "number", default: 100, label: "Max Value" },
        value: { type: "number", default: 50, label: "Current Value" },
        height: { type: "number", default: 200, label: "Height", min: 150, max: 400 },
      },
    },
    "heatmap": {
      name: "Heatmap",
      icon: Grid,
      category: "Charts & Graphs",
      description: "Heatmap visualization",
      properties: {
        title: { type: "text", default: "Heatmap", label: "Chart Title" },
        showLegend: { type: "boolean", default: true, label: "Show Legend" },
        height: { type: "number", default: 300, label: "Height", min: 200, max: 800 },
      },
    },
  },
  "navigation": {
    "tabs": {
      name: "Tabs",
      icon: Layers,
      category: "Navigation",
      description: "Tab navigation",
      properties: {
        tabs: { type: "text", default: "Tab 1, Tab 2, Tab 3", label: "Tab Labels (comma-separated)" },
        defaultTab: { type: "text", default: "Tab 1", label: "Default Tab" },
        position: { type: "select", default: "top", label: "Position", options: ["top", "bottom", "left", "right"] },
        size: { type: "select", default: "medium", label: "Size", options: ["small", "medium", "large"] },
        type: { type: "select", default: "line", label: "Type", options: ["line", "card", "button"] },
      },
    },
    "breadcrumbs": {
      name: "Breadcrumbs",
      icon: ChevronRight,
      category: "Navigation",
      description: "Breadcrumb navigation",
      properties: {
        items: { type: "text", default: "Home, Products, Item", label: "Items (comma-separated)" },
        separator: { type: "select", default: "/", label: "Separator", options: ["/", ">", "•", "→"] },
      },
    },
    "pagination": {
      name: "Pagination",
      icon: ChevronLeft,
      category: "Navigation",
      description: "Page navigation",
      properties: {
        total: { type: "number", default: 100, label: "Total Items", min: 1 },
        pageSize: { type: "number", default: 10, label: "Page Size", min: 5, max: 100 },
        currentPage: { type: "number", default: 1, label: "Current Page", min: 1 },
        showSizeChanger: { type: "boolean", default: false, label: "Show Size Changer" },
        showQuickJumper: { type: "boolean", default: false, label: "Show Quick Jumper" },
      },
    },
    "menu": {
      name: "Menu",
      icon: Menu,
      category: "Navigation",
      description: "Navigation menu",
      properties: {
        mode: { type: "select", default: "vertical", label: "Mode", options: ["vertical", "horizontal", "inline"] },
        theme: { type: "select", default: "light", label: "Theme", options: ["light", "dark"] },
        collapsed: { type: "boolean", default: false, label: "Collapsed" },
      },
    },
    "steps": {
      name: "Steps",
      icon: CheckCircle,
      category: "Navigation",
      description: "Step indicator",
      properties: {
        steps: { type: "text", default: "Step 1, Step 2, Step 3", label: "Steps (comma-separated)" },
        current: { type: "number", default: 0, label: "Current Step", min: 0 },
        direction: { type: "select", default: "horizontal", label: "Direction", options: ["horizontal", "vertical"] },
        size: { type: "select", default: "default", label: "Size", options: ["default", "small"] },
      },
    },
  },
  "feedback": {
    "alert": {
      name: "Alert",
      icon: AlertCircle,
      category: "Feedback",
      description: "Alert message",
      properties: {
        message: { type: "text", default: "This is an alert message", label: "Message" },
        type: { type: "select", default: "info", label: "Type", options: ["success", "info", "warning", "error"] },
        showIcon: { type: "boolean", default: true, label: "Show Icon" },
        closable: { type: "boolean", default: false, label: "Closable" },
        banner: { type: "boolean", default: false, label: "Banner Style" },
      },
    },
    "progress-bar": {
      name: "Progress Bar",
      icon: Loader2,
      category: "Feedback",
      description: "Progress indicator",
      properties: {
        percent: { type: "number", default: 50, label: "Progress (%)", min: 0, max: 100 },
        showInfo: { type: "boolean", default: true, label: "Show Percentage" },
        status: { type: "select", default: "active", label: "Status", options: ["active", "success", "exception", "normal"] },
        strokeWidth: { type: "number", default: 8, label: "Stroke Width", min: 2, max: 20 },
        strokeColor: { type: "color", default: "#1890ff", label: "Stroke Color" },
      },
    },
    "spinner": {
      name: "Spinner",
      icon: Loader2,
      category: "Feedback",
      description: "Loading spinner",
      properties: {
        size: { type: "select", default: "medium", label: "Size", options: ["small", "medium", "large"] },
        tip: { type: "text", default: "", label: "Loading Text" },
        delay: { type: "number", default: 0, label: "Delay (ms)", min: 0 },
      },
    },
    "skeleton": {
      name: "Skeleton",
      icon: Square,
      category: "Feedback",
      description: "Loading skeleton",
      properties: {
        active: { type: "boolean", default: true, label: "Animated" },
        rows: { type: "number", default: 3, label: "Rows", min: 1, max: 10 },
        paragraph: { type: "boolean", default: true, label: "Show Paragraph" },
      },
    },
    "toast": {
      name: "Toast",
      icon: Bell,
      category: "Feedback",
      description: "Toast notification",
      properties: {
        message: { type: "text", default: "Toast message", label: "Message" },
        type: { type: "select", default: "info", label: "Type", options: ["success", "info", "warning", "error"] },
        duration: { type: "number", default: 3000, label: "Duration (ms)", min: 1000 },
        position: { type: "select", default: "topRight", label: "Position", options: ["topLeft", "topRight", "bottomLeft", "bottomRight", "top", "bottom"] },
      },
    },
    "modal": {
      name: "Modal",
      icon: Maximize2,
      category: "Feedback",
      description: "Modal dialog",
      properties: {
        title: { type: "text", default: "Modal Title", label: "Title" },
        visible: { type: "boolean", default: false, label: "Visible" },
        width: { type: "number", default: 520, label: "Width", min: 200, max: 1200 },
        closable: { type: "boolean", default: true, label: "Closable" },
        maskClosable: { type: "boolean", default: true, label: "Close on Mask Click" },
        centered: { type: "boolean", default: false, label: "Centered" },
      },
    },
    "drawer": {
      name: "Drawer",
      icon: Sidebar,
      category: "Feedback",
      description: "Side drawer",
      properties: {
        title: { type: "text", default: "Drawer Title", label: "Title" },
        visible: { type: "boolean", default: false, label: "Visible" },
        placement: { type: "select", default: "right", label: "Placement", options: ["top", "right", "bottom", "left"] },
        width: { type: "number", default: 378, label: "Width", min: 200, max: 800 },
        closable: { type: "boolean", default: true, label: "Closable" },
      },
    },
    "notification": {
      name: "Notification",
      icon: Bell,
      category: "Feedback",
      description: "Notification badge",
      properties: {
        count: { type: "number", default: 0, label: "Count", min: 0 },
        showZero: { type: "boolean", default: false, label: "Show Zero" },
        overflowCount: { type: "number", default: 99, label: "Overflow Count", min: 1 },
        dot: { type: "boolean", default: false, label: "Dot Style" },
      },
    },
  },
  "advanced": {
    "splitter": {
      name: "Splitter",
      icon: GripVertical,
      category: "Advanced",
      description: "Resizable split panel",
      properties: {
        direction: { type: "select", default: "horizontal", label: "Direction", options: ["horizontal", "vertical"] },
        split: { type: "number", default: 50, label: "Split (%)", min: 0, max: 100 },
        minSize: { type: "number", default: 10, label: "Min Size (%)", min: 0, max: 50 },
        maxSize: { type: "number", default: 90, label: "Max Size (%)", min: 50, max: 100 },
        resizable: { type: "boolean", default: true, label: "Resizable" },
      },
    },
    "resizer": {
      name: "Resizer",
      icon: GripHorizontal,
      category: "Advanced",
      description: "Resizable container",
      properties: {
        direction: { type: "select", default: "both", label: "Direction", options: ["horizontal", "vertical", "both"] },
        minWidth: { type: "number", default: 100, label: "Min Width (px)", min: 50 },
        minHeight: { type: "number", default: 100, label: "Min Height (px)", min: 50 },
        maxWidth: { type: "number", default: null, label: "Max Width (px)" },
        maxHeight: { type: "number", default: null, label: "Max Height (px)" },
      },
    },
    "accordion": {
      name: "Accordion",
      icon: ChevronDown,
      category: "Advanced",
      description: "Collapsible accordion",
      properties: {
        items: { type: "text", default: "Item 1, Item 2, Item 3", label: "Items (comma-separated)" },
        defaultActiveKey: { type: "text", default: "", label: "Default Active" },
        accordion: { type: "boolean", default: true, label: "Only One Open" },
        bordered: { type: "boolean", default: true, label: "Bordered" },
      },
    },
    "carousel": {
      name: "Carousel",
      icon: ArrowRight,
      category: "Advanced",
      description: "Image/content carousel",
      properties: {
        autoplay: { type: "boolean", default: false, label: "Autoplay" },
        dots: { type: "boolean", default: true, label: "Show Dots" },
        arrows: { type: "boolean", default: true, label: "Show Arrows" },
        effect: { type: "select", default: "scroll", label: "Effect", options: ["scroll", "fade", "slide"] },
        speed: { type: "number", default: 500, label: "Speed (ms)", min: 100, max: 2000 },
      },
    },
    "tabs-advanced": {
      name: "Advanced Tabs",
      icon: Layers,
      category: "Advanced",
      description: "Tabs with add/remove",
      properties: {
        editable: { type: "boolean", default: false, label: "Editable" },
        addable: { type: "boolean", default: false, label: "Addable" },
        closable: { type: "boolean", default: false, label: "Closable" },
        type: { type: "select", default: "line", label: "Type", options: ["line", "card", "editable-card"] },
      },
    },
    "tree": {
      name: "Tree",
      icon: Folder,
      category: "Advanced",
      description: "Tree structure",
      properties: {
        checkable: { type: "boolean", default: false, label: "Checkable" },
        defaultExpandAll: { type: "boolean", default: false, label: "Expand All" },
        showLine: { type: "boolean", default: false, label: "Show Line" },
        draggable: { type: "boolean", default: false, label: "Draggable" },
      },
    },
    "transfer": {
      name: "Transfer",
      icon: ArrowRight,
      category: "Advanced",
      description: "Transfer list",
      properties: {
        titles: { type: "text", default: "Source, Target", label: "Titles (comma-separated)" },
        showSearch: { type: "boolean", default: false, label: "Show Search" },
        operations: { type: "text", default: ">, <", label: "Operations" },
      },
    },
    "timeline-advanced": {
      name: "Advanced Timeline",
      icon: Clock,
      category: "Advanced",
      description: "Timeline with custom content",
      properties: {
        mode: { type: "select", default: "left", label: "Mode", options: ["left", "right", "alternate"] },
        reverse: { type: "boolean", default: false, label: "Reverse" },
        pending: { type: "text", default: "", label: "Pending Text" },
      },
    },
  },
  platform: {
    "sop-reasoning-card": {
      name: "SOP Reasoning Card",
      icon: Brain,
      category: "Platform (SOP Executor)",
      description: "AI reasoning card with SOP matching",
      platform: "sop-executor",
      properties: {
        showConfidence: { type: "boolean", default: true, label: "Show Confidence" },
        showSOPReferences: { type: "boolean", default: true, label: "Show SOP References" },
        compact: { type: "boolean", default: false, label: "Compact Mode" },
      },
    },
    "sop-viewer": {
      name: "SOP Viewer",
      icon: Layers,
      category: "Platform (SOP Executor)",
      description: "Document viewer for SOPs",
      platform: "sop-executor",
      properties: {
        showNavigation: { type: "boolean", default: true, label: "Show Navigation" },
        showSearch: { type: "boolean", default: true, label: "Show Search" },
        defaultZoom: { type: "number", default: 100, label: "Default Zoom", min: 50, max: 200 },
      },
    },
    "work-order-card": {
      name: "Work Order Card",
      icon: Zap,
      category: "Platform (Field Service)",
      description: "Field service work order display",
      platform: "field-service",
      properties: {
        showStatus: { type: "boolean", default: true, label: "Show Status" },
        showPriority: { type: "boolean", default: true, label: "Show Priority" },
        showTechnician: { type: "boolean", default: true, label: "Show Technician" },
      },
    },
    "asset-card": {
      name: "Asset Card",
      icon: Database,
      category: "Platform (Field Service)",
      description: "Asset information card",
      platform: "field-service",
      properties: {
        showHealth: { type: "boolean", default: true, label: "Show Health Score" },
        showLocation: { type: "boolean", default: true, label: "Show Location" },
        showMaintenance: { type: "boolean", default: true, label: "Show Maintenance History" },
      },
    },
  },
};

// AI App Generator - Simulates AI-powered app creation
async function generateAppFromDescription(description, basicInfo) {
  // Try LLM-powered generation first
  try {
    const { generateAppFromPrompt } = await import("../services/ai/appBuilderAgent");
    const llmResult = await generateAppFromPrompt(description, basicInfo);
    
    if (llmResult && llmResult.entities && llmResult.pages) {
      // LLM generation succeeded - return it with pages structure
      return {
        entities: llmResult.entities,
        pages: llmResult.pages, // Return pages directly for LLM-generated apps
        components: llmResult.pages.flatMap((page) => 
          (page.components || []).map((comp) => ({
            ...comp,
            pageTag: page.name.toLowerCase().replace(/\s+/g, "-"),
          }))
        ),
      };
    }
  } catch (error) {
    console.warn("LLM generation failed, falling back to template:", error);
  }

  // Fall back to template-based generation
  // Simulate AI processing with progress updates
  const steps = [
    { label: "Analyzing requirements...", progress: 10 },
    { label: "Designing data model...", progress: 30 },
    { label: "Generating components...", progress: 50 },
    { label: "Configuring platform integration...", progress: 70 },
    { label: "Setting up AI Watchtower...", progress: 85 },
    { label: "Finalizing app structure...", progress: 100 },
  ];

  // Simulate progress
  for (const step of steps) {
    await new Promise((resolve) => setTimeout(resolve, 800));
    if (step.progress === 100) break;
  }

  // Generate app structure based on description
  const entities = [];
  const components = [];

  // Simple AI logic: extract entities and components from description
  const lower = description.toLowerCase();
  const now = Date.now();
  let counter = 0;
  const nextId = () => `gen-${now}-${counter++}`;

  // Detect primary domain/entity
  let mainEntityName = "Record";
  if (lower.includes("claim") || lower.includes("denial") || lower.includes("appeal")) {
    mainEntityName = "Claim";
  } else if (lower.includes("loan") || lower.includes("mortgage")) {
    mainEntityName = "Loan";
  } else if (lower.includes("ticket") || lower.includes("case") || lower.includes("incident")) {
    mainEntityName = "Ticket";
  } else if (lower.includes("order")) {
    mainEntityName = "Order";
  }

  // Primary entity
  if (mainEntityName === "Claim") {
    entities.push({
      id: `entity-${now}`,
      name: "Claim",
      fields: [
        { name: "id", type: "string", required: true },
        { name: "memberId", type: "string", required: true },
        { name: "amount", type: "number", required: true },
        { name: "status", type: "string", required: true },
        { name: "receivedDate", type: "date", required: true },
        { name: "slaRisk", type: "string", required: false },
      ],
    });
  } else if (mainEntityName === "Loan") {
    entities.push({
      id: `entity-${now}`,
      name: "Loan",
      fields: [
        { name: "id", type: "string", required: true },
        { name: "borrowerName", type: "string", required: true },
        { name: "amount", type: "number", required: true },
        { name: "status", type: "string", required: true },
        { name: "dti", type: "number", required: false },
      ],
    });
  } else {
    entities.push({
      id: `entity-${now}`,
      name: mainEntityName,
      fields: [
        { name: "id", type: "string", required: true },
        { name: "name", type: "string", required: true },
        { name: "status", type: "string", required: false },
      ],
    });
  }

  // Core table for main entity (Home / Watchtower)
  const homeTableId = nextId();
  components.push({
    id: homeTableId,
    type: "data-table",
    name: `${mainEntityName}s Table`,
    props: {},
    dataBinding: mainEntityName,
    pageTag: "home",
  });

  // Claims worklist table (separate Claims page)
  const claimsTableId = nextId();
  components.push({
    id: claimsTableId,
    type: "data-table",
    name: `${mainEntityName}s Worklist`,
    props: {},
    dataBinding: mainEntityName,
    pageTag: "claims",
  });

  // SOP / AI reasoning cards if relevant
  if (lower.includes("sop") || basicInfo.platform === "sop-navigator") {
    // Home-level AI insights / Watchtower
    components.push({
      id: nextId(),
      type: "sop-reasoning-card",
      name: "AI Watchtower – Overview",
      props: {},
      dataBinding: null,
      pageTag: "home",
    });

    // Detail-level AI reasoning view
    components.push({
      id: nextId(),
      type: "sop-reasoning-card",
      name: "AI Reasoning – Claim Detail",
      props: {},
      dataBinding: null,
      pageTag: "claim-detail",
    });
  }

  // Production-like scaffolding: header, toolbar, layout, metrics
  const headerId = nextId();
  const toolbarId = nextId();
  const mainContainerId = nextId();
  const metricsGridId = nextId();

  const appTitle = basicInfo.name || "New Application";

  const scaffold = [
    {
      id: headerId,
      type: "app-header",
      name: `${appTitle} Header`,
      props: {
        showLogo: true,
        showNavbar: true,
        showAvatar: true,
        showLoginInfo: true,
      },
      dataBinding: null,
      pageTag: "home",
    },
    {
      id: toolbarId,
      type: "toolbar",
      name: "Primary Toolbar",
      props: {
        showSearch: true,
        showActions: true,
      },
      dataBinding: null,
      pageTag: "home",
    },
    {
      id: mainContainerId,
      type: "container",
      name: `${mainEntityName} Workspace`,
      props: {
        padding: 24,
        backgroundColor: "#ffffff",
      },
      dataBinding: null,
      pageTag: "home",
    },
    {
      id: metricsGridId,
      type: "grid",
      name: "KPI Grid",
      props: {
        columns: 3,
        gap: 16,
      },
      dataBinding: null,
      parentId: mainContainerId,
      pageTag: "home",
    },
    {
      id: nextId(),
      type: "metric-card",
      name: "Open Items",
      props: {
        title: `Open ${mainEntityName}s`,
        value: "128",
        showTrend: true,
      },
      dataBinding: null,
      parentId: metricsGridId,
      pageTag: "home",
    },
    {
      id: nextId(),
      type: "metric-card",
      name: "At Risk",
      props: {
        title: "At Risk / SLA",
        value: "12",
        showTrend: true,
      },
      dataBinding: null,
      parentId: metricsGridId,
      pageTag: "home",
    },
    {
      id: nextId(),
      type: "metric-card",
      name: "Resolved",
      props: {
        title: "Resolved This Week",
        value: "89",
        showTrend: true,
      },
      dataBinding: null,
      parentId: metricsGridId,
      pageTag: "home",
    },
  ];

  // Tag some components for secondary pages (detail and SLA views)
  const detailComponents = [
    {
      id: nextId(),
      type: "section",
      name: `${mainEntityName} Detail Header`,
      props: { padding: 16, backgroundColor: "#ffffff" },
      pageTag: "claim-detail",
    },
    {
      id: nextId(),
      type: "data-table",
      name: `${mainEntityName} Lines`,
      props: {},
      dataBinding: mainEntityName === "Claim" ? "ClaimLine" : mainEntityName,
      pageTag: "claim-detail",
    },
  ];

  const slaComponents = [
    {
      id: nextId(),
      type: "chart",
      name: "SLA Risk Trend",
      props: {},
      pageTag: "sla",
    },
  ];

  // Knowledge Hub scaffolding
  const knowledgeComponents = [
    {
      id: nextId(),
      type: "section",
      name: "Knowledge Hub – Overview",
      props: { padding: 24, backgroundColor: "#ffffff" },
      pageTag: "knowledge",
    },
  ];

  const allComponents = [
    ...scaffold,
    ...components,
    ...detailComponents,
    ...slaComponents,
    ...knowledgeComponents,
  ];

  return {
    entities,
    components: allComponents,
  };
}

// Droppable Canvas Component
function DroppableCanvas({ children, onDrop }) {
  const { setNodeRef, isOver } = useDroppable({
    id: "canvas",
  });

  return (
    <div className="min-h-full bg-slate-50 py-4">
      <div
        ref={setNodeRef}
        className={`max-w-6xl mx-auto bg-white rounded-2xl shadow-md border p-6 transition-colors ${
          isOver ? "border-[#612D91] ring-2 ring-[#612D91]/30" : "border-slate-200"
        }`}
      >
        {children}
      </div>
    </div>
  );
}

// Draggable Component Library Item
function DraggableComponent({ id, name, icon: Icon, disabled = false }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: id,
    disabled: disabled,
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <button
      ref={setNodeRef}
      style={style}
      type="button"
      {...listeners}
      {...attributes}
      className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs cursor-move transition-all ${
        disabled
          ? "bg-gray-50 text-gray-300 cursor-not-allowed"
          : isDragging
          ? "bg-indigo-50 text-[#612D91]"
          : "bg-white text-gray-800 hover:bg-indigo-50"
      }`}
    >
      <span className="truncate">{name}</span>
    </button>
  );
}

export default function AppBuilder({ app: existingApp, onClose, onSave }) {
  const { isAuthenticated } = useAuth();
  const permissions = usePermissions();

  // Check authentication first
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="bg-white rounded-2xl p-8 max-w-md mx-4 shadow-2xl">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign In Required</h2>
          <p className="text-gray-600 mb-6">Please sign in to access the AppBuilder.</p>
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-[#612D91] text-white rounded-lg font-semibold hover:bg-[#7B3DA1] transition"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  // Check access
  if (!permissions.canAccessAppBuilder) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="bg-white rounded-2xl p-8 max-w-md mx-4 shadow-2xl">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Restricted</h2>
          <p className="text-gray-600 mb-6">You need Developer or Admin access to use AppBuilder.</p>
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-[#612D91] text-white rounded-lg font-semibold hover:bg-[#7B3DA1] transition"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const [mode, setMode] = useState(existingApp ? "builder" : "welcome"); // "welcome", "ai-create", "builder"
  const [step, setStep] = useState(1); // For builder mode: 1: Data Model, 2: Build UI
  const [appData, setAppData] = useState(() => {
    if (existingApp) {
      return {
        id: existingApp.id,
        name: existingApp.name,
        tagline: existingApp.tagline,
        description: existingApp.description,
        industry: existingApp.industry,
        platform: existingApp.platformId || "sop-navigator",
        platformName: existingApp.platformName || "SOP Executor",
        dataModel: existingApp.dataModel || { entities: [] },
        pages: existingApp.pages || [{ name: "Home", components: [] }],
        status: existingApp.status || "Workspace",
      };
    }
    return {
      id: `app-${Date.now()}`,
      name: "",
      tagline: "",
      description: "",
      industry: "Cross-Industry",
      platform: "sop-navigator",
      platformName: "SOP Executor",
      dataModel: { entities: [] },
      pages: [{ name: "Home", components: [] }],
      status: "Workspace",
    };
  });

  const [basicInfo, setBasicInfo] = useState({
    name: appData.name,
    tagline: appData.tagline,
    description: appData.description,
    industry: appData.industry,
    platform: appData.platform,
    platformName: appData.platformName,
  });

  const [selectedComponent, setSelectedComponent] = useState(null);
  const [editingEntity, setEditingEntity] = useState(null);
  const [activePage, setActivePage] = useState(0);
  const [viewMode, setViewMode] = useState("canvas"); // "canvas", "preview", "split"
  const [responsiveMode, setResponsiveMode] = useState("desktop"); // "desktop", "tablet", "mobile"
  const [componentSearch, setComponentSearch] = useState("");
  const [aiDescription, setAiDescription] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState({ label: "", progress: 0 });
  const [expandedCategories, setExpandedCategories] = useState({
    layout: true,
    "form-controls": true,
    "data-display": true,
    "charts-graphs": true,
    navigation: true,
    feedback: true,
    advanced: true,
    platform: true,
    templates: true,
  });
  const [showCodeGenerator, setShowCodeGenerator] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  const [draggedComponent, setDraggedComponent] = useState(null);

  const handleDragStart = (event) => {
    setDraggedComponent(event.active.id);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setDraggedComponent(null);

    const overId = over?.id;
    // If reordering within canvas (same parent)
    if (active?.data?.current?.sortable && over?.data?.current?.sortable) {
      const activeId = active.id;
      const overIdSortable = over.id;
      const updatedPages = [...appData.pages];
      const items = updatedPages[activePage].components.filter((c) => c.parentId == null);
      const oldIndex = items.findIndex((c) => c.id === activeId);
      const newIndex = items.findIndex((c) => c.id === overIdSortable);
      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        const reordered = arrayMove(items, oldIndex, newIndex);
        const rest = updatedPages[activePage].components.filter((c) => c.parentId);
        updatedPages[activePage].components = [...reordered, ...rest];
        setAppData({ ...appData, pages: updatedPages });
      }
      return;
    }
    const isCanvasDrop = overId === "canvas";
    const isContainerDrop =
      typeof overId === "string" && overId.startsWith("drop-");

    if (!isCanvasDrop && !isContainerDrop) return;

    const componentType = active.id;
    const componentDef = Object.values(COMPONENT_LIBRARY)
      .flatMap((cat) => Object.entries(cat))
      .find(([key]) => key === componentType)?.[1];

    if (componentDef) {
      const parentId = isContainerDrop ? overId.replace("drop-", "") : null;

      const newComponent = {
        id: `comp-${Date.now()}`,
        type: componentType,
        name: componentDef.name,
        props: {},
        dataBinding: null,
        parentId,
      };

      const updatedPages = [...appData.pages];
      updatedPages[activePage].components.push(newComponent);
      setAppData({ ...appData, pages: updatedPages });
    }
  };

  const handleSave = () => {
    const finalAppData = {
      ...appData,
      ...basicInfo,
      platformId: basicInfo.platform,
    };
    onSave?.(finalAppData);
    setIsSaved(true);
  };

  const handlePublish = () => {
    const finalAppData = {
      ...appData,
      ...basicInfo,
      platformId: basicInfo.platform,
      status: "Published",
      publishedAt: new Date().toISOString(),
      launchKey: `custom-${appData.id}`,
    };
    onSave?.(finalAppData);
  };

  const handleOpenFullPreview = () => {
    if (typeof window === "undefined") return;
    const previewWindow = window.open("", "_blank", "width=1400,height=900");
    if (!previewWindow) return;

    const title = basicInfo.name || appData.name || "FAB App Preview";
    previewWindow.document.title = title;
    previewWindow.document.body.style.margin = "0";
    // Use a neutral background so the app looks like the in-builder preview
    previewWindow.document.body.style.backgroundColor = "#f1f5f9";

    // Clone existing styles into the new window so Tailwind / app styles apply
    try {
      const sourceHead = window.document.head;
      const targetHead = previewWindow.document.head;
      if (sourceHead && targetHead) {
        Array.from(
          sourceHead.querySelectorAll('style, link[rel="stylesheet"]')
        ).forEach((node) => {
          targetHead.appendChild(node.cloneNode(true));
        });
      }
    } catch (err) {
      // Fail silently – worst case, preview is unstyled
      console.error("Failed to copy styles to preview window", err);
    }

    const container = previewWindow.document.createElement("div");
    container.id = "full-preview-root";
    previewWindow.document.body.appendChild(container);

    const root = createRoot(container);

    function StandalonePreview() {
      const [pageIndex, setPageIndex] = useState(activePage);
      const safeIndex =
        pageIndex >= 0 && pageIndex < appData.pages.length ? pageIndex : 0;
      const pageComponents =
        appData.pages[safeIndex]?.components || [];

      return (
        <LivePreview
          components={pageComponents}
          dataModel={appData.dataModel}
          responsiveMode="desktop"
          appName={title}
          pages={appData.pages}
          activePage={safeIndex}
          onNavigatePage={setPageIndex}
          fullScreen={true}
          showBuilderChrome={false}
        />
      );
    }

    root.render(<StandalonePreview />);
  };

  // Recursive renderer for nested components
  const renderComponents = (parentId = null, depth = 0) => {
    const items = appData.pages[activePage].components.filter(
      (c) => (c.parentId ?? null) === parentId
    );
    if (items.length === 0) return null;

    const parent =
      parentId == null
        ? null
        : appData.pages[activePage].components.find((c) => c.id === parentId);
    const isGridParent = parent?.type === "grid";
    const gridColumns = parent?.props?.columns || 3;

    return (
      <SortableContext items={items.map((i) => i.id)} strategy={rectSortingStrategy}>
        <div
          className={
            isGridParent
              ? "mt-2 grid gap-3"
              : ""
          }
          style={
            isGridParent
              ? { gridTemplateColumns: `repeat(${gridColumns}, minmax(0, 1fr))` }
              : undefined
          }
        >
          {items.map((comp) => (
            <div
              key={comp.id}
              className={isGridParent ? "" : depth > 0 ? "ml-4" : ""}
            >
              <ComponentPreview
                component={comp}
                isSelected={selectedComponent?.id === comp.id}
                onClick={() => setSelectedComponent(comp)}
                hasChildren={
                  appData.pages[activePage].components.some(
                    (child) => (child.parentId ?? null) === comp.id
                  )
                }
              />
              {renderComponents(comp.id, depth + 1)}
            </div>
          ))}
        </div>
      </SortableContext>
    );
  };

  const handleAICreate = async () => {
    if (!aiDescription.trim()) return;

    setIsGenerating(true);
    setGenerationProgress({ label: "Starting...", progress: 0 });

    try {
      // Simulate AI generation with progress updates
      const steps = [
        { label: "Analyzing requirements...", progress: 10 },
        { label: "Designing data model...", progress: 30 },
        { label: "Generating components...", progress: 50 },
        { label: "Configuring platform integration...", progress: 70 },
        { label: "Setting up AI Watchtower...", progress: 85 },
        { label: "Finalizing app structure...", progress: 100 },
      ];

      for (const step of steps) {
        setGenerationProgress(step);
        await new Promise((resolve) => setTimeout(resolve, 800));
      }

      // Generate app structure
      const generated = await generateAppFromDescription(aiDescription, basicInfo);

      // Check if LLM returned pages directly (new format)
      let pages = [];
      if (generated.pages && Array.isArray(generated.pages)) {
        // LLM returned pages directly - use them
        pages = generated.pages.map((page) => ({
          name: page.name,
          components: (page.components || []).map((comp) => ({
            ...comp,
            parentId: comp.parentId ?? null,
          })),
        }));
      } else {
        // Template-based generation - normalize and group by pageTag
        const normalizedComponents = (generated.components || []).map((comp) => ({
          ...comp,
          parentId: comp.parentId ?? null,
        }));

        // Build multi-page scaffolding aligned to Cogniclaim-style layout
        const homeComponents = normalizedComponents.filter(
          (c) => !c.pageTag || c.pageTag === "home" || c.pageTag === "ai-watchtower"
        );
        const claimsComponents = normalizedComponents.filter((c) => c.pageTag === "claims");
        const detailComponents = normalizedComponents.filter((c) => c.pageTag === "claim-detail" || c.pageTag === "ai-reasoning");
        const slaComponents = normalizedComponents.filter(
          (c) => c.pageTag === "sla" || c.pageTag === "sla-insights-section" || c.pageTag === "sla-and-operations"
        );
        const knowledgeComponents = normalizedComponents.filter((c) => c.pageTag === "knowledge" || c.pageTag === "knowledge-hub");

        pages = [
          { name: "AI Watchtower", components: homeComponents },
          {
            name: "Claims",
            components: claimsComponents.length ? claimsComponents : homeComponents,
          },
          {
            name: "AI Reasoning",
            components: detailComponents.length ? detailComponents : homeComponents,
          },
          {
            name: "SLA and Operations",
            components: slaComponents.length ? slaComponents : homeComponents,
          },
          {
            name: "Knowledge Hub",
            components: knowledgeComponents.length ? knowledgeComponents : homeComponents,
          },
          {
            name: "Settings",
            components: [],
          },
        ];
      }

      // Try to align page names to nav items explicitly listed in the prompt
      try {
        const lines = aiDescription.split("\n");
        const navItems = lines
          .filter((line) => line.trim().startsWith("-"))
          .map((line) =>
            line
              .trim()
              .replace(/^-\s*/, "")
              .replace(/^["“”]+|["“”]+$/g, "")
          )
          .filter((txt) => txt && !txt.toLowerCase().includes("persistent left sidebar"));

        if (navItems.length) {
          pages = pages.map((page, idx) => ({
            ...page,
            name: navItems[idx] || page.name,
          }));
        }
      } catch {
        // best-effort only; if parsing fails, keep default names
      }

      // Update app data with generated structure
      setAppData({
        ...appData,
        dataModel: { entities: generated.entities || [] },
        pages,
      });

      setIsGenerating(false);
      setMode("builder");
      setStep(2); // Go to build UI step
    } catch (error) {
      console.error("AI generation error:", error);
      setIsGenerating(false);
    }
  };

  const toggleCategory = (category) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  // Welcome Screen
  if (mode === "welcome") {
    return (
      <div className="fixed inset-0 bg-gray-900 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl"
        >
          <div className="p-8 space-y-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#612D91] to-[#A64AC9] mb-4">
                <Wand2 className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Create New Application</h2>
              <p className="text-gray-600">Choose how you'd like to build your app</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => setMode("ai-create")}
                className="p-6 rounded-xl border-2 border-[#612D91] bg-gradient-to-br from-indigo-50 to-purple-50 hover:shadow-lg transition-all text-left"
              >
                <Sparkles className="w-6 h-6 text-[#612D91] mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">AI-Powered Creation</h3>
                <p className="text-sm text-gray-600">
                  Describe your app and let AI generate it automatically
                </p>
              </button>

              <button
                onClick={() => {
                  // First capture basic info
                  setMode("basic-info");
                }}
                className="p-6 rounded-xl border-2 border-gray-200 hover:border-[#612D91] hover:shadow-lg transition-all text-left"
              >
                <Layers className="w-6 h-6 text-gray-600 mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Manual Builder</h3>
                <p className="text-sm text-gray-600">
                  Build your app step by step with full control
                </p>
              </button>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Basic Info Screen (before builder)
  if (mode === "basic-info") {
    return (
      <div className="fixed inset-0 bg-gray-900 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl"
        >
          <div className="p-8 space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Basic Information</h2>
              <p className="text-gray-600">Tell us about your application</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">App Name *</label>
                <input
                  type="text"
                  value={basicInfo.name}
                  onChange={(e) => setBasicInfo({ ...basicInfo, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#612D91] focus:border-transparent"
                  placeholder="My Custom App"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tagline</label>
                <input
                  type="text"
                  value={basicInfo.tagline}
                  onChange={(e) => setBasicInfo({ ...basicInfo, tagline: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#612D91] focus:border-transparent"
                  placeholder="AI-powered solution"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={basicInfo.description}
                  onChange={(e) => setBasicInfo({ ...basicInfo, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#612D91] focus:border-transparent"
                  rows={3}
                  placeholder="Describe what your app does..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Platform</label>
                  <select
                    value={basicInfo.platform}
                    onChange={(e) => {
                      const platformMap = {
                        "sop-navigator": "SOP Executor",
                        "field-service": "Field Service Platform",
                      };
                      setBasicInfo({
                        ...basicInfo,
                        platform: e.target.value,
                        platformName: platformMap[e.target.value] || "SOP Executor",
                      });
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#612D91] focus:border-transparent"
                  >
                    <option value="sop-navigator">SOP Executor</option>
                    <option value="field-service">Field Service Platform</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                  <select
                    value={basicInfo.industry}
                    onChange={(e) => setBasicInfo({ ...basicInfo, industry: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#612D91] focus:border-transparent"
                  >
                    <option value="Cross-Industry">Cross-Industry</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Financial Services">Financial Services</option>
                    <option value="Manufacturing">Manufacturing</option>
                    <option value="Retail">Retail</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setMode("welcome")}
                className="px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => {
                  setAppData({ ...appData, ...basicInfo });
                  setMode("builder");
                }}
                disabled={!basicInfo.name}
                className="px-6 py-2 rounded-lg bg-gradient-to-r from-[#612D91] to-[#A64AC9] text-white font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue to Builder
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // AI Creation Screen
  if (mode === "ai-create") {
    return (
      <div className="fixed inset-0 bg-gray-900 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl"
        >
          <div className="p-8 space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">AI-Powered App Creation</h2>
              <p className="text-gray-600">Describe your app and we'll build it for you</p>
            </div>

            {!isGenerating ? (
              <>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Basic Information</label>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <input
                        type="text"
                        value={basicInfo.name}
                        onChange={(e) => setBasicInfo({ ...basicInfo, name: e.target.value })}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#612D91] focus:border-transparent"
                        placeholder="App Name"
                      />
                      <select
                        value={basicInfo.platform}
                        onChange={(e) => {
                          const platformMap = {
                            "sop-navigator": "SOP Executor",
                            "field-service": "Field Service Platform",
                          };
                          setBasicInfo({
                            ...basicInfo,
                            platform: e.target.value,
                            platformName: platformMap[e.target.value] || "SOP Executor",
                          });
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#612D91] focus:border-transparent"
                      >
                        <option value="sop-navigator">SOP Executor</option>
                        <option value="field-service">Field Service Platform</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Describe your app in detail
                    </label>
                    <textarea
                      value={aiDescription}
                      onChange={(e) => setAiDescription(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#612D91] focus:border-transparent min-h-[200px]"
                      placeholder="Example: I need an app to manage healthcare claims. It should have a table to view all claims, show claim details, and use AI to analyze each claim against SOP guidelines..."
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Be as detailed as possible. Include entities, features, and any specific requirements.
                    </p>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setMode("welcome")}
                    className="px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleAICreate}
                    disabled={!aiDescription.trim() || !basicInfo.name}
                    className="px-6 py-2 rounded-lg bg-gradient-to-r from-[#612D91] to-[#A64AC9] text-white font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    Generate App
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#612D91] to-[#A64AC9] mb-4 animate-pulse">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {generationProgress.label}
                  </h3>
                  <div className="w-full bg-gray-200 rounded-full h-3 max-w-md mx-auto">
                    <motion.div
                      className="bg-gradient-to-r from-[#612D91] to-[#A64AC9] h-3 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${generationProgress.progress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{generationProgress.progress}%</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  // Main Builder
  return (
    <div className="fixed inset-0 bg-gray-900 z-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-2 rounded-lg bg-gradient-to-br from-[#612D91] to-[#A64AC9]">
            <Wand2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">AI App Builder</h2>
            <p className="text-xs text-gray-600">
              {appData.name || basicInfo.name || "New Application"} • {basicInfo.platformName || appData.platformName}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Responsive Controls */}
          <div className="flex items-center gap-1 border border-gray-200 rounded-lg p-1">
            <button
              onClick={() => setResponsiveMode("desktop")}
              className={`p-1.5 rounded transition-colors ${
                responsiveMode === "desktop" ? "bg-[#612D91] text-white" : "text-gray-600 hover:bg-gray-100"
              }`}
              title="Desktop"
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button
              onClick={() => setResponsiveMode("tablet")}
              className={`p-1.5 rounded transition-colors ${
                responsiveMode === "tablet" ? "bg-[#612D91] text-white" : "text-gray-600 hover:bg-gray-100"
              }`}
              title="Tablet"
            >
              <Tablet className="w-4 h-4" />
            </button>
            <button
              onClick={() => setResponsiveMode("mobile")}
              className={`p-1.5 rounded transition-colors ${
                responsiveMode === "mobile" ? "bg-[#612D91] text-white" : "text-gray-600 hover:bg-gray-100"
              }`}
              title="Mobile"
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>

          {/* View Mode + Run Controls */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 border border-gray-200 rounded-lg p-1">
              <button
                onClick={() => setViewMode("canvas")}
                className={`p-1.5 rounded transition-colors ${
                  viewMode === "canvas" ? "bg-[#612D91] text-white" : "text-gray-600 hover:bg-gray-100"
                }`}
                title="Canvas Only"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("split")}
                className={`p-1.5 rounded transition-colors ${
                  viewMode === "split" ? "bg-[#612D91] text-white" : "text-gray-600 hover:bg-gray-100"
                }`}
                title="Split View"
              >
                <Split className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("preview")}
                className={`p-1.5 rounded transition-colors ${
                  viewMode === "preview" ? "bg-[#612D91] text-white" : "text-gray-600 hover:bg-gray-100"
                }`}
                title="Preview Only"
              >
                <Eye className="w-4 h-4" />
              </button>
            </div>
            {/* Run in new tab (opens full-page preview) */}
            <button
              type="button"
              onClick={handleOpenFullPreview}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-gray-100"
              title="Run app in new tab"
            >
              <Play className="w-4 h-4" />
              <span>Run</span>
            </button>
          </div>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save
          </button>
          <button
            onClick={() => setShowCodeGenerator(true)}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#612D91] to-[#A64AC9] text-white hover:shadow-lg transition-all flex items-center gap-2"
          >
            <Code className="w-4 h-4" />
            Generate & Deploy
          </button>
          {isSaved && (
            <button
              onClick={handlePublish}
              className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-all flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Publish to Store
            </button>
          )}
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
        {/* Left Sidebar - Pages, Data Model & Component Library */}
        <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-4 space-y-4">
            {/* Pages Section */}
            <div>
              <div className="text-[10px] font-semibold text-gray-500 tracking-[0.18em] uppercase mb-2">
                Pages
              </div>
              <div className="space-y-1">
                {appData.pages.map((page, index) => {
                  const isActive = index === activePage;
                  return (
                    <button
                      key={page.name || index}
                      onClick={() => {
                        setActivePage(index);
                        setSelectedComponent(null);
                      }}
                      type="button"
                      className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs text-left transition-colors ${
                        isActive
                          ? "bg-[#612D91]/10 text-[#612D91] border border-[#612D91]/40"
                          : "bg-transparent text-gray-700 hover:bg-gray-50 border border-transparent"
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span className="truncate">{page.name || `Page ${index + 1}`}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Data Model Section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <Database className="w-4 h-4 text-[#612D91]" />
                  Data Model
                </h3>
                <button
                  onClick={() => {
                    const newEntity = {
                      id: `entity-${Date.now()}`,
                      name: "NewEntity",
                      fields: [
                        { name: "id", type: "string", required: true },
                        { name: "name", type: "string", required: true },
                      ],
                    };
                    setAppData({
                      ...appData,
                      dataModel: {
                        entities: [...(appData.dataModel.entities || []), newEntity],
                      },
                    });
                  }}
                  className="p-1.5 rounded-lg bg-[#612D91] text-white hover:bg-[#5B2E90] transition-colors"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
              <div className="space-y-2">
                {appData.dataModel.entities?.map((entity, idx) => (
                  <div
                    key={entity.id || idx}
                    className="p-2 rounded-lg border border-gray-200 text-xs hover:border-[#612D91] hover:bg-indigo-50 cursor-pointer transition-all"
                    onClick={() => setEditingEntity(entity)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">{entity.name}</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingEntity(entity);
                          }}
                          className="p-1 rounded hover:bg-gray-100"
                          title="Edit"
                        >
                          <Edit className="w-3 h-3 text-gray-600" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const updated = appData.dataModel.entities.filter((_, i) => i !== idx);
                            setAppData({
                              ...appData,
                              dataModel: { entities: updated },
                            });
                          }}
                          className="p-1 rounded hover:bg-gray-100"
                          title="Delete"
                        >
                          <Trash2 className="w-3 h-3 text-red-600" />
                        </button>
                      </div>
                    </div>
                    <div className="text-gray-500 mt-1">
                      {entity.fields?.length || 0} fields
                      {entity.relationships?.length > 0 && ` • ${entity.relationships.length} relationships`}
                    </div>
                  </div>
                ))}
              </div>
              {(!appData.dataModel.entities || appData.dataModel.entities.length === 0) && (
                <div className="text-center py-4 text-gray-400 text-xs">
                  <Database className="w-6 h-6 mx-auto mb-2" />
                  <p>No entities yet</p>
                </div>
              )}
            </div>

            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900">Component Library</h3>
              </div>

              {/* Component Search */}
              <div className="mb-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={componentSearch}
                    onChange={(e) => setComponentSearch(e.target.value)}
                    placeholder="Search components..."
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#612D91] focus:border-transparent"
                  />
                </div>
              </div>

              {/* Component Templates - Accordion */}
              <div className="mb-3">
                <button
                  onClick={() => toggleCategory("templates")}
                  className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Copy className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-900">Templates</span>
                  </div>
                  {expandedCategories.templates ? (
                    <ChevronUp className="w-4 h-4 text-gray-600" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-600" />
                  )}
                </button>
                {expandedCategories.templates && (
                  <div className="mt-2 space-y-1 pl-6">
                    {Object.entries(COMPONENT_TEMPLATES)
                      .filter(([key, template]) =>
                        !componentSearch || template.name.toLowerCase().includes(componentSearch.toLowerCase())
                      )
                      .map(([key, template]) => {
                        const Icon = template.icon;
                        return (
                          <div
                            key={key}
                            onClick={() => {
                              // Add all template components to current page
                              const newComponents = template.components.map((comp) => ({
                                ...comp,
                                id: `comp-${Date.now()}-${Math.random()}`,
                              }));
                              const updatedPages = [...appData.pages];
                              updatedPages[activePage].components.push(...newComponents);
                              setAppData({ ...appData, pages: updatedPages });
                            }}
                            className="p-2 rounded-lg border border-gray-200 hover:border-[#612D91] hover:bg-indigo-50 cursor-pointer transition-all"
                          >
                            <div className="flex items-center gap-2">
                              <Icon className="w-4 h-4 text-gray-600" />
                              <div className="flex-1 min-w-0">
                                <div className="text-xs font-medium text-gray-900 truncate">{template.name}</div>
                                <div className="text-[10px] text-gray-500 truncate">{template.description}</div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>

              {/* Layout Components - Accordion */}
              <div className="mb-3">
                <button
                  onClick={() => toggleCategory("layout")}
                  className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Layout className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-900">Layout</span>
                  </div>
                  {expandedCategories.layout ? (
                    <ChevronUp className="w-4 h-4 text-gray-600" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-600" />
                  )}
                </button>
                {expandedCategories.layout && (
                  <div className="mt-2 space-y-1 pl-6">
                    {Object.entries(COMPONENT_LIBRARY.layout)
                      .filter(([key, comp]) =>
                        !componentSearch || comp.name.toLowerCase().includes(componentSearch.toLowerCase())
                      )
                      .map(([key, comp]) => {
                      const Icon = comp.icon;
                      return (
                        <DraggableComponent
                          key={key}
                          id={key}
                          name={comp.name}
                          icon={Icon}
                        />
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Platform Components - Accordion */}
              <div className="mb-3">
                <button
                  onClick={() => toggleCategory("platform")}
                  className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Component className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-900">Platform Components</span>
                  </div>
                  {expandedCategories.platform ? (
                    <ChevronUp className="w-4 h-4 text-gray-600" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-600" />
                  )}
                </button>
                {expandedCategories.platform && (
                  <div className="mt-2 space-y-1 pl-6">
                    {Object.entries(COMPONENT_LIBRARY.platform)
                      .filter(([key, comp]) => {
                        if (!componentSearch) return true;
                        return comp.name.toLowerCase().includes(componentSearch.toLowerCase()) ||
                               comp.description.toLowerCase().includes(componentSearch.toLowerCase());
                      })
                      .map(([key, comp]) => {
                      const Icon = comp.icon;
                      const isCompatible = !comp.platform || comp.platform === basicInfo.platform || comp.platform === appData.platform;
                      return (
                        <DraggableComponent
                          key={key}
                          id={key}
                          name={comp.name}
                          icon={Icon}
                          disabled={!isCompatible}
                        />
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Form Controls - Accordion */}
              {COMPONENT_LIBRARY["form-controls"] && (
                <div className="mb-3">
                  <button
                    onClick={() => toggleCategory("form-controls")}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Settings className="w-4 h-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-900">Form Controls</span>
                    </div>
                    {expandedCategories["form-controls"] ? (
                      <ChevronUp className="w-4 h-4 text-gray-600" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-600" />
                    )}
                  </button>
                  {expandedCategories["form-controls"] && (
                    <div className="mt-2 space-y-1 pl-6">
                      {Object.entries(COMPONENT_LIBRARY["form-controls"])
                        .filter(([key, comp]) =>
                          !componentSearch || comp.name.toLowerCase().includes(componentSearch.toLowerCase())
                        )
                        .map(([key, comp]) => {
                          const Icon = comp.icon;
                          return (
                            <DraggableComponent
                              key={key}
                              id={key}
                              name={comp.name}
                              icon={Icon}
                            />
                          );
                        })}
                    </div>
                  )}
                </div>
              )}

              {/* Data Display - Accordion */}
              {COMPONENT_LIBRARY["data-display"] && (
                <div className="mb-3">
                  <button
                    onClick={() => toggleCategory("data-display")}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-900">Data Display</span>
                    </div>
                    {expandedCategories["data-display"] ? (
                      <ChevronUp className="w-4 h-4 text-gray-600" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-600" />
                    )}
                  </button>
                  {expandedCategories["data-display"] && (
                    <div className="mt-2 space-y-1 pl-6">
                      {Object.entries(COMPONENT_LIBRARY["data-display"])
                        .filter(([key, comp]) =>
                          !componentSearch || comp.name.toLowerCase().includes(componentSearch.toLowerCase())
                        )
                        .map(([key, comp]) => {
                          const Icon = comp.icon;
                          return (
                            <DraggableComponent
                              key={key}
                              id={key}
                              name={comp.name}
                              icon={Icon}
                            />
                          );
                        })}
                    </div>
                  )}
                </div>
              )}

              {/* Charts & Graphs - Accordion */}
              {COMPONENT_LIBRARY["charts-graphs"] && (
                <div className="mb-3">
                  <button
                    onClick={() => toggleCategory("charts-graphs")}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-900">Charts & Graphs</span>
                    </div>
                    {expandedCategories["charts-graphs"] ? (
                      <ChevronUp className="w-4 h-4 text-gray-600" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-600" />
                    )}
                  </button>
                  {expandedCategories["charts-graphs"] && (
                    <div className="mt-2 space-y-1 pl-6">
                      {Object.entries(COMPONENT_LIBRARY["charts-graphs"])
                        .filter(([key, comp]) =>
                          !componentSearch || comp.name.toLowerCase().includes(componentSearch.toLowerCase())
                        )
                        .map(([key, comp]) => {
                          const Icon = comp.icon;
                          return (
                            <DraggableComponent
                              key={key}
                              id={key}
                              name={comp.name}
                              icon={Icon}
                            />
                          );
                        })}
                    </div>
                  )}
                </div>
              )}

              {/* Navigation - Accordion */}
              {COMPONENT_LIBRARY.navigation && (
                <div className="mb-3">
                  <button
                    onClick={() => toggleCategory("navigation")}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Menu className="w-4 h-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-900">Navigation</span>
                    </div>
                    {expandedCategories.navigation ? (
                      <ChevronUp className="w-4 h-4 text-gray-600" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-600" />
                    )}
                  </button>
                  {expandedCategories.navigation && (
                    <div className="mt-2 space-y-1 pl-6">
                      {Object.entries(COMPONENT_LIBRARY.navigation)
                        .filter(([key, comp]) =>
                          !componentSearch || comp.name.toLowerCase().includes(componentSearch.toLowerCase())
                        )
                        .map(([key, comp]) => {
                          const Icon = comp.icon;
                          return (
                            <DraggableComponent
                              key={key}
                              id={key}
                              name={comp.name}
                              icon={Icon}
                            />
                          );
                        })}
                    </div>
                  )}
                </div>
              )}

              {/* Feedback - Accordion */}
              {COMPONENT_LIBRARY.feedback && (
                <div className="mb-3">
                  <button
                    onClick={() => toggleCategory("feedback")}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-900">Feedback</span>
                    </div>
                    {expandedCategories.feedback ? (
                      <ChevronUp className="w-4 h-4 text-gray-600" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-600" />
                    )}
                  </button>
                  {expandedCategories.feedback && (
                    <div className="mt-2 space-y-1 pl-6">
                      {Object.entries(COMPONENT_LIBRARY.feedback)
                        .filter(([key, comp]) =>
                          !componentSearch || comp.name.toLowerCase().includes(componentSearch.toLowerCase())
                        )
                        .map(([key, comp]) => {
                          const Icon = comp.icon;
                          return (
                            <DraggableComponent
                              key={key}
                              id={key}
                              name={comp.name}
                              icon={Icon}
                            />
                          );
                        })}
                    </div>
                  )}
                </div>
              )}

              {/* Advanced - Accordion */}
              {COMPONENT_LIBRARY.advanced && (
                <div className="mb-3">
                  <button
                    onClick={() => toggleCategory("advanced")}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <GripVertical className="w-4 h-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-900">Advanced</span>
                    </div>
                    {expandedCategories.advanced ? (
                      <ChevronUp className="w-4 h-4 text-gray-600" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-600" />
                    )}
                  </button>
                  {expandedCategories.advanced && (
                    <div className="mt-2 space-y-1 pl-6">
                      {Object.entries(COMPONENT_LIBRARY.advanced)
                        .filter(([key, comp]) =>
                          !componentSearch || comp.name.toLowerCase().includes(componentSearch.toLowerCase())
                        )
                        .map(([key, comp]) => {
                          const Icon = comp.icon;
                          return (
                            <DraggableComponent
                              key={key}
                              id={key}
                              name={comp.name}
                              icon={Icon}
                            />
                          );
                        })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Center - Canvas/Preview */}
        <div
          className={`flex-1 bg-gray-50 overflow-y-auto ${
            viewMode === "split" ? "flex" : ""
          }`}
        >
          {/* Canvas View */}
          {(viewMode === "canvas" || viewMode === "split") && (
            <div
              className={`bg-gray-50 overflow-y-auto p-6 ${
                viewMode === "split" ? "w-1/2 border-r border-gray-200" : "flex-1"
              }`}
            >
              <div className={`mb-4 text-xs font-medium text-gray-500 ${
                responsiveMode === "desktop" ? "" : 
                responsiveMode === "tablet" ? "max-w-3xl mx-auto" : "max-w-sm mx-auto"
              }`}>
                {responsiveMode === "desktop" && "Desktop View"}
                {responsiveMode === "tablet" && "Tablet View (768px)"}
                {responsiveMode === "mobile" && "Mobile View (375px)"}
              </div>
              <div className={`
                  ${responsiveMode === "desktop" ? "" : 
                    responsiveMode === "tablet" ? "max-w-3xl mx-auto" : "max-w-sm mx-auto"}
                `}>
                <DroppableCanvas>
                  {appData.pages[activePage].components.filter((c) => c.parentId == null).length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                      <Layers className="w-12 h-12 mb-4" />
                      <p className="text-sm">Drag components here to build your app</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {renderComponents(null)}
                    </div>
                  )}
                </DroppableCanvas>
              </div>
              <DragOverlay>
                {draggedComponent && (
                  <div className="p-4 bg-white rounded-lg shadow-xl border-2 border-[#612D91]">
                    {Object.values(COMPONENT_LIBRARY)
                      .flatMap((cat) => Object.entries(cat))
                      .find(([key]) => key === draggedComponent)?.[1]?.name || draggedComponent}
                  </div>
                )}
              </DragOverlay>
            </div>
          )}

          {/* Preview View */}
          {(viewMode === "preview" || viewMode === "split") && (
            <div
              className={`bg-white overflow-y-auto p-6 ${
                viewMode === "split" ? "w-1/2" : "flex-1"
              }`}
            >
              <div className={`mb-4 text-xs font-medium text-gray-500 ${
                responsiveMode === "desktop" ? "" : 
                responsiveMode === "tablet" ? "max-w-3xl mx-auto" : "max-w-sm mx-auto"
              }`}>
                Live Preview
              </div>
              <div className={`
                ${responsiveMode === "desktop" ? "" : 
                  responsiveMode === "tablet" ? "max-w-3xl mx-auto" : "max-w-sm mx-auto"}
              `}>
                <LivePreview
                  components={appData.pages[activePage].components}
                  dataModel={appData.dataModel}
                  responsiveMode={responsiveMode}
                  appName={basicInfo.name || appData.name}
                  pages={appData.pages}
                  activePage={activePage}
                  onNavigatePage={(index) => {
                    if (index >= 0 && index < appData.pages.length) {
                      setActivePage(index);
                      setSelectedComponent(null);
                    }
                  }}
                  onOpenFullPreview={handleOpenFullPreview}
                />
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar - Enhanced Properties */}
        <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
          <div className="p-4 space-y-4">
            {selectedComponent ? (
              <EnhancedPropertyPanel
                component={selectedComponent}
                appData={appData}
                activePage={activePage}
                dataModel={appData.dataModel}
                onUpdate={(updatedComponent) => {
                  const updated = appData.pages[activePage].components.map((c) =>
                    c.id === selectedComponent.id ? updatedComponent : c
                  );
                  const updatedPages = [...appData.pages];
                  updatedPages[activePage].components = updated;
                  setAppData({ ...appData, pages: updatedPages });
                  setSelectedComponent(updatedComponent);
                }}
                onDelete={() => {
                  // Remove the selected component and its descendants
                  const removeWithChildren = (list, idToRemove) => {
                    const idsToRemove = new Set([idToRemove]);
                    let changed = true;
                    while (changed) {
                      changed = false;
                      list.forEach((item) => {
                        if (idsToRemove.has(item.parentId)) {
                          if (!idsToRemove.has(item.id)) {
                            idsToRemove.add(item.id);
                            changed = true;
                          }
                        }
                      });
                    }
                    return list.filter((item) => !idsToRemove.has(item.id));
                  };

                  const updated = removeWithChildren(
                    appData.pages[activePage].components,
                    selectedComponent.id
                  );
                  const updatedPages = [...appData.pages];
                  updatedPages[activePage].components = updated;
                  setAppData({ ...appData, pages: updatedPages });
                  setSelectedComponent(null);
                }}
              />
            ) : (
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <h3 className="font-semibold text-gray-900 text-sm">AI Watchtower</h3>
                  </div>
                  <p className="text-xs text-gray-600">
                    AI Watchtower will be automatically integrated with your app for intelligent reasoning and chat.
                  </p>
                  <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
                    <span className="px-2 py-1 rounded bg-white">✓ Auto-configured</span>
                    <span className="px-2 py-1 rounded bg-white">✓ Platform-aware</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        </DndContext>
      </div>

      {/* Entity Editor Modal */}
      {editingEntity && (
        <EntityEditor
          entity={editingEntity}
          entities={appData.dataModel.entities || []}
          onSave={(updatedEntity) => {
            const updated = appData.dataModel.entities.map((e) =>
              e.id === editingEntity.id ? updatedEntity : e
            );
            setAppData({
              ...appData,
              dataModel: { entities: updated },
            });
            setEditingEntity(null);
          }}
          onClose={() => setEditingEntity(null)}
        />
      )}

      {/* Code Generator Modal */}
      {showCodeGenerator && (
        <CodeGenerator
          appData={appData}
          basicInfo={basicInfo}
          onClose={() => setShowCodeGenerator(false)}
          onDeploy={(generatedApp) => {
            const userApps = JSON.parse(localStorage.getItem("fabStore.userApps") || "[]");
            const appToSave = {
              ...generatedApp,
              status: "Published",
              publishedAt: new Date().toISOString(),
            };
            userApps.push(appToSave);
            localStorage.setItem("fabStore.userApps", JSON.stringify(userApps));
            setShowCodeGenerator(false);
            onSave?.(appToSave);
          }}
        />
      )}
    </div>
  );
}

// Component Preview
function ComponentPreview({ component, isSelected, onClick, hasChildren = false }) {
  const componentDef = Object.values(COMPONENT_LIBRARY)
    .flatMap((cat) => Object.entries(cat))
    .find(([key]) => key === component.type)?.[1];

  const isContainerType = ["container", "section", "grid", "card", "app-header"].includes(
    component.type
  );
  const props = component.props || {};
  const styleProps = component.style || {};
  const isSideNav = component.type === "side-nav";
  const { setNodeRef, isOver } = useDroppable({
    id: `drop-${component.id}`,
    disabled: !isContainerType,
  });

  const wrapperBase =
    "rounded-lg border cursor-pointer transition-all bg-white";
  const wrapperSelected = isSelected ? "border-[#612D91] shadow-sm" : "border-gray-200 hover:border-gray-300";
  const wrapperOver =
    isOver && isContainerType ? "border-dashed border-[#612D91]" : "";

  // Side nav should look like a vertical left rail, not a full-width rectangle
  const sideNavWrapper = isSideNav
    ? "p-3 w-56"
    : "p-4 w-full";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      ref={isContainerType ? setNodeRef : null}
      className={`${wrapperBase} ${wrapperSelected} ${wrapperOver} ${sideNavWrapper}`}
    >
      {/* Inline control preview so canvas feels like real UI */}
      <div className="text-xs">
        {/* Layout: App Header */}
        {component.type === "app-header" && (
          <div className="flex items-center justify-between px-4 py-2.5 bg-gray-900 rounded-md">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-indigo-500 flex items-center justify-center text-[10px] font-bold text-white">
                LOGO
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] font-semibold text-white">
                  {props.title || "Application Header"}
                </span>
                <span className="text-[10px] text-gray-300">Branding · Nav · Avatar</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 text-[10px] text-gray-300">
                <span>Home</span>
                <span>·</span>
                <span>Worklist</span>
                <span>·</span>
                <span>AI Watchtower</span>
              </div>
              <div className="w-7 h-7 rounded-full bg-gray-700 flex items-center justify-center text-[10px] text-gray-100">
                VK
              </div>
            </div>
          </div>
        )}

        {/* Layout containers / sections */}
        {["container", "section", "card"].includes(component.type) && !isSideNav && !hasChildren && (
          <div className="rounded-md border border-dashed border-gray-300 bg-gray-50 px-4 py-3 text-[11px] text-gray-500 text-left">
            {component.type === "section" ? "Section – drop cards, grids, or forms here" : "Container – drop layout or UI controls here"}
          </div>
        )}

        {/* Layout: Grid skeleton when empty */}
        {component.type === "grid" && !hasChildren && (
          <div className="rounded-md border border-dashed border-gray-300 bg-gray-50 px-3 py-3">
            <div
              className="grid gap-3"
              style={{
                gridTemplateColumns: `repeat(${props.columns || 3}, minmax(0, 1fr))`,
              }}
            >
              {Array.from({ length: props.columns || 3 }).map((_, idx) => (
                <div
                  key={idx}
                  className="h-10 rounded-md border border-gray-200 bg-white flex items-center justify-center text-[11px] text-gray-400"
                >
                  Column {idx + 1}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Side nav preview */}
        {isSideNav && (
          <div className="flex border border-gray-200 rounded-lg overflow-hidden text-[11px]">
            <div className="w-28 bg-gray-900 text-gray-100 py-2">
              <div className="px-3 pb-2 text-[10px] uppercase tracking-wide text-gray-400">
                Navigation
              </div>
              {(() => {
                // Allow items to be string or array; normalize to array of labels
                const raw = props.items ?? "Home, Claims, AI Watchtower, SLA & Operations";
                const labels = Array.isArray(raw)
                  ? raw
                  : String(raw)
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean);
                return labels.map((item, idx) => (
                  <div
                    key={idx}
                    className={`px-3 py-1 ${
                      idx === 0
                        ? "bg-gray-800 text-white"
                        : "text-gray-300 hover:bg-gray-800/60"
                    }`}
                  >
                    {item}
                  </div>
                ));
              })()}
            </div>
            <div className="flex-1 bg-white py-3 px-4 text-gray-400">
              Page content
            </div>
          </div>
        )}

        {/* Form controls */}
        {component.type === "input" && (
          <input
            type={props.type || "text"}
            placeholder={props.placeholder || "Text input"}
            className="w-full px-3 py-1.5 rounded-md border border-gray-300 text-xs focus:outline-none focus:ring-1 focus:ring-[#612D91]"
          />
        )}
        {component.type === "textarea" && (
          <textarea
            rows={props.rows || 3}
            placeholder={props.placeholder || "Textarea"}
            className="w-full px-3 py-1.5 rounded-md border border-gray-300 text-xs focus:outline-none focus:ring-1 focus:ring-[#612D91]"
          />
        )}
        {component.type === "dropdown" && (
          <select className="w-full px-3 py-1.5 rounded-md border border-gray-300 text-xs focus:outline-none focus:ring-1 focus:ring-[#612D91]">
            {(props.options || "Option 1, Option 2, Option 3")
              .split(",")
              .map((o) => o.trim())
              .filter(Boolean)
              .map((opt, idx) => (
                <option key={idx}>{opt}</option>
              ))}
          </select>
        )}
        {component.type === "checkbox" && (
          <label className="inline-flex items-center gap-1.5 text-xs text-gray-700">
            <input
              type="checkbox"
              defaultChecked={props.checked}
              className="h-3.5 w-3.5 rounded border-gray-300 text-[#612D91] focus:ring-[#612D91]"
            />
            <span>{props.label || "Checkbox"}</span>
          </label>
        )}
        {component.type === "radio" && (
          <div className="flex flex-wrap gap-3">
            {(props.options || "Option 1, Option 2, Option 3")
              .split(",")
              .map((o) => o.trim())
              .filter(Boolean)
              .map((opt, idx) => (
                <label key={idx} className="inline-flex items-center gap-1.5">
                  <input
                    type="radio"
                    name={component.id}
                    className="h-3.5 w-3.5 border-gray-300 text-[#612D91] focus:ring-[#612D91]"
                  />
                  <span>{opt}</span>
                </label>
              ))}
          </div>
        )}
        {component.type === "switch" && (
          <button
            type="button"
            className={`relative inline-flex h-4 w-7 items-center rounded-full border ${
              props.checked
                ? "bg-[#612D91] border-[#612D91]"
                : "bg-gray-200 border-gray-300"
            }`}
          >
            <span
              className={`inline-block h-3 w-3 transform rounded-full bg-white transition ${
                props.checked ? "translate-x-3" : "translate-x-0.5"
              }`}
            />
          </button>
        )}
        {component.type === "date-picker" && (
          <input
            type="date"
            className="w-full px-3 py-1.5 rounded-md border border-gray-300 text-xs focus:outline-none focus:ring-1 focus:ring-[#612D91]"
          />
        )}
        {component.type === "button" && (
          <div
            className={`flex ${
              styleProps.textAlign === "center"
                ? "justify-center"
                : styleProps.textAlign === "right"
                ? "justify-end"
                : "justify-start"
            }`}
          >
            <button
              type="button"
              className="inline-flex items-center justify-center px-3 py-1.5 rounded-md bg-[#612D91] text-white text-xs font-medium hover:bg-[#7B3DA1]"
            >
              {props.label || component.name || "Button"}
            </button>
          </div>
        )}

        {/* Data display previews */}
        {component.type === "metric-card" && (
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
            <div className="text-[10px] uppercase tracking-wide text-slate-500 mb-1">
              Metric Card
            </div>
            <div className="text-lg font-semibold text-slate-900">1,234</div>
            <div className="text-[11px] text-slate-500">Metric value</div>
          </div>
        )}
        {component.type === "data-table" && (
          <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
            <div className="px-3 py-1.5 border-b border-slate-100 text-[11px] font-semibold text-slate-700">
              Data Table
            </div>
            <table className="min-w-full text-[11px]">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-3 py-1 text-left font-medium">ID</th>
                  <th className="px-3 py-1 text-left font-medium">Status</th>
                  <th className="px-3 py-1 text-left font-medium">Owner</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="px-3 py-1">REC-101</td>
                  <td className="px-3 py-1">Open</td>
                  <td className="px-3 py-1">User 1</td>
                </tr>
                <tr>
                  <td className="px-3 py-1">REC-102</td>
                  <td className="px-3 py-1">In Progress</td>
                  <td className="px-3 py-1">User 2</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Charts */}
        {component.type === "bar-chart" && (
          <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
            <div className="text-[10px] uppercase tracking-wide text-slate-500 mb-1">
              Bar Chart
            </div>
            <div className="h-24 flex items-end gap-1.5">
              {[35, 70, 50, 90, 60].map((h, idx) => (
                <div
                  key={idx}
                  className="flex-1 rounded-t-md bg-indigo-500"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </div>
        )}
        {component.type === "line-chart" && (
          <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
            <div className="text-[10px] uppercase tracking-wide text-slate-500 mb-1">
              Line Chart
            </div>
            <div className="h-24 relative">
              <svg viewBox="0 0 100 40" className="w-full h-full text-indigo-500">
                <polyline
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  points="0,30 15,20 30,25 45,10 60,18 75,8 90,15 100,5"
                />
                {[0, 15, 30, 45, 60, 75, 90, 100].map((x, idx) => (
                  <circle
                    key={idx}
                    cx={x}
                    cy={[30, 20, 25, 10, 18, 8, 15, 5][idx]}
                    r="1.3"
                    className="fill-indigo-500"
                  />
                ))}
              </svg>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// Enhanced Property Panel (ToolJet-style)
function EnhancedPropertyPanel({ component, appData, activePage, dataModel, onUpdate, onDelete }) {
  const componentDef = Object.values(COMPONENT_LIBRARY)
    .flatMap((cat) => Object.entries(cat))
    .find(([key]) => key === component.type)?.[1];

  const properties = componentDef?.properties || {};
  const styleProps = component.style || {};

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Component Properties</h3>
        <button
          onClick={onDelete}
          className="p-1.5 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
          title="Delete"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Basic Properties */}
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Component Name</label>
          <input
            type="text"
            value={component.name}
            onChange={(e) => onUpdate({ ...component, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#612D91] focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Data Binding</label>
          <select
            value={component.dataBinding || ""}
            onChange={(e) => onUpdate({ ...component, dataBinding: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#612D91] focus:border-transparent"
          >
            <option value="">None</option>
            {dataModel.entities?.map((entity) => (
              <option key={entity.id} value={entity.name}>
                {entity.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Component-Specific Properties */}
      {Object.keys(properties).length > 0 && (
        <div className="border-t border-gray-200 pt-4">
          <h4 className="text-xs font-semibold text-gray-700 mb-3 uppercase">Style & Layout</h4>
          <div className="space-y-3">
            {Object.entries(properties).map(([key, prop]) => (
              <div key={key}>
                <label className="block text-xs font-medium text-gray-700 mb-1">{prop.label}</label>
                {prop.type === "number" && (
                  <input
                    type="number"
                    value={component.props?.[key] ?? prop.default}
                    onChange={(e) =>
                      onUpdate({
                        ...component,
                        props: { ...component.props, [key]: Number(e.target.value) },
                      })
                    }
                    min={prop.min}
                    max={prop.max}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#612D91] focus:border-transparent"
                  />
                )}
                {prop.type === "color" && (
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={component.props?.[key] ?? prop.default}
                      onChange={(e) =>
                        onUpdate({
                          ...component,
                          props: { ...component.props, [key]: e.target.value },
                        })
                      }
                      className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={component.props?.[key] ?? prop.default}
                      onChange={(e) =>
                        onUpdate({
                          ...component,
                          props: { ...component.props, [key]: e.target.value },
                        })
                      }
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#612D91] focus:border-transparent"
                    />
                  </div>
                )}
                {prop.type === "text" && (
                  <input
                    type="text"
                    value={component.props?.[key] ?? prop.default}
                    onChange={(e) =>
                      onUpdate({
                        ...component,
                        props: { ...component.props, [key]: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#612D91] focus:border-transparent"
                  />
                )}
                {prop.type === "boolean" && (
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={component.props?.[key] ?? prop.default}
                      onChange={(e) =>
                        onUpdate({
                          ...component,
                          props: { ...component.props, [key]: e.target.checked },
                        })
                      }
                      className="w-4 h-4 text-[#612D91] rounded focus:ring-[#612D91]"
                    />
                    <span className="text-xs text-gray-600">{prop.label}</span>
                  </label>
                )}
                {prop.type === "select" && (
                  <select
                    value={component.props?.[key] ?? prop.default}
                    onChange={(e) =>
                      onUpdate({
                        ...component,
                        props: { ...component.props, [key]: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#612D91] focus:border-transparent"
                  >
                    {prop.options?.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Generic Styles for layout / button components */}
      {["container", "section", "card", "grid", "button"].includes(component.type) && (
        <div className="border-t border-gray-200 pt-4">
          <h4 className="text-xs font-semibold text-gray-700 mb-3 uppercase">Styles</h4>
          <div className="space-y-3">
            {component.type === "button" && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Text Align
                </label>
                <div className="flex gap-1">
                  {["left", "center", "right"].map((align) => (
                    <button
                      key={align}
                      type="button"
                      onClick={() =>
                        onUpdate({
                          ...component,
                          style: { ...styleProps, textAlign: align },
                        })
                      }
                      className={`flex-1 px-2 py-1 rounded border text-xs ${
                        styleProps.textAlign === align
                          ? "bg-[#612D91] text-white border-[#612D91]"
                          : "bg-white text-gray-700 border-gray-300"
                      }`}
                    >
                      {align.charAt(0).toUpperCase() + align.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {["container", "section", "card"].includes(component.type) && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Content Justification
                </label>
                <div className="flex gap-1">
                  {[
                    { key: "start", label: "Start" },
                    { key: "center", label: "Center" },
                    { key: "end", label: "End" },
                  ].map(({ key, label }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() =>
                        onUpdate({
                          ...component,
                          style: { ...styleProps, justify: key },
                        })
                      }
                      className={`flex-1 px-2 py-1 rounded border text-xs ${
                        styleProps.justify === key
                          ? "bg-[#612D91] text-white border-[#612D91]"
                          : "bg-white text-gray-700 border-gray-300"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="border-t border-gray-200 pt-4">
        <button
          onClick={onDelete}
          className="w-full px-4 py-2 rounded-lg border border-red-200 text-red-700 font-medium hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
        >
          <Trash2 className="w-4 h-4" />
          Remove Component
        </button>
      </div>
    </div>
  );
}

// Entity Editor Component
function EntityEditor({ entity, entities, onSave, onClose }) {
  const [editedEntity, setEditedEntity] = useState(() => ({
    ...entity,
    fields: entity.fields || [],
    relationships: entity.relationships || [],
  }));

  const fieldTypes = [
    { value: "string", label: "Text", icon: Type },
    { value: "number", label: "Number", icon: Hash },
    { value: "date", label: "Date", icon: Calendar },
    { value: "boolean", label: "Boolean", icon: CheckSquare },
    { value: "reference", label: "Reference", icon: Link },
    { value: "file", label: "File", icon: FileText },
    { value: "enum", label: "Enum", icon: Radio },
    { value: "json", label: "JSON", icon: Code },
  ];

  const addField = () => {
    setEditedEntity({
      ...editedEntity,
      fields: [
        ...editedEntity.fields,
        {
          id: `field-${Date.now()}`,
          name: "newField",
          type: "string",
          required: false,
          defaultValue: null,
          validation: null,
        },
      ],
    });
  };

  const updateField = (fieldId, updates) => {
    setEditedEntity({
      ...editedEntity,
      fields: editedEntity.fields.map((f) => (f.id === fieldId ? { ...f, ...updates } : f)),
    });
  };

  const removeField = (fieldId) => {
    setEditedEntity({
      ...editedEntity,
      fields: editedEntity.fields.filter((f) => f.id !== fieldId),
    });
  };

  const addRelationship = () => {
    setEditedEntity({
      ...editedEntity,
      relationships: [
        ...editedEntity.relationships,
        {
          id: `rel-${Date.now()}`,
          type: "one-to-many",
          targetEntity: entities.find((e) => e.id !== entity.id)?.id || "",
          field: "",
        },
      ],
    });
  };

  const updateRelationship = (relId, updates) => {
    setEditedEntity({
      ...editedEntity,
      relationships: editedEntity.relationships.map((r) =>
        r.id === relId ? { ...r, ...updates } : r
      ),
    });
  };

  const removeRelationship = (relId) => {
    setEditedEntity({
      ...editedEntity,
      relationships: editedEntity.relationships.filter((r) => r.id !== relId),
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Edit Entity: {entity.name}</h3>
            <p className="text-sm text-gray-600 mt-1">Configure fields, types, and relationships</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Entity Name</label>
            <input
              type="text"
              value={editedEntity.name}
              onChange={(e) => setEditedEntity({ ...editedEntity, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#612D91] focus:border-transparent"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-gray-900">Fields</h4>
              <button
                onClick={addField}
                className="px-3 py-1.5 rounded-lg bg-[#612D91] text-white text-sm font-medium hover:bg-[#5B2E90] transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Field
              </button>
            </div>
            <div className="space-y-3">
              {editedEntity.fields.map((field) => {
                const FieldTypeIcon = fieldTypes.find((ft) => ft.value === field.type)?.icon || Type;
                return (
                  <div key={field.id} className="p-4 rounded-lg border border-gray-200 bg-gray-50">
                    <div className="grid grid-cols-12 gap-3 items-start">
                      <div className="col-span-4">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Field Name</label>
                        <input
                          type="text"
                          value={field.name}
                          onChange={(e) => updateField(field.id, { name: e.target.value })}
                          className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-[#612D91] focus:border-transparent"
                        />
                      </div>
                      <div className="col-span-3">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Type</label>
                        <select
                          value={field.type}
                          onChange={(e) => updateField(field.id, { type: e.target.value })}
                          className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-[#612D91] focus:border-transparent"
                        >
                          {fieldTypes.map((ft) => (
                            <option key={ft.value} value={ft.value}>
                              {ft.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Required</label>
                        <label className="flex items-center h-9 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={field.required || false}
                            onChange={(e) => updateField(field.id, { required: e.target.checked })}
                            className="w-4 h-4 text-[#612D91] rounded focus:ring-[#612D91]"
                          />
                        </label>
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Default</label>
                        <input
                          type="text"
                          value={field.defaultValue || ""}
                          onChange={(e) => updateField(field.id, { defaultValue: e.target.value })}
                          placeholder="Optional"
                          className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-[#612D91] focus:border-transparent"
                        />
                      </div>
                      <div className="col-span-1 flex items-end">
                        <button
                          onClick={() => removeField(field.id)}
                          className="p-1.5 rounded hover:bg-red-50 text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {field.type === "enum" && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Enum Values</label>
                        <input
                          type="text"
                          value={field.enumValues?.join(", ") || ""}
                          onChange={(e) =>
                            updateField(field.id, {
                              enumValues: e.target.value.split(",").map((v) => v.trim()).filter(Boolean),
                            })
                          }
                          placeholder="Option1, Option2, Option3"
                          className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-[#612D91] focus:border-transparent"
                        />
                      </div>
                    )}

                    {field.type === "reference" && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <label className="block text-xs font-medium text-gray-700 mb-1">References Entity</label>
                        <select
                          value={field.referenceEntity || ""}
                          onChange={(e) => updateField(field.id, { referenceEntity: e.target.value })}
                          className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-[#612D91] focus:border-transparent"
                        >
                          <option value="">Select entity...</option>
                          {entities
                            .filter((e) => e.id !== entity.id)
                            .map((e) => (
                              <option key={e.id} value={e.id}>
                                {e.name}
                              </option>
                            ))}
                        </select>
                      </div>
                    )}

                    <div className="mt-3 pt-3 border-t border-gray-200 grid grid-cols-2 gap-3">
                      {field.type === "number" && (
                        <>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Min Value</label>
                            <input
                              type="number"
                              value={field.min || ""}
                              onChange={(e) => updateField(field.id, { min: e.target.value ? Number(e.target.value) : null })}
                              className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Max Value</label>
                            <input
                              type="number"
                              value={field.max || ""}
                              onChange={(e) => updateField(field.id, { max: e.target.value ? Number(e.target.value) : null })}
                              className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                            />
                          </div>
                        </>
                      )}
                      {field.type === "string" && (
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Max Length</label>
                          <input
                            type="number"
                            value={field.maxLength || ""}
                            onChange={(e) => updateField(field.id, { maxLength: e.target.value ? Number(e.target.value) : null })}
                            className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-gray-900">Relationships</h4>
              <button
                onClick={addRelationship}
                className="px-3 py-1.5 rounded-lg bg-[#612D91] text-white text-sm font-medium hover:bg-[#5B2E90] transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Relationship
              </button>
            </div>
            <div className="space-y-3">
              {editedEntity.relationships.map((rel) => (
                <div key={rel.id} className="p-4 rounded-lg border border-gray-200 bg-gray-50">
                  <div className="grid grid-cols-12 gap-3 items-center">
                    <div className="col-span-4">
                      <label className="block text-xs font-medium text-gray-700 mb-1">Type</label>
                      <select
                        value={rel.type}
                        onChange={(e) => updateRelationship(rel.id, { type: e.target.value })}
                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-[#612D91] focus:border-transparent"
                      >
                        <option value="one-to-many">One-to-Many</option>
                        <option value="many-to-many">Many-to-Many</option>
                        <option value="one-to-one">One-to-One</option>
                      </select>
                    </div>
                    <div className="col-span-4">
                      <label className="block text-xs font-medium text-gray-700 mb-1">Target Entity</label>
                      <select
                        value={rel.targetEntity}
                        onChange={(e) => updateRelationship(rel.id, { targetEntity: e.target.value })}
                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-[#612D91] focus:border-transparent"
                      >
                        <option value="">Select entity...</option>
                        {entities
                          .filter((e) => e.id !== entity.id)
                          .map((e) => (
                            <option key={e.id} value={e.id}>
                              {e.name}
                            </option>
                          ))}
                      </select>
                    </div>
                    <div className="col-span-3">
                      <label className="block text-xs font-medium text-gray-700 mb-1">Field Name</label>
                      <input
                        type="text"
                        value={rel.field}
                        onChange={(e) => updateRelationship(rel.id, { field: e.target.value })}
                        placeholder="fieldName"
                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-[#612D91] focus:border-transparent"
                      />
                    </div>
                    <div className="col-span-1 flex items-end">
                      <button
                        onClick={() => removeRelationship(rel.id)}
                        className="p-1.5 rounded hover:bg-red-50 text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {editedEntity.relationships.length === 0 && (
                <div className="text-center py-4 text-gray-400 text-xs">No relationships defined</div>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onSave(editedEntity);
              onClose();
            }}
            className="px-6 py-2 rounded-lg bg-gradient-to-r from-[#612D91] to-[#A64AC9] text-white font-medium hover:shadow-lg transition-all"
          >
            Save Entity
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// Code Generator Component
function CodeGenerator({ appData, basicInfo, onClose, onDeploy }) {
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState({ step: "", progress: 0 });
  const [generatedCode, setGeneratedCode] = useState(null);

  const generateCode = async () => {
    setGenerating(true);
    const steps = [
      { step: "Generating solution structure...", progress: 10 },
      { step: "Creating data files from entities...", progress: 30 },
      { step: "Generating component files...", progress: 50 },
      { step: "Creating API service layer...", progress: 70 },
      { step: "Wiring platform adapter...", progress: 85 },
      { step: "Configuring AI Watchtower...", progress: 95 },
      { step: "Finalizing...", progress: 100 },
    ];

    for (const s of steps) {
      setProgress(s);
      await new Promise((resolve) => setTimeout(resolve, 600));
    }

    const solutionName = basicInfo.name.toLowerCase().replace(/\s+/g, "-");
    const generated = {
      structure: {
        basePath: `src/apps/${solutionName}/`,
        files: [
          { path: `data/${solutionName}.js`, type: "data" },
          { path: `components/Layout.jsx`, type: "component" },
          { path: `services/api.js`, type: "service" },
          { path: `services/platformAdapter.js`, type: "adapter" },
        ],
      },
      appConfig: {
        id: `custom-${Date.now()}`,
        name: basicInfo.name,
        tagline: basicInfo.tagline,
        description: basicInfo.description,
        industry: basicInfo.industry,
        platformId: basicInfo.platform,
        platformName: basicInfo.platformName,
        dataModel: appData.dataModel,
        pages: appData.pages,
        launchKey: solutionName,
        status: "Published",
      },
    };

    setGeneratedCode(generated);
    setGenerating(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Generate & Deploy Application</h3>
            <p className="text-sm text-gray-600 mt-1">Generate code structure and deploy to FAB Store</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {!generating && !generatedCode && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-indigo-50 border border-indigo-200">
                <h4 className="font-semibold text-gray-900 mb-2">What will be generated:</h4>
                <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                  <li>Solution structure: <code className="text-xs bg-white px-1 rounded">src/apps/{basicInfo.name.toLowerCase().replace(/\s+/g, "-")}/</code></li>
                  <li>Data files from your entity schema</li>
                  <li>Component files from canvas</li>
                  <li>API service layer</li>
                  <li>Platform adapter ({basicInfo.platformName})</li>
                  <li>AI Watchtower integration</li>
                </ul>
              </div>
              <button
                onClick={generateCode}
                className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-[#612D91] to-[#A64AC9] text-white font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Code className="w-5 h-5" />
                Generate Code
              </button>
            </div>
          )}

          {generating && (
            <div className="space-y-4">
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#612D91] to-[#A64AC9] mb-4 animate-pulse">
                  <Code className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{progress.step}</h3>
                <div className="w-full bg-gray-200 rounded-full h-3 max-w-md mx-auto">
                  <motion.div
                    className="bg-gradient-to-r from-[#612D91] to-[#A64AC9] h-3 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress.progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <p className="text-sm text-gray-600 mt-2">{progress.progress}%</p>
              </div>
            </div>
          )}

          {generatedCode && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200">
                <div className="flex items-center gap-2 mb-2">
                  <Check className="w-5 h-5 text-emerald-600" />
                  <h4 className="font-semibold text-gray-900">Code Generated Successfully!</h4>
                </div>
                <p className="text-sm text-gray-700">
                  Your application code has been generated. Review the structure below, then deploy to FAB Store.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Generated Structure:</h4>
                <div className="bg-gray-900 rounded-lg p-4 text-xs text-gray-300 font-mono space-y-1">
                  {generatedCode.structure.files.map((file, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-gray-500">📄</span>
                      <span>{generatedCode.structure.basePath}{file.path}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const codeStr = JSON.stringify(generatedCode.structure, null, 2);
                    navigator.clipboard.writeText(codeStr);
                  }}
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Copy Structure
                </button>
                <button
                  onClick={() => onDeploy(generatedCode.appConfig)}
                  className="flex-1 px-6 py-2 rounded-lg bg-gradient-to-r from-[#612D91] to-[#A64AC9] text-white font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Deploy to FAB Store
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// Live Preview Component - App-like layout
function LivePreview({
  components,
  dataModel,
  responsiveMode,
  appName,
  pages,
  activePage,
  onNavigatePage,
  onOpenFullPreview,
  fullScreen = false,
  showBuilderChrome = true,
}) {
  if (components.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-400">
        <Eye className="w-12 h-12 mb-4" />
        <p className="text-sm">No components to preview</p>
        <p className="text-xs mt-1">Add components to see live preview</p>
      </div>
    );
  }

  const header = components.find((c) => c.type === "app-header");
  const toolbar = components.find((c) => c.type === "toolbar");
  const metrics = components.filter((c) => c.type === "metric-card");
  const tables = components.filter((c) => c.type === "data-table");
  const charts = components.filter((c) =>
    ["bar-chart", "line-chart"].includes(c.type)
  );
  const reasoningCards = components.filter((c) => c.type === "sop-reasoning-card");
  const formControls = components.filter((c) =>
    ["button", "input", "textarea", "dropdown", "checkbox", "radio", "switch", "date-picker", "slider", "rating"].includes(
      c.type
    )
  );

  const appTitle = appName || header?.name || "New Application";

  const sideNavComponent = components.find((c) => c.type === "side-nav");
  const sideNavItems =
    (sideNavComponent?.props?.items ||
      (pages && pages.length ? pages.map((p) => p.name || "Page") : null)) ||
    ["AI Watchtower", "Claims", "AI Reasoning", "SLA and Operations", "Knowledge Hub", "Settings"];

  const currentPageName =
    pages && pages[activePage]?.name
      ? String(pages[activePage].name).toLowerCase()
      : "";

  // Track which components get rendered with special handling so we can show generic
  // placeholders for everything else (charts, cards, etc.) instead of hiding them.
  const renderedIds = new Set();
  metrics.forEach((m) => renderedIds.add(m.id));
  tables.forEach((t) => renderedIds.add(t.id));
  charts.forEach((c) => renderedIds.add(c.id));
  reasoningCards.forEach((r) => renderedIds.add(r.id));
  formControls.forEach((f) => renderedIds.add(f.id));

  // Main content reused across embedded and full-screen modes
  const mainContent = (
    <div className={fullScreen ? "h-full bg-slate-50" : "min-h-full bg-slate-50 py-4"}>
      <div
        className={
          fullScreen
            ? "h-full w-full bg-white overflow-hidden"
            : "max-w-6xl mx-auto bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden"
        }
      >
        {/* Top App Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              {showBuilderChrome && (
                <div className="text-xs uppercase tracking-[0.18em] text-slate-300">
                  FAB Builder Preview
                </div>
              )}
              <div className="text-sm font-semibold">{appTitle}</div>
            </div>
          </div>
          {showBuilderChrome && (
            <div className="flex items-center gap-3 text-xs text-slate-200">
              <span>Demo User</span>
              <div className="h-7 w-7 rounded-full bg-slate-700" />
            </div>
          )}
        </div>

        {/* Toolbar */}
        <div className="px-6 py-3 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Search className="w-3.5 h-3.5" />
            <span>Search or filter records</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <button className="px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-50">
              Add Filter
            </button>
            <button className="px-2.5 py-1 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3" />
              Run AI
            </button>
          </div>
        </div>

        {/* Main content */}
        <div className="px-6 py-5 grid grid-cols-1 lg:grid-cols-[2fr,1.1fr] gap-5">
          {/* Left side - KPIs + Charts + Table + Form controls */}
          <div className="space-y-4">
            {/* KPI Row */}
            {(metrics.length > 0 || currentPageName.includes("sla")) && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {(metrics.length > 0
                  ? metrics.slice(0, 3).map((m) => ({
                      id: m.id,
                      title: m.props?.title || m.name,
                      value: m.props?.value || "1,234",
                      subtitle: "Metric Value",
                    }))
                  : [
                      {
                        id: "sla-1",
                        title: "At Risk / SLA",
                        value: "128",
                        subtitle: "Claims likely to miss timely payment",
                      },
                      {
                        id: "sla-2",
                        title: "Breached SLAs",
                        value: "42",
                        subtitle: "Already beyond timely payment window",
                      },
                      {
                        id: "sla-3",
                        title: "Late Payment Exposure",
                        value: "$20M",
                        subtitle: "YTD penalty risk (Texas & Michigan focus)",
                      },
                    ]
                ).map((m) => (
                  <div
                    key={m.id}
                    className="rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-3"
                  >
                    <div className="text-[11px] uppercase tracking-wide text-slate-500">
                      {m.title}
                    </div>
                    <div className="mt-1 text-lg font-semibold text-slate-900">
                      {m.value}
                    </div>
                    <div className="mt-0.5 text-[11px] text-slate-500 text-[11px]">
                      {m.subtitle}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Charts row (bar/line) */}
            {charts.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {charts.slice(0, 2).map((ch) => {
                  const isBar = ch.type === "bar-chart";
                  const title = ch.props?.title || (isBar ? "Bar Chart" : "Line Chart");
                  return (
                    <div
                      key={ch.id}
                      className="rounded-xl border border-slate-200 bg-white px-3 py-3"
                    >
                      <div className="text-[11px] font-semibold text-slate-700 mb-1.5">
                        {title}
                      </div>
                      {isBar ? (
                        <div className="h-28 flex items-end gap-1.5">
                          {[35, 70, 50, 90, 60].map((h, idx) => (
                            <div
                              key={idx}
                              className="flex-1 rounded-t-md bg-indigo-500/80"
                              style={{ height: `${h}%` }}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="h-28 relative">
                          <svg viewBox="0 0 100 40" className="w-full h-full text-indigo-500">
                            <polyline
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              points="0,30 15,20 30,25 45,10 60,18 75,8 90,15 100,5"
                            />
                            {[0, 15, 30, 45, 60, 75, 90, 100].map((x, idx) => (
                              <circle
                                key={idx}
                                cx={x}
                                cy={[30, 20, 25, 10, 18, 8, 15, 5][idx]}
                                r="1.3"
                                className="fill-indigo-500"
                              />
                            ))}
                          </svg>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Primary table */}
            {tables[0] && (
              <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-slate-900">
                      {tables[0].name || "Records"}
                    </div>
                    {tables[0].dataBinding && (
                      <div className="text-[11px] text-indigo-600 flex items-center gap-1">
                        <Database className="w-3 h-3" />
                        Bound to: {tables[0].dataBinding}
                      </div>
                    )}
                  </div>
                  <button className="text-[11px] px-2 py-1 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50">
                    View all
                  </button>
                </div>
                <div className="px-4 pb-4">
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-[11px]">
                      <thead>
                        <tr className="text-slate-500 bg-slate-50 border-b border-slate-100">
                          <th className="text-left font-medium py-2 pr-4">ID</th>
                          <th className="text-left font-medium py-2 pr-4">Status</th>
                          <th className="text-left font-medium py-2 pr-4">Owner</th>
                          <th className="text-right font-medium py-2 pl-4">Value</th>
                        </tr>
                      </thead>
                      <tbody className="text-xs text-slate-700">
                        {(() => {
                          const binding = (tables[0].dataBinding || "Item").toString();
                          const prefix = binding
                            ? binding
                                .replace(/[^a-z0-9]/gi, "")
                                .slice(0, 3)
                                .toUpperCase()
                            : "REC";
                          const rows = [
                            { id: `${prefix}-101`, status: "Open", owner: "User 1", value: "High" },
                            { id: `${prefix}-102`, status: "In Progress", owner: "User 2", value: "Medium" },
                            { id: `${prefix}-103`, status: "In Progress", owner: "User 3", value: "Low" },
                            { id: `${prefix}-104`, status: "Flagged", owner: "User 4", value: "High" },
                            { id: `${prefix}-105`, status: "Resolved", owner: "User 5", value: "Medium" },
                            { id: `${prefix}-106`, status: "Closed", owner: "User 6", value: "Low" },
                            { id: `${prefix}-107`, status: "Reopened", owner: "User 7", value: "Medium" },
                          ];
                          return rows.map((row) => (
                            <tr
                              key={row.id}
                              className="border-b border-slate-100 last:border-0 hover:bg-slate-50 cursor-pointer"
                            >
                              <td className="py-2 pr-4 font-medium">{row.id}</td>
                              <td className="py-2 pr-4">
                                <span className="text-amber-700 bg-amber-50 rounded-full px-2 py-0.5 text-[11px]">
                                  {row.status}
                                </span>
                              </td>
                              <td className="py-2 pr-4 text-slate-600">{row.owner}</td>
                              <td className="py-2 pl-4 text-right text-slate-900">
                                {row.value}
                              </td>
                            </tr>
                          ));
                        })()}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Form controls preview */}
            {formControls.length > 0 && (
              <div className="rounded-xl border border-slate-200 bg-white px-4 py-4">
                <div className="text-xs font-semibold text-slate-500 mb-3 uppercase tracking-wide">
                  Sample Form
                </div>
                <div className="space-y-3">
                  {formControls.map((fc) => {
                    renderedIds.add(fc.id);
                    const props = fc.props || {};
                    if (fc.type === "input") {
                      return (
                        <div key={fc.id} className="flex flex-col gap-1">
                          <label className="text-xs font-medium text-slate-700">
                            {props.label || "Text Input"}
                          </label>
                          <input
                            type={props.type || "text"}
                            placeholder={props.placeholder || "Enter text..."}
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                          />
                        </div>
                      );
                    }
                    if (fc.type === "textarea") {
                      return (
                        <div key={fc.id} className="flex flex-col gap-1">
                          <label className="text-xs font-medium text-slate-700">
                            {props.label || "Textarea"}
                          </label>
                          <textarea
                            rows={props.rows || 3}
                            placeholder={props.placeholder || "Enter long text..."}
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                          />
                        </div>
                      );
                    }
                    if (fc.type === "dropdown") {
                      const options =
                        (props.options || "Option 1, Option 2, Option 3")
                          .split(",")
                          .map((o) => o.trim())
                          .filter(Boolean);
                      return (
                        <div key={fc.id} className="flex flex-col gap-1">
                          <label className="text-xs font-medium text-slate-700">
                            {props.label || "Dropdown"}
                          </label>
                          <select className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
                            {options.map((opt, idx) => (
                              <option key={idx}>{opt}</option>
                            ))}
                          </select>
                        </div>
                      );
                    }
                    if (fc.type === "checkbox") {
                      return (
                        <label
                          key={fc.id}
                          className="inline-flex items-center gap-2 text-xs text-slate-700"
                        >
                          <input
                            type="checkbox"
                            defaultChecked={props.checked}
                            className="h-3.5 w-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <span>{props.label || "Checkbox label"}</span>
                        </label>
                      );
                    }
                    if (fc.type === "radio") {
                      const options =
                        (props.options || "Option 1, Option 2, Option 3")
                          .split(",")
                          .map((o) => o.trim())
                          .filter(Boolean);
                      return (
                        <div key={fc.id} className="flex flex-col gap-1 text-xs text-slate-700">
                          <span className="font-medium">
                            {props.label || "Radio group"}
                          </span>
                          <div className="flex flex-wrap gap-3 mt-1">
                            {options.map((opt, idx) => (
                              <label key={idx} className="inline-flex items-center gap-1.5">
                                <input
                                  type="radio"
                                  name={fc.id}
                                  className="h-3.5 w-3.5 border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                <span>{opt}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      );
                    }
                    if (fc.type === "switch") {
                      return (
                        <div key={fc.id} className="flex items-center justify-between text-xs">
                          <span className="text-slate-700">
                            {props.label || "Toggle switch"}
                          </span>
                          <button
                            type="button"
                            className={`relative inline-flex h-4 w-7 items-center rounded-full border ${
                              props.checked
                                ? "bg-indigo-600 border-indigo-600"
                                : "bg-slate-200 border-slate-300"
                            }`}
                          >
                            <span
                              className={`inline-block h-3 w-3 transform rounded-full bg-white transition ${
                                props.checked ? "translate-x-3" : "translate-x-0.5"
                              }`}
                            />
                          </button>
                        </div>
                      );
                    }
                    if (fc.type === "date-picker") {
                      return (
                        <div key={fc.id} className="flex flex-col gap-1">
                          <label className="text-xs font-medium text-slate-700">
                            {props.label || "Date"}
                          </label>
                          <input
                            type="date"
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                          />
                        </div>
                      );
                    }
                    if (fc.type === "slider") {
                      const min = props.min ?? 0;
                      const max = props.max ?? 100;
                      const value = props.defaultValue ?? Math.round((min + max) / 2);
                      return (
                        <div key={fc.id} className="flex flex-col gap-1">
                          <label className="text-xs font-medium text-slate-700">
                            {props.label || "Slider"}
                          </label>
                          <div className="flex items-center gap-3">
                            <input
                              type="range"
                              min={min}
                              max={max}
                              defaultValue={value}
                              step={props.step ?? 1}
                              disabled={props.disabled}
                              className="flex-1 accent-indigo-600"
                            />
                            {props.showValue !== false && (
                              <span className="text-xs text-slate-600 w-10 text-right">
                                {value}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    }
                    if (fc.type === "rating") {
                      const max = Math.max(1, props.max || 5);
                      const current = Math.min(max, Math.max(0, props.defaultValue || 0));
                      return (
                        <div key={fc.id} className="flex flex-col gap-1">
                          <label className="text-xs font-medium text-slate-700">
                            {props.label || "Rating"}
                          </label>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: max }).map((_, idx) => {
                              const filled = idx < current;
                              return (
                                <svg
                                  key={idx}
                                  className={`w-4 h-4 ${
                                    filled ? "text-yellow-400" : "text-slate-300"
                                  }`}
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path d="M10 1.5l2.39 4.84 5.34.78-3.86 3.76.91 5.32L10 13.77l-4.78 2.63.91-5.32L2.27 7.12l5.34-.78L10 1.5z" />
                                </svg>
                              );
                            })}
                          </div>
                        </div>
                      );
                    }
                    if (fc.type === "button") {
                      const label = props.label || fc.name || "Button";
                      const variant = props.variant || "primary";
                      const styleProps = fc.style || {};
                      const base =
                        "inline-flex items-center justify-center px-3 py-1.5 rounded-lg text-xs font-medium";
                      const variantClass =
                        variant === "secondary"
                          ? "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50"
                          : variant === "outline"
                          ? "border border-indigo-600 text-indigo-600 bg-white hover:bg-indigo-50"
                          : "bg-indigo-600 text-white hover:bg-indigo-700";
                      const justify =
                        styleProps.textAlign === "center"
                          ? "justify-center"
                          : styleProps.textAlign === "right"
                          ? "justify-end"
                          : "justify-start";
                      return (
                        <div key={fc.id} className={`flex ${justify}`}>
                          <button type="button" className={`${base} ${variantClass}`}>
                            {label}
                          </button>
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              </div>
            )}

            {/* Generic preview for any remaining components (charts, cards, etc.) */}
            {components.some(
              (c) =>
                !renderedIds.has(c.id) &&
                !["app-header", "toolbar", "container", "grid", "section", "side-nav"].includes(c.type)
            ) && (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-4">
                <div className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">
                  Additional Components
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {components
                    .filter(
                      (c) =>
                        !renderedIds.has(c.id) &&
                        !["app-header", "toolbar", "container", "grid", "section", "side-nav"].includes(c.type)
                    )
                    .map((c) => (
                      <div
                        key={c.id}
                        className="border border-slate-200 rounded-lg bg-white px-3 py-2 text-[11px]"
                      >
                        <div className="font-semibold text-slate-800 mb-0.5">
                          {c.name || c.type}
                        </div>
                        <div className="text-slate-500">
                          Preview placeholder for <span className="font-mono">{c.type}</span> component.
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>

          {/* Right side - AI / detail */}
          <div className="space-y-4">
            {/* Render actual reasoning cards if present */}
            {reasoningCards.length > 0 && (
              <div className="space-y-3">
                {reasoningCards.map((card) => {
                  const props = card.props || {};
                  const cardName = card.name || "AI Reasoning";
                  const description = props.description || "AI-powered analysis and insights.";
                  
                  return (
                    <div key={card.id} className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="p-1.5 rounded-lg bg-indigo-600 text-white">
                          <Sparkles className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-slate-900">
                            {cardName}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {description}
                          </div>
                        </div>
                      </div>
                      {props.details && (
                        <div className="mt-1.5 text-[11px] text-slate-700">
                          {typeof props.details === "string" ? (
                            <p>{props.details}</p>
                          ) : Array.isArray(props.details) ? (
                            <ul className="space-y-1 list-disc list-inside">
                              {props.details.map((item, idx) => (
                                <li key={idx}>{item}</li>
                              ))}
                            </ul>
                          ) : null}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Secondary cards if any */}
            {metrics.slice(3).map((m) => (
              <div
                key={m.id}
                className="rounded-xl border border-slate-200 bg-white px-3 py-3"
              >
                <div className="text-[11px] uppercase tracking-wide text-slate-500">
                  {m.props?.title || m.name}
                </div>
                <div className="mt-1 text-lg font-semibold text-slate-900">
                  {m.props?.value || "0"}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const navItems =
    // Prefer explicit side-nav items if present, otherwise fall back to page names
    sideNavComponent
      ? sideNavItems
      : pages && pages.length
      ? pages.map((p, idx) => p.name || `Page ${idx + 1}`)
      : sideNavItems;

  const shellClass = fullScreen
    ? "h-screen w-screen"
    : "w-full min-h-[520px] rounded-2xl border border-slate-800 overflow-hidden";

  return (
    <div className={`${shellClass} bg-slate-950 text-slate-100 flex`}>
      {/* Left sidebar nav */}
      <aside className="w-56 border-r border-slate-800 flex flex-col">
        <div className="px-4 py-4 border-b border-slate-800">
          <div className="text-[10px] uppercase tracking-[0.18em] text-slate-400">
            FAB App
          </div>
          <div className="mt-1 text-sm font-semibold text-white truncate">{appTitle}</div>
        </div>
        <nav className="flex-1 py-3 text-xs">
          {navItems.map((label, index) => {
            const isActive = index === activePage;
            return (
              <button
                key={index}
                onClick={() => onNavigatePage && onNavigatePage(index)}
                className={`w-full flex items-center gap-2 px-4 py-2 text-left transition ${
                  isActive
                    ? "bg-slate-800 text-white"
                    : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
                }`}
              >
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-indigo-400" />
                <span>{label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main preview area */}
      <main className="flex-1 overflow-auto">{mainContent}</main>
    </div>
  );
}
