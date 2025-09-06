module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx,html}"],
  theme: {
    extend: {},
  },
  variants: {
    extend: {
      opacity: ['group-hover'],
    },
  },
  plugins: [require('tailwind-scrollbar-hide')],
};
