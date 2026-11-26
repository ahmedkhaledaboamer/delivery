/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // APEX AORA brand — sampled from the logo (violet → magenta → blue → cyan)
        brand: {
          DEFAULT: "#7C3AED", // violet — primary buttons, active states
          dark: "#3B1A8C", // deep indigo-violet — big headings
          accent: "#06B6D4", // cyan — bright accents, live dots, map route highlights
          light: "#EDE9FE", // selected cards, chips
          lighter: "#F5F3FF", // header bands, info banners
        },
        surface: "#FAFAFF", // screen background
        ink: "#1E1B4B", // primary text (same indigo as the wordmark)
        body: "#4B5563", // secondary text
        muted: "#9CA3AF", // hints, placeholders
        line: "#E5E7EB", // borders
        danger: { DEFAULT: "#E53935", light: "#FDECEC" },
      },
      fontFamily: {
        inter: ["Inter_400Regular"],
        "inter-medium": ["Inter_500Medium"],
        "inter-semibold": ["Inter_600SemiBold"],
        "inter-bold": ["Inter_700Bold"],
      },
    },
  },
  plugins: [],
};
