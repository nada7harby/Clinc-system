/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef5ff",
          100: "#d8e7ff",
          200: "#b6d1ff",
          300: "#83b2f7",
          400: "#4f86cf",
          500: "#1f4072", // Prussian Blue
          600: "#1a3866",
          700: "#162f58",
          800: "#122746",
          900: "#0f213a",
          950: "#081426",
        },
        accent: {
          glow: "#fff3b4",
          soft: "#fff9df",
          DEFAULT: "#fff3b4",
        },
        ink: {
          900: "#0a1020",
          950: "#050810",
        },
        surface: {
          50: "#fffdf2",
          100: "#fff7cf",
        },
        primary: {
          DEFAULT: "#1f4072",
          dark: "#122746",
          light: "#d8e7ff",
        },
        secondary: {
          DEFAULT: "#0a1020",
        },
      },
      boxShadow: {
        premium: "0 18px 40px -18px rgba(12, 20, 40, 0.25)",
        glass: "0 18px 60px -35px rgba(31, 64, 114, 0.35)",
        glow: "0 0 28px rgba(31, 64, 114, 0.35)",
        halo:
          "0 0 0 1px rgba(31, 64, 114, 0.25), 0 0 30px rgba(255, 243, 180, 0.35)",
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
