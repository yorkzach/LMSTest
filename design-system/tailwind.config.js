/**
 * NTEC Tailwind Preset
 * ---------------------------------------------------------------------------
 * Drop this in your project root (or import it as a preset) so any internal
 * NTEC web app inherits the brand tokens defined in css/ntec-tokens.css.
 *
 * Usage in a project:
 *   // tailwind.config.js
 *   const ntecPreset = require("./path/to/ntec-style-guide/tailwind.config.js");
 *   module.exports = {
 *     presets: [ntecPreset],
 *     content: ["./src/**\/*.{html,js,jsx,ts,tsx,vue}"],
 *   };
 *
 * Colors below are the literal hex values from the NTEC Brand Standards
 * Guideline (May 2024). The neutral scale is anchored to brand black so
 * `gray-900` and `black` are the same color.
 * ---------------------------------------------------------------------------
 */
module.exports = {
  theme: {
    extend: {
      colors: {
        // Brand primary
        "ntec-black":  "#211E1F",
        "ntec-orange": "#DA6227",
        "ntec-sand":   "#D8C9A3",
        "ntec-sky":    "#69BDE2",

        // Brand secondary
        "ntec-steel": "#496A96",
        "ntec-navy":  "#2D3949",
        "ntec-brown": "#31261D",
        "ntec-sage":  "#6C886A",
        "ntec-mauve": "#9B7793",

        // Neutral scale (anchored to brand black at 900)
        "ntec-gray": {
          50:  "#F7F6F4",
          100: "#ECEAE6",
          200: "#D9D6D0",
          300: "#BAB6AE",
          400: "#8E8A82",
          500: "#6A6661",
          600: "#4D4946",
          700: "#363330",
          800: "#2A2725",
          900: "#211E1F",
        },

        // Semantic
        "ntec-success": "#2F7D32",
        "ntec-warning": "#B45309",
        "ntec-danger":  "#B42318",
        "ntec-info":    "#496A96",
      },

      fontFamily: {
        // Brand-mandated fonts — see README.md for licensed-webfont notes
        "ntec-display": [
          "Franklin Gothic Medium",
          "Franklin Gothic",
          "ITC Franklin Gothic",
          "Arial Narrow",
          "Arial",
          "sans-serif",
        ],
        "ntec-body": [
          "Calibri",
          "Carlito",
          "Segoe UI",
          "Tahoma",
          "Helvetica Neue",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
      },

      fontSize: {
        "ntec-xs":   ["12px", { lineHeight: "1.5" }],
        "ntec-sm":   ["14px", { lineHeight: "1.5" }],
        "ntec-base": ["16px", { lineHeight: "1.5" }],
        "ntec-lg":   ["18px", { lineHeight: "1.5" }],
        "ntec-xl":   ["20px", { lineHeight: "1.35" }],
        "ntec-2xl":  ["24px", { lineHeight: "1.35" }],
        "ntec-3xl":  ["30px", { lineHeight: "1.2" }],
        "ntec-4xl":  ["36px", { lineHeight: "1.2" }],
        "ntec-5xl":  ["48px", { lineHeight: "1.2" }],
      },

      letterSpacing: {
        "ntec-tight":  "-0.01em",
        "ntec-wide":   "0.05em",
        "ntec-wider":  "0.1em",
      },

      spacing: {
        // 4px scale matches ntec-tokens.css. Tailwind's default scale is
        // already on a 4px grid; we add a couple of explicit aliases.
        "ntec-1":  "4px",
        "ntec-2":  "8px",
        "ntec-3":  "12px",
        "ntec-4":  "16px",
        "ntec-6":  "24px",
        "ntec-8":  "32px",
        "ntec-12": "48px",
        "ntec-16": "64px",
        "ntec-24": "96px",
      },

      borderRadius: {
        "ntec-sm":   "2px",
        "ntec-md":   "4px",
        "ntec-lg":   "8px",
        "ntec-xl":   "12px",
        "ntec-pill": "999px",
      },

      boxShadow: {
        "ntec-xs": "0 1px 2px rgba(34, 31, 31, 0.06)",
        "ntec-sm": "0 1px 3px rgba(34, 31, 31, 0.08), 0 1px 2px rgba(34, 31, 31, 0.04)",
        "ntec-md": "0 4px 8px rgba(34, 31, 31, 0.08), 0 2px 4px rgba(34, 31, 31, 0.04)",
        "ntec-lg": "0 12px 24px rgba(34, 31, 31, 0.10), 0 4px 8px rgba(34, 31, 31, 0.04)",
      },

      transitionDuration: {
        "ntec-fast":   "120ms",
        "ntec-normal": "200ms",
        "ntec-slow":   "320ms",
      },

      transitionTimingFunction: {
        "ntec-standard": "cubic-bezier(0.2, 0, 0, 1)",
      },
    },
  },
};
