/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        tpPurple: "#612D91",
        tpPink: "#E91E63",
      },
    },
  },
  darkMode: "class",
  plugins: [],
};

