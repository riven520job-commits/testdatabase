/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        notion: {
          bg: "#f7f7f5",
          card: "#ffffff",
          border: "#e5e5e0",
          text: "#30302e",
          muted: "#73726f",
          soft: "#efefeb"
        }
      },
      boxShadow: {
        notion: "0 12px 28px rgba(15, 15, 15, 0.04)"
      }
    }
  },
  plugins: []
};
