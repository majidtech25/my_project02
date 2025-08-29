export default {
  darkMode: "class",
  Content:["./index.html","./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          light: "#4F9DFB",
          DEFAULT: "#1D4ED8", // Business Blue
          dark: "#0B3C91",
        },
        success: "#22C55E", // Green
        warning: "#FACC15", // Yellow
        danger: "#EF4444",  // Red
      },
    },
  },

  // ✅ Safelist custom classes so they're always included
  safelist: [
    "card",
    "card-header",
    "table",
    "table-wrapper",
    "btn",
    "btn-primary",
    "btn-secondary"
  ],

  plugins: [],
};