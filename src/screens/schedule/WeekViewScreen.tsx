/**
 * Écran de vue hebdomadaire de l'emploi du temps
 * Affiche tous les cours de la semaine avec possibilité d'ajouter des détails
 */

import React, {useState, useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  TextInput,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {useSchedule} from '../../context/ScheduleContext';
import {CoursGenere, COLORS_SCHEDULE as COLORS, JourSemaine, ActivitePersonnelle} from '../../types/schedule';
import CalendarGeneratorService from '../../services/CalendarGeneratorService';
import CourseDetailModal from './CourseDetailModal';

interface WeekViewScreenProps {
  onOpenSetup: () => void;
  onOpenMonthView: () => void;
  activeTab?: string;
  onTabPress?: (tab: string) => void;
}

const JOUR_LABELS: Record<JourSemaine, string> = {
  lundi: 'Lun',
  mardi: 'Mar',
  mercredi: 'Mer',
  jeudi: 'Jeu',
  vendredi: 'Ven',
  samedi: 'Sam',
  dimanche: 'Dim',
};

export default function WeekViewScreen({
  onOpenSetup,
  onOpenMonthView,
}: WeekViewScreenProps) {
  const {
    coursGeneres,
    selectedDate,
    currentWeekStart,
    setSelectedDate,
    goToNextWeek,
    goToPreviousWeek,
    goToToday,
    refreshData,
    updateStatutCours,
    toggleActiviteComplete,
    getActivitesParDate,
  } = useSchedule();

  const [refreshing, setRefreshing] = useState(false);
  const [selectedCours, setSelectedCours] = useState<CoursGenere | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [filterMatiere, setFilterMatiere] = useState<string | null>(null);

  // Obtenir les dates de la semaine
  const weekDates = useMemo(() => {
    return CalendarGeneratorService.getDatesSemaine(new Date(currentWeekStart));
  }, [currentWeekStart]);

  // Grouper les cours par date
  const coursParDate = useMemo(() => {
    const grouped: Record<string, CoursGenere[]> = {};
    weekDates.forEach(date => {
      grouped[date] = coursGeneres
        .filter(c => c.date === date)
        .filter(c => !filterMatiere || c.matiere === filterMatiere)
        .filter(c => {
          if (!searchQuery) return true;
          const query = searchQuery.toLowerCase();
          return (
            c.matiere.toLowerCase().includes(query) ||
            c.details.theme.toLowerCase().includes(query) ||
            c.details.notesPersonnelles.toLowerCase().includes(query)
          );
        });
      grouped[date] = CalendarGeneratorService.trierParHeure(grouped[date]);
    });
    return grouped;
  }, [coursGeneres, weekDates, filterMatiere, searchQuery]);

  // Obtenir les matières uniques pour le filtre
  const matieres = useMemo(() => {
    const uniqueMatieres = new Set(coursGeneres.map(c => c.matiere));
    return Array.from(uniqueMatieres).sort();
  }, [coursGeneres]);

  // Obtenir le titre de la semaine
  const weekTitle = useMemo(() => {
    const debut = new Date(currentWeekStart);
    const fin = new Date(currentWeekStart);
    fin.setDate(fin.getDate() + 4);

    const mois = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];

    if (debut.getMonth() === fin.getMonth()) {
      return `${debut.getDate()} - ${fin.getDate()} ${mois[debut.getMonth()]} ${debut.getFullYear()}`;
    }
    return `${debut.getDate()} ${mois[debut.getMonth()]} - ${fin.getDate()} ${mois[fin.getMonth()]}`;
  }, [currentWeekStart]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };

  const handleCoursPress = (cours: CoursGenere) => {
    setSelectedCours(cours);
    setShowDetailModal(true);
  };

  const handleMarkComplete = async (cours: CoursGenere) => {
    const newStatut = cours.statut === 'complete' ? 'a_venir' : 'complete';
    await updateStatutCours(cours.id, newStatut);
  };

  const isToday = (date: string) => {
    return date === CalendarGeneratorService.formatDate(new Date());
  };

  const hasDetails = (cours: CoursGenere) => {
    return (
      cours.details.theme ||
      cours.details.activites.length > 0 ||
      cours.details.objectifs.length > 0 ||
      cours.details.typeEvaluation
    );
  };

  const renderCoursItem = (cours: CoursGenere) => {
    const duree = CalendarGeneratorService.calculerDureeMinutes(cours.heureDebut, cours.heureFin);
    const isCompleted = cours.statut === 'complete';
    const isCancelled = cours.statut === 'annule';
    const isCurrentlyActive = CalendarGeneratorService.estEnCours(cours);

    return (
      <TouchableOpacity
        key={cours.id}
        style={[
          styles.coursCard,
          {borderLeftColor: cours.couleur},
          isCompleted && styles.coursCardCompleted,
          isCancelled && styles.coursCardCancelled,
          isCurrentlyActive && styles.coursCardActive,
        ]}
        onPress={() => handleCoursPress(cours)}
        onLongPress={() => handleMarkComplete(cours)}>
        <View style={styles.coursHeader}>
          <View style={styles.coursTimeContainer}>
            <Text style={[styles.coursTime, isCompleted && styles.coursTimeCompleted]}>
              {cours.heureDebut} - {cours.heureFin}
            </Text>
            <Text style={styles.coursDuree}>
              {CalendarGeneratorService.formatDuree(duree)}
            </Text>
          </View>
          <View style={styles.coursIndicators}>
            {hasDetails(cours) && (
              <View style={[styles.detailIndicator, {backgroundColor: cours.couleur}]}>
                <MaterialIcons name="description" size={12} color="#fff" />
              </View>
            )}
            {cours.details.typeEvaluation && (
              <View style={[styles.evalIndicator, {backgroundColor: COLORS.warning}]}>
                <MaterialIcons name="assignment" size={12} color="#fff" />
              </View>
            )}
            {isCurrentlyActive && (
              <View style={styles.liveIndicator}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>En cours</Text>
              </View>
            )}
          </View>
        </View>

        <Text style={[styles.coursMatiere, isCompleted && styles.coursMatiereCompleted]}>
          {cours.matiere}
        </Text>

        {cours.salle ? (
          <View style={styles.salleContainer}>
            <MaterialIcons name="room" size={14} color={COLORS.textMuted} />
            <Text style={styles.coursSalle}>{cours.salle}</Text>
          </View>
        ) : null}

        {cours.details.theme ? (
          <Text style={styles.coursTheme} numberOfLines={2}>
            {cours.details.theme}
          </Text>
        ) : null}

        {cours.details.typeEvaluation ? (
          <View style={styles.evalContainer}>
            <MaterialIcons name="assignment" size={14} color={COLORS.warning} />
            <Text style={styles.evalText}>{cours.details.typeEvaluation}</Text>
          </View>
        ) : null}

        {isCompleted && (
          <View style={styles.completedBadge}>
            <MaterialIcons name="check-circle" size={16} color={COLORS.success} />
            <Text style={styles.completedText}>Terminé</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderActiviteItem = (activite: ActivitePersonnelle) => {
    return (
      <TouchableOpacity
        key={activite.id}
        style={[
          styles.activiteCard,
          {borderLeftColor: activite.couleur},
          activite.complete && styles.activiteCardComplete,
        ]}
        onPress={() => toggleActiviteComplete(activite.id)}>
        <View style={styles.activiteHeader}>
          <Text style={[styles.activiteTime, activite.complete && styles.activiteTimeComplete]}>
            {activite.heureDebut} - {activite.heureFin}
          </Text>
          <View style={[styles.activiteTypeIndicator, {backgroundColor: activite.couleur}]}>
            <MaterialIcons
              name={activite.type === 'etude' ? 'menu-book' : activite.type === 'sport' ? 'sports-soccer' : activite.type === 'loisir' ? 'sports-esports' : 'event'}
              size={10}
              color="#fff"
            />
          </View>
        </View>
        <Text style={[styles.activiteTitre, activite.complete && styles.activiteTitreComplete]}>
          {activite.titre}
        </Text>
        {activite.complete && (
          <View style={styles.activiteCompleteBadge}>
            <MaterialIcons name="check-circle" size={12} color={COLORS.success} />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderDayColumn = (date: string, index: number) => {
    const dateObj = new Date(date);
    const jourKey = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'][index] as JourSemaine;
    const cours = coursParDate[date] || [];
    const dayActivites = getActivitesParDate(date);
    const todayClass = isToday(date);
    const isWeekend = index >= 5;

    return (
      <View key={date} style={[styles.dayColumn, isWeekend && styles.dayColumnWeekend]}>
        <TouchableOpacity
          style={[styles.dayHeader, todayClass && styles.dayHeaderToday, selectedDate === date && styles.dayHeaderSelected, isWeekend && styles.dayHeaderWeekend]}
          onPress={() => setSelectedDate(date)}>
          <Text style={[styles.dayName, todayClass && styles.dayNameToday, isWeekend && styles.dayNameWeekend]}>
            {JOUR_LABELS[jourKey]}
          </Text>
          <Text style={[styles.dayNumber, todayClass && styles.dayNumberToday, isWeekend && styles.dayNumberWeekend]}>
            {dateObj.getDate()}
          </Text>
        </TouchableOpacity>

        <ScrollView
          style={styles.dayContent}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled>
          {cours.length === 0 && dayActivites.length === 0 ? (
            <View style={styles.emptyDay}>
              <Text style={styles.emptyDayText}>{isWeekend ? 'Week-end' : 'Pas de cours'}</Text>
            </View>
          ) : (
            <>
              {cours.map(c => renderCoursItem(c))}
              {dayActivites.map(a => renderActiviteItem(a))}
            </>
          )}
        </ScrollView>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={onOpenSetup}>
          <MaterialIcons name="settings" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>

        <View style={styles.headerTitle}>
          <Text style={styles.headerTitleText}>Emploi du temps</Text>
          <Text style={styles.headerSubtitle}>{weekTitle}</Text>
        </View>

        <TouchableOpacity style={styles.headerButton} onPress={onOpenMonthView}>
          <MaterialIcons name="calendar-month" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Navigation semaine */}
      <View style={styles.weekNav}>
        <TouchableOpacity style={styles.weekNavButton} onPress={goToPreviousWeek}>
          <MaterialIcons name="chevron-left" size={28} color={COLORS.textPrimary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.todayButton} onPress={goToToday}>
          <MaterialIcons name="today" size={20} color={COLORS.primary} />
          <Text style={styles.todayButtonText}>Aujourd'hui</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.weekNavButton} onPress={goToNextWeek}>
          <MaterialIcons name="chevron-right" size={28} color={COLORS.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Barre de recherche et filtres */}
      <View style={styles.filterBar}>
        <TouchableOpacity
          style={[styles.searchButton, showSearch && styles.searchButtonActive]}
          onPress={() => setShowSearch(!showSearch)}>
          <MaterialIcons name="search" size={20} color={showSearch ? '#fff' : COLORS.textSecondary} />
        </TouchableOpacity>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          <TouchableOpacity
            style={[styles.filterChip, !filterMatiere && styles.filterChipActive]}
            onPress={() => setFilterMatiere(null)}>
            <Text style={[styles.filterChipText, !filterMatiere && styles.filterChipTextActive]}>
              Tous
            </Text>
          </TouchableOpacity>
          {matieres.map(m => (
            <TouchableOpacity
              key={m}
              style={[styles.filterChip, filterMatiere === m && styles.filterChipActive]}
              onPress={() => setFilterMatiere(filterMatiere === m ? null : m)}>
              <Text style={[styles.filterChipText, filterMatiere === m && styles.filterChipTextActive]}>
                {m}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {showSearch && (
        <View style={styles.searchBar}>
          <MaterialIcons name="search" size={20} color={COLORS.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un cours, thème..."
            placeholderTextColor={COLORS.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <MaterialIcons name="close" size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>
      )}

      {/* Grille de la semaine */}
      <ScrollView
        style={styles.weekGrid}
        horizontal
        showsHorizontalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.primary}
          />
        }>
        {weekDates.map((date, index) => renderDayColumn(date, index))}
      </ScrollView>

      {/* Modal de détail */}
      {selectedCours && (
        <CourseDetailModal
          visible={showDetailModal}
          cours={selectedCours}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedCours(null);
          }}
        />
      )}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.cardDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    alignItems: 'center',
  },
  headerTitleText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  headerSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  weekNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  weekNavButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  todayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: COLORS.primary + '20',
    borderRadius: 20,
    gap: 6,
  },
  todayButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  filterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  searchButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.cardDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButtonActive: {
    backgroundColor: COLORS.primary,
  },
  filterScroll: {
    flex: 1,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: COLORS.cardDark,
    borderRadius: 16,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
  },
  filterChipText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#fff',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    marginHorizontal: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  weekGrid: {
    flex: 1,
  },
  dayColumn: {
    width: 160,
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
  },
  dayHeader: {
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  dayHeaderToday: {
    backgroundColor: COLORS.primary + '20',
  },
  dayHeaderSelected: {
    backgroundColor: COLORS.primary + '30',
  },
  dayName: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  dayNameToday: {
    color: COLORS.primary,
  },
  dayNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  dayNumberToday: {
    color: COLORS.primary,
  },
  dayContent: {
    flex: 1,
    padding: 8,
  },
  emptyDay: {
    padding: 16,
    alignItems: 'center',
  },
  emptyDayText: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontStyle: 'italic',
  },
  coursCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
  },
  coursCardCompleted: {
    opacity: 0.7,
  },
  coursCardCancelled: {
    opacity: 0.5,
    backgroundColor: COLORS.cardDark,
  },
  coursCardActive: {
    borderWidth: 1,
    borderColor: COLORS.success,
  },
  coursHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  coursTimeContainer: {
    flex: 1,
  },
  coursTime: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  coursTimeCompleted: {
    textDecorationLine: 'line-through',
  },
  coursDuree: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  coursIndicators: {
    flexDirection: 'row',
    gap: 4,
  },
  detailIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  evalIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.success + '20',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.success,
  },
  liveText: {
    fontSize: 9,
    color: COLORS.success,
    fontWeight: '600',
  },
  coursMatiere: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  coursMatiereCompleted: {
    textDecorationLine: 'line-through',
  },
  salleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  coursSalle: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  coursTheme: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 4,
    lineHeight: 16,
  },
  evalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
    backgroundColor: COLORS.warning + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  evalText: {
    fontSize: 10,
    color: COLORS.warning,
    fontWeight: '500',
    flex: 1,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  completedText: {
    fontSize: 11,
    color: COLORS.success,
    fontWeight: '500',
  },
  // Styles pour les activités personnelles
  activiteCard: {
    backgroundColor: COLORS.cardDark,
    borderRadius: 10,
    padding: 10,
    marginBottom: 6,
    borderLeftWidth: 3,
  },
  activiteCardComplete: {
    opacity: 0.6,
  },
  activiteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  activiteTime: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  activiteTimeComplete: {
    textDecorationLine: 'line-through',
  },
  activiteTypeIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activiteTitre: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  activiteTitreComplete: {
    textDecorationLine: 'line-through',
    color: COLORS.textMuted,
  },
  activiteCompleteBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  // Styles pour le week-end
  dayColumnWeekend: {
    backgroundColor: COLORS.cardDark + '30',
  },
  dayHeaderWeekend: {
    backgroundColor: COLORS.cardDark + '50',
  },
  dayNameWeekend: {
    color: COLORS.textMuted,
  },
  dayNumberWeekend: {
    color: COLORS.textMuted,
  },
});
