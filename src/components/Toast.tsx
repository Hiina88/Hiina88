"use client";

import { useEffect } from "react";

interface ToastProps {
  message: string | null;
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, onClose, duration = 1800 }: ToastProps) {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(onClose, duration);
    return () => clearTimeout(t);
  }, [message, duration, onClose]);

  if (!message) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-full bg-ink-800 text-white text-sm shadow-pop flex items-center gap-2 animate-[fadeIn_120ms_ease-out]"
    >
      <svg
        viewBox="0 0 20 20"
        fill="none"
        className="w-4 h-4"
        aria-hidden
      >
        <path
          d="M5 10.5l3 3 7-7"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span>{message}</span>
    </div>
  );
}
