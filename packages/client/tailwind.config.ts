import type { Config } from 'tailwindcss'

export default {
  content: [],
  theme: {
    extend: {
        fontFamily: {
            display: ['Syne', 'sans-serif'],
            body: ['DM Sans', 'sans-serif'],
        },
        colors: {
            50: '#f0f4ff',
            100: '#dce6ff',
            200: '#b9ccff',
            300: '#86a5ff',
            400: '#4d73ff',
            500: '#1f45f5',
            600: '#1030e8',
            700: '#0d22c0',
            800: '#0f1f9b',
            900: '#111d7a',
            950: '#0a1050',
        },
        slate: {
          925: '#0d1424',
        }
    },
  },
  plugins: [],
} satisfies Config