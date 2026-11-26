/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Brand greens sampled from the Rush Figma design
        brand: {
          DEFAULT: "#6A9A0A", // primary buttons, active states
          dark: "#2F5A08", // big headings ("Always in sight.")
          accent: "#8CC63F", // bright accents, map route
          light: "#EAF3DA", // selected cards, chips
          lighter: "#F4F9EC", // header bands, info banners
        },
        surface: "#F8FAF5", // screen background
        ink: "#111827", // primary text
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
