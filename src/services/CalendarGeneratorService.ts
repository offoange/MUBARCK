/**
 * Service de génération automatique du calendrier des cours
 * Génère tous les cours de l'année à partir de l'emploi du temps de base
 */

import {
  ConfigurationEmploiDuTemps,
  CoursGenere,
  EmploiDuTempsBase,
  JourSemaine,
  JourCours,
  PeriodeVacances,
  DETAILS_COURS_DEFAUT,
  CoursBase,
} from '../types/schedule';

// Mapping des jours de la semaine (cours uniquement lundi-vendredi)
const JOUR_INDEX: Record<number, JourCours> = {
  1: 'lundi',
  2: 'mardi',
  3: 'mercredi',
  4: 'jeudi',
  5: 'vendredi',
};

// Mapping complet pour l'affichage (tous les jours)
const JOUR_INDEX_COMPLET: Record<number, JourSemaine> = {
  0: 'dimanche',
  1: 'lundi',
  2: 'mardi',
  3: 'mercredi',
  4: 'jeudi',
  5: 'vendredi',
  6: 'samedi',
};

const JOUR_NAMES_FR: Record<JourSemaine, string> = {
  lundi: 'Lundi',
  mardi: 'Mardi',
  mercredi: 'Mercredi',
  jeudi: 'Jeudi',
  vendredi: 'Vendredi',
  samedi: 'Samedi',
  dimanche: 'Dimanche',
};

class CalendarGeneratorService {
  /**
   * Génère tous les cours pour l'année scolaire
   */
  genererCoursAnnee(config: ConfigurationEmploiDuTemps): CoursGenere[] {
    const { emploiDuTempsBase, periodeAnnee, vacances } = config;
    const coursGeneres: CoursGenere[] = [];

    const dateDebut = new Date(periodeAnnee.dateDebut);
    const dateFin = new Date(periodeAnnee.dateFin);

    // Parcourir chaque jour de la période
    let currentDate = new Date(dateDebut);

    while (currentDate <= dateFin) {
      const jourSemaine = currentDate.getDay();

      // Ignorer les weekends (samedi = 6, dimanche = 0)
      if (jourSemaine >= 1 && jourSemaine <= 5) {
        const dateStr = this.formatDate(currentDate);

        // Vérifier si ce n'est pas une période de vacances
        if (!this.estEnVacances(dateStr, vacances)) {
          const jour = JOUR_INDEX[jourSemaine] as keyof EmploiDuTempsBase;
          const coursJour = emploiDuTempsBase[jour];

          // Générer les cours pour ce jour
          coursJour.forEach(coursBase => {
            const coursGenere = this.creerCoursGenere(
              coursBase,
              dateStr,
              jour
            );
            coursGeneres.push(coursGenere);
          });
        }
      }

      // Passer au jour suivant
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return coursGeneres;
  }

  /**
   * Génère les cours pour une semaine spécifique
   */
  genererCoursSemaine(
    emploiDuTempsBase: EmploiDuTempsBase,
    dateDebutSemaine: string,
    vacances: PeriodeVacances[] = []
  ): CoursGenere[] {
    const coursGeneres: CoursGenere[] = [];
    const debut = new Date(dateDebutSemaine);

    // Parcourir les 5 jours de la semaine (lundi à vendredi)
    for (let i = 0; i < 5; i++) {
      const currentDate = new Date(debut);
      currentDate.setDate(debut.getDate() + i);
      const dateStr = this.formatDate(currentDate);

      if (!this.estEnVacances(dateStr, vacances)) {
        const jour = JOUR_INDEX[i + 1] as keyof EmploiDuTempsBase;
        const coursJour = emploiDuTempsBase[jour];

        coursJour.forEach(coursBase => {
          const coursGenere = this.creerCoursGenere(coursBase, dateStr, jour);
          coursGeneres.push(coursGenere);
        });
      }
    }

    return coursGeneres;
  }

  /**
   * Crée un cours généré à partir d'un cours de base
   */
  private creerCoursGenere(
    coursBase: CoursBase,
    date: string,
    jour: JourSemaine
  ): CoursGenere {
    const id = `cours_${date.replace(/-/g, '')}_${coursBase.heureDebut.replace(':', '')}_${coursBase.id}`;

    return {
      id,
      date,
      jour,
      heureDebut: coursBase.heureDebut,
      heureFin: coursBase.heureFin,
      matiere: coursBase.matiere,
      salle: coursBase.salle,
      couleur: coursBase.couleur,
      details: { ...DETAILS_COURS_DEFAUT },
      statut: 'a_venir',
      coursBaseId: coursBase.id,
    };
  }

  /**
   * Vérifie si une date est en période de vacances
   */
  private estEnVacances(date: string, vacances: PeriodeVacances[]): boolean {
    const dateObj = new Date(date);

    return vacances.some(periode => {
      const debut = new Date(periode.debut);
      const fin = new Date(periode.fin);
      return dateObj >= debut && dateObj <= fin;
    });
  }

  /**
   * Formate une date en string YYYY-MM-DD
   */
  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Parse une date string en objet Date
   */
  parseDate(dateStr: string): Date {
    return new Date(dateStr);
  }

  /**
   * Obtient le lundi de la semaine pour une date donnée
   */
  getLundiDeSemaine(date: Date): Date {
    const d = new Date(date);
    const jour = d.getDay();
    const diff = d.getDate() - jour + (jour === 0 ? -6 : 1);
    d.setDate(diff);
    return d;
  }

  /**
   * Obtient le vendredi de la semaine pour une date donnée
   */
  getVendrediDeSemaine(date: Date): Date {
    const lundi = this.getLundiDeSemaine(date);
    const vendredi = new Date(lundi);
    vendredi.setDate(lundi.getDate() + 4);
    return vendredi;
  }

  /**
   * Obtient les dates de la semaine (lundi à dimanche - 7 jours)
   */
  getDatesSemaine(date: Date): string[] {
    const lundi = this.getLundiDeSemaine(date);
    const dates: string[] = [];

    for (let i = 0; i < 7; i++) {
      const d = new Date(lundi);
      d.setDate(lundi.getDate() + i);
      dates.push(this.formatDate(d));
    }

    return dates;
  }

  /**
   * Obtient le jour de la semaine à partir d'une date
   */
  getJourSemaine(date: Date): JourSemaine {
    return JOUR_INDEX_COMPLET[date.getDay()];
  }

  /**
   * Obtient le numéro de la semaine de l'année
   */
  getNumeroSemaine(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  }

  /**
   * Formate une date pour affichage (ex: "Lun. 12 Jan")
   */
  formatDateAffichage(dateStr: string): string {
    const date = new Date(dateStr);
    const jours = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    const mois = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];

    const jour = jours[date.getDay()];
    const numero = date.getDate();
    const moisNom = mois[date.getMonth()];

    return `${jour}. ${numero} ${moisNom}`;
  }

