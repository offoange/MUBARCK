import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Image,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import ProfileStatCard from '../components/ProfileStatCard';
import GoalSlider from '../components/GoalSlider';
import SettingsItem from '../components/SettingsItem';
import BottomNavigation from '../components/BottomNavigation';
import LocalStorageService, {UserProfile, Goal} from '../services/LocalStorageService';

const COLORS = {
  primary: '#6c2bee',
  background: '#161022',
  card: '#1d172a',
  orange: '#f97316',
  emerald: '#34d399',
  pink: '#ec4899',
  sky: '#38bdf8',
  textPrimary: '#ffffff',
  textSecondary: '#94a3b8',
  danger: '#ef4444',
};

interface ProfileScreenProps {
  activeTab?: string;
  onTabPress?: (tab: string) => void;
  onLogout?: () => void;
}

export default function ProfileScreen({
  activeTab = 'profile',
  onTabPress,
  onLogout,
}: ProfileScreenProps) {
  const [morningMotivation, setMorningMotivation] = useState(true);
  const [hydrationNudges, setHydrationNudges] = useState(true);
  const [focusModeAlerts, setFocusModeAlerts] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: '',
    email: '',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDv1T6_MgXb2h74tuQcPVMvbw8S4R4pc8Z3-CfWR5oci3d8PSI1QKZ33IPQzRJ1qQjUgGPSmaTTP-oIP1iKm_WGUOu38P3H75umAWRzAXa3NkZkqKRMeonVId2OvWSlMgBSBCreAds8CmeG5LfaCyJLo10LTJrW0BtJgfkrAHBCMW8S24zfS-wum183e4jgZYcZF4dhfi7F9aeHyWwOEK2A1fBqaYMxMs7GPJsNxQ4hCBVzTdFQWrKN0bNe9Tth2LOvB4uhxJp5zAQ',
    level: 'LEVEL 1 DÉBUTANT',
    dayStreak: 0,
    wellnessScore: 0,
  });
  const [goals, setGoals] = useState<Goal[]>([
    {
      id: '1',
      icon: 'menu-book',
      iconColor: COLORS.primary,
      title: 'Daily Study Target',
      subtitle: 'Hours per day',
      progress: 50,
      displayValue: '4h',
    },
    {
      id: '2',
      icon: 'bedtime',
      iconColor: COLORS.sky,
      title: 'Sleep Goal',
      subtitle: 'Target duration',
      progress: 100,
      displayValue: '8h 00m',
    },
  ]);

  // Charger les données du profil et des paramètres depuis le stockage au démarrage
  useEffect(() => {
    const loadProfileData = async () => {
      try {
        // Charger le profil utilisateur
        const savedProfile = await LocalStorageService.getUserProfile();
        if (savedProfile) {
          setUserProfile(savedProfile);
        } else {
          // Si aucun profil n'est sauvegardé, sauvegarder le profil initial
          await LocalStorageService.saveUserProfile(userProfile);
        }

        // Charger les paramètres
        const savedSettings = await LocalStorageService.getSettings();
        if (savedSettings) {
          setMorningMotivation(savedSettings.morningMotivation);
          setHydrationNudges(savedSettings.hydrationNudges);
          setFocusModeAlerts(savedSettings.focusModeAlerts);
        } else {
          // Si aucun paramètre n'est sauvegardé, sauvegarder les paramètres initiaux
          await LocalStorageService.saveSettings({
            morningMotivation,
            hydrationNudges,
            focusModeAlerts,
            theme: 'dark',
          });
        }

        // Charger les objectifs
        const savedGoals = await LocalStorageService.getGoals();
        if (savedGoals && savedGoals.length > 0) {
          setGoals(savedGoals);
        } else {
          // Si aucun objectif n'est sauvegardé, sauvegarder les objectifs initiaux
          await LocalStorageService.saveGoals(goals);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données du profil:', error);
        Alert.alert('Erreur', 'Impossible de charger vos données de profil.');
      }
    };

    loadProfileData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity>
          <Text style={styles.saveButton}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Profile Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            <Image
              source={{
                uri: userProfile.avatar || 'https://lh3.googleusercontent.com/aida-public/AB6AXuDv1T6_MgXb2h74tuQcPVMvbw8S4R4pc8Z3-CfWR5oci3d8PSI1QKZ33IPQzRJ1qQjUgGPSmaTTP-oIP1iKm_WGUOu38P3H75umAWRzAXa3NkZkqKRMeonVId2OvWSlMgBSBCreAds8CmeG5LfaCyJLo10LTJrW0BtJgfkrAHBCMW8S24zfS-wum183e4jgZYcZF4dhfi7F9aeHyWwOEK2A1fBqaYMxMs7GPJsNxQ4hCBVzTdFQWrKN0bNe9Tth2LOvB4uhxJp5zAQ',
              }}
              style={styles.avatar}
            />
            <TouchableOpacity style={styles.editBadge}>
              <MaterialIcons name="edit" size={14} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>{userProfile.name}</Text>
          <Text style={styles.userEmail}>{userProfile.email}</Text>
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>{userProfile.level}</Text>
          </View>
        </View>

        {/* Edit Personal Details Button */}
        <TouchableOpacity style={styles.editButton}>
          <Text style={styles.editButtonText}>Edit Personal Details</Text>
        </TouchableOpacity>

        {/* Stats Cards */}
        <View style={styles.statsRow}>
          <ProfileStatCard
            icon="local-fire-department"
            iconColor={COLORS.orange}
            value={userProfile.dayStreak?.toString() || '0'}
            label="Day Streak"
          />
          <ProfileStatCard
            icon="favorite"
            iconColor={COLORS.emerald}
            value={`${userProfile.wellnessScore || 0}%`}
            label="Wellness Score"
          />
        </View>

        {/* My Goals Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Goals</Text>
          <View style={styles.goalsContainer}>
            {goals.map(goal => (
              <GoalSlider
                key={goal.id}
                icon={goal.icon}
                iconColor={goal.iconColor}
                title={goal.title}
                subtitle={goal.subtitle}
                progress={goal.progress}
                displayValue={goal.displayValue}
                hasDropdown={goal.id === '2'}
              />
            ))}
          </View>
        </View>

        {/* Notification Settings */}
        <View style={styles.section}>
          <View style={styles.notificationTabs}>
            <TouchableOpacity style={styles.notifTab}>
              <MaterialIcons name="home" size={20} color={COLORS.textSecondary} />
              <Text style={styles.notifTabText}>Home</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.notifTab}>
              <MaterialIcons name="calendar-today" size={20} color={COLORS.textSecondary} />
              <Text style={styles.notifTabText}>Calendar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.notifTab}>
              <MaterialIcons name="spa" size={20} color={COLORS.textSecondary} />
              <Text style={styles.notifTabText}>Wellness</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.notifTab, styles.notifTabActive]}>
              <MaterialIcons name="person" size={20} color={COLORS.primary} />
              <Text style={[styles.notifTabText, styles.notifTabTextActive]}>Profile</Text>
            </TouchableOpacity>
          </View>
          <SettingsItem
            icon="wb-sunny"
            iconColor={COLORS.orange}
            title="Morning Motivation"
            hasSwitch
            switchValue={morningMotivation}
            onSwitchChange={async (value) => {
              setMorningMotivation(value);
              try {
                await LocalStorageService.saveSettings({
                  morningMotivation: value,
                  hydrationNudges,
                  focusModeAlerts,
                  theme: 'dark',
                });
              } catch (error) {
                console.error('Erreur lors de la sauvegarde des paramètres:', error);
              }
            }}
          />
          <SettingsItem
            icon="water-drop"
            iconColor={COLORS.sky}
            title="Hydration Nudges"
            hasSwitch
            switchValue={hydrationNudges}
            onSwitchChange={async (value) => {
              setHydrationNudges(value);
              try {
                await LocalStorageService.saveSettings({
                  morningMotivation,
                  hydrationNudges: value,
                  focusModeAlerts,
                  theme: 'dark',
                });
              } catch (error) {
                console.error('Erreur lors de la sauvegarde des paramètres:', error);
              }
            }}
          />
          <SettingsItem
            icon="notifications-active"
            iconColor={COLORS.primary}
            title="Focus Mode Alerts"
            hasSwitch
            switchValue={focusModeAlerts}
            onSwitchChange={async (value) => {
              setFocusModeAlerts(value);
              try {
                await LocalStorageService.saveSettings({
                  morningMotivation,
                  hydrationNudges,
                  focusModeAlerts: value,
                  theme: 'dark',
                });
              } catch (error) {
                console.error('Erreur lors de la sauvegarde des paramètres:', error);
              }
            }}
          />
        </View>

        {/* App Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Settings</Text>
          <SettingsItem
            icon="lock"
            iconColor={COLORS.primary}
            title="Account Security"
            showArrow
          />
          <SettingsItem
            icon="palette"
            iconColor={COLORS.pink}
            title="Theme & Appearance"
            value="Dark"
            showArrow
          />
          <SettingsItem
            icon="help"
            iconColor={COLORS.emerald}
            title="Help & Support"
            showArrow
          />
        </View>

        {/* Log Out Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => {
            Alert.alert(
              'Déconnexion',
              'Êtes-vous sûr de vouloir vous déconnecter?',
              [
                {text: 'Annuler', style: 'cancel'},
                {
                  text: 'Déconnexion',
                  style: 'destructive',
                  onPress: () => onLogout?.(),
                },
              ]
            );
          }}
        >
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        {/* Version */}
        <Text style={styles.versionText}>Version 2.4.0 (Build 302)</Text>

        {/* Bottom spacing for navigation */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNavigation
        activeTab={activeTab}
        onTabPress={onTabPress}
        onAddPress={() => console.log('Add pressed')}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  saveButton: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 20,
  },
  avatarSection: {
    alignItems: 'center',
    gap: 8,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.background,
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginTop: 8,
  },
  userEmail: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  levelBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 8,
  },
  levelText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    letterSpacing: 1,
  },
  editButton: {
    backgroundColor: COLORS.card,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  editButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  goalsContainer: {
    gap: 12,
  },
  notificationTabs: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 4,
    marginBottom: 8,
  },
  notifTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    gap: 4,
  },
  notifTabActive: {
    backgroundColor: 'rgba(108, 43, 238, 0.2)',
    borderRadius: 10,
  },
  notifTabText: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  notifTabTextActive: {
    color: COLORS.primary,
  },
  logoutButton: {
    alignItems: 'center',
    paddingVertical: 14,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.danger,
  },
  versionText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  bottomSpacer: {
    height: 100,
  },
});
