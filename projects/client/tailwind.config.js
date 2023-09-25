/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,js,jsx}",
    "../../node_modules/flowbite-react/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
    fontFamily: {
      inter: ["Inter", "sans-serif"],
    },
    colors: {
      maingreen: "#2E6930",
      maindarkgreen: "#1E4620",
      reddanger: "#CB3A31",
      reddangersurface: "#F5D8D6",
      yellowwarn: "#E1AD01",
      yellowwarnsurface: "#F5E5D5",
      greensuccess: "#43936C",
      greensuccesssurface: "#D9E9E2",
      lightgrey: "#EDEDED",
      darkgrey: "#757575",
    },
    fontSize: {
      xxs: "0.5rem",
      xs: "0.75rem",
      sm: "0.8rem",
      base: "1rem",
      xl: "1.25rem",
      "2xl": "1.563rem",
      "3xl": "1.953rem",
      "4xl": "2.441rem",
      "5xl": "3.052rem",
    },
    letterSpacing: {
      tighter: "-0.1em",
      tight: "-0.05em",
      normal: "0",
      wide: "0.1em",
      wider: "0.2em",
      widest: "0.3em",
    },
  },
  plugins: [
    require("flowbite/plugin")({
      charts: true,
    }),
  ],
};
