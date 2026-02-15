import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import ReminderItem from '../components/ReminderItem';
import FilterTab from '../components/FilterTab';
import ProgressCard from '../components/ProgressCard';
import BottomNavigation from '../components/BottomNavigation';
import LocalStorageService from '../services/LocalStorageService';
import NotificationService from '../services/NotificationService';
import AddReminderModal, {NewReminder} from '../components/AddReminderModal';

const COLORS = {
  primary: '#6c2bee',
  background: '#161022',
  card: '#1d172a',
  sky: '#38bdf8',
  orange: '#fb923c',
  pink: '#f472b6',
  purple: '#a855f7',
  textPrimary: '#ffffff',
  textSecondary: '#94a3b8',
};

interface Reminder {
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
  repeatInterval?: number;
  notificationId?: string;
}

const FILTERS = ['Tout', 'Études', 'Santé', 'Bien-être'];

const INITIAL_REMINDERS: Reminder[] = [
  {
    id: '1',
    icon: 'water-drop',
    iconColor: '#fff',
    iconBgColor: COLORS.sky,
    title: 'Boire un verre d\'eau',
    subtitle: 'Toutes les 2h',
    isEnabled: true,
    category: 'Santé',
    repeatType: 'hourly',
    repeatInterval: 2,
  },
  {
    id: '2',
    icon: 'timer',
    iconColor: '#fff',
    iconBgColor: COLORS.orange,
    title: 'Pause Pomodoro',
    subtitle: '10:30 • 25 min focus',
    isEnabled: false,
    category: 'Études',
    hour: 10,
    minute: 30,
    repeatType: 'daily',
  },
  {
    id: '3',
    icon: 'self-improvement',
    iconColor: '#fff',
    iconBgColor: COLORS.pink,
    title: 'Respiration profonde',
    subtitle: '20:00 • 5 min',
    isEnabled: false,
    category: 'Bien-être',
    hour: 20,
    minute: 0,
    repeatType: 'daily',
  },
  {
    id: '4',
    icon: 'phonelink-off',
    iconColor: '#fff',
    iconBgColor: COLORS.purple,
    title: 'Déconnexion écrans',
    subtitle: '23:00 • Sommeil',
    isEnabled: false,
    category: 'Bien-être',
    hour: 23,
    minute: 0,
    repeatType: 'daily',
  },
];

interface RappelsScreenProps {
  activeTab?: string;
  onTabPress?: (tab: string) => void;
}

// Fonction pour formater la date réelle du téléphone
const formatCurrentDate = (): string => {
  const now = new Date();
  const jours = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  const mois = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
  return `${jours[now.getDay()]} ${now.getDate()} ${mois[now.getMonth()]}`;
};

