/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // 暗色主题色彩体系（来自模块八8.6）
        surface: {
          base: '#0F1117',
          elevated: '#161822',
          overlay: '#1C1F2E',
          field: '#232738',
        },
        text: {
          primary: '#E8ECF1',
          secondary: '#9BA3B5',
          muted: '#5C6478',
          disabled: '#3D4455',
        },
        accent: {
          gold: '#D4A853',
          'gold-light': '#E8C97A',
          'gold-dark': '#B8913A',
          crimson: '#C0392B',
          'crimson-light': '#E74C3C',
          azure: '#3498DB',
          'azure-light': '#5DADE2',
          emerald: '#27AE60',
          'emerald-light': '#2ECC71',
          amethyst: '#8E44AD',
          'amethyst-light': '#A569BD',
        },
        rarity: {
          white: '#B0B0B0',
          green: '#2ECC71',
          blue: '#3498DB',
          purple: '#8E44AD',
          orange: '#E67E22',
          red: '#E74C3C',
          gold: '#D4A853',
        },
        battle: {
          hp: '#E74C3C',
          'hp-bg': '#3D1A1A',
          mp: '#3498DB',
          'mp-bg': '#1A2A3D',
          exp: '#F1C40F',
          shield: '#27AE60',
        },
      },
      fontFamily: {
        game: ['"Noto Serif SC"', '"Source Han Serif SC"', 'serif'],
        ui: ['"Noto Sans SC"', '"Source Han Sans SC"', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
      },
      fontSize: {
        'hud-xs': ['10px', { lineHeight: '14px' }],
        'hud-sm': ['12px', { lineHeight: '16px' }],
        'hud-base': ['14px', { lineHeight: '20px' }],
        'hud-lg': ['16px', { lineHeight: '24px' }],
        'hud-xl': ['20px', { lineHeight: '28px' }],
        'hud-2xl': ['24px', { lineHeight: '32px' }],
      },
      spacing: {
        'hud-1': '4px',
        'hud-2': '8px',
        'hud-3': '12px',
        'hud-4': '16px',
        'hud-5': '20px',
        'hud-6': '24px',
        'hud-8': '32px',
        'hud-10': '40px',
      },
      borderRadius: {
        'hud': '6px',
        'hud-lg': '10px',
        'hud-full': '9999px',
      },
      boxShadow: {
        'hud': '0 2px 8px rgba(0, 0, 0, 0.4)',
        'hud-lg': '0 4px 16px rgba(0, 0, 0, 0.5)',
        'hud-gold': '0 0 12px rgba(212, 168, 83, 0.3)',
        'hud-crimson': '0 0 12px rgba(192, 57, 43, 0.3)',
      },
      animation: {
        'hp-pulse': 'hpPulse 0.6s ease-out',
        'damage-float': 'damageFloat 1.2s ease-out forwards',
        'combo-pop': 'comboPop 0.3s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
      },
      keyframes: {
        hpPulse: {
          '0%': { transform: 'scale(1)', filter: 'brightness(1)' },
          '50%': { transform: 'scale(1.05)', filter: 'brightness(1.4)' },
          '100%': { transform: 'scale(1)', filter: 'brightness(1)' },
        },
        damageFloat: {
          '0%': { opacity: '1', transform: 'translateY(0)' },
          '100%': { opacity: '0', transform: 'translateY(-40px)' },
        },
        comboPop: {
          '0%': { transform: 'scale(0.5)', opacity: '0' },
          '50%': { transform: 'scale(1.3)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 8px rgba(212, 168, 83, 0.2)' },
          '50%': { boxShadow: '0 0 20px rgba(212, 168, 83, 0.5)' },
        },
      },
    },
  },
  plugins: [],
}