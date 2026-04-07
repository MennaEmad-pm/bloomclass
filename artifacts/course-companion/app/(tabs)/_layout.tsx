import { BlurView } from 'expo-blur';
import { Tabs } from 'expo-router';
import { Home, FileText, User } from 'lucide-react-native';
import React from 'react';
import { Platform, StyleSheet, View, useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColors } from '@/hooks/useColors';

export default function TabLayout() {
  const colors = useColors();
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const isDark = colorScheme === 'dark';
  const isIOS = Platform.OS === 'ios';

  const TAB_HEIGHT = 56;
  const tabBarHeight = TAB_HEIGHT + insets.bottom;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        headerShown: false,
        tabBarStyle: isIOS
          ? {
              position: 'absolute',
              backgroundColor: 'transparent',
              borderTopWidth: 1,
              borderTopColor: colors.border,
              elevation: 0,
              height: tabBarHeight,
            }
          : {
              backgroundColor: colors.background,
              borderTopWidth: 1,
              borderTopColor: colors.border,
              elevation: 0,
              height: tabBarHeight,
            },
        tabBarItemStyle: {
          height: TAB_HEIGHT,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          marginBottom: 4,
        },
        tabBarBackground: () =>
          isIOS ? (
            <BlurView
              intensity={100}
              tint={isDark ? 'dark' : 'light'}
              style={StyleSheet.absoluteFill}
            />
          ) : (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.background }]} />
          ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Home size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="assignments"
        options={{
          title: 'Assignments',
          tabBarIcon: ({ color }) => <FileText size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <User size={22} color={color} />,
        }}
      />
    </Tabs>
  );
}
