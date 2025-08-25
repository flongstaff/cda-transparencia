/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e6f0fa',
          100: '#cce0f5',
          200: '#99c2eb',
          300: '#66a3e0',
          400: '#3385d6',
          500: '#0056b3', // Primary
          600: '#004590',
          700: '#00346c',
          800: '#002249',
          900: '#001125',
        },
        secondary: {
          50: '#e5f4e9',
          100: '#cbebd3',
          200: '#97d6a8',
          300: '#64c27c',
          400: '#40b45f',
          500: '#28a745', // Secondary
          600: '#208537',
          700: '#186429',
          800: '#10431c',
          900: '#08210e',
        },
        accent: {
          50: '#fff8e6',
          100: '#fef2cc',
          200: '#fde599',
          300: '#fcd766',
          400: '#fbca33',
          500: '#ffc107', // Accent
          600: '#cc9a06',
          700: '#997304',
          800: '#664d03',
          900: '#332601',
        },
        success: {
          50: '#e4f7f3',
          100: '#c9efe7',
          200: '#94dfd0',
          300: '#5ecfb8',
          400: '#39c4a9',
          500: '#20c997', // Success
          600: '#1aa179',
          700: '#13785a',
          800: '#0d503c',
          900: '#06281e',
        },
        warning: {
          50: '#fff4e6',
          100: '#ffe9cc',
          200: '#ffd399',
          300: '#ffbd66',
          400: '#ffa733',
          500: '#fd7e14', // Warning
          600: '#ca6510',
          700: '#984c0c',
          800: '#653208',
          900: '#331904',
        },
        error: {
          50: '#faeaec',
          100: '#f5d5d9',
          200: '#ebacb3',
          300: '#e1828d',
          400: '#d65967',
          500: '#dc3545', // Error
          600: '#b02a37',
          700: '#842029',
          800: '#58151c',
          900: '#2c0b0e',
        },
        gray: {
          50: '#f8f9fa',
          100: '#f1f3f5',
          200: '#e9ecef',
          300: '#dee2e6',
          400: '#ced4da',
          500: '#adb5bd',
          600: '#6c757d',
          700: '#495057',
          800: '#343a40',
          900: '#212529',
        },
      },
      fontFamily: {
        heading: ['Montserrat', 'sans-serif'],
        body: ['Open Sans', 'sans-serif'],
        mono: ['Roboto Mono', 'monospace'],
      },
      spacing: {
        '72': '18rem',
        '84': '21rem',
        '96': '24rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-in-out',
        'slide-down': 'slideDown 0.5s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};