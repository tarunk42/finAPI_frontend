/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Scan src files for Tailwind classes
  ],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        // Define semantic colors based on your CSS variables
        'background': 'var(--bg)', // Use CSS variables defined in index.css
        'foreground': 'var(--text)',
        'border-color': 'var(--border)',
      },
      // If you were using specific fonts like "Nunito", add them here
      // fontFamily: {
      //   sans: ['Nunito', 'sans-serif'],
      // },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}