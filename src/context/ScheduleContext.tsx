/**
 * Context pour la gestion de l'état de l'emploi du temps
 */

import React, {createContext, useContext, useState, useEffect, useCallback, ReactNode} from 'react';
import {
  ConfigurationEmploiDuTemps,
  CoursGenere,
  EmploiDuTempsBase,
  PeriodeAnnee,
  PeriodeVacances,
  DetailsCours,
  ActivitePersonnelle,
} from '../types/schedule';
import ScheduleStorageService from '../services/ScheduleStorageService';
import CalendarGeneratorService from '../services/CalendarGeneratorService';

interface ScheduleContextType {
  // État
  configuration: ConfigurationEmploiDuTemps | null;
  coursGeneres: CoursGenere[];
  activites: ActivitePersonnelle[];
  estConfigure: boolean;
  isLoading: boolean;
  selectedDate: string;
  currentWeekStart: string;

  // Actions de configuration
  saveEmploiDuTempsBase: (emploi: EmploiDuTempsBase) => Promise<void>;
  savePeriodeAnnee: (periode: PeriodeAnnee) => Promise<void>;
  saveVacances: (vacances: PeriodeVacances[]) => Promise<void>;
  genererCours: () => Promise<void>;
  resetConfiguration: () => Promise<void>;

  // Actions sur les cours
  updateDetailsCours: (coursId: string, details: Partial<DetailsCours>) => Promise<void>;
  updateStatutCours: (coursId: string, statut: CoursGenere['statut']) => Promise<void>;
  getCoursParDate: (date: string) => CoursGenere[];
  getCoursParSemaine: () => CoursGenere[];

  // Actions sur les activités personnelles
  addActivite: (activite: Omit<ActivitePersonnelle, 'id'>) => Promise<void>;
  updateActivite: (id: string, updates: Partial<ActivitePersonnelle>) => Promise<void>;
  deleteActivite: (id: string) => Promise<void>;
  toggleActiviteComplete: (id: string) => Promise<void>;
  getActivitesParDate: (date: string) => ActivitePersonnelle[];

  // Navigation
  setSelectedDate: (date: string) => void;
  goToNextWeek: () => void;
  goToPreviousWeek: () => void;
  goToToday: () => void;

  // Utilitaires
  refreshData: () => Promise<void>;
  searchCours: (query: string) => Promise<CoursGenere[]>;
}

const ScheduleContext = createContext<ScheduleContextType | undefined>(undefined);

interface ScheduleProviderProps {
  children: ReactNode;
}

