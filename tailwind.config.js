/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#ff7a00',
          foreground: '#ffffff',
        },
        brand: {
          bg: '#050507',
          surface: '#0f0f14',
          ink: '#F4F4F6',
          muted: '#94A3B8',
          blue: {
            DEFAULT: '#ff7a00',
            hover: '#ea580c',
            light: '#2a1a0c',
          },
          border: 'rgba(255, 255, 255, 0.08)',
          borderSubtle: 'rgba(255, 255, 255, 0.05)',
          success: {
            DEFAULT: '#10B981',
            light: 'rgba(16, 185, 129, 0.1)',
            border: 'rgba(16, 185, 129, 0.3)',
          },
          warning: {
            DEFAULT: '#F59E0B',
            light: 'rgba(245, 158, 11, 0.1)',
            border: 'rgba(245, 158, 11, 0.3)',
          },
          error: {
            DEFAULT: '#EF4444',
            light: 'rgba(239, 68, 68, 0.1)',
            border: 'rgba(239, 68, 68, 0.3)',
          },
        },
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'sans-serif'],
        sans: ['"DM Sans"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
