/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          black: '#000000',
          bg: '#F5F5F7',
          card: '#F8F8F8',
          primary: '#7201FF',
          success: '#8FFE01',
          neutral: '#D3D3D3',
          border: '#EAEAEA',
          muted: '#8A8A8E',
          lightgray: '#F0F0F2',
          surface: '#FFFFFF',
        }
      },
      fontFamily: {
        sans: ['Urbanist', 'sans-serif'],
      },
      boxShadow: {
        'panel': '0 8px 30px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)',
        'card': '0 2px 12px rgba(0, 0, 0, 0.04)',
        'floating': '0 14px 40px -4px rgba(0, 0, 0, 0.12), 0 4px 12px -2px rgba(0, 0, 0, 0.06)',
        'subtle': '0 1px 3px rgba(0, 0, 0, 0.05)',
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
      },
      gridTemplateColumns: {
        '16': 'repeat(16, minmax(0, 1fr))',
      },
    },
  },
  plugins: [],
}
