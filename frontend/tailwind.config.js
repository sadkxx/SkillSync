/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ["class"],
    content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
  	extend: {
  		colors: {
  			border: 'var(--border)',
  			input: 'var(--input)',
  			ring: 'var(--ring)',
  			background: 'var(--background)',
  			foreground: 'var(--foreground)',
  			primary: {
  				DEFAULT: 'var(--primary)',
  				foreground: 'var(--primary-foreground)'
  			},
  			secondary: {
  				DEFAULT: 'var(--secondary)',
  				foreground: 'var(--secondary-foreground)'
  			},
  			destructive: {
  				DEFAULT: 'var(--destructive)',
  				foreground: 'var(--destructive-foreground, var(--primary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'var(--muted)',
  				foreground: 'var(--muted-foreground)'
  			},
  			accent: {
  				DEFAULT: 'var(--accent)',
  				foreground: 'var(--accent-foreground)'
  			},
  			popover: {
  				DEFAULT: 'var(--popover)',
  				foreground: 'var(--popover-foreground)'
  			},
  			card: {
  				DEFAULT: 'var(--card)',
  				foreground: 'var(--card-foreground)'
  			},
  			ink: '#121A2F',
  			mist: '#F5F1E8',
  			ember: '#FF7A59',
  			gold: '#F4C95D',
  			moss: '#75B798',
  			slate: '#5B6476'
  		},
  		boxShadow: {
  			panel: '0 24px 60px rgba(18, 26, 47, 0.14)'
  		},
  		fontFamily: {
  			display: [
  				'Space Grotesk',
  				'Segoe UI',
  				'sans-serif'
  			],
  			body: [
  				'Manrope',
  				'Segoe UI',
  				'sans-serif'
  			]
  		},
  		backgroundImage: {
  			'hero-glow': 'radial-gradient(circle at top left, rgba(255, 122, 89, 0.28), transparent 32%), radial-gradient(circle at top right, rgba(244, 201, 93, 0.22), transparent 28%), linear-gradient(135deg, #121A2F 0%, #1E2945 100%)'
  		}
  	}
  },
  plugins: []
};
