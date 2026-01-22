/**
 * Service de gestion des notifications locales pour les rappels
 * Version simplifiée qui simule les notifications sans dépendance à expo-notifications
 */

import {Alert} from 'react-native';

// Types pour les rappels avec notifications
export interface ReminderNotification {
  id: string;
  title: string;
  body: string;
  hour: number;
  minute: number;
  repeatType?: 'daily' | 'hourly' | 'weekly' | 'none';
  repeatInterval?: number; // Pour les répétitions horaires (ex: toutes les 2h)
  isEnabled: boolean;
  notificationId?: string; // ID de la notification programmée
}

/**
 * Service de notification simplifié qui simule les notifications
 * Cette version n'utilise pas expo-notifications pour éviter les erreurs de compatibilité
 */
class NotificationService {
  // Stockage des notifications programmées
  private scheduledNotifications: Map<string, ReminderNotification> = new Map();
  
  /**
   * Vérifie si les notifications sont disponibles (toujours true dans cette version simplifiée)
   */
  isAvailable(): boolean {
    return true;
  }

  /**
   * Simule la demande de permissions (toujours réussie dans cette version simplifiée)
   */
  async requestPermissions(): Promise<boolean> {
    return true;
  }

  /**
   * Programme une notification quotidienne à une heure spécifique
   */
  async scheduleDaily(reminder: ReminderNotification): Promise<string | null> {
    try {
      // Générer un ID unique pour la notification
      const notificationId = `daily_${reminder.id}_${Date.now()}`;
      
      // Stocker la notification programmée
      this.scheduledNotifications.set(notificationId, {
        ...reminder,
        notificationId
      });
      
      // Afficher un message de confirmation
      console.log(`Notification quotidienne programmée pour ${reminder.hour}:${reminder.minute}`);
      
      return notificationId;
    } catch (error) {
      console.error('Erreur lors de la programmation de la notification:', error);
      return null;
    }
  }

  /**
   * Programme une notification avec répétition horaire
   */
  async scheduleHourlyRepeat(reminder: ReminderNotification): Promise<string | null> {
    try {
      // Générer un ID unique pour la notification
      const notificationId = `hourly_${reminder.id}_${Date.now()}`;
      
      // Stocker la notification programmée
      this.scheduledNotifications.set(notificationId, {
        ...reminder,
        notificationId
      });
      
      // Afficher un message de confirmation
      console.log(`Notification programmée toutes les ${reminder.repeatInterval || 2} heures`);
      
      return notificationId;
    } catch (error) {
      console.error('Erreur lors de la programmation de la notification horaire:', error);
      return null;
    }
  }

  /**
   * Programme une notification unique à une date/heure spécifique
   */
  async scheduleOnce(reminder: ReminderNotification, date: Date): Promise<string | null> {
    try {
      // Générer un ID unique pour la notification
      const notificationId = `once_${reminder.id}_${Date.now()}`;
      
      // Stocker la notification programmée
      this.scheduledNotifications.set(notificationId, {
        ...reminder,
        notificationId
      });
      
      // Afficher un message de confirmation
      console.log(`Notification unique programmée pour ${date.toLocaleString()}`);
      
      return notificationId;
    } catch (error) {
      console.error('Erreur lors de la programmation de la notification unique:', error);
      return null;
    }
  }

  /**
   * Annule une notification programmée
   */
  async cancelNotification(notificationId: string): Promise<void> {
    try {
      // Supprimer la notification programmée
      this.scheduledNotifications.delete(notificationId);
      console.log(`Notification annulée: ${notificationId}`);
    } catch (error) {
      console.error('Erreur lors de l\'annulation de la notification:', error);
    }
  }

  /**
   * Annule toutes les notifications programmées
   */
  async cancelAllNotifications(): Promise<void> {
    try {
      // Supprimer toutes les notifications programmées
      this.scheduledNotifications.clear();
      console.log('Toutes les notifications ont été annulées');
    } catch (error) {
      console.error('Erreur lors de l\'annulation des notifications:', error);
    }
  }

  /**
   * Récupère toutes les notifications programmées
   */
  async getScheduledNotifications(): Promise<ReminderNotification[]> {
    return Array.from(this.scheduledNotifications.values());
  }

  /**
   * Envoie une notification immédiate (pour les tests)
   */
  async sendImmediateNotification(title: string, body: string): Promise<void> {
    // Simuler une notification avec une alerte
    Alert.alert(title, body);
  }

  /**
   * Calcule la prochaine occurrence d'une heure donnée
   */
  getNextOccurrence(hour: number, minute: number): Date {
    const now = new Date();
    const next = new Date();
    next.setHours(hour, minute, 0, 0);

    // Si l'heure est déjà passée aujourd'hui, programmer pour demain
    if (next <= now) {
      next.setDate(next.getDate() + 1);
    }

    return next;
  }
}

export default new NotificationService();
