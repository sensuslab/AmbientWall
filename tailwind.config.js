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
        surface: {
          white: '#FFFFFF',
          warm: '#FFFBF7',
          cream: '#FFF8F0',
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
        'elevation-surface': '0 1px 3px rgba(0, 0, 0, 0.04)',
        'elevation-1': '0 4px 12px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04)',
        'elevation-2': '0 8px 24px rgba(0, 0, 0, 0.08), 0 2px 6px rgba(0, 0, 0, 0.04)',
        'elevation-3': '0 16px 40px rgba(0, 0, 0, 0.10), 0 4px 12px rgba(0, 0, 0, 0.04)',
        'elevation-4': '0 24px 56px rgba(0, 0, 0, 0.12), 0 6px 16px rgba(0, 0, 0, 0.04)',
        'elevation-floating': '0 32px 72px rgba(0, 0, 0, 0.16), 0 8px 24px rgba(0, 0, 0, 0.06)',
        'elevation-dragging': '0 40px 80px rgba(0, 0, 0, 0.20), 0 12px 32px rgba(0, 0, 0, 0.08)',
        'glow': '0 0 40px rgba(100, 181, 198, 0.3)',
        'glow-warm': '0 0 40px rgba(255, 107, 107, 0.3)',
        'glow-active': '0 0 60px rgba(78, 205, 196, 0.4)',
        'inner-glow': 'inset 0 1px 0 rgba(255, 255, 255, 0.4)',
      },
      animation: {
        'breathe': 'breathe 4s ease-in-out infinite',
        'breathe-slow': 'breathe 6s ease-in-out infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'pulse-gentle': 'pulseGentle 4s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float 8s ease-in-out infinite',
        'glow-pulse': 'glowPulse 4s ease-in-out infinite',
        'slide-in': 'slideIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
        'fade-in-slow': 'fadeIn 0.6s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'scroll-news': 'scrollNews 60s linear infinite',
        'mode-transition': 'modeTransition 0.4s ease-out',
      },
      keyframes: {
        breathe: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.95' },
          '50%': { transform: 'scale(1.015)', opacity: '1' },
        },
        pulseGentle: {
          '0%, 100%': { opacity: '0.9' },
          '50%': { opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 40px rgba(100, 181, 198, 0.3)' },
          '50%': { boxShadow: '0 0 60px rgba(100, 181, 198, 0.5)' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        scrollNews: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        modeTransition: {
          '0%': { opacity: '0.8', transform: 'scale(0.98)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      fontFamily: {
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
      transitionDuration: {
        '400': '400ms',
        '600': '600ms',
      },
      transitionTimingFunction: {
        'ambient': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'smooth': 'cubic-bezier(0.25, 0.1, 0.25, 1)',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '100': '25rem',
        '120': '30rem',
      },
    },
  },
  plugins: [],
};