export function ScheduleProvider({children}: ScheduleProviderProps) {
  const [configuration, setConfiguration] = useState<ConfigurationEmploiDuTemps | null>(null);
  const [coursGeneres, setCoursGeneres] = useState<CoursGenere[]>([]);
  const [activites, setActivites] = useState<ActivitePersonnelle[]>([]);
  const [estConfigure, setEstConfigure] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(CalendarGeneratorService.formatDate(new Date()));
  const [currentWeekStart, setCurrentWeekStart] = useState(
    CalendarGeneratorService.formatDate(CalendarGeneratorService.getLundiDeSemaine(new Date()))
  );

  // Charger les données au démarrage
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const data = await ScheduleStorageService.getAllData();
      const activitesData = await ScheduleStorageService.getActivites();

      setConfiguration(data.configuration);
      setEstConfigure(data.estConfigure);
      setActivites(activitesData);

      // Mettre à jour les statuts des cours
      const coursAvecStatuts = CalendarGeneratorService.mettreAJourStatuts(data.coursGeneres);
      setCoursGeneres(coursAvecStatuts);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = useCallback(async () => {
    await loadData();
  }, []);

  // Sauvegarder l'emploi du temps de base
  const saveEmploiDuTempsBase = useCallback(async (emploi: EmploiDuTempsBase) => {
    try {
      setIsLoading(true);
      await ScheduleStorageService.saveEmploiDuTempsBase(emploi);
      const updatedConfig = await ScheduleStorageService.getConfiguration();
      setConfiguration(updatedConfig);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Sauvegarder la période de l'année
  const savePeriodeAnnee = useCallback(async (periode: PeriodeAnnee) => {
    try {
      setIsLoading(true);
      await ScheduleStorageService.savePeriodeAnnee(periode);
      const updatedConfig = await ScheduleStorageService.getConfiguration();
      setConfiguration(updatedConfig);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la période:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Sauvegarder les vacances
  const saveVacances = useCallback(async (vacances: PeriodeVacances[]) => {
    try {
      setIsLoading(true);
      await ScheduleStorageService.saveVacances(vacances);
      const updatedConfig = await ScheduleStorageService.getConfiguration();
      setConfiguration(updatedConfig);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des vacances:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Générer tous les cours
  const genererCours = useCallback(async () => {
    try {
      setIsLoading(true);

      // Récupérer la configuration depuis le storage (plus fiable que l'état)
      const config = await ScheduleStorageService.getConfiguration();
      if (!config) {
        throw new Error('Configuration non disponible');
      }

      const nouveauxCours = CalendarGeneratorService.genererCoursAnnee(config);
      await ScheduleStorageService.saveCoursGeneres(nouveauxCours);
      await ScheduleStorageService.setEstConfigure(true);

      setConfiguration(config);
      setCoursGeneres(nouveauxCours);
      setEstConfigure(true);
    } catch (error) {
      console.error('Erreur lors de la génération des cours:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Réinitialiser la configuration
  const resetConfiguration = useCallback(async () => {
    try {
      setIsLoading(true);
      await ScheduleStorageService.clearAllData();
      setConfiguration(null);
      setCoursGeneres([]);
      setEstConfigure(false);
    } catch (error) {
      console.error('Erreur lors de la réinitialisation:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Mettre à jour les détails d'un cours
  const updateDetailsCours = useCallback(async (coursId: string, details: Partial<DetailsCours>) => {
    try {
      await ScheduleStorageService.updateDetailsCours(coursId, details);

      setCoursGeneres(prev =>
        prev.map(c =>
          c.id === coursId
            ? {
                ...c,
                details: {
                  ...c.details,
                  ...details,
                  derniereMiseAJour: new Date().toISOString(),
                },
              }
            : c
        )
      );
    } catch (error) {
      console.error('Erreur lors de la mise à jour des détails:', error);
      throw error;
    }
  }, []);

  // Mettre à jour le statut d'un cours
  const updateStatutCours = useCallback(async (coursId: string, statut: CoursGenere['statut']) => {
    try {
      await ScheduleStorageService.updateStatutCours(coursId, statut);

      setCoursGeneres(prev =>
        prev.map(c => (c.id === coursId ? {...c, statut} : c))
      );
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      throw error;
    }
  }, []);

  // Obtenir les cours pour une date
  const getCoursParDate = useCallback((date: string): CoursGenere[] => {
    return CalendarGeneratorService.trierParHeure(
      coursGeneres.filter(c => c.date === date)
    );
  }, [coursGeneres]);

  // Obtenir les cours pour la semaine actuelle
  const getCoursParSemaine = useCallback((): CoursGenere[] => {
    const dates = CalendarGeneratorService.getDatesSemaine(new Date(currentWeekStart));
    return coursGeneres.filter(c => dates.includes(c.date));
  }, [coursGeneres, currentWeekStart]);

  // Navigation semaine suivante
  const goToNextWeek = useCallback(() => {
    const current = new Date(currentWeekStart);
    current.setDate(current.getDate() + 7);
    setCurrentWeekStart(CalendarGeneratorService.formatDate(current));
    setSelectedDate(CalendarGeneratorService.formatDate(current));
  }, [currentWeekStart]);

  // Navigation semaine précédente
  const goToPreviousWeek = useCallback(() => {
    const current = new Date(currentWeekStart);
    current.setDate(current.getDate() - 7);
    setCurrentWeekStart(CalendarGeneratorService.formatDate(current));
    setSelectedDate(CalendarGeneratorService.formatDate(current));
  }, [currentWeekStart]);

  // Retour à aujourd'hui
  const goToToday = useCallback(() => {
    const today = new Date();
    setSelectedDate(CalendarGeneratorService.formatDate(today));
    setCurrentWeekStart(
      CalendarGeneratorService.formatDate(CalendarGeneratorService.getLundiDeSemaine(today))
    );
  }, []);

  // Recherche dans les cours
  const searchCours = useCallback(async (query: string): Promise<CoursGenere[]> => {
    return ScheduleStorageService.rechercherCours(query);
  }, []);

  // ========== Gestion des activités personnelles ==========

  const addActivite = useCallback(async (activite: Omit<ActivitePersonnelle, 'id'>) => {
    try {
      const newActivite = await ScheduleStorageService.addActivite(activite);
      setActivites(prev => [...prev, newActivite]);
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'activité:', error);
      throw error;
    }
  }, []);

  const updateActivite = useCallback(async (id: string, updates: Partial<ActivitePersonnelle>) => {
    try {
      await ScheduleStorageService.updateActivite(id, updates);
      setActivites(prev => prev.map(a => a.id === id ? {...a, ...updates} : a));
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'activité:', error);
      throw error;
    }
  }, []);

  const deleteActivite = useCallback(async (id: string) => {
    try {
      await ScheduleStorageService.deleteActivite(id);
      setActivites(prev => prev.filter(a => a.id !== id));
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'activité:', error);
      throw error;
    }
  }, []);

  const toggleActiviteComplete = useCallback(async (id: string) => {
    try {
      await ScheduleStorageService.toggleActiviteComplete(id);
      setActivites(prev => prev.map(a => a.id === id ? {...a, complete: !a.complete} : a));
    } catch (error) {
      console.error('Erreur lors du toggle de l\'activité:', error);
      throw error;
    }
  }, []);

  const getActivitesParDate = useCallback((date: string): ActivitePersonnelle[] => {
    return activites.filter(a => a.date === date);
  }, [activites]);

  const value: ScheduleContextType = {
    configuration,
    coursGeneres,
    activites,
    estConfigure,
    isLoading,
    selectedDate,
    currentWeekStart,
    saveEmploiDuTempsBase,
    savePeriodeAnnee,
    saveVacances,
    genererCours,
    resetConfiguration,
    updateDetailsCours,
    updateStatutCours,
    getCoursParDate,
    getCoursParSemaine,
    addActivite,
    updateActivite,
    deleteActivite,
    toggleActiviteComplete,
    getActivitesParDate,
    setSelectedDate,
    goToNextWeek,
    goToPreviousWeek,
    goToToday,
    refreshData,
    searchCours,
  };

  return (
    <ScheduleContext.Provider value={value}>
      {children}
    </ScheduleContext.Provider>
  );
}

export function useSchedule(): ScheduleContextType {
  const context = useContext(ScheduleContext);
  if (context === undefined) {
    throw new Error('useSchedule must be used within a ScheduleProvider');
  }
  return context;
}

export default ScheduleContext;
