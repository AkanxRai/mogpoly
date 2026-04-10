"use client";

import { motion } from "framer-motion";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger";
  size?: "sm" | "md" | "lg";
}

const variants = {
  primary: "bg-[rgba(0,255,100,0.08)] border-[rgba(0,255,100,0.3)] text-[#00ff64] hover:bg-[rgba(0,255,100,0.15)] hover:shadow-[0_0_20px_rgba(0,255,100,0.2)]",
  secondary: "bg-[rgba(255,255,255,0.04)] border-[rgba(255,255,255,0.15)] text-[rgba(255,255,255,0.6)] hover:bg-[rgba(255,255,255,0.08)]",
  danger: "bg-[rgba(255,0,0,0.08)] border-[rgba(255,0,0,0.3)] text-[#ff4444] hover:bg-[rgba(255,0,0,0.15)]",
};

const sizes = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-5 py-2.5 text-sm",
  lg: "px-8 py-3.5 text-base",
};

export default function Button({
  variant = "primary", size = "md", className = "", children, disabled, ...props
}: ButtonProps) {
  return (
    <motion.button
      whileHover={disabled ? {} : { scale: 1.02 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      className={`font-mono border rounded-md transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled}
      {...(props as any)}
    >
      {children}
    </motion.button>
  );
}
