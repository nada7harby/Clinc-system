/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f9f6f6",
          100: "#f3eded",
          200: "#e5d9d9",
          300: "#d1bebe",
          400: "#a87c7c",
          500: "#7e6363", // Primary
          600: "#6d5454",
          700: "#5a4545",
          800: "#493939",
          900: "#3d3030",
          950: "#211919",
        },
        accent: {
          glow: "#ffbaba",
          soft: "#fff0f0",
          DEFAULT: "#e89999",
        },
        ink: {
          900: "#0a1020",
          950: "#050810",
        },
        surface: {
          50: "#fcfaf7",
          100: "#f7f2ee",
        },
        primary: {
          DEFAULT: "#7e6363",
          dark: "#493939",
          light: "#f3eded",
        },
        secondary: {
          DEFAULT: "#0a1020",
        },
      },
      boxShadow: {
        premium: "0 18px 40px -18px rgba(12, 20, 40, 0.25)",
        glass: "0 18px 60px -35px rgba(126, 99, 99, 0.35)",
        glow: "0 0 28px rgba(126, 99, 99, 0.35)",
        halo:
          "0 0 0 1px rgba(126, 99, 99, 0.25), 0 0 30px rgba(232, 153, 153, 0.18)",
      },
      borderRadius: {
        "2xl": "1.25rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
      fontFamily: {
        sans: ["Sora", "Space Grotesk", "sans-serif"],
      },
      animation: {
        float: "float 7s ease-in-out infinite",
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "glow-sweep": "glowSweep 6s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        glowSweep: {
          "0%, 100%": { opacity: 0.3, transform: "translateX(-15%)" },
          "50%": { opacity: 0.7, transform: "translateX(15%)" },
        },
      },
    },
  },
  plugins: [],
};
