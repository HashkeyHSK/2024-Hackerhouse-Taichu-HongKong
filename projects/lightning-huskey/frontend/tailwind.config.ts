import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        pretendard: ["var(--font-pretendard)"],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        "huskey-gray-50": "#FAFAFA",
        "huskey-gray-100": "#F4F4F5",
        "huskey-gray-200": "#E4E4E7",
        "huskey-gray-300": "#D1D1D6",
        "huskey-gray-400": "#A0A0AB",
        "huskey-gray-500": "#70707B",
        "huskey-gray-600": "#51525C",
        "huskey-gray-700": "#3F3F46",
        "huskey-gray-800": "#211C23",
        "huskey-gray-900": "#18181B",
        "huskey-primary-50": "#EFF7FC",
        "huskey-primary-100": "#D6ECFF",
        "huskey-primary-200": "#A8D6FF",
        "huskey-primary-300": "#71BCFF",
        "huskey-primary-400": "#00AAFF",
        "huskey-primary-500": "#2868C1",
        "huskey-primary-600": "#095292",
        "huskey-primary-700": "#00305A",
        "huskey-primary-800": "#002240",
        "huskey-primary-900": "#001F2E",
        "huskey-background": "#071027",
        "huskey-box": "#001B36",
        "huskey-cool-gray": "#273452",
      },
    },
  },
  plugins: [],
};
export default config;
