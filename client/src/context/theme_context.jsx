import React, { createContext, useContext, useState, useEffect } from 'react';

// Define all available themes
export const THEMES = [
  { id: 'light', name: 'Light Mode (Clean)' },
  { id: 'forest-green', name: 'Forest Green & Mint' },
  { id: 'navy-blue', name: 'Navy Blue & Sky Blue' },
  { id: 'burgundy', name: 'Burgundy & Soft Pink' },
  { id: 'charcoal', name: 'Charcoal & Mustard' },
  { id: 'purple', name: 'Purple & Lavender' },
  { id: 'darcula', name: 'Darcula (JetBrains)' }
];

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  // Initialize with Light Mode as default, check localStorage for saved preference
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('dashboard-theme');
    return savedTheme || 'light';
  });

  // Update document attribute and localStorage when theme changes
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('dashboard-theme', theme);
  }, [theme]);

  const value = {
    theme,
    setTheme,
    themes: THEMES
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

// Custom hook to use the theme context
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
