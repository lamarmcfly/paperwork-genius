import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand colors
        brand: {
          primary: '#1E3A5F',    // Deep navy blue
          accent: '#3B82F6',     // Bright blue
          light: '#F8FAFC',      // Light gray background
        },
        // Permit type colors
        permit: {
          'new-construction': '#EF4444',
          'demolition': '#F59E0B',
          'commercial-buildout': '#3B82F6',
          'major-renovation': '#22C55E',
          'multifamily': '#A855F7',
          'other': '#6B7280',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
