"use client";

import React, { createContext, useState, useEffect, useContext } from 'react';
import ClientOnly from '@/components/ClientOnly';

type Theme = 'light' | 'dark';
type ThemeContextType = {
  theme: Theme;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Separate component to handle client-side theme logic
function ThemeLogic({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  const [theme, setTheme] = useState<Theme>('light');
  
  // Initialize theme using browser APIs
  useEffect(() => {
    const storedTheme = localStorage.getItem('theme') as Theme;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (storedTheme) {
      setTheme(storedTheme);
      document.documentElement.classList.toggle('dark', storedTheme === 'dark');
    } else if (prefersDark) {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    }
  }, []);
  
  const toggleTheme = () => {
    setTheme(prev => {
      const newTheme = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', newTheme);
      document.documentElement.classList.toggle('dark', newTheme === 'dark');
      return newTheme;
    });
  };
  
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Main provider that ensures client-side only execution
export function ThemeProvider({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  
  return (
    <ClientOnly>
      <ThemeLogic>{children}</ThemeLogic>
    </ClientOnly>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
