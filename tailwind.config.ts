import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        gold:      { DEFAULT: '#d4af37', light: '#f7e7ce', dark: '#b8952a' },
        obsidian:  { DEFAULT: '#0d0d0d', 900: '#111', 800: '#1a1a1a', 700: '#222', 600: '#2a2a2a' },
        glass:     { DEFAULT: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.10)' },
      },
      fontFamily: {
        serif:  ['Playfair Display', 'Georgia', 'serif'],
        sans:   ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'radial-gold': 'radial-gradient(circle at 50% 50%, rgba(212,175,55,0.06) 0%, rgba(13,13,13,1) 70%)',
      },
      backdropBlur: { glass: '20px' },
      animation: {
        'fade-in-up':   'fadeInUp 0.6s ease-out',
        'fade-in-down': 'fadeInDown 0.6s ease-out',
        'pulse-gold':   'pulseGold 2s ease-in-out infinite',
      },
      keyframes: {
        fadeInUp:   { from: { opacity: '0', transform: 'translateY(24px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        fadeInDown: { from: { opacity: '0', transform: 'translateY(-24px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        pulseGold:  { '0%,100%': { boxShadow: '0 0 0 0 rgba(212,175,55,0.4)' }, '50%': { boxShadow: '0 0 0 8px rgba(212,175,55,0)' } },
      },
    },
  },
  plugins: [],
}
export default config
