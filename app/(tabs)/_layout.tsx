import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { StoreProvider } from '@/contexts/StoreContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function Layout() {
  const colorScheme = useColorScheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StoreProvider>
        <Tabs
          screenOptions={{
            tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
            headerShown: false,
            tabBarButton: HapticTab,
            tabBarBackground: TabBarBackground,
            tabBarStyle: Platform.select({
              ios: {
                // Use a transparent background on iOS to show the blur effect
                position: 'absolute',
              },
              default: {},
            }),
          }}
        >
          {/* Updated icon names to match MaterialIcons */}
          <Tabs.Screen
            name="index"
            options={{
              title: 'Week Plan',
              tabBarIcon: ({ color }) => (
                <MaterialIcons size={28} name="home" color={color} /> // 'house.fill' -> 'home'
              ),
            }}
          />
          <Tabs.Screen
            name="food_list"
            options={{
              title: 'Food List',
              tabBarIcon: ({ color }) => (
                <MaterialIcons size={28} name="restaurant" color={color} /> // 'paperplane.fill' -> 'restaurant'
              ),
            }}
          />
          <Tabs.Screen
            name="settings"
            options={{
              title: 'Settings',
              tabBarIcon: ({ color }) => (
                <MaterialIcons size={28} name="settings" color={color} /> // 'gearshape.fill' -> 'settings'
              ),
            }}
          />
        </Tabs>
      </StoreProvider>
    </GestureHandlerRootView>
  );
}
