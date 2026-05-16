module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cb: {
          base: 'var(--bg-base)',
          surface: 'var(--bg-surface)',
          elevated: 'var(--bg-elevated)',
          accent: 'var(--accent)',
          accentDim: 'var(--accent-dim)',
          hot: 'var(--accent-hot)',
          teal: 'var(--accent-teal)',
          text: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
          border: 'var(--border)'
        }
      }
    }
  },
  plugins: []
};
