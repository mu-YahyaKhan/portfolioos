import React from 'react';
import { useTheme } from '../../context/ThemeContext';

export default function ThemeToggle({ style }) {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      type="button"
      className="theme-toggle-btn"
      style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-2)', flexShrink: 0, ...style }}
      onClick={toggleTheme}
      aria-label="Toggle dark mode"
      title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {theme === 'dark' ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="4.5" />
          <line x1="12" y1="1.5" x2="12" y2="4" /><line x1="12" y1="20" x2="12" y2="22.5" />
          <line x1="4.2" y1="4.2" x2="5.9" y2="5.9" /><line x1="18.1" y1="18.1" x2="19.8" y2="19.8" />
          <line x1="1.5" y1="12" x2="4" y2="12" /><line x1="20" y1="12" x2="22.5" y2="12" />
          <line x1="4.2" y1="19.8" x2="5.9" y2="18.1" /><line x1="18.1" y1="5.9" x2="19.8" y2="4.2" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.5 14.6c-.3-.2-.7-.2-1 0a7.5 7.5 0 0 1-9.9-9.9c.2-.4.1-.8-.2-1s-.6-.3-1-.1A9.5 9.5 0 1 0 21.6 15.7c.2-.4.1-.8-.1-1.1z" />
        </svg>
      )}
    </button>
  );
}
