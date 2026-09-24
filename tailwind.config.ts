import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Pastel purple brand scale, anchored on the Divvy logo (#b18ae8)
        brand: {
          50: '#f6f2fd',
          100: '#ece3fa',
          200: '#dcc7f5',
          300: '#c6a4ee',
          400: '#b18ae8',
          500: '#9a67df',
          600: '#844ec9',
          700: '#6d3ca8',
          800: '#572f85',
          900: '#432463',
          950: '#2a1544',
        },
        // Light surface tokens (white + pastel purple tints)
        surface: {
          bg: '#f4f2f7',
          card: '#ffffff',
          border: '#e7e4ee',
          accent: '#f6f4fa',
        },
      },
      boxShadow: {
        card: '0 1px 2px rgba(42, 21, 68, 0.04), 0 8px 24px -12px rgba(42, 21, 68, 0.12)',
        'card-hover':
          '0 2px 4px rgba(42, 21, 68, 0.05), 0 12px 32px -12px rgba(132, 78, 201, 0.25)',
        logo: '0 4px 14px rgba(132, 78, 201, 0.35)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'glow-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
};

export default config;
