import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './src/navigation/AppNavigator';
import { initializeNotifications } from './src/services/notificationService';

export default function App() {
  useEffect(() => {
    initializeNotifications().catch((error) => {
      // Notification initialization may fail in Expo Go - this is expected and non-critical
      console.warn('Notification init failed (this is expected in Expo Go):', error.message);
    });
  }, []);

  return (
    <>
      <AppNavigator />
      <StatusBar style="light" />
    </>
  );
}
