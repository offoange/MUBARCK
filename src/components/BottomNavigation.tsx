import React from 'react';
import {View, TouchableOpacity, Text, StyleSheet} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

interface NavItemProps {
  icon: string;
  label: string;
  isActive?: boolean;
  onPress?: () => void;
}

function NavItem({icon, label, isActive = false, onPress}: NavItemProps) {
  return (
    <TouchableOpacity style={styles.navItem} onPress={onPress}>
      <MaterialIcons
        name={icon}
        size={26}
        color={isActive ? '#6c2bee' : '#94a3b8'}
      />
      <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

interface BottomNavigationProps {
  activeTab?: string;
  onTabPress?: (tab: string) => void;
  onAddPress?: () => void;
}

export default function BottomNavigation({
  activeTab = 'home',
  onTabPress,
  onAddPress,
}: BottomNavigationProps) {
  return (
    <View style={styles.container}>
      <NavItem
        icon="dashboard"
        label="Accueil"
        isActive={activeTab === 'home'}
        onPress={() => onTabPress?.('home')}
      />
      <NavItem
        icon="event-note"
        label="Planning"
        isActive={activeTab === 'schedule'}
        onPress={() => onTabPress?.('schedule')}
      />
      <View style={styles.fabContainer}>
        <TouchableOpacity style={styles.fab} onPress={onAddPress}>
          <MaterialIcons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      </View>
      <NavItem
        icon="notifications"
        label="Rappels"
        isActive={activeTab === 'reminders'}
        onPress={() => onTabPress?.('reminders')}
      />
      <NavItem
        icon="person"
        label="Profil"
        isActive={activeTab === 'profile'}
        onPress={() => onTabPress?.('profile')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(19, 17, 24, 0.9)',
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  navItem: {
    alignItems: 'center',
    gap: 4,
    width: 64,
  },
  navLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: '#94a3b8',
  },
  navLabelActive: {
    color: '#6c2bee',
  },
  fabContainer: {
    marginTop: -30,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6c2bee',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6c2bee',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
});
