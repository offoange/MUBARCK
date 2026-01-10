import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Image,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import DaySelector from '../components/DaySelector';
import BalanceCard from '../components/BalanceCard';
import TimelineItem from '../components/TimelineItem';
import BottomNavigation from '../components/BottomNavigation';
import LocalStorageService, {ScheduleItem as ScheduleItemType, UserProfile} from '../services/LocalStorageService';

const COLORS = {
  primary: '#6c2bee',
  background: '#161022',
  card: '#1d172a',
  cardDark: '#2a2438',
  rose: '#be185d',
  textPrimary: '#ffffff',
  textSecondary: '#94a3b8',
};

const DAYS = [
  {dayName: 'Mer', dayNumber: 14, isSelected: true},
  {dayName: 'Jeu', dayNumber: 15, isSelected: false},
  {dayName: 'Ven', dayNumber: 16, isSelected: false},
  {dayName: 'Sam', dayNumber: 17, isSelected: false},
  {dayName: 'Dim', dayNumber: 18, isSelected: false},
  {dayName: 'Lun', dayNumber: 19, isSelected: false},
];

const INITIAL_SCHEDULE_ITEMS: ScheduleItemType[] = [
  {
    id: '1',
    time: '09:00',
    icon: 'calculate',
    title: 'Mathématiques',
    subtitle: 'Chapitre 4: Algèbre',
    timeRange: '09:00 - 10:30',
    backgroundColor: COLORS.primary,
    iconBgColor: 'rgba(255,255,255,0.2)',
  },
  {
    id: '2',
    time: '10:30',
    icon: 'coffee',
    title: 'Pause Café',
    subtitle: 'Recharge mentale',
    timeRange: '10:30 - 11:00',
    backgroundColor: COLORS.cardDark,
    iconBgColor: '#78716c',
  },
  {
    id: '3',
    time: '11:00',
    icon: 'menu-book',
    title: 'Histoire',
    subtitle: 'Révisions Guerre Froide',
    timeRange: '11:00 - 12:30',
    backgroundColor: COLORS.cardDark,
    iconBgColor: COLORS.primary,
  },
  {
    id: '4',
    time: '13:00',
    icon: 'restaurant',
    title: 'Déjeuner & Détente',
    subtitle: 'Repas sain et calme',
    timeRange: '13:00 - 14:00',
    backgroundColor: '#4a1d3d',
    iconBgColor: COLORS.rose,
  },
];

interface PlanningScreenProps {
  activeTab?: string;
  onTabPress?: (tab: string) => void;
}

export default function PlanningScreen({
  activeTab = 'schedule',
  onTabPress,
}: PlanningScreenProps) {
  const [days, setDays] = useState(DAYS);
  const [scheduleItems, setScheduleItems] = useState<ScheduleItemType[]>(INITIAL_SCHEDULE_ITEMS);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // Charger les données du planning et du profil utilisateur au démarrage
  useEffect(() => {
    const loadData = async () => {
      try {
        // Charger le profil utilisateur
        const savedProfile = await LocalStorageService.getUserProfile();
        if (savedProfile) {
          setUserProfile(savedProfile);
        }

        // Charger le planning
        const savedSchedule = await LocalStorageService.getSchedule();
        if (savedSchedule && savedSchedule.length > 0) {
          setScheduleItems(savedSchedule);
        } else {
          await LocalStorageService.saveSchedule(INITIAL_SCHEDULE_ITEMS);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        Alert.alert('Erreur', 'Impossible de charger vos données.');
      }
    };

    loadData();
  }, []);

  const handleDaySelect = async (dayNumber: number) => {
    try {
      const updatedDays = days.map(day => ({
        ...day,
        isSelected: day.dayNumber === dayNumber,
      }));

      setDays(updatedDays);

      // Ici, vous pourriez également sauvegarder la sélection du jour si nécessaire
      // et charger les événements spécifiques à ce jour

      // Exemple fictif pour démontrer la fonctionnalité
      // const dayEvents = await LocalStorageService.getScheduleForDay(dayNumber);
      // setScheduleItems(dayEvents);
    } catch (error) {
      console.error('Erreur lors de la sélection du jour:', error);
      Alert.alert('Erreur', 'Impossible de charger les événements pour ce jour.');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image
            source={{
              uri: userProfile?.avatar || 'https://lh3.googleusercontent.com/aida-public/AB6AXuDv1T6_MgXb2h74tuQcPVMvbw8S4R4pc8Z3-CfWR5oci3d8PSI1QKZ33IPQzRJ1qQjUgGPSmaTTP-oIP1iKm_WGUOu38P3H75umAWRzAXa3NkZkqKRMeonVId2OvWSlMgBSBCreAds8CmeG5LfaCyJLo10LTJrW0BtJgfkrAHBCMW8S24zfS-wum183e4jgZYcZF4dhfi7F9aeHyWwOEK2A1fBqaYMxMs7GPJsNxQ4hCBVzTdFQWrKN0bNe9Tth2LOvB4uhxJp5zAQ',
            }}
            style={styles.avatar}
          />
          <View>
            <Text style={styles.greeting}>Bonne journée,</Text>
            <Text style={styles.userName}>{userProfile?.name?.split(' ')[0] || 'Utilisateur'}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.notificationButton}>
          <MaterialIcons name="notifications-none" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Day Selector */}
        <DaySelector days={days} onDaySelect={handleDaySelect} />

        {/* Balance Card */}
        <BalanceCard
          title="Équilibre du jour"
          subtitle="Études vs Bien-être"
          percentage={65}
          focusLabel="Focus"
          focusValue="4h"
          pauseLabel="Pause"
          pauseValue="2h"
        />

        {/* Programme Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Programme</Text>
          <View style={styles.timeline}>
            {scheduleItems.map((item, index) => (
              <TimelineItem
                key={item.id}
                time={item.time}
                icon={item.icon}
                title={item.title}
                subtitle={item.subtitle}
                timeRange={item.timeRange}
                backgroundColor={item.backgroundColor}
                iconBgColor={item.iconBgColor}
                isFirst={index === 0}
                isLast={index === scheduleItems.length - 1}
                onMorePress={index === 0 ? () => {} : undefined}
              />
            ))}
          </View>
        </View>

        {/* Add Task Button */}
        <TouchableOpacity style={styles.addTaskButton}>
          <MaterialIcons name="add" size={20} color={COLORS.textSecondary} />
          <Text style={styles.addTaskText}>Ajouter une tâche</Text>
        </TouchableOpacity>

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
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  greeting: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
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
    gap: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  timeline: {
    marginTop: 8,
  },
  addTaskButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 16,
    borderStyle: 'dashed',
  },
  addTaskText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  bottomSpacer: {
    height: 100,
  },
});
