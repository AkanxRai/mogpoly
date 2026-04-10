"use client";

import { motion, AnimatePresence } from "framer-motion";

interface ModalProps {
  open: boolean;
  onClose?: () => void;
  children: React.ReactNode;
  title?: string;
}

export default function Modal({ open, onClose, children, title }: ModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-[rgba(0,0,0,0.7)] backdrop-blur-sm" />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="glass-panel relative z-10 max-w-md w-full p-6 max-h-[80vh] overflow-y-auto"
          >
            {title && (
              <h2 className="text-lg font-bold text-glow mb-4 font-mono">{title}</h2>
            )}
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
