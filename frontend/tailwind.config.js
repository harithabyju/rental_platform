/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#77DD77', // Pastel Green
                secondary: '#F48FB1', // Pastel Pink
                background: '#F3F4F6', // Gray 100
            }
        },
    },
    plugins: [],
}
