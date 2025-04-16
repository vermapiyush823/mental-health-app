/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class', // Enables dark mode with class strategy
  theme: {
    extend: {
      colors: {
        // You can define custom colors for your light/dark themes here
        // For example:
        primary: {
          light: '#4F46E5', // Indigo shade for light mode
          dark: '#818CF8',  // Lighter indigo for dark mode
        },
      },
      backgroundColor: {
        dark: '#121212',    // Dark background
        light: '#FFFFFF',   // Light background
      },
      textColor: {
        dark: '#FFFFFF',    // Text color for dark mode
        light: '#000000',   // Text color for light mode
      },
    },
  },
  plugins: [],
}