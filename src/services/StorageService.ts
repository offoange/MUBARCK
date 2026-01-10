import AsyncStorage from '@react-native-async-storage/async-storage';

// Clés de stockage
const STORAGE_KEYS = {
  USER_PROFILE: '@MubarakApp:userProfile',
  REMINDERS: '@MubarakApp:reminders',
  SCHEDULE: '@MubarakApp:schedule',
  SETTINGS: '@MubarakApp:settings',
  GOALS: '@MubarakApp:goals',
  WELLNESS_DATA: '@MubarakApp:wellnessData',
};

// Types
export interface UserProfile {
  name: string;
  email: string;
  avatar?: string;
  level?: string;
  dayStreak?: number;
  wellnessScore?: number;
}

export interface Reminder {
  id: string;
  icon: string;
  iconColor: string;
  iconBgColor: string;
  title: string;
  subtitle: string;
  isEnabled: boolean;
  category: string;
}

export interface ScheduleItem {
  id: string;
  time: string;
  icon: string;
  title: string;
  subtitle: string;
  timeRange: string;
  backgroundColor?: string;
  iconBgColor?: string;
}

export interface Goal {
  id: string;
  icon: string;
  iconColor: string;
  title: string;
  subtitle: string;
  progress: number;
  displayValue: string;
}

export interface Settings {
  morningMotivation: boolean;
  hydrationNudges: boolean;
  focusModeAlerts: boolean;
  theme: 'light' | 'dark';
}

export interface WellnessData {
  water: {
    current: number;
    target: number;
  };
  sleep: {
    hours: number;
    minutes: number;
    target: number;
  };
  steps: {
    current: number;
    target: number;
  };
}

// Service de stockage
class StorageService {
  // Profil utilisateur
  async saveUserProfile(profile: UserProfile): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
    } catch (error) {
      console.error('Error saving user profile:', error);
    }
  }

  async getUserProfile(): Promise<UserProfile | null> {
    try {
      const profileData = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
      return profileData ? JSON.parse(profileData) : null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }

  // Rappels
  async saveReminders(reminders: Reminder[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(reminders));
    } catch (error) {
      console.error('Error saving reminders:', error);
    }
  }

  async getReminders(): Promise<Reminder[]> {
    try {
      const remindersData = await AsyncStorage.getItem(STORAGE_KEYS.REMINDERS);
      return remindersData ? JSON.parse(remindersData) : [];
    } catch (error) {
      console.error('Error getting reminders:', error);
      return [];
    }
  }

  // Planning
  async saveSchedule(schedule: ScheduleItem[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SCHEDULE, JSON.stringify(schedule));
    } catch (error) {
      console.error('Error saving schedule:', error);
    }
  }

  async getSchedule(): Promise<ScheduleItem[]> {
    try {
      const scheduleData = await AsyncStorage.getItem(STORAGE_KEYS.SCHEDULE);
      return scheduleData ? JSON.parse(scheduleData) : [];
    } catch (error) {
      console.error('Error getting schedule:', error);
      return [];
    }
  }

  // Objectifs
  async saveGoals(goals: Goal[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
    } catch (error) {
      console.error('Error saving goals:', error);
    }
  }

  async getGoals(): Promise<Goal[]> {
    try {
      const goalsData = await AsyncStorage.getItem(STORAGE_KEYS.GOALS);
      return goalsData ? JSON.parse(goalsData) : [];
    } catch (error) {
      console.error('Error getting goals:', error);
      return [];
    }
  }

  // Paramètres
  async saveSettings(settings: Settings): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  }

  async getSettings(): Promise<Settings | null> {
    try {
      const settingsData = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
      return settingsData ? JSON.parse(settingsData) : null;
    } catch (error) {
      console.error('Error getting settings:', error);
      return null;
    }
  }

  // Données bien-être
  async saveWellnessData(data: WellnessData): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.WELLNESS_DATA, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving wellness data:', error);
    }
  }

  async getWellnessData(): Promise<WellnessData | null> {
    try {
      const wellnessData = await AsyncStorage.getItem(STORAGE_KEYS.WELLNESS_DATA);
      return wellnessData ? JSON.parse(wellnessData) : null;
    } catch (error) {
      console.error('Error getting wellness data:', error);
      return null;
    }
  }

  // Effacer toutes les données
  async clearAllData(): Promise<void> {
    try {
      const keys = Object.values(STORAGE_KEYS);
      await AsyncStorage.multiRemove(keys);
    } catch (error) {
      console.error('Error clearing all data:', error);
    }
  }
}

export default new StorageService();
