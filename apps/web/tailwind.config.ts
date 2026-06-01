import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        atlas: {
          bg: '#FFFFFF',
          'bg-subtle': '#F4F7F0',
          'text-primary': '#163300',
          'text-secondary': '#4A5A40',
          accent: '#9FE870',
          'dark-surface': '#163300',
          border: '#E3E8DD',
          success: '#1F9D6B',
          error: '#D6453D',
          'dark-bg': '#0E1A0B',
          'dark-text': '#F4F7F0',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.5rem',
      },
    },
  },
  plugins: [],
};

export default config;
