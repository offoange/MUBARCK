/**
 * Service de stockage local pour l'application MubarakApp
 * Cette implémentation utilise AsyncStorage pour la persistance des données.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// Clés de stockage
const STORAGE_KEYS = {
  USER_PROFILE: '@mubarak_user_profile',
  REMINDERS: '@mubarak_reminders',
  SCHEDULE: '@mubarak_schedule',
  GOALS: '@mubarak_goals',
  SETTINGS: '@mubarak_settings',
  WELLNESS_DATA: '@mubarak_wellness_data',
  IS_LOGGED_IN: '@mubarak_is_logged_in',
  HAS_COMPLETED_ONBOARDING: '@mubarak_has_completed_onboarding',
  NOTES: '@mubarak_notes',
  DAILY_GOAL: '@mubarak_daily_goal',
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
  // Champs pour les notifications
  hour?: number;
  minute?: number;
  repeatType?: 'daily' | 'hourly' | 'weekly' | 'none';
  repeatInterval?: number; // Pour les répétitions horaires (ex: 2 pour "toutes les 2h")
  notificationId?: string; // ID de la notification programmée
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

export interface Note {
  id: string;
  title: string;
  content: string;
  subject: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface DailyGoal {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  isCompleted: boolean;
  createdAt: string;
  completedAt?: string;
}

// Données par défaut
const DEFAULT_USER_PROFILE: UserProfile = {
  name: 'Alex Rivera',
  email: 'alex.rivera@university.edu',
  avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDv1T6_MgXb2h74tuQcPVMvbw8S4R4pc8Z3-CfWR5oci3d8PSI1QKZ33IPQzRJ1qQjUgGPSmaTTP-oIP1iKm_WGUOu38P3H75umAWRzAXa3NkZkqKRMeonVId2OvWSlMgBSBCreAds8CmeG5LfaCyJLo10LTJrW0BtJgfkrAHBCMW8S24zfS-wum183e4jgZYcZF4dhfi7F9aeHyWwOEK2A1fBqaYMxMs7GPJsNxQ4hCBVzTdFQWrKN0bNe9Tth2LOvB4uhxJp5zAQ',
  level: 'LEVEL 5 SCHEDULER',
  dayStreak: 12,
  wellnessScore: 85,
};

const DEFAULT_REMINDERS: Reminder[] = [
  {
    id: '1',
    icon: 'water-drop',
    iconColor: '#fff',
    iconBgColor: '#38bdf8',
    title: 'Boire un verre d\'eau',
    subtitle: 'Toutes les 2h • Prochain à 10:00',
    isEnabled: true,
    category: 'Santé',
  },
  {
    id: '2',
    icon: 'timer',
    iconColor: '#fff',
    iconBgColor: '#fb923c',
    title: 'Pause Pomodoro',
    subtitle: '10:30 • 25 min focus',
    isEnabled: false,
    category: 'Études',
  },
  {
    id: '3',
    icon: 'self-improvement',
    iconColor: '#fff',
    iconBgColor: '#f472b6',
    title: 'Respiration profonde',
    subtitle: '20:00 • 5 min',
    isEnabled: false,
    category: 'Bien-être',
  },
  {
    id: '4',
    icon: 'phonelink-off',
    iconColor: '#fff',
    iconBgColor: '#a855f7',
    title: 'Déconnexion écrans',
    subtitle: '23:00 • Sommeil',
    isEnabled: false,
    category: 'Bien-être',
  },
];

const DEFAULT_SCHEDULE: ScheduleItem[] = [
  {
    id: '1',
    time: '09:00',
    icon: 'calculate',
    title: 'Mathématiques',
    subtitle: 'Chapitre 4: Algèbre',
    timeRange: '09:00 - 10:30',
    backgroundColor: '#6c2bee',
    iconBgColor: 'rgba(255,255,255,0.2)',
  },
  {
    id: '2',
    time: '11:00',
    icon: 'science',
    title: 'Physique',
    subtitle: 'TP Laboratoire',
    timeRange: '11:00 - 12:30',
    backgroundColor: '#be185d',
    iconBgColor: 'rgba(255,255,255,0.2)',
  },
  {
    id: '3',
    time: '14:00',
    icon: 'psychology',
    title: 'Étude Personnelle',
    subtitle: 'Bibliothèque',
    timeRange: '14:00 - 16:00',
    backgroundColor: '#0891b2',
    iconBgColor: 'rgba(255,255,255,0.2)',
  },
];

const DEFAULT_GOALS: Goal[] = [
  {
    id: '1',
    icon: 'menu-book',
    iconColor: '#6c2bee',
    title: 'Daily Study Target',
    subtitle: 'Hours per day',
    progress: 50,
    displayValue: '4h',
  },
  {
    id: '2',
    icon: 'bedtime',
    iconColor: '#38bdf8',
    title: 'Sleep Goal',
    subtitle: 'Target duration',
    progress: 100,
    displayValue: '8h 00m',
  },
];

const DEFAULT_SETTINGS: Settings = {
  morningMotivation: true,
  hydrationNudges: true,
  focusModeAlerts: false,
  theme: 'dark',
};

const DEFAULT_WELLNESS_DATA: WellnessData = {
  water: {
    current: 1.2,
    target: 2,
  },
  sleep: {
    hours: 7,
    minutes: 20,
    target: 8,
  },
  steps: {
    current: 3500,
    target: 8000,
  },
};

// Service de stockage local avec AsyncStorage
class LocalStorageService {
  // Profil utilisateur
  async saveUserProfile(profile: UserProfile): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
      console.log('Profil utilisateur sauvegardé:', profile);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du profil:', error);
    }
  }

  async getUserProfile(): Promise<UserProfile | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Erreur lors de la récupération du profil:', error);
      return null;
    }
  }

  // Rappels
  async saveReminders(items: Reminder[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(items));
      console.log('Rappels sauvegardés:', items);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des rappels:', error);
    }
  }

  async getReminders(): Promise<Reminder[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.REMINDERS);
      return data ? JSON.parse(data) : DEFAULT_REMINDERS;
    } catch (error) {
      console.error('Erreur lors de la récupération des rappels:', error);
      return DEFAULT_REMINDERS;
    }
  }

  // Planning
  async saveSchedule(items: ScheduleItem[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SCHEDULE, JSON.stringify(items));
      console.log('Planning sauvegardé:', items);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du planning:', error);
    }
  }

  async getSchedule(): Promise<ScheduleItem[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.SCHEDULE);
      return data ? JSON.parse(data) : DEFAULT_SCHEDULE;
    } catch (error) {
      console.error('Erreur lors de la récupération du planning:', error);
      return DEFAULT_SCHEDULE;
    }
  }

  // Objectifs
  async saveGoals(items: Goal[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(items));
      console.log('Objectifs sauvegardés:', items);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des objectifs:', error);
    }
  }

  async getGoals(): Promise<Goal[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.GOALS);
      return data ? JSON.parse(data) : DEFAULT_GOALS;
    } catch (error) {
      console.error('Erreur lors de la récupération des objectifs:', error);
      return DEFAULT_GOALS;
    }
  }

  // Paramètres
  async saveSettings(newSettings: Settings): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(newSettings));
      console.log('Paramètres sauvegardés:', newSettings);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des paramètres:', error);
    }
  }

  async getSettings(): Promise<Settings | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? JSON.parse(data) : DEFAULT_SETTINGS;
    } catch (error) {
      console.error('Erreur lors de la récupération des paramètres:', error);
      return DEFAULT_SETTINGS;
    }
  }

  // Données bien-être
  async saveWellnessData(data: WellnessData): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.WELLNESS_DATA, JSON.stringify(data));
      console.log('Données bien-être sauvegardées:', data);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des données bien-être:', error);
    }
  }

  async getWellnessData(): Promise<WellnessData | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.WELLNESS_DATA);
      return data ? JSON.parse(data) : DEFAULT_WELLNESS_DATA;
    } catch (error) {
      console.error('Erreur lors de la récupération des données bien-être:', error);
      return DEFAULT_WELLNESS_DATA;
    }
  }

  // Effacer toutes les données
  async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.USER_PROFILE,
        STORAGE_KEYS.REMINDERS,
        STORAGE_KEYS.SCHEDULE,
        STORAGE_KEYS.GOALS,
        STORAGE_KEYS.SETTINGS,
        STORAGE_KEYS.WELLNESS_DATA,
        STORAGE_KEYS.IS_LOGGED_IN,
        STORAGE_KEYS.HAS_COMPLETED_ONBOARDING,
        STORAGE_KEYS.NOTES,
      ]);
      console.log('Toutes les données ont été effacées');
    } catch (error) {
      console.error('Erreur lors de la suppression des données:', error);
    }
  }

  // Gestion de la session utilisateur
  async setLoggedIn(value: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.IS_LOGGED_IN, JSON.stringify(value));
      console.log('État de connexion:', value);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de l\'état de connexion:', error);
    }
  }

  async getIsLoggedIn(): Promise<boolean> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.IS_LOGGED_IN);
      return data ? JSON.parse(data) : false;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'état de connexion:', error);
      return false;
    }
  }

  async setOnboardingCompleted(value: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.HAS_COMPLETED_ONBOARDING, JSON.stringify(value));
      console.log('Onboarding complété:', value);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de l\'état onboarding:', error);
    }
  }

  async getHasCompletedOnboarding(): Promise<boolean> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.HAS_COMPLETED_ONBOARDING);
      return data ? JSON.parse(data) : false;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'état onboarding:', error);
      return false;
    }
  }

  // Vérifier si l'utilisateur est authentifié
  async isAuthenticated(): Promise<boolean> {
    try {
      const isLoggedIn = await this.getIsLoggedIn();
      const userProfile = await this.getUserProfile();
      return userProfile !== null && isLoggedIn;
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'authentification:', error);
      return false;
    }
  }

  // Notes de révision
  async saveNotes(items: Note[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(items));
      console.log('Notes sauvegardées:', items);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des notes:', error);
    }
  }

  async getNotes(): Promise<Note[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.NOTES);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Erreur lors de la récupération des notes:', error);
      return [];
    }
  }

  async addNote(note: Note): Promise<void> {
    try {
      const notes = await this.getNotes();
      notes.push(note);
      await this.saveNotes(notes);
      console.log('Note ajoutée:', note);
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la note:', error);
    }
  }

  async updateNote(updatedNote: Note): Promise<void> {
    try {
      const notes = await this.getNotes();
      const updatedNotes = notes.map(n => n.id === updatedNote.id ? updatedNote : n);
      await this.saveNotes(updatedNotes);
      console.log('Note mise à jour:', updatedNote);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la note:', error);
    }
  }

  async deleteNote(noteId: string): Promise<void> {
    try {
      const notes = await this.getNotes();
      const filteredNotes = notes.filter(n => n.id !== noteId);
      await this.saveNotes(filteredNotes);
      console.log('Note supprimée:', noteId);
    } catch (error) {
      console.error('Erreur lors de la suppression de la note:', error);
    }
  }

  // Objectif du jour
  async saveDailyGoal(goal: DailyGoal): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.DAILY_GOAL, JSON.stringify(goal));
      console.log('Objectif du jour sauvegardé:', goal);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de l\'objectif du jour:', error);
    }
  }

  async getDailyGoal(): Promise<DailyGoal | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.DAILY_GOAL);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'objectif du jour:', error);
      return null;
    }
  }

  async completeDailyGoal(): Promise<void> {
    try {
      const goal = await this.getDailyGoal();
      if (goal) {
        goal.isCompleted = true;
        goal.completedAt = new Date().toISOString();
        await this.saveDailyGoal(goal);
        console.log('Objectif du jour complété:', goal);
      }
    } catch (error) {
      console.error('Erreur lors de la complétion de l\'objectif du jour:', error);
    }
  }

  async deleteDailyGoal(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.DAILY_GOAL);
      console.log('Objectif du jour supprimé');
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'objectif du jour:', error);
    }
  }
}

export default new LocalStorageService();
