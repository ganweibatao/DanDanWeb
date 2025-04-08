import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';

// Define the type for the theme options
type Theme = 'light' | 'dark' | 'system';

// Define the type for the context value
interface ThemeContextProps {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

// Create the context with a default value (can be undefined or a default object)
const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

// Define the props for the provider
interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

export const ThemeProvider = ({ 
  children, 
  defaultTheme = 'system', 
  storageKey = 'theme',
}: ThemeProviderProps) => {
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      const storedTheme = localStorage.getItem(storageKey);
      return (storedTheme as Theme) || defaultTheme;
    } catch (e) {
      console.error("Failed to read theme from localStorage", e);
      return defaultTheme;
    }
  });

  useEffect(() => {
    const root = window.document.documentElement;

    const applyTheme = (themeToApply: 'light' | 'dark') => {
      root.classList.remove('light', 'dark');
      root.classList.add(themeToApply);
    };

    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
       // Only apply if the context theme is 'system'
       if (localStorage.getItem(storageKey) === 'system') { 
         applyTheme(e.matches ? 'dark' : 'light');
       }
    };

    const systemThemeMatcher = window.matchMedia('(prefers-color-scheme: dark)');

    // Remove previous listener before applying new effect
    systemThemeMatcher.removeEventListener('change', handleSystemThemeChange);

    if (theme === 'system') {
      // Apply current system theme
      applyTheme(systemThemeMatcher.matches ? 'dark' : 'light');
      // Save preference
      localStorage.setItem(storageKey, 'system');
      // Listen for changes
      systemThemeMatcher.addEventListener('change', handleSystemThemeChange);
    } else {
      applyTheme(theme);
      localStorage.setItem(storageKey, theme);
    }

    // Cleanup listener on component unmount
    return () => {
      systemThemeMatcher.removeEventListener('change', handleSystemThemeChange);
    };
  }, [theme, storageKey]); // Depend on theme and storageKey

  const value = {
    theme,
    setTheme: (newTheme: Theme) => {
      setTheme(newTheme);
    },
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use the theme context
export const useTheme = (): ThemeContextProps => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}; 