import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

export default function Drawer({ open, onClose, children, width = 520, title = "" }) {
  // Prevent body scroll while drawer open (nice polish)
  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = original; };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            className="fixed inset-0 bg-black/40 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Panel (fixed; overlays content, doesn’t push layout) */}
          <motion.aside
            key="panel"
            className="fixed top-0 right-0 h-full bg-white dark:bg-gray-900 shadow-2xl border-l border-gray-200 dark:border-gray-700 z-50"
            style={{ width }}
            initial={{ x: width }}
            animate={{ x: 0 }}
            exit={{ x: width }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
            aria-modal="true"
            role="dialog"
            aria-label={title || "Details"}
          >
            <div className="h-full flex flex-col">
              {children}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
