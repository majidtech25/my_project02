import React from "react";

export default function ModalCard({ title, children, onClose }) {
  return (
    <div className="absolute inset-0 flex items-start justify-center z-50">
      {/* Overlay (lighter so the page is still visible) */}
      <div
        className="fixed inset-0 bg-black/20"
        onClick={onClose} // close when clicking outside
      ></div>

      {/* Card */}
      <div className="relative mt-20 bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md p-6">
        {/* Title */}
        <h2 className="text-lg font-semibold mb-4">{title}</h2>

        {/* Content */}
        <div className="space-y-3">{children}</div>

        {/* Close button (top-right) */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>
    </div>
  );
}