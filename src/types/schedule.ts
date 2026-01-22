/**
 * Types et interfaces pour la gestion de l'emploi du temps
 */

// Jours de la semaine en français (tous les jours)
export type JourSemaine = 'lundi' | 'mardi' | 'mercredi' | 'jeudi' | 'vendredi' | 'samedi' | 'dimanche';

// Jours de cours (lundi à vendredi uniquement)
export type JourCours = 'lundi' | 'mardi' | 'mercredi' | 'jeudi' | 'vendredi';

// Type pour les activités personnelles
export type TypeActivite = 'etude' | 'sport' | 'loisir' | 'rendez_vous' | 'autre';

// Activité personnelle ajoutée par l'élève
export interface ActivitePersonnelle {
  id: string;
  titre: string;
  description: string;
  date: string;        // Format "YYYY-MM-DD"
  heureDebut: string;  // Format "HH:MM"
  heureFin: string;    // Format "HH:MM"
  type: TypeActivite;
  couleur: string;
  rappel: boolean;
  complete: boolean;
}

// Statuts possibles d'un cours
export type StatutCours = 'a_venir' | 'en_cours' | 'complete' | 'annule';

// Cours de base (emploi du temps fixe)
export interface CoursBase {
  id: string;
  heureDebut: string; // Format "HH:MM"
  heureFin: string;   // Format "HH:MM"
  matiere: string;
  salle: string;
  couleur: string;
}

// Emploi du temps de base par jour
export interface EmploiDuTempsBase {
  lundi: CoursBase[];
  mardi: CoursBase[];
  mercredi: CoursBase[];
  jeudi: CoursBase[];
  vendredi: CoursBase[];
}

// Période de vacances
export interface PeriodeVacances {
  id: string;
  nom: string;
  debut: string; // Format "YYYY-MM-DD"
  fin: string;   // Format "YYYY-MM-DD"
}

// Période de l'année scolaire
export interface PeriodeAnnee {
  dateDebut: string; // Format "YYYY-MM-DD"
  dateFin: string;   // Format "YYYY-MM-DD"
}

// Configuration complète de l'emploi du temps
export interface ConfigurationEmploiDuTemps {
  emploiDuTempsBase: EmploiDuTempsBase;
  periodeAnnee: PeriodeAnnee;
  vacances: PeriodeVacances[];
  derniereModification: string;
}

// Détails variables d'un cours (ajoutés par l'étudiant)
export interface DetailsCours {
  theme: string;
  objectifs: string[];
  activites: string[];
  typeEvaluation: string;
  unite: string;
  notesPersonnelles: string;
  derniereMiseAJour: string;
}

// Cours généré (instance spécifique d'un cours)
export interface CoursGenere {
  id: string;
  date: string;        // Format "YYYY-MM-DD"
  jour: JourSemaine;
  heureDebut: string;
  heureFin: string;
  matiere: string;
  salle: string;
  couleur: string;
  details: DetailsCours;
  statut: StatutCours;
  coursBaseId: string; // Référence au cours de base
}

// Données sauvegardées
export interface DonneesEmploiDuTemps {
  configuration: ConfigurationEmploiDuTemps | null;
  coursGeneres: CoursGenere[];
  estConfigure: boolean;
}

// Matière prédéfinie
export interface MatierePredefinite {
  nom: string;
  couleur: string;
  icone: string;
}

// Liste des matières MYP 5B
export const MATIERES_PREDEFINIES: MatierePredefinite[] = [
  { nom: 'Individus et Sociétés', couleur: '#FF6B6B', icone: 'groups' },
  { nom: 'Espagnol', couleur: '#FFD93D', icone: 'translate' },
  { nom: 'Mathématiques', couleur: '#4A90E2', icone: 'calculate' },
  { nom: 'Anglais', couleur: '#6BCF7F', icone: 'language' },
  { nom: 'Projet Personnel', couleur: '#95E1D3', icone: 'assignment' },
  { nom: 'EPS', couleur: '#F39C12', icone: 'sports-soccer' },
  { nom: 'L&L Française', couleur: '#E74C3C', icone: 'menu-book' },
  { nom: 'Sciences', couleur: '#9B59B6', icone: 'science' },
  { nom: 'Informatique', couleur: '#34495E', icone: 'computer' },
  { nom: 'Art Visuel', couleur: '#E67E22', icone: 'palette' },
  { nom: 'Vie de classe', couleur: '#A8E6CF', icone: 'school' },
];

// Horaires types
export const HORAIRES_TYPES = [
  '08:00', '09:00', '10:00', '10:15', '11:15', '12:15',
  '13:30', '14:30', '15:30',
];

