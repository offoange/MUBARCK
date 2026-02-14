/**
 * Service de gestion des notifications locales pour les rappels
 * Utilise expo-notifications pour les vraies notifications
 */

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import {Platform, Alert} from 'react-native';

// Configuration des notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
}),
});

// Types pour les rappels avec notifications
export interface ReminderNotification {
  id: string;
  title: string;
  body: string;
  hour: number;
  minute: number;
  repeatType?: 'daily' | 'hourly' | 'weekly' | 'none';
  repeatInterval?: number;
  isEnabled: boolean;
  notificationId?: string;
}

class NotificationService {
  private isInitialized: boolean = false;

  /**
   * Initialise le service de notifications et demande les permissions
   */
  async initialize(): Promise<boolean> {
    if (this.isInitialized) {
      return true;
    }

    try {
      // Vérifier si c'est un appareil physique
      if (!Device.isDevice) {
        console.log('Les notifications ne fonctionnent que sur un appareil physique');
        return false;
      }

      // Demander les permissions
      const {status: existingStatus} = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const {status} = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        Alert.alert(
          'Permissions requises',
          'Veuillez autoriser les notifications pour recevoir vos rappels.'
        );
        return false;
      }

      // Configuration spécifique Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('reminders', {
          name: 'Rappels',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#6c2bee',
          sound: 'default',
        });
      }

      this.isInitialized = true;
      console.log('Service de notifications initialisé avec succès');
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'initialisation des notifications:', error);
      return false;
    }
  }

  /**
   * Programme une notification quotidienne à une heure spécifique
   */
  async scheduleDaily(reminder: ReminderNotification): Promise<string | null> {
    try {
      await this.initialize();

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: reminder.title,
          body: reminder.body,
          sound: 'default',
          priority: Notifications.AndroidNotificationPriority.HIGH,
          data: {reminderId: reminder.id},
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: reminder.hour,
          minute: reminder.minute,
          channelId: 'reminders',
        },
      });

      console.log(`Notification quotidienne programmée: ${notificationId} à ${reminder.hour}:${reminder.minute}`);
      return notificationId;
    } catch (error) {
      console.error('Erreur lors de la programmation de la notification quotidienne:', error);
      return null;
    }
  }

  /**
   * Programme une notification avec répétition horaire
   */
  async scheduleHourlyRepeat(reminder: ReminderNotification): Promise<string | null> {
    try {
      await this.initialize();

      const intervalHours = reminder.repeatInterval || 2;
      const intervalSeconds = intervalHours * 60 * 60;

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: reminder.title,
          body: reminder.body,
          sound: 'default',
          priority: Notifications.AndroidNotificationPriority.HIGH,
          data: {reminderId: reminder.id},
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: intervalSeconds,
          repeats: true,
          channelId: 'reminders',
        },
      });

      console.log(`Notification horaire programmée: ${notificationId} toutes les ${intervalHours}h`);
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
      await this.initialize();

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: reminder.title,
          body: reminder.body,
          sound: 'default',
          priority: Notifications.AndroidNotificationPriority.HIGH,
          data: {reminderId: reminder.id},
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: date,
          channelId: 'reminders',
        },
      });

      console.log(`Notification unique programmée: ${notificationId} pour ${date.toLocaleString()}`);
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
      await Notifications.cancelScheduledNotificationAsync(notificationId);
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
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('Toutes les notifications ont été annulées');
    } catch (error) {
      console.error('Erreur lors de l\'annulation des notifications:', error);
    }
  }

  /**
   * Récupère toutes les notifications programmées
   */
  async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Erreur lors de la récupération des notifications:', error);
      return [];
    }
  }

  /**
   * Envoie une notification immédiate (pour les tests)
   */
  async sendImmediateNotification(title: string, body: string): Promise<void> {
    try {
      await this.initialize();

      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: 'default',
        },
        trigger: null, // null = immédiat
      });
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la notification immédiate:', error);
      Alert.alert(title, body);
    }
  }

  /**
   * Programme une notification de test dans X secondes
   */
  async scheduleTestNotification(seconds: number = 10): Promise<string | null> {
    try {
      await this.initialize();

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '🔔 Test de notification',
          body: `Cette notification a été programmée il y a ${seconds} secondes.`,
          sound: 'default',
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: seconds,
          repeats: false,
          channelId: 'reminders',
        },
      });

      console.log(`Notification de test programmée dans ${seconds}s: ${notificationId}`);
      Alert.alert(
        'Test programmé',
        `Une notification apparaîtra dans ${seconds} secondes. Vous pouvez fermer l'app pour tester.`
      );
      return notificationId;
    } catch (error) {
      console.error('Erreur lors de la programmation de la notification de test:', error);
      Alert.alert('Erreur', 'Impossible de programmer la notification de test.');
      return null;
    }
  }

  /**
   * Ajoute un listener pour les notifications reçues
   */
  addNotificationReceivedListener(
    callback: (notification: Notifications.Notification) => void
  ): Notifications.Subscription {
    return Notifications.addNotificationReceivedListener(callback);
  }

  /**
   * Ajoute un listener pour les réponses aux notifications (quand l'utilisateur clique)
   */
  addNotificationResponseListener(
    callback: (response: Notifications.NotificationResponse) => void
  ): Notifications.Subscription {
    return Notifications.addNotificationResponseReceivedListener(callback);
  }
}

export default new NotificationService();
