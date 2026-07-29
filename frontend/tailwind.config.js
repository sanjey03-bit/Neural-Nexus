/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Deep glassmorphic dark palette
        brand: {
          dark: "#0b0f19",      // Deep near-black background
          darker: "#070a12",    // Muted darker tone
          glass: "rgba(255, 255, 255, 0.03)", // Very low opacity white
          border: "rgba(255, 255, 255, 0.08)", // Glass borders
          accent: "#0ea5e9",    // Soft teal/cyan accent
          accentMuted: "rgba(14, 165, 233, 0.15)",
        }
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      }
    },
  },
  plugins: [],
}
