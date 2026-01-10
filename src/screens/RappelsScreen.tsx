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
}

const FILTERS = ['Tout', 'Études', 'Santé', 'Bien-être'];

const INITIAL_REMINDERS: Reminder[] = [
  {
    id: '1',
    icon: 'water-drop',
    iconColor: '#fff',
    iconBgColor: COLORS.sky,
    title: 'Boire un verre d\'eau',
    subtitle: 'Toutes les 2h • Prochain à 10:00',
    isEnabled: true,
    category: 'Santé',
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
  },
];

interface RappelsScreenProps {
  activeTab?: string;
  onTabPress?: (tab: string) => void;
}

export default function RappelsScreen({
  activeTab = 'reminders',
  onTabPress,
}: RappelsScreenProps) {
  const [activeFilter, setActiveFilter] = useState('Tout');
  const [reminders, setReminders] = useState<Reminder[]>(INITIAL_REMINDERS);

  // Charger les rappels depuis le stockage au démarrage
  useEffect(() => {
    const loadReminders = async () => {
      try {
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

  const toggleReminder = async (id: string, value: boolean) => {
    try {
      const updatedReminders = reminders.map(reminder =>
        reminder.id === id ? {...reminder, isEnabled: value} : reminder,
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

  const morningReminders = filteredReminders.filter(r =>
    ['1', '2'].includes(r.id),
  );
  const eveningReminders = filteredReminders.filter(r =>
    ['3', '4'].includes(r.id),
  );

  const completedCount = reminders.filter(r => r.isEnabled).length;
  const progress = Math.round((completedCount / reminders.length) * 100);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Rappels</Text>
          <Text style={styles.headerSubtitle}>Mercredi 24 Octobre</Text>
        </View>
        <TouchableOpacity style={styles.addButton}>
          <MaterialIcons name="add" size={24} color="#fff" />
        </TouchableOpacity>
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
        onAddPress={() => console.log('Add pressed')}
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
