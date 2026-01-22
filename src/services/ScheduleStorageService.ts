/**
 * Service de stockage pour la gestion de l'emploi du temps
 * Utilise AsyncStorage pour la persistance des données
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ConfigurationEmploiDuTemps,
  CoursGenere,
  DonneesEmploiDuTemps,
  PeriodeVacances,
  EmploiDuTempsBase,
  PeriodeAnnee,
  DetailsCours,
  ActivitePersonnelle,
  EMPLOI_DU_TEMPS_DEFAUT,
} from '../types/schedule';

// Clés de stockage
const STORAGE_KEYS = {
  CONFIGURATION: '@mubarak_schedule_config',
  COURS_GENERES: '@mubarak_schedule_courses',
  EST_CONFIGURE: '@mubarak_schedule_setup_done',
  ACTIVITES: '@mubarak_schedule_activities',
};

class ScheduleStorageService {
  // ========== Configuration de l'emploi du temps ==========

  /**
   * Sauvegarde la configuration de l'emploi du temps
   */
  async saveConfiguration(config: ConfigurationEmploiDuTemps): Promise<void> {
    try {
      const configWithTimestamp = {
        ...config,
        derniereModification: new Date().toISOString(),
      };
      await AsyncStorage.setItem(
        STORAGE_KEYS.CONFIGURATION,
        JSON.stringify(configWithTimestamp)
      );
      console.log('Configuration sauvegardée');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la configuration:', error);
      throw error;
    }
  }

  /**
   * Récupère la configuration de l'emploi du temps
   */
  async getConfiguration(): Promise<ConfigurationEmploiDuTemps | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.CONFIGURATION);
      if (data) {
        return JSON.parse(data) as ConfigurationEmploiDuTemps;
      }
      return null;
    } catch (error) {
      console.error('Erreur lors de la récupération de la configuration:', error);
      return null;
    }
  }

  /**
   * Sauvegarde l'emploi du temps de base
   */
  async saveEmploiDuTempsBase(emploi: EmploiDuTempsBase): Promise<void> {
    try {
      const currentConfig = await this.getConfiguration();
      const newConfig: ConfigurationEmploiDuTemps = {
        emploiDuTempsBase: emploi,
        periodeAnnee: currentConfig?.periodeAnnee || { dateDebut: '', dateFin: '' },
        vacances: currentConfig?.vacances || [],
        derniereModification: new Date().toISOString(),
      };
      await this.saveConfiguration(newConfig);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de l\'emploi du temps de base:', error);
      throw error;
    }
  }

  /**
   * Sauvegarde la période de l'année scolaire
   */
  async savePeriodeAnnee(periode: PeriodeAnnee): Promise<void> {
    try {
      const currentConfig = await this.getConfiguration();
      const newConfig: ConfigurationEmploiDuTemps = {
        emploiDuTempsBase: currentConfig?.emploiDuTempsBase || EMPLOI_DU_TEMPS_DEFAUT,
        periodeAnnee: periode,
        vacances: currentConfig?.vacances || [],
        derniereModification: new Date().toISOString(),
      };
      await this.saveConfiguration(newConfig);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la période:', error);
      throw error;
    }
  }

  /**
   * Sauvegarde les périodes de vacances
   */
  async saveVacances(vacances: PeriodeVacances[]): Promise<void> {
    try {
      const currentConfig = await this.getConfiguration();
      const newConfig: ConfigurationEmploiDuTemps = {
        emploiDuTempsBase: currentConfig?.emploiDuTempsBase || EMPLOI_DU_TEMPS_DEFAUT,
        periodeAnnee: currentConfig?.periodeAnnee || { dateDebut: '', dateFin: '' },
        vacances: vacances,
        derniereModification: new Date().toISOString(),
      };
      await this.saveConfiguration(newConfig);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des vacances:', error);
      throw error;
    }
  }

  // ========== Cours générés ==========

  /**
   * Sauvegarde tous les cours générés
   */
  async saveCoursGeneres(cours: CoursGenere[]): Promise<void> {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.COURS_GENERES,
        JSON.stringify(cours)
      );
      console.log(`${cours.length} cours sauvegardés`);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des cours:', error);
      throw error;
    }
  }

  /**
   * Récupère tous les cours générés
   */
  async getCoursGeneres(): Promise<CoursGenere[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.COURS_GENERES);
      if (data) {
        return JSON.parse(data) as CoursGenere[];
      }
      return [];
    } catch (error) {
      console.error('Erreur lors de la récupération des cours:', error);
      return [];
    }
  }

  /**
   * Récupère les cours pour une date spécifique
   */
  async getCoursParDate(date: string): Promise<CoursGenere[]> {
    try {
      const allCours = await this.getCoursGeneres();
      return allCours.filter(cours => cours.date === date);
    } catch (error) {
      console.error('Erreur lors de la récupération des cours par date:', error);
      return [];
    }
  }

  /**
   * Récupère les cours pour une semaine (du lundi au vendredi)
   */
  async getCoursParSemaine(dateDebut: string): Promise<CoursGenere[]> {
    try {
      const allCours = await this.getCoursGeneres();
      const debut = new Date(dateDebut);
      const fin = new Date(dateDebut);
      fin.setDate(fin.getDate() + 4); // Vendredi

      return allCours.filter(cours => {
        const dateCours = new Date(cours.date);
        return dateCours >= debut && dateCours <= fin;
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des cours de la semaine:', error);
      return [];
    }
  }

  /**
   * Récupère les cours pour un mois
   */
  async getCoursParMois(annee: number, mois: number): Promise<CoursGenere[]> {
    try {
      const allCours = await this.getCoursGeneres();
      return allCours.filter(cours => {
        const dateCours = new Date(cours.date);
        return dateCours.getFullYear() === annee && dateCours.getMonth() === mois;
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des cours du mois:', error);
      return [];
    }
  }

  /**
   * Met à jour un cours spécifique
   */
  async updateCours(coursId: string, updates: Partial<CoursGenere>): Promise<void> {
    try {
      const allCours = await this.getCoursGeneres();
      const index = allCours.findIndex(c => c.id === coursId);
      
      if (index !== -1) {
        allCours[index] = {
          ...allCours[index],
          ...updates,
          details: {
            ...allCours[index].details,
            ...(updates.details || {}),
            derniereMiseAJour: new Date().toISOString(),
          },
        };
        await this.saveCoursGeneres(allCours);
        console.log('Cours mis à jour:', coursId);
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du cours:', error);
      throw error;
    }
  }

  /**
   * Met à jour les détails d'un cours
   */
  async updateDetailsCours(coursId: string, details: Partial<DetailsCours>): Promise<void> {
    try {
      const allCours = await this.getCoursGeneres();
      const index = allCours.findIndex(c => c.id === coursId);
      
      if (index !== -1) {
        allCours[index].details = {
          ...allCours[index].details,
          ...details,
          derniereMiseAJour: new Date().toISOString(),
        };
        await this.saveCoursGeneres(allCours);
        console.log('Détails du cours mis à jour:', coursId);
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour des détails:', error);
      throw error;
    }
  }

  /**
   * Change le statut d'un cours
   */
  async updateStatutCours(coursId: string, statut: CoursGenere['statut']): Promise<void> {
    try {
      await this.updateCours(coursId, { statut });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      throw error;
    }
  }

  /**
   * Récupère un cours par son ID
   */
  async getCoursById(coursId: string): Promise<CoursGenere | null> {
    try {
      const allCours = await this.getCoursGeneres();
      return allCours.find(c => c.id === coursId) || null;
    } catch (error) {
      console.error('Erreur lors de la récupération du cours:', error);
      return null;
    }
  }

  /**
   * Recherche des cours par matière
   */
  async getCoursParMatiere(matiere: string): Promise<CoursGenere[]> {
    try {
      const allCours = await this.getCoursGeneres();
      return allCours.filter(cours => 
        cours.matiere.toLowerCase().includes(matiere.toLowerCase())
      );
    } catch (error) {
      console.error('Erreur lors de la recherche par matière:', error);
      return [];
    }
  }

  /**
   * Recherche globale dans les cours
   */
  async rechercherCours(query: string): Promise<CoursGenere[]> {
    try {
      const allCours = await this.getCoursGeneres();
      const queryLower = query.toLowerCase();
      
      return allCours.filter(cours => {
        return (
          cours.matiere.toLowerCase().includes(queryLower) ||
          cours.details.theme.toLowerCase().includes(queryLower) ||
          cours.details.unite.toLowerCase().includes(queryLower) ||
          cours.details.notesPersonnelles.toLowerCase().includes(queryLower) ||
          cours.details.activites.some(a => a.toLowerCase().includes(queryLower)) ||
          cours.details.objectifs.some(o => o.toLowerCase().includes(queryLower))
        );
      });
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
      return [];
    }
  }

  // ========== État de configuration ==========

  /**
   * Vérifie si l'emploi du temps a été configuré
   */
  async estConfigure(): Promise<boolean> {
    try {
      const value = await AsyncStorage.getItem(STORAGE_KEYS.EST_CONFIGURE);
      return value === 'true';
    } catch (error) {
      console.error('Erreur lors de la vérification de la configuration:', error);
      return false;
    }
  }

  /**
   * Marque l'emploi du temps comme configuré
   */
  async setEstConfigure(value: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.EST_CONFIGURE, value.toString());
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'état de configuration:', error);
      throw error;
    }
  }

  // ========== Gestion des données ==========

  /**
   * Récupère toutes les données de l'emploi du temps
   */
  async getAllData(): Promise<DonneesEmploiDuTemps> {
    try {
      const [configuration, coursGeneres, estConfigureValue] = await Promise.all([
        this.getConfiguration(),
        this.getCoursGeneres(),
        this.estConfigure(),
      ]);

      return {
        configuration,
        coursGeneres,
        estConfigure: estConfigureValue,
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des données:', error);
      return {
        configuration: null,
        coursGeneres: [],
        estConfigure: false,
      };
    }
  }

  /**
   * Efface toutes les données de l'emploi du temps
   */
  async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.CONFIGURATION,
        STORAGE_KEYS.COURS_GENERES,
        STORAGE_KEYS.EST_CONFIGURE,
      ]);
      console.log('Toutes les données de l\'emploi du temps ont été effacées');
    } catch (error) {
      console.error('Erreur lors de la suppression des données:', error);
      throw error;
    }
  }

  /**
   * Exporte les données pour sauvegarde
   */
  async exportData(): Promise<string> {
    try {
      const data = await this.getAllData();
      return JSON.stringify(data, null, 2);
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      throw error;
    }
  }

  /**
   * Importe les données depuis une sauvegarde
   */
  async importData(jsonData: string): Promise<void> {
    try {
      const data = JSON.parse(jsonData) as DonneesEmploiDuTemps;
      
      if (data.configuration) {
        await this.saveConfiguration(data.configuration);
      }
      
      if (data.coursGeneres && data.coursGeneres.length > 0) {
        await this.saveCoursGeneres(data.coursGeneres);
      }
      
      await this.setEstConfigure(data.estConfigure);
      
      console.log('Données importées avec succès');
    } catch (error) {
      console.error('Erreur lors de l\'import:', error);
      throw error;
    }
  }

  // ========== Statistiques ==========

  /**
   * Compte les cours par statut
   */
  async getStatistiques(): Promise<{
    total: number;
    aVenir: number;
    enCours: number;
    completes: number;
    annules: number;
    avecDetails: number;
  }> {
    try {
      const allCours = await this.getCoursGeneres();

      return {
        total: allCours.length,
        aVenir: allCours.filter(c => c.statut === 'a_venir').length,
        enCours: allCours.filter(c => c.statut === 'en_cours').length,
        completes: allCours.filter(c => c.statut === 'complete').length,
        annules: allCours.filter(c => c.statut === 'annule').length,
        avecDetails: allCours.filter(c =>
          c.details.theme ||
          c.details.activites.length > 0 ||
          c.details.objectifs.length > 0
        ).length,
      };
    } catch (error) {
      console.error('Erreur lors du calcul des statistiques:', error);
      return {
        total: 0,
        aVenir: 0,
        enCours: 0,
        completes: 0,
        annules: 0,
        avecDetails: 0,
      };
    }
  }

  // ========== Activités personnelles ==========

  /**
   * Sauvegarde toutes les activités personnelles
   */
  async saveActivites(activites: ActivitePersonnelle[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.ACTIVITES, JSON.stringify(activites));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des activités:', error);
      throw error;
    }
  }

  /**
   * Récupère toutes les activités personnelles
   */
  async getActivites(): Promise<ActivitePersonnelle[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.ACTIVITES);
      if (data) {
        return JSON.parse(data) as ActivitePersonnelle[];
      }
      return [];
    } catch (error) {
      console.error('Erreur lors de la récupération des activités:', error);
      return [];
    }
  }

  /**
   * Ajoute une nouvelle activité personnelle
   */
  async addActivite(activite: Omit<ActivitePersonnelle, 'id'>): Promise<ActivitePersonnelle> {
    try {
      const activites = await this.getActivites();
      const newActivite: ActivitePersonnelle = {
        ...activite,
        id: `activite_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      };
      activites.push(newActivite);
      await this.saveActivites(activites);
      return newActivite;
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'activité:', error);
      throw error;
    }
  }

  /**
   * Met à jour une activité personnelle
   */
  async updateActivite(id: string, updates: Partial<ActivitePersonnelle>): Promise<void> {
    try {
      const activites = await this.getActivites();
      const index = activites.findIndex(a => a.id === id);
      if (index !== -1) {
        activites[index] = {...activites[index], ...updates};
        await this.saveActivites(activites);
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'activité:', error);
      throw error;
    }
  }

  /**
   * Supprime une activité personnelle
   */
  async deleteActivite(id: string): Promise<void> {
    try {
      const activites = await this.getActivites();
      const filtered = activites.filter(a => a.id !== id);
      await this.saveActivites(filtered);
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'activité:', error);
      throw error;
    }
  }

  /**
   * Récupère les activités pour une date donnée
   */
  async getActivitesParDate(date: string): Promise<ActivitePersonnelle[]> {
    try {
      const activites = await this.getActivites();
      return activites.filter(a => a.date === date);
    } catch (error) {
      console.error('Erreur lors de la récupération des activités par date:', error);
      return [];
    }
  }

  /**
   * Marque une activité comme complète ou non
   */
  async toggleActiviteComplete(id: string): Promise<void> {
    try {
      const activites = await this.getActivites();
      const index = activites.findIndex(a => a.id === id);
      if (index !== -1) {
        activites[index].complete = !activites[index].complete;
        await this.saveActivites(activites);
      }
    } catch (error) {
      console.error('Erreur lors du toggle de l\'activité:', error);
      throw error;
    }
  }
}

export default new ScheduleStorageService();
