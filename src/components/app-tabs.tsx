import { Tabs } from 'expo-router';
import { Colors } from '@/constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';

export default function AppTabs() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#0D9488', // Turkuaz aktif renk
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.backgroundElement, // Beyaz
          borderTopColor: colors.backgroundSelected, // Açık gri/turkuaz
          borderTopWidth: 1.5,
          height: 64,
          paddingBottom: 10,
          paddingTop: 6,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Çevirici',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="calculator-variant-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="planner"
        options={{
          title: 'Planlayıcı',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="calendar-clock-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="expenses"
        options={{
          title: 'Defter',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="notebook-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="phrases"
        options={{
          title: 'Cümleler',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="chat-processing-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Ayarlar',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="cog-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
