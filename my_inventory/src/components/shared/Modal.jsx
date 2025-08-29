import React from "react";
import { FiX } from "react-icons/fi";

export default function Modal({ title, children, footer, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
          aria-label="Close modal"
        >
          <FiX className="w-5 h-5" />
        </button>

        {/* Header */}
        {title && <h2 className="text-lg font-semibold mb-4">{title}</h2>}

        {/* Body */}
        <div className="space-y-4">{children}</div>

        {/* Footer */}
        {footer && <div className="mt-6 flex justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
}
