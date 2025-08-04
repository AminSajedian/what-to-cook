import { HapticTab } from "@/components/HapticTab";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { Colors } from "@/constants/Colors";
import { StoreProvider } from "@/contexts/StoreContext";
import { useColorScheme } from "@/hooks/useColorScheme";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function Layout() {
  const colorScheme = useColorScheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StoreProvider>
        <Tabs
          screenOptions={{
            // Remove extra space above header on Android
            headerStatusBarHeight: Platform.OS === "android" ? 0 : undefined,
            tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
            tabBarButton: HapticTab,
            tabBarBackground: TabBarBackground,
            tabBarStyle: Platform.select({
              ios: {
                position: "absolute",
              },
              default: {},
            }),
            headerShown: true,
            headerStyle: {
              backgroundColor: Colors[colorScheme ?? "light"].background,
              borderBottomWidth: 0,
              elevation: 0,
              shadowOpacity: 0,
              minHeight: 60, // Only supported properties
            },
            headerTitleStyle: {
              fontWeight: "bold",
              fontSize: 22,
              letterSpacing: 0.2,
              color: Colors[colorScheme ?? "light"].text,
            },
            headerTitleAlign: "center",
            tabBarIconStyle: {
              marginTop: 3, // Adjust icon position
              marginBottom: 3, // Adjust icon position
            },
            tabBarLabelStyle: {
              fontSize: 12,
              fontWeight: "500",
              letterSpacing: 0.1,
              marginBottom: Platform.OS === "ios" ? -2 : 0, // Adjust label position
            },
          }}
        >
          <Tabs.Screen
            name="index"
            options={{
              title: "Week Plan",
              tabBarIcon: ({ color }) => (
                <MaterialIcons size={28} name="home" color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="food_list"
            options={{
              title: "Food List",
              tabBarIcon: ({ color }) => (
                <MaterialIcons size={28} name="restaurant" color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="settings"
            options={{
              title: "Settings",
              tabBarIcon: ({ color }) => (
                <MaterialIcons size={28} name="settings" color={color} />
              ),
            }}
          />
        </Tabs>
      </StoreProvider>
    </GestureHandlerRootView>
  );
}
