/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ai: {
          bg: "#020617",       // Darkest Slate
          card: "#0f172a",     // Card BG
          accent: "#3b82f6",   // Blue
          cyan: "#06b6d4",     // Cyan
          violet: "#8b5cf6",   // Violet
        },
      },
      animation: {
        'meteor': 'meteor 5s linear infinite',
        'twinkle': 'twinkle 4s ease-in-out infinite',
        'blob': 'blob 20s infinite',
      },
      keyframes: {
        meteor: {
          "0%": { transform: "rotate(215deg) translateX(0)", opacity: "1" },
          "70%": { opacity: "1" },
          "100%": { transform: "rotate(215deg) translateX(-500px)", opacity: "0" },
        },
        twinkle: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.3" },
        },
        blob: {
          "0%": { transform: "translate(0px, 0px) scale(1)" },
          "33%": { transform: "translate(30px, -50px) scale(1.1)" },
          "66%": { transform: "translate(-20px, 20px) scale(0.9)" },
          "100%": { transform: "translate(0px, 0px) scale(1)" },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};