  /**
   * Formate une date complète (ex: "Lundi 12 Janvier 2026")
   */
  formatDateComplete(dateStr: string): string {
    const date = new Date(dateStr);
    const jours = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    const mois = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

    const jour = jours[date.getDay()];
    const numero = date.getDate();
    const moisNom = mois[date.getMonth()];
    const annee = date.getFullYear();

    return `${jour} ${numero} ${moisNom} ${annee}`;
  }

  /**
   * Obtient le nom du jour en français
   */
  getNomJour(jour: JourSemaine): string {
    return JOUR_NAMES_FR[jour];
  }

  /**
   * Calcule la durée d'un cours en minutes
   */
  calculerDureeMinutes(heureDebut: string, heureFin: string): number {
    const [debutH, debutM] = heureDebut.split(':').map(Number);
    const [finH, finM] = heureFin.split(':').map(Number);

    const debutMinutes = debutH * 60 + debutM;
    const finMinutes = finH * 60 + finM;

    return finMinutes - debutMinutes;
  }

  /**
   * Formate la durée (ex: "1h30")
   */
  formatDuree(minutes: number): string {
    const heures = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (heures === 0) {
      return `${mins}min`;
    } else if (mins === 0) {
      return `${heures}h`;
    } else {
      return `${heures}h${mins.toString().padStart(2, '0')}`;
    }
  }

