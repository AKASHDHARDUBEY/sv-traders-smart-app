import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';

// Light theme keeps your current colors (white background)
const lightTheme = {
  mode: 'light',
  background: '#f5f5f5',
  card: '#ffffff',
  textPrimary: '#2c3e50',
  textSecondary: '#7f8c8d',
  accent: '#3498db',
  border: '#dddddd',
  success: '#27ae60',
  danger: '#e74c3c',
};

// Dark theme: dark blue background, sky blue text
const darkTheme = {
  mode: 'dark',
  background: '#030621',
  card: '#070d2e',
  textPrimary: '#8fd7ff',   // sky blue
  textSecondary: '#6bb8ff',
  accent: '#4da8ff',
  border: '#1f3558',
  success: '#20dfc0',
  danger: '#ff6b81',
};

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [mode, setMode] = useState('light');

  const theme = useMemo(() => (mode === 'dark' ? darkTheme : lightTheme), [mode]);

  const toggleTheme = useCallback(() => {
    setMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  const value = useMemo(
    () => ({ mode, theme, toggleTheme }),
    [mode, theme, toggleTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useThemeMode = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useThemeMode must be used within a ThemeProvider');
  }
  return ctx;
};


