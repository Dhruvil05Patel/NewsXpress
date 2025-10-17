// tailwind.config.js

/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            // 1. Add your custom background color
            colors: {
                'newspaper': '#F8F5F2',
            },
            // 2. Add your custom fonts
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                serif: ['Playfair Display', 'serif'],
            },
        },
    },
    plugins: [
        require('tailwind-scrollbar-hide')
    ],
}