/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Premium dark theme with royal colors
        dark: {
          50: '#F5F3F0',
          100: '#E8E4DF',
          200: '#D1C9C1',
          300: '#B9AFA5',
          400: '#9B8E84',
          500: '#6B5D54',
          600: '#4A3F38',
          700: '#2D241E',
          800: '#1A1512',
          900: '#0F0C0A',
        },
        royal: {
          olive: '#556B2F',
          'dark-olive': '#3D4D23',
          'light-olive': '#6B8E23',
          gold: '#D4AF37',
          'light-gold': '#E8D4A0',
          cream: '#F5F1E8',
          'dark-cream': '#E6E1D6',
        },
        accent: {
          primary: '#4ECB9B',
          secondary: '#F97316',
          success: '#22C55E',
          warning: '#EAB308',
          error: '#EF4444',
        },
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto'],
      },
      opacity: {
        6: '0.06',
        12: '0.12',
      },
    },
  },
  plugins: [],
}