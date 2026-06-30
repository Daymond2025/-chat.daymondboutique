import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        neo: {
          DEFAULT:  'oklch(.67 .22 144.33)',
          dark:     'oklch(.48 .20 144.33)',
          darker:   'oklch(.32 .16 144.33)',
          darkest:  'oklch(.20 .10 144.33)',
          // Couleur header style WhatsApp — sombre, peu saturée, cohérente Neo Green
          header:   'oklch(.25 .06 144.33)',
          light:    'oklch(.82 .14 144.33)',
          bg:       'oklch(.95 .04 144.33)',
          border:   'oklch(.88 .08 144.33)',
        },
      },
      keyframes: {
        'typing-dot': {
          '0%, 60%, 100%': { transform: 'translateY(0)' },
          '30%':           { transform: 'translateY(-6px)' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'typing-dot-1': 'typing-dot 1.2s 0.0s infinite ease-in-out',
        'typing-dot-2': 'typing-dot 1.2s 0.2s infinite ease-in-out',
        'typing-dot-3': 'typing-dot 1.2s 0.4s infinite ease-in-out',
        'slide-up':     'slide-up 0.2s ease-out',
      },
    },
  },
  plugins: [],
};

export default config;