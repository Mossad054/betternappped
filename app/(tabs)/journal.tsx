import { router } from 'expo-router';
import { useEffect } from 'react';

export default function JournalScreen() {
  useEffect(() => {
    // Immediately redirect to add-entry when this tab is pressed
    router.push('/add-entry');
  }, []);
  
  // This screen won't actually be visible since we redirect immediately
  return null;
}