module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
   extend: {
   colors: {
    primary: "#9D0942",
    primaryDark: "#7A0733",
    primaryLight: "#FCE7F3",
    background: "#fafafa",
    card: "#ffffff",
    borderLight: "#e5e7eb",
  },
  backgroundImage: {
    primaryGradient: "linear-gradient(135deg,#9D0942,#7A0733)",
  },
  boxShadow: {
    card: "0 2px 10px rgba(0,0,0,0.05)",
    navbar: "0 1px 4px rgba(0,0,0,0.08)",
  },
},
  },
  plugins: [],
};