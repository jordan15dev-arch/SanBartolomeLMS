import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: "#0A2540",
        blue: "#10437A",
        gold: "#D8AD57",
      },
    },
  },
  plugins: [],
};

export default config;
