import { createContext, useContext, useState, useEffect } from 'react';

// Define available themes
export const THEMES = [
  {
    id: 'lighture',
    name: 'Lighture - Bright Blue',
    description: 'Clean, professional light theme with blue accents',
  },
  {
    id: 'darkwood',
    name: 'Darkwood - Cyber Night',
    description: 'Dark theme with deep blues and purples',
  },
  {
    id: 'dracula',
    name: 'Dracula - High Contrast',
    description: 'High-contrast, saturated syntax highlighting theme',
  },
  {
    id: 'monokai-pro',
    name: 'Monokai Pro - Professional',
    description: 'Muted, professional dark palette',
  },
  {
    id: 'standard-dark',
    name: 'Dark Mode - Standard',
    description: 'Standard dark mode for Android, iOS, macOS, and Chrome',
  },
  {
    id: 'sunset',
    name: 'Sunset - Warm Orange',
    description: 'Warm theme with orange and pink accents',
  },
  {
    id: 'crimson',
    name: 'Crimson - Power Red',
    description: 'Bright red theme with powerful accents',
  },
  {
    id: 'nimbus',
    name: 'Nimbus - Cloudy Gray',
    description: 'Soft, cloudy gray theme for calm feel',
  },
  {
    id: 'amber',
    name: 'Amber - Golden Yellow',
    description: 'Warm yellow theme with golden accents',
  },
  {
    id: 'blush',
    name: 'Blush - Soft Pink',
    description: 'Gentle pink theme with soft accents',
  },
];

const ThemeContext = createContext();

const STORAGE_KEY = 'akovolabs-theme';

export const ThemeProvider = ({ children }) => {
  // Initialize theme from localStorage or default to first theme
  const [currentTheme, setCurrentTheme] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && THEMES.find((t) => t.id === saved)) {
      return saved;
    }
    return THEMES[0].id;
  });

  // Persist theme to localStorage when it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, currentTheme);
    // Apply theme class to document root
    document.documentElement.setAttribute('data-theme', currentTheme);
  }, [currentTheme]);

  // Cycle to next theme
  const cycleTheme = () => {
    const currentIndex = THEMES.findIndex((t) => t.id === currentTheme);
    const nextIndex = (currentIndex + 1) % THEMES.length;
    setCurrentTheme(THEMES[nextIndex].id);
  };

  // Set a specific theme by id
  const setTheme = (themeId) => {
    if (THEMES.find((t) => t.id === themeId)) {
      setCurrentTheme(themeId);
    }
  };

  // Get current theme data
  const getCurrentThemeData = () => THEMES.find((t) => t.id === currentTheme);

  const value = {
    currentTheme,
    themes: THEMES,
    cycleTheme,
    setTheme,
    getCurrentThemeData,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
