/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./lib/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        tox: {
          orange: '#ff5500',
          orangeDark: '#e04a00',
          orangeHover: '#ff661a',
          orangeLight: '#fff5ed',
          orangeBorder: '#fed7aa',
          black: '#09090b',
          dark: '#141417',
          surface: '#ffffff',
          card: '#ffffff',
          border: '#e4e4e7',
          borderDark: '#27272a',
          muted: '#64748b',
          bg: '#f8fafc',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'Courier New', 'monospace'],
      },
      boxShadow: {
        'tox': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
        'tox-md': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
        'tox-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.06), 0 4px 6px -4px rgba(0, 0, 0, 0.04)',
        'tox-orange': '0 4px 14px 0 rgba(255, 85, 0, 0.25)',
      },
    },
  },
  plugins: [],
};
