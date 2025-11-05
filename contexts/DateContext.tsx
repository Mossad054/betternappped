import React, { createContext, useContext, useState, ReactNode } from 'react';

/**
 * DateContext - Manages selected date for entry logging
 * 
 * This context provides a centralized way to manage the selected date
 * for logging entries. It allows the Calendar component to set a date
 * and the add-entry screen to read it.
 */

interface DateContextType {
  selectedDate: Date | null;
  setSelectedDate: (date: Date | null) => void;
  clearSelectedDate: () => void;
  getFormattedDate: (format?: 'iso' | 'display') => string;
}

const DateContext = createContext<DateContextType | undefined>(undefined);

export function DateProvider({ children }: { children: ReactNode }) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const clearSelectedDate = () => {
    setSelectedDate(null);
  };

  const getFormattedDate = (format: 'iso' | 'display' = 'iso'): string => {
    const date = selectedDate || new Date();
    
    if (format === 'iso') {
      return date.toISOString().split('T')[0]; // YYYY-MM-DD
    }
    
    // Display format: "Monday, November 5, 2025"
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const value: DateContextType = {
    selectedDate,
    setSelectedDate,
    clearSelectedDate,
    getFormattedDate,
  };

  return <DateContext.Provider value={value}>{children}</DateContext.Provider>;
}

export function useDateContext() {
  const context = useContext(DateContext);
  if (context === undefined) {
    throw new Error('useDateContext must be used within a DateProvider');
  }
  return context;
}
