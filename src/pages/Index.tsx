
import React, { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import VaccinationCalendar from '@/components/VaccinationCalendar';
import TestsHelper from '@/components/TestsHelper';
import DrugCalculator from '@/components/DrugCalculator';
import Credits from '@/components/Credits';
import { initializeDemoData } from '@/utils/storage';
import { requestNotificationPermission } from '@/utils/notifications';

const Index = () => {
  const [activeTab, setActiveTab] = useState('vaccination');
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Initialize dark mode from local storage
  useEffect(() => {
    const storedTheme = localStorage.getItem('infectious_butterfly_theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    const shouldUseDarkMode = storedTheme === 'dark' || (!storedTheme && prefersDark);
    setIsDarkMode(shouldUseDarkMode);
    
    if (shouldUseDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Initialize demo data
    initializeDemoData();
    
    // Request notification permission
    requestNotificationPermission();
  }, []);
  
  // Toggle dark mode
  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('infectious_butterfly_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('infectious_butterfly_theme', 'light');
    }
  };
  
  // Render active tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'vaccination':
        return <VaccinationCalendar />;
      case 'tests':
        return <TestsHelper />;
      case 'drugs':
        return <DrugCalculator />;
      case 'credits':
        return <Credits isDarkMode={isDarkMode} toggleTheme={toggleTheme} />;
      default:
        return <VaccinationCalendar />;
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <Header 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
      />
      <main className="px-4 py-8 md:px-8">
        {renderTabContent()}
      </main>
    </div>
  );
};

export default Index;
