
// Format date for display
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Format date for calendar (without time)
export const formatCalendarDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Get future date by adding days
export const addDays = (dateString: string, days: number): string => {
  const date = new Date(dateString);
  date.setDate(date.getDate() + days);
  return date.toISOString();
};

// Check if a date is today
export const isToday = (dateString: string): boolean => {
  const date = new Date(dateString);
  const today = new Date();
  
  return date.getFullYear() === today.getFullYear() &&
         date.getMonth() === today.getMonth() &&
         date.getDate() === today.getDate();
};

// Check if a date is in the coming 3 days (for reminders)
export const isInNextThreeDays = (dateString: string): boolean => {
  const date = new Date(dateString);
  const today = new Date();
  const threeDaysLater = new Date();
  threeDaysLater.setDate(today.getDate() + 3);
  
  return date >= today && date <= threeDaysLater;
};

// Generate dates for a month view calendar
export const getCalendarDates = (year: number, month: number): Date[] => {
  const dates: Date[] = [];
  
  // Get the first day of the month
  const firstDay = new Date(year, month, 1);
  const startingDayOfWeek = firstDay.getDay();
  
  // Get days from previous month to fill in the first week
  const prevMonthLastDate = new Date(year, month, 0).getDate();
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    dates.push(new Date(year, month - 1, prevMonthLastDate - i));
  }
  
  // Get all days in the current month
  const lastDate = new Date(year, month + 1, 0).getDate();
  for (let i = 1; i <= lastDate; i++) {
    dates.push(new Date(year, month, i));
  }
  
  // Get days from next month to fill in the last week
  const lastDay = new Date(year, month, lastDate);
  const remainingDays = 6 - lastDay.getDay();
  for (let i = 1; i <= remainingDays; i++) {
    dates.push(new Date(year, month + 1, i));
  }
  
  return dates;
};

// Get today's date in YYYY-MM-DD format
export const getTodayString = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

// Get current time in HH:MM format
export const getCurrentTime = (): string => {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  
  return `${hours}:${minutes}`;
};

// Combine date and time strings into ISO string
export const combineDateAndTime = (dateString: string, timeString: string): string => {
  const [year, month, day] = dateString.split('-').map(Number);
  const [hours, minutes] = timeString.split(':').map(Number);
  
  return new Date(year, month - 1, day, hours, minutes).toISOString();
};
