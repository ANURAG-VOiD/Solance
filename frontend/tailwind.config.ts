import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        void: "#09090b",
        surface: { DEFAULT: "#18181b", hover: "#27272a" },
        border: "#2e2e33",
        brand: { DEFAULT: "#ff6b00", hover: "#e05e00" },
        text: { DEFAULT: "#f4f4f5", muted: "#a1a1aa" },
        bg: "var(--color-bg)",
        "bg-subtle": "var(--color-bg-subtle)",
        accent: "var(--color-accent)",
        "accent-hover": "var(--color-accent-hover)",
        success: "var(--color-success)",
        warning: "var(--color-warning)",
        danger: "var(--color-danger)",
      },
    },
  },
  plugins: [],
};

export default config;
