/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        glass: {
          light: 'rgba(255, 255, 255, 0.25)',
          medium: 'rgba(255, 255, 255, 0.4)',
          heavy: 'rgba(255, 255, 255, 0.6)',
        },
        ambient: {
          calm: '#64B5C6',
          active: '#4ECDC4',
          alert: '#FF6B6B',
          warm: '#FFE66D',
        },
      },
      backdropBlur: {
        xs: '2px',
        glass: '12px',
        heavy: '24px',
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(0, 0, 0, 0.08)',
        'glass-lg': '0 16px 48px rgba(0, 0, 0, 0.12)',
        'glass-xl': '0 24px 64px rgba(0, 0, 0, 0.15)',
        'depth-1': '0 4px 16px rgba(0, 0, 0, 0.05)',
        'depth-2': '0 8px 32px rgba(0, 0, 0, 0.08)',
        'depth-3': '0 16px 48px rgba(0, 0, 0, 0.12)',
        'depth-4': '0 24px 64px rgba(0, 0, 0, 0.16)',
        'glow': '0 0 40px rgba(100, 181, 198, 0.3)',
        'glow-warm': '0 0 40px rgba(255, 107, 107, 0.3)',
      },
      animation: {
        'breathe': 'breathe 4s ease-in-out infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow-pulse': 'glowPulse 4s ease-in-out infinite',
        'slide-in': 'slideIn 0.5s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
        'scroll-news': 'scrollNews 30s linear infinite',
      },
      keyframes: {
        breathe: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.9' },
          '50%': { transform: 'scale(1.02)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 40px rgba(100, 181, 198, 0.3)' },
          '50%': { boxShadow: '0 0 60px rgba(100, 181, 198, 0.5)' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scrollNews: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      fontFamily: {
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
