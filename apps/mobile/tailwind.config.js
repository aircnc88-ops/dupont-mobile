/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0b0e11',
        panel: '#151a21',
        panel2: '#1c232c',
        line: '#262e38',
        muted: '#8a94a3',
        txt: '#eaecef',
        up: '#2ebd85',
        down: '#f6465d',
        accent: '#00c2cb',
        warn: '#f0b90b',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"Pretendard"', '"Apple SD Gothic Neo"', '"Noto Sans KR"', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
