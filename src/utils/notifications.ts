
// Check if browser supports notifications
export const supportsNotifications = (): boolean => {
  return 'Notification' in window;
};

// Request notification permissions
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!supportsNotifications()) {
    return false;
  }
  
  if (Notification.permission === 'granted') {
    return true;
  }
  
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  
  return false;
};

// Send a notification
export const sendNotification = (title: string, options?: NotificationOptions): boolean => {
  if (!supportsNotifications() || Notification.permission !== 'granted') {
    return false;
  }
  
  new Notification(title, options);
  return true;
};

// Schedule vaccination reminders
export const scheduleVaccinationReminders = async (
  animalId: string,
  vaccineType: string,
  doseNumber: number,
  doseDate: string
): Promise<void> => {
  if (!await requestNotificationPermission()) {
    console.log('Notification permission denied');
    return;
  }
  
  const reminderDate = new Date(doseDate);
  reminderDate.setDate(reminderDate.getDate() - 3); // 3 days before
  
  const now = new Date();
  const timeUntilReminder = reminderDate.getTime() - now.getTime();
  
  if (timeUntilReminder > 0) {
    setTimeout(() => {
      sendNotification(`Vaccination Reminder: ${animalId}`, {
        body: `Upcoming ${vaccineType} vaccination (Dose ${doseNumber}) in 3 days`,
        icon: '/favicon.ico'
      });
    }, timeUntilReminder);
  }
};
