/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // Sử dụng 'class' để chuyển đổi chế độ tối
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      zIndex: {
        '100': '100',
        '200': '200',
      },
      spacing: {
        '1/6': '16.666667%',
      }
    },
  },
  plugins: [],
}
