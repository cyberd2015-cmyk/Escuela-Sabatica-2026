/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ["class"],
    content: [
        './index.html',
        './src/**/*.{js,ts,jsx,tsx}',
    ],
    theme: {
        extend: {
            colors: {
                // Institutional Colors - Sello 1853
                institutional: {
                    blue: "#1A4789",
                    gold: "#D4AF37",
                    white: "#FDFDFD",
                },
                // Primary and secondary mappings can remain if they don't conflict
                primary: {
                    DEFAULT: '#1A4789', // Blue institutional
                    50: '#e6f0ff',
                    100: '#b3d1ff',
                    200: '#80b3ff',
                    300: '#4d94ff',
                    400: '#1a75ff',
                    500: '#1A4789',
                    600: '#002d5c',
                    700: '#002652',
                    800: '#001f47',
                    900: '#00193d',
                },
                gold: {
                    DEFAULT: '#D4AF37',
                    50: '#fdf9e6',
                    100: '#f9efc0',
                    200: '#f4e399',
                    300: '#efd773',
                    400: '#e9cb4c',
                    500: '#D4AF37',
                    600: '#bf9c2f',
                    700: '#a98928',
                    800: '#947621',
                    900: '#7e631a',
                },
                background: 'hsl(var(--background))',
                foreground: 'hsl(var(--foreground))',
                card: {
                    DEFAULT: 'hsl(var(--card))',
                    foreground: 'hsl(var(--card-foreground))',
                },
                muted: {
                    DEFAULT: 'hsl(var(--muted))',
                    foreground: 'hsl(var(--muted-foreground))',
                },
                accent: {
                    DEFAULT: 'hsl(var(--accent))',
                    foreground: 'hsl(var(--accent-foreground))',
                },
                destructive: {
                    DEFAULT: 'hsl(var(--destructive))',
                    foreground: 'hsl(var(--destructive-foreground))',
                },
                border: 'hsl(var(--border))',
                input: 'hsl(var(--input))',
                ring: 'hsl(var(--ring))',
            },
            backgroundImage: {
                'hero-gradient': 'linear-gradient(to bottom, #1A4789, #0D2A54)',
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            borderRadius: {
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(var(--radius) - 4px)',
                xl: 'var(--radius)', // Adding xl for branding rules
            },
        },
    },
    plugins: [],
}
