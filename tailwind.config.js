/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./lib/**/*.{js,jsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        obsidian: {
          950: '#030304',
          900: '#09090b',
          850: '#0e0e11',
          800: '#141418',
          750: '#1a1a20',
          700: '#23232b',
          600: '#32323d',
        },
        tox: {
          orange: '#ff5500',
          orangeDark: '#e04a00',
          orangeHover: '#ff661a',
          orangeLight: 'rgba(255, 85, 0, 0.1)',
          orangeBorder: 'rgba(255, 85, 0, 0.3)',
          black: '#000000',
          dark: '#09090b',
          surface: '#0e0e11',
          card: '#141418',
          border: 'rgba(255, 255, 255, 0.08)',
          borderHover: 'rgba(255, 255, 255, 0.16)',
          muted: '#8e8e99',
          bg: '#000000',
        },
      },
      fontFamily: {
        sans: ['Geist', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['Geist Mono', 'JetBrains Mono', 'Menlo', 'Monaco', 'Courier New', 'monospace'],
      },
      boxShadow: {
        '8k': '0 0 0 1px rgba(255, 255, 255, 0.08), 0 2px 4px rgba(0, 0, 0, 0.4)',
        '8k-card': '0 0 0 1px rgba(255, 255, 255, 0.08), 0 8px 24px -4px rgba(0, 0, 0, 0.6)',
        '8k-modal': '0 0 0 1px rgba(255, 255, 255, 0.12), 0 24px 60px -12px rgba(0, 0, 0, 0.85)',
        '8k-glow': '0 0 30px -5px rgba(255, 85, 0, 0.35)',
        '8k-glow-subtle': '0 0 20px -8px rgba(255, 85, 0, 0.2)',
        'tox-orange': '0 0 20px 0 rgba(255, 85, 0, 0.35)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'subtle-grid': 'radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px)',
      },
    },
  },
  plugins: [],
};
