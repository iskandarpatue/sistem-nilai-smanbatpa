import React, { createContext, useContext, useState } from 'react';

const ThemeContext = createContext();

// Menyediakan 4 pilihan warna elegan
export const themes = {
  ocean: { name: 'Ocean Blue', primary: 'blue-500', hover: 'blue-600', ring: 'blue-500/50', border: 'blue-500/30', bg: 'blue-950/20' },
  sunset: { name: 'Sunset Orange', primary: 'orange-500', hover: 'orange-600', ring: 'orange-500/50', border: 'orange-500/30', bg: 'orange-950/20' },
  emerald: { name: 'Emerald Green', primary: 'emerald-500', hover: 'emerald-600', ring: 'emerald-500/50', border: 'emerald-500/30', bg: 'emerald-950/20' },
  amethyst: { name: 'Amethyst Purple', primary: 'purple-500', hover: 'purple-600', ring: 'purple-500/50', border: 'purple-500/30', bg: 'purple-950/20' }
};

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState(themes.ocean);
  return (
    <ThemeContext.Provider value={{ currentTheme, setCurrentTheme, themes }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);