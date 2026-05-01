/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        pivot1: '#2563EB',
        pivot2: '#16A34A',
        weather: '#D97706',
        anomaly: '#DC2626',
        missing: '#9CA3AF',
        warning: '#EA580C',
      },
    },
  },
  plugins: [],
};
