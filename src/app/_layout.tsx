import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { initDB } from '../db/schema';
import { useTaskStore } from '../store/useTaskStore';

export default function RootLayout() {
  useEffect(() => {
    try {
      initDB();
      useTaskStore.getState().loadTasks();
    } catch (e) {
      console.error('DB init failed', e);
    }
  }, []);

  return (
    <>
      <StatusBar style="auto" />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}
