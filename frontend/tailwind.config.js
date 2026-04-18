/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand1: "#005f73",
        brand2: "#0a9396",
        brand3: "#94d2bd",
        brand4: "#e9d8a6",
        brand5: "#ee9b00",
      }
    },
  },
  plugins: [],
}
