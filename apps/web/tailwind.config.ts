import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        auriga: {
          // ---- Official Auriga brand palette ----
          // Auriga Neon (primary brand) — #CCFF00
          neon: '#CCFF00',
          // Auriga Black (text & dark surfaces) — #1C180D
          black: '#1C180D',
          bg: '#FFFFFF',
          'bg-subtle': '#F5F3F0',
          'text-primary': '#1C180D',
          'text-secondary': '#6F6C68',
          accent: {
            DEFAULT: '#CCFF00',
            50: '#FAFFE5',
            100: '#F2FFB3',
            200: '#E8FF80',
            400: '#DBFF4D',
            500: '#CCFF00',
            600: '#8FB300',
            700: '#6E8A00',
          },
          // Auriga UI green — #5AC53A
          green: {
            DEFAULT: '#5AC53A',
            50: '#F2FAEF',
            100: '#E5F6E0',
            200: '#C4EAB8',
            300: '#9FDD8D',
            400: '#7BD161',
            500: '#5AC53A',
            600: '#4CA531',
            700: '#2F8A26',
            800: '#2F661E',
          },
          // Heather warm-gray scale (#D4D0C9 / #B4B1AB / #8A8783)
          heather: {
            50: '#F5F3F0',
            100: '#ECEAE5',
            200: '#D4D0C9',
            300: '#B4B1AB',
            400: '#8A8783',
            500: '#6F6C68',
            600: '#54514D',
            700: '#3D3B38',
          },
          'dark-surface': '#1C180D',
          border: '#E4E1DB',
          success: '#5AC53A',
          error: '#D6453D',
          'dark-bg': '#1C180D',
          'dark-text': '#F5F3F0',
        },
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        ring: 'hsl(var(--ring))',
      },
      fontFamily: {
        sans: [
          'var(--font-body)',
          'Inter',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
        heading: [
          'var(--font-heading)',
          'Georgia',
          'Cambria',
          'Times New Roman',
          'serif',
        ],
        serif: [
          'var(--font-heading)',
          'Georgia',
          'Cambria',
          'Times New Roman',
          'serif',
        ],
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.5rem',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'pop-in': {
          '0%': { transform: 'scale(0)', opacity: '0' },
          '60%': { transform: 'scale(1.15)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'confetti-fall': {
          '0%': { transform: 'translateY(-10%) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(420%) rotate(540deg)', opacity: '0' },
        },
        'rise-in': {
          '0%': { transform: 'translateY(8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'pop-in': 'pop-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) both',
        'confetti-fall': 'confetti-fall 2.2s ease-in forwards',
        'rise-in': 'rise-in 0.4s ease-out both',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