  /**
   * Vérifie si un cours est en cours actuellement
   */
  estEnCours(cours: CoursGenere): boolean {
    const now = new Date();
    const today = this.formatDate(now);

    if (cours.date !== today) {
      return false;
    }

    const heureActuelle = now.getHours() * 60 + now.getMinutes();
    const [debutH, debutM] = cours.heureDebut.split(':').map(Number);
    const [finH, finM] = cours.heureFin.split(':').map(Number);

    const debut = debutH * 60 + debutM;
    const fin = finH * 60 + finM;

    return heureActuelle >= debut && heureActuelle < fin;
  }

  /**
   * Vérifie si un cours est passé
   */
  estPasse(cours: CoursGenere): boolean {
    const now = new Date();
    const today = this.formatDate(now);
    const coursDate = new Date(cours.date);

    if (coursDate < new Date(today)) {
      return true;
    }

    if (cours.date === today) {
      const heureActuelle = now.getHours() * 60 + now.getMinutes();
      const [finH, finM] = cours.heureFin.split(':').map(Number);
      const fin = finH * 60 + finM;
      return heureActuelle >= fin;
    }

    return false;
  }

  /**
   * Met à jour les statuts des cours en fonction de l'heure actuelle
   */
  mettreAJourStatuts(cours: CoursGenere[]): CoursGenere[] {
    return cours.map(c => {
      if (c.statut === 'annule') {
        return c;
      }

      if (this.estEnCours(c)) {
        return { ...c, statut: 'en_cours' };
      } else if (this.estPasse(c)) {
        return { ...c, statut: c.statut === 'en_cours' ? 'complete' : c.statut };
      }

      return c;
    });
  }

  /**
   * Groupe les cours par date
   */
  grouperParDate(cours: CoursGenere[]): Record<string, CoursGenere[]> {
    return cours.reduce((acc, c) => {
      if (!acc[c.date]) {
        acc[c.date] = [];
      }
      acc[c.date].push(c);
      return acc;
    }, {} as Record<string, CoursGenere[]>);
  }

  /**
   * Trie les cours par heure de début
   */
  trierParHeure(cours: CoursGenere[]): CoursGenere[] {
    return [...cours].sort((a, b) => {
      const [aH, aM] = a.heureDebut.split(':').map(Number);
      const [bH, bM] = b.heureDebut.split(':').map(Number);
      return (aH * 60 + aM) - (bH * 60 + bM);
    });
  }

  /**
   * Obtient les cours à venir pour aujourd'hui
   */
  getCoursAujourdhuiAVenir(cours: CoursGenere[]): CoursGenere[] {
    const today = this.formatDate(new Date());
    const now = new Date();
    const heureActuelle = now.getHours() * 60 + now.getMinutes();

    return cours
      .filter(c => {
        if (c.date !== today || c.statut === 'annule') {
          return false;
        }
        const [debutH, debutM] = c.heureDebut.split(':').map(Number);
        const debut = debutH * 60 + debutM;
        return debut > heureActuelle;
      })
      .sort((a, b) => {
        const [aH, aM] = a.heureDebut.split(':').map(Number);
        const [bH, bM] = b.heureDebut.split(':').map(Number);
        return (aH * 60 + aM) - (bH * 60 + bM);
      });
  }

  /**
   * Obtient le prochain cours
   */
  getProchainCours(cours: CoursGenere[]): CoursGenere | null {
    const now = new Date();
    const today = this.formatDate(now);
    const heureActuelle = now.getHours() * 60 + now.getMinutes();

    const coursFuturs = cours
      .filter(c => {
        if (c.statut === 'annule') {
          return false;
        }
        if (c.date > today) {
          return true;
        }
        if (c.date === today) {
          const [debutH, debutM] = c.heureDebut.split(':').map(Number);
          const debut = debutH * 60 + debutM;
          return debut > heureActuelle;
        }
        return false;
      })
      .sort((a, b) => {
        if (a.date !== b.date) {
          return a.date.localeCompare(b.date);
        }
        const [aH, aM] = a.heureDebut.split(':').map(Number);
        const [bH, bM] = b.heureDebut.split(':').map(Number);
        return (aH * 60 + aM) - (bH * 60 + bM);
      });

    return coursFuturs[0] || null;
  }
}

export default new CalendarGeneratorService();