export default function RappelsScreen({
  activeTab = 'reminders',
  onTabPress,
}: RappelsScreenProps) {
  const [activeFilter, setActiveFilter] = useState('Tout');
  const [reminders, setReminders] = useState<Reminder[]>(INITIAL_REMINDERS);
  const [showAddModal, setShowAddModal] = useState(false);
  const currentDate = formatCurrentDate();

  // Charger les rappels au démarrage
  useEffect(() => {
    const loadReminders = async () => {
      try {
        // Charger les rappels sauvegardés
        const savedReminders = await LocalStorageService.getReminders();
        if (savedReminders && savedReminders.length > 0) {
          setReminders(savedReminders);
        } else {
          // Si aucun rappel n'est sauvegardé, utiliser les rappels initiaux et les sauvegarder
          await LocalStorageService.saveReminders(INITIAL_REMINDERS);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des rappels:', error);
        Alert.alert('Erreur', 'Impossible de charger vos rappels.');
      }
    };

    loadReminders();
  }, []);

  // Rafraîchir les rappels quand on revient sur cet écran
  useEffect(() => {
    const refreshReminders = async () => {
      if (activeTab === 'reminders') {
        try {
          const savedReminders = await LocalStorageService.getReminders();
          if (savedReminders && savedReminders.length > 0) {
            setReminders(savedReminders);
          }
        } catch (error) {
          console.error('Erreur lors du rafraîchissement des rappels:', error);
        }
      }
    };

    refreshReminders();
  }, [activeTab]);

  const toggleReminder = async (id: string, value: boolean) => {
    try {
      const reminder = reminders.find(r => r.id === id);
      if (!reminder) return;

      let notificationId = reminder.notificationId;

      if (value) {
        // Activer la notification
        const notifData = {
          id: reminder.id,
          title: reminder.title,
          body: `C'est l'heure: ${reminder.title}`,
          hour: reminder.hour || 0,
          minute: reminder.minute || 0,
          repeatType: reminder.repeatType,
          repeatInterval: reminder.repeatInterval,
          isEnabled: true,
        };

        if (reminder.repeatType === 'hourly') {
          notificationId = await NotificationService.scheduleHourlyRepeat(notifData) || undefined;
          Alert.alert(
            'Rappel activé',
            `Vous recevrez une notification toutes les ${reminder.repeatInterval || 2} heures.`
          );
        } else if (reminder.repeatType === 'daily' && reminder.hour !== undefined) {
          notificationId = await NotificationService.scheduleDaily(notifData) || undefined;
          const timeStr = `${String(reminder.hour).padStart(2, '0')}:${String(reminder.minute || 0).padStart(2, '0')}`;
          
          // Vérifier si la notification sera aujourd'hui ou demain
          const now = new Date();
          const targetToday = new Date();
          targetToday.setHours(reminder.hour, reminder.minute || 0, 0, 0);
          
          const isToday = targetToday > now;
          const dayText = isToday ? "aujourd'hui" : 'demain';
          
          Alert.alert(
            'Rappel activé',
            `Prochaine notification ${dayText} à ${timeStr}, puis tous les jours.`
          );
        }
      } else {
        // Désactiver la notification
        if (reminder.notificationId) {
          await NotificationService.cancelNotification(reminder.notificationId);
          notificationId = undefined;
        }
      }

      const updatedReminders = reminders.map(r =>
        r.id === id ? {...r, isEnabled: value, notificationId} : r,
      );

      setReminders(updatedReminders);

      // Sauvegarder les rappels mis à jour
      await LocalStorageService.saveReminders(updatedReminders);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du rappel:', error);
      Alert.alert('Erreur', 'Impossible de sauvegarder les modifications.');
    }
  };

  const filteredReminders = reminders.filter(reminder => {
    if (activeFilter === 'Tout') {
      return true;
    }
    return reminder.category === activeFilter;
  });

  // Séparer les rappels par période (matin: avant 14h, soir: après 14h)
  const morningReminders = filteredReminders.filter(r => {
    if (r.hour !== undefined) {
      return r.hour < 14;
    }
    // Pour les rappels horaires ou sans heure définie, les mettre dans "matin"
    return r.repeatType === 'hourly' || ['1', '2'].includes(r.id);
  });

  const eveningReminders = filteredReminders.filter(r => {
    if (r.hour !== undefined) {
      return r.hour >= 14;
    }
    // Pour les rappels avec IDs fixes du soir
    return ['3', '4'].includes(r.id);
  });

  const completedCount = reminders.filter(r => r.isEnabled).length;
  const progress = Math.round((completedCount / reminders.length) * 100);

  // Fonction pour ajouter un nouveau rappel
  const handleAddReminder = async (newReminderData: NewReminder) => {
    try {
      // Générer un ID unique
      const newId = `reminder_${Date.now()}`;

      // Déterminer la couleur de fond de l'icône selon la catégorie
      const categoryColors: {[key: string]: string} = {
        'Santé': COLORS.sky,
        'Études': COLORS.orange,
        'Bien-être': COLORS.purple,
      };

      // Créer le sous-titre
      let subtitle = '';
      if (newReminderData.repeatType === 'hourly') {
        subtitle = `Toutes les ${newReminderData.repeatInterval || 2}h`;
      } else if (newReminderData.repeatType === 'daily') {
        const hourStr = String(newReminderData.hour).padStart(2, '0');
        const minStr = String(newReminderData.minute).padStart(2, '0');
        subtitle = `${hourStr}:${minStr} • Tous les jours`;
      } else {
        const hourStr = String(newReminderData.hour).padStart(2, '0');
        const minStr = String(newReminderData.minute).padStart(2, '0');
        subtitle = `${hourStr}:${minStr}`;
      }

      const newReminder: Reminder = {
        id: newId,
        icon: newReminderData.icon,
        iconColor: '#fff',
        iconBgColor: categoryColors[newReminderData.category] || COLORS.primary,
        title: newReminderData.title,
        subtitle,
        isEnabled: false,
        category: newReminderData.category,
        hour: newReminderData.hour,
        minute: newReminderData.minute,
        repeatType: newReminderData.repeatType,
        repeatInterval: newReminderData.repeatInterval,
      };

      const updatedReminders = [...reminders, newReminder];
      setReminders(updatedReminders);
      await LocalStorageService.saveReminders(updatedReminders);

      Alert.alert('Succès', 'Rappel ajouté avec succès !');
    } catch (error) {
      console.error('Erreur lors de l\'ajout du rappel:', error);
      Alert.alert('Erreur', 'Impossible d\'ajouter le rappel.');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Rappels</Text>
          <Text style={styles.headerSubtitle}>{currentDate}</Text>
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.testButton}
            onPress={async () => {
              await NotificationService.scheduleTestNotification(10);
            }}>
            <MaterialIcons name="notifications-active" size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.addButton} onPress={() => setShowAddModal(true)}>
            <MaterialIcons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Filter Tabs */}
        <FilterTab
          filters={FILTERS}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
        />

        {/* Morning Habits Section */}
        {morningReminders.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Habitudes du matin</Text>
            {morningReminders.map(reminder => (
              <ReminderItem
                key={reminder.id}
                icon={reminder.icon}
                iconColor={reminder.iconColor}
                iconBgColor={reminder.iconBgColor}
                title={reminder.title}
                subtitle={reminder.subtitle}
                isEnabled={reminder.isEnabled}
                onToggle={value => toggleReminder(reminder.id, value)}
              />
            ))}
          </View>
        )}

        {/* Evening Section */}
        {eveningReminders.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Soirée & Détente</Text>
            {eveningReminders.map(reminder => (
              <ReminderItem
                key={reminder.id}
                icon={reminder.icon}
                iconColor={reminder.iconColor}
                iconBgColor={reminder.iconBgColor}
                title={reminder.title}
                subtitle={reminder.subtitle}
                isEnabled={reminder.isEnabled}
                onToggle={value => toggleReminder(reminder.id, value)}
              />
            ))}
          </View>
        )}

        {/* Progress Card */}
        <ProgressCard
          title="Continuez comme ça !"
          subtitle={`Vous avez complété ${progress}% de vos habitudes aujourd'hui.`}
          progress={progress}
        />

        {/* Bottom spacing for navigation */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNavigation
        activeTab={activeTab}
        onTabPress={onTabPress}
        onAddPress={() => setShowAddModal(true)}
      />

      {/* Modal pour ajouter un rappel */}
      <AddReminderModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleAddReminder}
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
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  testButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.orange,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 20,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  bottomSpacer: {
    height: 100,
  },
});
