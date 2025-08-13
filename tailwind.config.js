/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: [
    './App.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    './screens/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        customBlue: {
          50: 'rgb(59, 130, 246)',
          100: 'rgb(37, 99, 235)',
        },
      },
      backgroundImage: {
        'custom-gradient':
          'linear-gradient(90deg, rgba(59, 130, 246, 1) 0%, rgba(37, 99, 235, 1) 100%)',
      },
    },
  },
  plugins: [],
};
