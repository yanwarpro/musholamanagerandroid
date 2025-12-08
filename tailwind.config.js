/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        'navy-deep': '#0A1628',
        'teal-deep': '#0D2B3E',
        'mint': {
          400: '#7FFFD4',
          500: '#98FFE0',
        },
        'glass': {
          border: 'rgba(255, 255, 255, 0.15)',
          bg: 'rgba(255, 255, 255, 0.1)',
        }
      },
      fontFamily: {
        'outfit': ['Outfit', 'sans-serif'],
        'jakarta': ['Plus Jakarta Sans', 'sans-serif'],
        'mono': ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};
