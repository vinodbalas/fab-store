import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, AlertCircle, Info, X } from "lucide-react";
import { useEffect, useState } from "react";

/**
 * Toast Notification Component
 * Displays temporary success/error/info messages
 */

const TOAST_DURATION = 4000; // 4 seconds

const toastTypes = {
  success: {
    icon: CheckCircle2,
    bg: "bg-green-50 dark:bg-green-900/20",
    border: "border-green-200 dark:border-green-800",
    iconColor: "text-green-600 dark:text-green-400",
    textColor: "text-green-900 dark:text-green-100",
  },
  error: {
    icon: XCircle,
    bg: "bg-red-50 dark:bg-red-900/20",
    border: "border-red-200 dark:border-red-800",
    iconColor: "text-red-600 dark:text-red-400",
    textColor: "text-red-900 dark:text-red-100",
  },
  warning: {
    icon: AlertCircle,
    bg: "bg-yellow-50 dark:bg-yellow-900/20",
    border: "border-yellow-200 dark:border-yellow-800",
    iconColor: "text-yellow-600 dark:text-yellow-400",
    textColor: "text-yellow-900 dark:text-yellow-100",
  },
  info: {
    icon: Info,
    bg: "bg-blue-50 dark:bg-blue-900/20",
    border: "border-blue-200 dark:border-blue-800",
    iconColor: "text-blue-600 dark:text-blue-400",
    textColor: "text-blue-900 dark:text-blue-100",
  },
};

export function Toast({ message, type = "success", onClose, duration = TOAST_DURATION }) {
  const [isVisible, setIsVisible] = useState(true);
  const config = toastTypes[type] || toastTypes.success;
  const Icon = config.icon;

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => onClose?.(), 300); // Wait for exit animation
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className={`fixed top-20 right-6 z-50 min-w-[320px] max-w-md ${config.bg} ${config.border} border-2 rounded-lg shadow-2xl p-4 flex items-start gap-3`}
    >
      <div className={`shrink-0 ${config.iconColor}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold ${config.textColor}`}>{message}</p>
      </div>
      <button
        onClick={() => {
          setIsVisible(false);
          setTimeout(() => onClose?.(), 300);
        }}
        className={`shrink-0 ${config.iconColor} hover:opacity-70 transition-opacity`}
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

/**
 * Toast Container - Manages multiple toasts
 */
export function ToastContainer({ toasts, onRemove }) {
  return (
    <div className="fixed top-20 right-6 z-50 space-y-3 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <Toast
              message={toast.message}
              type={toast.type}
              onClose={() => onRemove(toast.id)}
              duration={toast.duration}
            />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}

/**
 * Hook for managing toasts
 */
export function useToast() {
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = "success", duration = TOAST_DURATION) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type, duration }]);
    return id;
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const ToastComponent = () => (
    <ToastContainer toasts={toasts} onRemove={removeToast} />
  );

  return { showToast, removeToast, ToastComponent };
}

