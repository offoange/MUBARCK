/**
 * Service de stockage local pour l'application MubarakApp
 * Cette implémentation utilise des variables en mémoire pour simuler la persistance des données
 * dans un environnement de développement sans dépendance externe.
 */

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

export interface Note {
  id: string;
  title: string;
  content: string;
  subject: string;
  color: string;
  createdAt: string;
  updatedAt: string;
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

// Variables de stockage en mémoire
let userProfile: UserProfile | null = null;
let reminders: Reminder[] = [...DEFAULT_REMINDERS];
let schedule: ScheduleItem[] = [...DEFAULT_SCHEDULE];
let goals: Goal[] = [...DEFAULT_GOALS];
let settings: Settings = {...DEFAULT_SETTINGS};
let wellnessData: WellnessData = {...DEFAULT_WELLNESS_DATA};
let isLoggedIn: boolean = false;
let hasCompletedOnboarding: boolean = false;
let notes: Note[] = [];

// Service de stockage local
class LocalStorageService {
  // Profil utilisateur
  async saveUserProfile(profile: UserProfile): Promise<void> {
    userProfile = {...profile};
    console.log('Profil utilisateur sauvegardé:', userProfile);
  }

  async getUserProfile(): Promise<UserProfile | null> {
    return userProfile ? {...userProfile} : null;
  }

  // Rappels
  async saveReminders(items: Reminder[]): Promise<void> {
    reminders = [...items];
    console.log('Rappels sauvegardés:', reminders);
  }

  async getReminders(): Promise<Reminder[]> {
    return [...reminders];
  }

  // Planning
  async saveSchedule(items: ScheduleItem[]): Promise<void> {
    schedule = [...items];
    console.log('Planning sauvegardé:', schedule);
  }

  async getSchedule(): Promise<ScheduleItem[]> {
    return [...schedule];
  }

  // Objectifs
  async saveGoals(items: Goal[]): Promise<void> {
    goals = [...items];
    console.log('Objectifs sauvegardés:', goals);
  }

  async getGoals(): Promise<Goal[]> {
    return [...goals];
  }

  // Paramètres
  async saveSettings(newSettings: Settings): Promise<void> {
    settings = {...newSettings};
    console.log('Paramètres sauvegardés:', settings);
  }

  async getSettings(): Promise<Settings | null> {
    return {...settings};
  }

  // Données bien-être
  async saveWellnessData(data: WellnessData): Promise<void> {
    wellnessData = {...data};
    console.log('Données bien-être sauvegardées:', wellnessData);
  }

  async getWellnessData(): Promise<WellnessData | null> {
    return {...wellnessData};
  }

  // Effacer toutes les données
  async clearAllData(): Promise<void> {
    userProfile = null;
    reminders = [...DEFAULT_REMINDERS];
    schedule = [...DEFAULT_SCHEDULE];
    goals = [...DEFAULT_GOALS];
    settings = {...DEFAULT_SETTINGS};
    wellnessData = {...DEFAULT_WELLNESS_DATA};
    isLoggedIn = false;
    hasCompletedOnboarding = false;
    console.log('Toutes les données ont été effacées');
  }

  // Gestion de la session utilisateur
  async setLoggedIn(value: boolean): Promise<void> {
    isLoggedIn = value;
    console.log('État de connexion:', isLoggedIn);
  }

  async getIsLoggedIn(): Promise<boolean> {
    return isLoggedIn;
  }

  async setOnboardingCompleted(value: boolean): Promise<void> {
    hasCompletedOnboarding = value;
    console.log('Onboarding complété:', hasCompletedOnboarding);
  }

  async getHasCompletedOnboarding(): Promise<boolean> {
    return hasCompletedOnboarding;
  }

  // Vérifier si l'utilisateur est authentifié
  async isAuthenticated(): Promise<boolean> {
    return userProfile !== null && isLoggedIn;
  }

  // Notes de révision
  async saveNotes(items: Note[]): Promise<void> {
    notes = [...items];
    console.log('Notes sauvegardées:', notes);
  }

  async getNotes(): Promise<Note[]> {
    return [...notes];
  }

  async addNote(note: Note): Promise<void> {
    notes = [...notes, note];
    console.log('Note ajoutée:', note);
  }

  async updateNote(updatedNote: Note): Promise<void> {
    notes = notes.map(n => n.id === updatedNote.id ? updatedNote : n);
    console.log('Note mise à jour:', updatedNote);
  }

  async deleteNote(noteId: string): Promise<void> {
    notes = notes.filter(n => n.id !== noteId);
    console.log('Note supprimée:', noteId);
  }
}

export default new LocalStorageService();
