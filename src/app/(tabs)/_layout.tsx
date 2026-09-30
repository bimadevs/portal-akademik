import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { colors, radius, shadows } from '@/theme';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarItemStyle: styles.tabBarItem,
      }}
    >
      {/* Tab 1: Home (Ikon Rumah) */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Beranda',
          tabBarAccessibilityLabel: 'Tab Home Menu Utama',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
              <Ionicons
                name={focused ? 'home' : 'home-outline'}
                size={22}
                color={focused ? colors.primary : color}
              />
            </View>
          ),
        }}
      />

      {/* Tab 2: Data Mahasiswa (Ikon Topi Toga) */}
      <Tabs.Screen
        name="mahasiswa"
        options={{
          title: 'Input Data',
          tabBarAccessibilityLabel: 'Tab Form Input Data Mahasiswa',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
              <Ionicons
                name={focused ? 'school' : 'school-outline'}
                size={22}
                color={focused ? colors.primary : color}
              />
            </View>
          ),
        }}
      />

      {/* Tab 3: Report (Ikon Dokumen Berkas) */}
      <Tabs.Screen
        name="report"
        options={{
          title: 'Rekap Data',
          tabBarAccessibilityLabel: 'Tab Display & Report Data Mahasiswa',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
              <Ionicons
                name={focused ? 'document-text' : 'document-text-outline'}
                size={22}
                color={focused ? colors.primary : color}
              />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: 'rgba(226, 232, 240, 0.8)',
    height: Platform.OS === 'ios' ? 86 : 68,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 24 : 10,
    boxShadow: shadows.floatingBar,
  },
  tabBarItem: {
    paddingVertical: 2,
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 30,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainerActive: {
    backgroundColor: '#EFF6FF',
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
    letterSpacing: 0.2,
  },
});

