import { Tabs } from 'expo-router';
import { Image } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const activeTint = colorScheme === 'dark' ? '#93C5FD' : '#2563EB';
  const inactiveTint = colorScheme === 'dark' ? '#94A3B8' : '#64748B';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: activeTint,
        tabBarInactiveTintColor: inactiveTint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          // Applying glassmorphism-like effect with rgba background and adjusted border
          backgroundColor: colorScheme === 'dark' ? 'rgba(7, 17, 31, 0.9)' : 'rgba(255, 255, 255, 0.9)',
          borderTopColor: colorScheme === 'dark' ? 'rgba(148, 163, 184, 0.25)' : 'rgba(15, 23, 42, 0.18)',
          height: 80, // Increased height to accommodate vertical centering and padding
          paddingTop: 8, // Added padding to push content down slightly for vertical centering
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <Image
              source={require('../../assets/Icons/Home.png')}
              style={{ width: 24, height: 24, tintColor: color }}
              resizeMode="contain"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="bible"
        options={{
          title: 'Bible',
          tabBarIcon: ({ color }) => (
            <Image
              source={require('../../assets/Icons/Bible.png')}
              style={{ width: 24, height: 24, tintColor: color }}
              resizeMode="contain"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="characters"
        options={{
          title: 'Characters',
          tabBarIcon: ({ color }) => (
            <Image
              source={require('../../assets/Icons/Companions.png')}
              style={{ width: 24, height: 24, tintColor: color }}
              resizeMode="contain"
            />
          ),
        }}
      />
    </Tabs>
  );
}