// Emploi du temps de base par défaut (MYP 5B Enko Abidjan)
export const EMPLOI_DU_TEMPS_DEFAUT: EmploiDuTempsBase = {
  lundi: [
    { id: 'lundi_1', heureDebut: '08:00', heureFin: '09:00', matiere: 'Individus et Sociétés', salle: '', couleur: '#FF6B6B' },
    { id: 'lundi_2', heureDebut: '09:00', heureFin: '10:00', matiere: 'Espagnol', salle: '', couleur: '#FFD93D' },
    { id: 'lundi_3', heureDebut: '10:15', heureFin: '11:15', matiere: 'Espagnol', salle: '', couleur: '#FFD93D' },
    { id: 'lundi_4', heureDebut: '11:15', heureFin: '12:15', matiere: 'Vie de classe', salle: '', couleur: '#A8E6CF' },
    { id: 'lundi_5', heureDebut: '13:30', heureFin: '14:30', matiere: 'Anglais', salle: '', couleur: '#6BCF7F' },
    { id: 'lundi_6', heureDebut: '14:30', heureFin: '15:30', matiere: 'Projet Personnel', salle: '', couleur: '#95E1D3' },
  ],
  mardi: [
    { id: 'mardi_1', heureDebut: '08:00', heureFin: '10:00', matiere: 'Individus et Sociétés', salle: '', couleur: '#FF6B6B' },
    { id: 'mardi_2', heureDebut: '10:15', heureFin: '12:15', matiere: 'Mathématiques', salle: '', couleur: '#4A90E2' },
    { id: 'mardi_3', heureDebut: '13:30', heureFin: '14:30', matiere: 'Sciences', salle: '', couleur: '#9B59B6' },
    { id: 'mardi_4', heureDebut: '14:30', heureFin: '15:30', matiere: 'L&L Française', salle: '', couleur: '#E74C3C' },
  ],
  mercredi: [
    { id: 'mercredi_1', heureDebut: '08:00', heureFin: '10:00', matiere: 'EPS', salle: '', couleur: '#F39C12' },
    { id: 'mercredi_2', heureDebut: '10:15', heureFin: '11:15', matiere: 'Mathématiques', salle: '', couleur: '#4A90E2' },
    { id: 'mercredi_3', heureDebut: '11:15', heureFin: '12:15', matiere: 'Espagnol', salle: '', couleur: '#FFD93D' },
    { id: 'mercredi_4', heureDebut: '13:30', heureFin: '14:30', matiere: 'Informatique', salle: '', couleur: '#34495E' },
    { id: 'mercredi_5', heureDebut: '14:30', heureFin: '15:30', matiere: 'Anglais', salle: '', couleur: '#6BCF7F' },
  ],
  jeudi: [
    { id: 'jeudi_1', heureDebut: '08:00', heureFin: '09:00', matiere: 'L&L Française', salle: '', couleur: '#E74C3C' },
    { id: 'jeudi_2', heureDebut: '09:00', heureFin: '10:00', matiere: 'Mathématiques', salle: '', couleur: '#4A90E2' },
    { id: 'jeudi_3', heureDebut: '10:15', heureFin: '11:15', matiere: 'Sciences', salle: 'Labo', couleur: '#9B59B6' },
    { id: 'jeudi_4', heureDebut: '11:15', heureFin: '12:15', matiere: 'Sciences', salle: 'Labo', couleur: '#9B59B6' },
    { id: 'jeudi_5', heureDebut: '13:30', heureFin: '14:30', matiere: 'Art Visuel', salle: '', couleur: '#E67E22' },
  ],
  vendredi: [
    { id: 'vendredi_1', heureDebut: '08:00', heureFin: '09:00', matiere: 'Anglais', salle: '', couleur: '#6BCF7F' },
    { id: 'vendredi_2', heureDebut: '09:00', heureFin: '10:00', matiere: 'L&L Française', salle: '', couleur: '#E74C3C' },
    { id: 'vendredi_3', heureDebut: '10:15', heureFin: '11:15', matiere: 'Mathématiques', salle: '', couleur: '#4A90E2' },
    { id: 'vendredi_4', heureDebut: '11:15', heureFin: '12:15', matiere: 'Sciences', salle: '', couleur: '#9B59B6' },
    { id: 'vendredi_5', heureDebut: '13:30', heureFin: '14:30', matiere: 'Art Visuel', salle: '', couleur: '#E67E22' },
  ],
};

// Détails par défaut pour un nouveau cours
export const DETAILS_COURS_DEFAUT: DetailsCours = {
  theme: '',
  objectifs: [],
  activites: [],
  typeEvaluation: '',
  unite: '',
  notesPersonnelles: '',
  derniereMiseAJour: '',
};

// Couleurs de l'interface
export const COLORS_SCHEDULE = {
  primary: '#6c2bee',
  background: '#161022',
  card: '#1d172a',
  cardDark: '#2a2438',
  cardLight: '#3a3448',
  accent: '#be185d',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  textPrimary: '#ffffff',
  textSecondary: '#94a3b8',
  textMuted: '#64748b',
  border: 'rgba(255,255,255,0.1)',
  borderLight: 'rgba(255,255,255,0.2)',
};
