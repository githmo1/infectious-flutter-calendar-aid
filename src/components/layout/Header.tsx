
import React, { useState } from 'react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  activeTab, 
  setActiveTab, 
  isDarkMode, 
  toggleTheme 
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const tabs = [
    { id: 'vaccination', label: 'Vaccination Calendar' },
    { id: 'tests', label: 'Tests Helper' },
    { id: 'drugs', label: 'Drug Calculator' },
    { id: 'credits', label: 'Credits & Settings' }
  ];
  
  return (
    <header className="bg-white dark:bg-gray-800 shadow-md py-4 px-6 md:px-10 flex flex-col md:flex-row items-center justify-between">
      <div className="flex items-center mb-4 md:mb-0">
        {/* Animated Butterfly Logo */}
        <div className="relative w-12 h-12 mr-4">
          <div className="text-5xl animate-float">🦋</div>
        </div>
        <h1 className="text-2xl font-bold text-butterfly dark:text-butterfly">
          Infectious Butterfly
        </h1>
      </div>
      
      {/* Mobile menu button */}
      <div className="md:hidden w-full flex justify-end">
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="p-2 text-gray-600 dark:text-gray-300"
        >
          {isMenuOpen ? (
            <span className="text-xl">✕</span>
          ) : (
            <span className="text-xl">☰</span>
          )}
        </button>
      </div>
      
      {/* Navigation - desktop */}
      <nav className={`hidden md:flex items-center space-x-6`}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`py-2 transition-colors ${
              activeTab === tab.id
                ? 'tab-active'
                : 'text-gray-600 dark:text-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
        
        {/* Theme toggle */}
        <button 
          onClick={toggleTheme}
          className="p-2 text-gray-600 dark:text-gray-300 hover:text-butterfly dark:hover:text-butterfly"
        >
          {isDarkMode ? '☀️' : '🌙'}
        </button>
      </nav>
      
      {/* Mobile Navigation */}
      {isMenuOpen && (
        <nav className="md:hidden w-full mt-4 flex flex-col space-y-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setIsMenuOpen(false);
              }}
              className={`py-2 px-4 w-full text-left transition-colors ${
                activeTab === tab.id
                  ? 'bg-butterfly/10 text-butterfly'
                  : 'text-gray-600 dark:text-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
          
          {/* Theme toggle */}
          <button 
            onClick={toggleTheme}
            className="py-2 px-4 w-full text-left text-gray-600 dark:text-gray-300 flex items-center"
          >
            <span>{isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}</span>
          </button>
        </nav>
      )}
    </header>
  );
};

export default Header;
