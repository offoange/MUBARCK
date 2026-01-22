import React, {useState, useEffect, useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ImageBackground,
  StatusBar,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import WellnessCard from '../components/WellnessCard';
import QuickActionButton from '../components/QuickActionButton';
import ScheduleItem from '../components/ScheduleItem';
import BottomNavigation from '../components/BottomNavigation';
import DailyGoalModal from '../components/DailyGoalModal';
import LocalStorageService, {WellnessData, UserProfile, DailyGoal} from '../services/LocalStorageService';
import {useSchedule} from '../context/ScheduleContext';

const COLORS = {
  primary: '#6c2bee',
  background: '#161022',
  card: '#1d172a',
  sky: '#38bdf8',
  emerald: '#34d399',
  rose: '#fb7185',
  textPrimary: '#ffffff',
  textSecondary: '#94a3b8',
};

// Helper pour obtenir l'icône selon la matière
const getIconForMatiere = (matiere: string): string => {
  const icons: {[key: string]: string} = {
    'Mathématiques': 'calculate',
    'Sciences': 'science',
    'Physique': 'science',
    'Chimie': 'science',
    'Biologie': 'biotech',
    'Français': 'menu-book',
    'L&L Française': 'menu-book',
    'Anglais': 'language',
    'Espagnol': 'translate',
    'Histoire': 'history-edu',
    'Géographie': 'public',
    'Individus et Sociétés': 'groups',
    'EPS': 'sports-soccer',
    'Sport': 'fitness-center',
    'Art Visuel': 'palette',
    'Musique': 'music-note',
    'Informatique': 'computer',
    'Projet Personnel': 'assignment',
    'Vie de classe': 'school',
  };
  return icons[matiere] || 'menu-book';
};

// Helper pour obtenir l'icône selon le type d'activité
const getIconForActivite = (type: string): string => {
  const icons: {[key: string]: string} = {
    'etude': 'menu-book',
    'sport': 'fitness-center',
    'loisir': 'sports-esports',
    'rendez_vous': 'event',
    'autre': 'event-note',
  };
  return icons[type] || 'event';
};

interface HomeScreenProps {
  activeTab?: string;
  onTabPress?: (tab: string) => void;
  onOpenFocusTimer?: () => void;
  onOpenBreathingExercise?: () => void;
  onOpenNotes?: () => void;
}

export default function HomeScreen({
  activeTab = 'home',
  onTabPress,
  onOpenFocusTimer,
  onOpenBreathingExercise,
  onOpenNotes,
}: HomeScreenProps) {
  const {getCoursParDate, getActivitesParDate, estConfigure} = useSchedule();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [wellnessData, setWellnessData] = useState<WellnessData>({
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
  });
  const [dailyGoal, setDailyGoal] = useState<DailyGoal | null>(null);
  const [showGoalModal, setShowGoalModal] = useState(false);

  // Obtenir la date du jour au format YYYY-MM-DD
  const today = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }, []);

  // Récupérer les cours et activités du jour
  const todayCours = useMemo(() => getCoursParDate(today), [getCoursParDate, today]);
  const todayActivites = useMemo(() => getActivitesParDate(today), [getActivitesParDate, today]);

  // Combiner et trier les événements du jour par heure
  const todaySchedule = useMemo(() => {
    const events: Array<{
      id: string;
      time: string;
      title: string;
      subtitle: string;
      icon: string;
      color: string;
      type: 'cours' | 'activite';
      isCompleted?: boolean;
    }> = [];

    // Ajouter les cours
    todayCours.forEach(cours => {
      events.push({
        id: cours.id,
        time: cours.heureDebut,
        title: cours.matiere,
        subtitle: cours.salle ? `Salle ${cours.salle} • ${cours.heureDebut} - ${cours.heureFin}` : `${cours.heureDebut} - ${cours.heureFin}`,
        icon: getIconForMatiere(cours.matiere),
        color: cours.couleur,
        type: 'cours',
        isCompleted: cours.statut === 'complete',
      });
    });

    // Ajouter les activités personnelles
    todayActivites.forEach(activite => {
      events.push({
        id: activite.id,
        time: activite.heureDebut,
        title: activite.titre,
        subtitle: `${activite.heureDebut} - ${activite.heureFin}`,
        icon: getIconForActivite(activite.type),
        color: activite.couleur,
        type: 'activite',
        isCompleted: activite.complete,
      });
    });

    // Trier par heure
    return events.sort((a, b) => a.time.localeCompare(b.time));
  }, [todayCours, todayActivites]);

  // Charger les données utilisateur et de bien-être au démarrage
  useEffect(() => {
    const loadData = async () => {
      try {
        // Charger le profil utilisateur
        const savedProfile = await LocalStorageService.getUserProfile();
        if (savedProfile) {
          setUserProfile(savedProfile);
        }

        // Charger les données de bien-être
        const savedWellnessData = await LocalStorageService.getWellnessData();
        if (savedWellnessData) {
          setWellnessData(savedWellnessData);
        } else {
          await LocalStorageService.saveWellnessData(wellnessData);
        }

        // Charger l'objectif du jour
        const savedDailyGoal = await LocalStorageService.getDailyGoal();
        if (savedDailyGoal) {
          setDailyGoal(savedDailyGoal);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        Alert.alert('Erreur', 'Impossible de charger vos données.');
      }
    };

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatarContainer}>
            <Image
              source={{
                uri: userProfile?.avatar || 'https://lh3.googleusercontent.com/aida-public/AB6AXuDv1T6_MgXb2h74tuQcPVMvbw8S4R4pc8Z3-CfWR5oci3d8PSI1QKZ33IPQzRJ1qQjUgGPSmaTTP-oIP1iKm_WGUOu38P3H75umAWRzAXa3NkZkqKRMeonVId2OvWSlMgBSBCreAds8CmeG5LfaCyJLo10LTJrW0BtJgfkrAHBCMW8S24zfS-wum183e4jgZYcZF4dhfi7F9aeHyWwOEK2A1fBqaYMxMs7GPJsNxQ4hCBVzTdFQWrKN0bNe9Tth2LOvB4uhxJp5zAQ',
              }}
              style={styles.avatar}
            />
            <View style={styles.onlineIndicator} />
          </View>
          <View>
            <Text style={styles.greeting}>Bonjour,</Text>
            <Text style={styles.userName}>{userProfile?.name?.split(' ')[0] || 'Utilisateur'}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.notificationButton}>
          <MaterialIcons name="notifications" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Focus of the Day Card */}
        <TouchableOpacity activeOpacity={0.95} onPress={() => setShowGoalModal(true)}>
          <ImageBackground
            source={{
              uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDFL2uUyaeX5T8MvmWCnIUKbFtGLGNmEzGgk6mdw0ywJzbnpeAPBwJk9YZ8sYoFf6jB7maDXIDQS9A1XX1iVYAC8HH-XFHFdI0MQ6E8A5Jz8unBVXy5MQ4FNg98Yyf4P30slzikx2hAWWcdwDnDetKRkNHHHnd9Y3JrLrUezJW-JEJe_a-qzZya-IUohVOu5GqZ0P8r78GMnsEncJ8cJm9rl3Tb2UECFvqfqh-e7CVBj3-KagPFwKqw3llAnRwdmrRpb-fxnPYUT-Q',
            }}
            style={styles.focusCard}
            imageStyle={styles.focusCardImage}>
            <View style={[styles.focusCardOverlay, dailyGoal?.isCompleted && styles.focusCardOverlayCompleted]} />
            <View style={styles.focusCardContent}>
              <View style={styles.focusHeaderRow}>
                <View style={styles.focusBadge}>
                  <Text style={styles.focusBadgeText}>
                    {dailyGoal?.isCompleted ? '✓ OBJECTIF ATTEINT' : 'OBJECTIF DU JOUR'}
                  </Text>
                </View>
                <View style={styles.editBadge}>
                  <MaterialIcons name="edit" size={14} color="#fff" />
                </View>
              </View>
              <View style={styles.focusTextContainer}>
                <Text style={styles.focusTitle}>
                  {dailyGoal?.title || 'Définir un objectif'}
                </Text>
                <Text style={styles.focusDescription}>
                  {dailyGoal?.description || 'Appuyez ici pour définir votre objectif du jour et rester motivé !'}
                </Text>
              </View>
            </View>
          </ImageBackground>
        </TouchableOpacity>

        {/* Wellness Tracker */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Suivi Bien-être</Text>
            <TouchableOpacity>
              <Text style={styles.sectionLink}>Détails</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.wellnessGrid}>
            <WellnessCard
              icon="water-drop"
              label="Eau"
              value={`${wellnessData.water.current}L`}
              progress={Math.round((wellnessData.water.current / wellnessData.water.target) * 100)}
              color={COLORS.sky}
            />
            <WellnessCard
              icon="bedtime"
              label="Sommeil"
              value={`${wellnessData.sleep.hours}h ${wellnessData.sleep.minutes}m`}
              progress={Math.round(((wellnessData.sleep.hours * 60 + wellnessData.sleep.minutes) / (wellnessData.sleep.target * 60)) * 100)}
              color={COLORS.primary}
            />
            <WellnessCard
              icon="directions-run"
              label="Pas"
              value={wellnessData.steps.current.toLocaleString()}
              progress={Math.round((wellnessData.steps.current / wellnessData.steps.target) * 100)}
              color={COLORS.emerald}
              onPress={async () => {
                try {
                  // Simuler une mise à jour des pas (ajout de 500 pas)
                  const updatedWellnessData = {
                    ...wellnessData,
                    steps: {
                      ...wellnessData.steps,
                      current: wellnessData.steps.current + 500,
                    },
                  };
                  setWellnessData(updatedWellnessData);
                  await LocalStorageService.saveWellnessData(updatedWellnessData);
                } catch (error) {
                  console.error('Erreur lors de la mise à jour des pas:', error);
                }
              }}
            />
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions Rapides</Text>
          <View style={styles.quickActionsGrid}>
            <QuickActionButton
              icon="timer"
              title="Minuteur Focus"
              subtitle="25 min"
              color={COLORS.primary}
              onPress={onOpenFocusTimer}
            />

            <QuickActionButton
              icon="self-improvement"
              title="Respirer"
              subtitle="3 min détente"
              color={COLORS.emerald}
              onPress={onOpenBreathingExercise}
            />
            <QuickActionButton
              icon="edit-note"
              title="Notes"
              subtitle="Révisions"
              color={COLORS.rose}
              onPress={onOpenNotes}
            />
          </View>
        </View>

        {/* Today's Schedule */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Programme du Jour</Text>
            {estConfigure && (
              <TouchableOpacity onPress={() => onTabPress && onTabPress('schedule')}>
                <Text style={styles.sectionLink}>Voir tout</Text>
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.scheduleContainer}>
            {todaySchedule.length > 0 ? (
              todaySchedule.slice(0, 4).map((event, index) => (
                <ScheduleItem
                  key={event.id}
                  icon={event.icon}
                  title={event.title}
                  subtitle={event.subtitle}
                  time={event.time}
                  isActive={!event.isCompleted && index === 0}
                  isLast={index === Math.min(todaySchedule.length - 1, 3)}
                />
              ))
            ) : (
              <View style={styles.emptySchedule}>
                <MaterialIcons name="event-available" size={48} color={COLORS.textSecondary} />
                <Text style={styles.emptyScheduleTitle}>
                  {estConfigure ? 'Aucun cours aujourd\'hui' : 'Calendrier non configuré'}
                </Text>
                <Text style={styles.emptyScheduleSubtitle}>
                  {estConfigure
                    ? 'Profitez de votre journée libre !'
                    : 'Configurez votre emploi du temps dans l\'onglet Calendrier'}
                </Text>
                {!estConfigure && (
                  <TouchableOpacity
                    style={styles.configureButton}
                    onPress={() => onTabPress && onTabPress('schedule')}>
                    <Text style={styles.configureButtonText}>Configurer</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        </View>

        {/* Bottom spacing for navigation */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNavigation
        activeTab={activeTab}
        onTabPress={onTabPress}
        onAddPress={() => console.log('Add pressed')}
      />

      {/* Daily Goal Modal */}
      <DailyGoalModal
        visible={showGoalModal}
        onClose={() => setShowGoalModal(false)}
        currentGoal={dailyGoal}
        onSave={async (goal) => {
          try {
            await LocalStorageService.saveDailyGoal(goal);
            setDailyGoal(goal);
            setShowGoalModal(false);
            Alert.alert('Succès', 'Votre objectif a été enregistré !');
          } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);
            Alert.alert('Erreur', 'Impossible de sauvegarder l\'objectif.');
          }
        }}
        onComplete={async () => {
          try {
            await LocalStorageService.completeDailyGoal();
            const updatedGoal = await LocalStorageService.getDailyGoal();
            setDailyGoal(updatedGoal);
            setShowGoalModal(false);
            Alert.alert('Félicitations ! 🎉', 'Vous avez atteint votre objectif du jour !');
          } catch (error) {
            console.error('Erreur lors de la complétion:', error);
            Alert.alert('Erreur', 'Impossible de marquer l\'objectif comme atteint.');
          }
        }}
        onDelete={async () => {
          try {
            await LocalStorageService.deleteDailyGoal();
            setDailyGoal(null);
            setShowGoalModal(false);
          } catch (error) {
            console.error('Erreur lors de la suppression:', error);
            Alert.alert('Erreur', 'Impossible de supprimer l\'objectif.');
          }
        }}
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
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#22c55e',
    borderWidth: 2,
    borderColor: COLORS.background,
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
    gap: 24,
  },
  focusCard: {
    height: 220,
    borderRadius: 16,
    overflow: 'hidden',
  },
  focusCardImage: {
    borderRadius: 16,
  },
  focusCardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 16,
  },
  focusCardOverlayCompleted: {
    backgroundColor: 'rgba(34, 197, 94, 0.3)',
  },
  focusCardContent: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  focusHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  focusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  editBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  focusBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 1,
  },
  focusTextContainer: {
    gap: 8,
  },
  focusTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  focusDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 20,
  },
  section: {
    gap: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  sectionLink: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  wellnessGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  scheduleContainer: {
    gap: 0,
  },
  emptySchedule: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    gap: 12,
  },
  emptyScheduleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  emptyScheduleSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  configureButton: {
    marginTop: 8,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  configureButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  bottomSpacer: {
    height: 100,
  },
});
