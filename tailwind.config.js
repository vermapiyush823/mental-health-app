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
      animation: {
        blob: 'blob 7s infinite ease-in-out',
      },
      keyframes: {
        blob: {
          '0%': {
            transform: 'translate(0px, 0px) scale(1)',
          },
          '33%': {
            transform: 'translate(30px, -50px) scale(1.1)',
          },
          '66%': {
            transform: 'translate(-20px, 20px) scale(0.9)',
          },
          '100%': {
            transform: 'translate(0px, 0px) scale(1)',
          },
        },
      },
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
      animation: {
        blob: "blob 7s infinite",
        slideRight: "slideRight 0.8s ease-out forwards 0.3s"
      },
      keyframes: {
        blob: {
          "0%": {
            transform: "translate(0px, 0px) scale(1)",
          },
          "33%": {
            transform: "translate(30px, -50px) scale(1.1)",
          },
          "66%": {
            transform: "translate(-20px, 20px) scale(0.9)",
          },
          "100%": {
            transform: "translate(0px, 0px) scale(1)",
          },
        },
        slideRight: {
          "0%": { transform: "scaleX(0)" },
          "100%": { transform: "scaleX(1)" }
        }
      },
      transitionProperty: {
        'width': 'width',
        'height': 'height',
      },
      // Add the animation delay utilities as CSS variables
      animationDelay: {
        '2000': '2s',
        '4000': '4s',
      },
    },
  },
  plugins: [
    // Add the animation delay plugin
    function({ addUtilities, theme }) {
      const animationDelays = theme('animationDelay', {});
      const utilities = Object.entries(animationDelays).reduce(
        (acc, [key, value]) => {
          return {
            ...acc,
            [`.animation-delay-${key}`]: { animationDelay: value },
          };
        },
        {}
      );
      
      addUtilities(utilities);
    },
  ],
}