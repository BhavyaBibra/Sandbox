/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                bg: {
                    primary: '#0B0F17',
                    secondary: '#111827',
                    editor: '#0D1117',
                    canvas: '#0A0E14',
                },
                text: {
                    primary: '#E6EDF3',
                    secondary: '#8B949E',
                },
                accent: {
                    primary: '#7AA2F7',
                    success: '#9ECE6A',
                    warning: '#E0AF68',
                },
                border: {
                    default: '#21262D',
                    hover: '#30363D',
                }
            },
            zIndex: {
                base: '0',
                elevated: '10',
                dropdown: '20',
                sticky: '30',
                overlay: '40',
                panel: '50',
                toast: '60',
                modal: '100',
            }
        },
    },
    plugins: [
        require('@tailwindcss/typography'),
    ],
}
