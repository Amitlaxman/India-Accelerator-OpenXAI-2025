/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./app/**/*.{js,jsx,ts,tsx}",
      "./pages/**/*.{js,jsx,ts,tsx}",
      "./components/**/*.{js,jsx,ts,tsx}"
    ],
    theme: {
      extend: {
        fontFamily: {
          sans: ['Inter', 'ui-sans-serif', 'system-ui'],
          serif: ['Georgia', 'Times New Roman', 'serif'],
          handwriting: ['"Dancing Script"', 'cursive'] // example signature style if you embed fonts
        },
      },
    },
    plugins: [],
  };
  