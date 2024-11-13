import { useState, useEffect } from 'react';
import { FaSun, FaMoon } from 'react-icons/fa';

interface ThemeModeSwitchProps {
  className?: string;
}

const ThemeModeSwitch = ({ className = '' }: ThemeModeSwitchProps) => {
  const [mode, setMode] = useState(localStorage.getItem('theme') || 'light');

  const toggleTheme = () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    localStorage.setItem('theme', newMode);
  };

  useEffect(() => {
    if (mode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [mode]);

  return (
    <button
      onClick={toggleTheme}
      className={`relative w-14 h-7 rounded-full ${mode === 'dark' ? 'bg-sky-900' : 'bg-sky-200'} transition-colors focus:outline-none ${className}`}
      aria-label="Toggle theme"
    >
      
      <div className={`absolute inset-0 overflow-hidden rounded-full ${mode === 'dark' ? 'bg-sky-900' : 'bg-sky-200'}`}>
        {mode === 'dark' ? (
          <>
            <div className="absolute top-1 right-2 w-1 h-1 bg-white rounded-full"></div>
            <div className="absolute bottom-2 left-3 w-1 h-1 bg-white rounded-full"></div>
            <div className="absolute top-3 left-4 w-0.5 h-0.5 bg-white rounded-full"></div>
          </>
        ) : (
          <>
            <div className="absolute top-1 left-2 w-2 h-1 bg-white rounded-full"></div>
            <div className="absolute bottom-1 right-3 w-3 h-1 bg-white rounded-full"></div>
          </>
        )}
      </div>
      <div className={`absolute top-1 left-1 w-5 h-5 rounded-full transition-transform duration-200 transform ${mode === 'dark' ? 'translate-x-7 bg-gray-900' : 'translate-x-0 bg-white'} flex items-center justify-center`}>
        {mode === 'dark' ? (
          <FaMoon className="w-3 h-3 text-yellow-200" />
        ) : (
          <FaSun className="w-3 h-3 text-orange-400" />
        )}
      </div>
    </button>
  );
};

export default ThemeModeSwitch;
