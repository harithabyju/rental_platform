/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#10B981',
                secondary: '#6366F1',
                background: '#0B0F19',
                surface: '#111827',
                'surface-light': '#1E293B',
                'surface-hover': '#253449',
                border: '#1E293B',
                'border-light': '#334155',
            }
        },
    },
    plugins: [],
}
