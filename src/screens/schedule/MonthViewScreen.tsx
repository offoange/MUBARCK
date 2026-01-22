/**
 * Écran de vue mensuelle du calendrier
 * Affiche un calendrier mensuel avec les cours marqués
 */

import React, {useState, useMemo, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {useSchedule} from '../../context/ScheduleContext';
import {CoursGenere, COLORS_SCHEDULE as COLORS} from '../../types/schedule';
import CalendarGeneratorService from '../../services/CalendarGeneratorService';
import CourseDetailModal from './CourseDetailModal';

interface MonthViewScreenProps {
  onClose: () => void;
}

const JOURS_SEMAINE = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const MOIS_NOMS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

export default function MonthViewScreen({onClose}: MonthViewScreenProps) {
  const {coursGeneres, setSelectedDate} = useSchedule();

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedCours, setSelectedCours] = useState<CoursGenere | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Obtenir les jours du mois
  const monthDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const days: Array<{date: string; dayNumber: number; isCurrentMonth: boolean}> = [];

    // Jours du mois précédent pour compléter la première semaine
    const firstDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month, -i);
      days.push({
        date: CalendarGeneratorService.formatDate(date),
        dayNumber: date.getDate(),
        isCurrentMonth: false,
      });
    }

    // Jours du mois actuel
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const date = new Date(year, month, i);
      days.push({
        date: CalendarGeneratorService.formatDate(date),
        dayNumber: i,
        isCurrentMonth: true,
      });
    }

    // Jours du mois suivant pour compléter la dernière semaine
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(year, month + 1, i);
      days.push({
        date: CalendarGeneratorService.formatDate(date),
        dayNumber: i,
        isCurrentMonth: false,
      });
    }

    return days;
  }, [currentMonth]);

  // Grouper les cours par date
  const coursParDate = useMemo(() => {
    const grouped: Record<string, CoursGenere[]> = {};
    coursGeneres.forEach(cours => {
      if (!grouped[cours.date]) {
        grouped[cours.date] = [];
      }
      grouped[cours.date].push(cours);
    });
    return grouped;
  }, [coursGeneres]);

  // Cours du jour sélectionné
  const coursJourSelectionne = useMemo(() => {
    if (!selectedDay) {
      return [];
    }
    return CalendarGeneratorService.trierParHeure(coursParDate[selectedDay] || []);
  }, [selectedDay, coursParDate]);

  const goToPreviousMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const goToCurrentMonth = () => {
    setCurrentMonth(new Date());
  };

  const handleDayPress = useCallback((date: string) => {
    setSelectedDay(date);
  }, []);

  const handleCoursPress = (cours: CoursGenere) => {
    setSelectedCours(cours);
    setShowDetailModal(true);
  };

  const handleGoToWeek = (date: string) => {
    setSelectedDate(date);
    onClose();
  };

  const isToday = (date: string) => {
    return date === CalendarGeneratorService.formatDate(new Date());
  };

  const isWeekend = (index: number) => {
    return index % 7 === 5 || index % 7 === 6;
  };

  const getCoursIndicators = (date: string) => {
    const cours = coursParDate[date] || [];
    if (cours.length === 0) {
      return null;
    }

    const hasExam = cours.some(c => c.details.typeEvaluation);
    const uniqueColors = [...new Set(cours.map(c => c.couleur))].slice(0, 3);

    return {hasExam, colors: uniqueColors, count: cours.length};
  };

  const renderCalendarDay = (day: typeof monthDays[0], index: number) => {
    const indicators = getCoursIndicators(day.date);
    const today = isToday(day.date);
    const weekend = isWeekend(index);
    const selected = selectedDay === day.date;

    return (
      <TouchableOpacity
        key={`${day.date}-${index}`}
        style={[
          styles.dayCell,
          !day.isCurrentMonth && styles.dayCellOtherMonth,
          weekend && styles.dayCellWeekend,
          today && styles.dayCellToday,
          selected && styles.dayCellSelected,
        ]}
        onPress={() => handleDayPress(day.date)}>
        <Text
          style={[
            styles.dayNumber,
            !day.isCurrentMonth && styles.dayNumberOtherMonth,
            weekend && styles.dayNumberWeekend,
            today && styles.dayNumberToday,
            selected && styles.dayNumberSelected,
          ]}>
          {day.dayNumber}
        </Text>

        {indicators && (
          <View style={styles.indicators}>
            {indicators.hasExam && (
              <View style={[styles.examIndicator]} />
            )}
            <View style={styles.colorDots}>
              {indicators.colors.map((color, i) => (
                <View
                  key={i}
                  style={[styles.colorDot, {backgroundColor: color}]}
                />
              ))}
            </View>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderCoursItem = (cours: CoursGenere) => {
    const hasDetails = cours.details.theme || cours.details.activites.length > 0;

    return (
      <TouchableOpacity
        key={cours.id}
        style={[styles.coursItem, {borderLeftColor: cours.couleur}]}
        onPress={() => handleCoursPress(cours)}>
        <View style={styles.coursHeader}>
          <Text style={styles.coursTime}>
            {cours.heureDebut} - {cours.heureFin}
          </Text>
          {hasDetails && (
            <View style={[styles.detailBadge, {backgroundColor: cours.couleur}]}>
              <MaterialIcons name="description" size={10} color="#fff" />
            </View>
          )}
        </View>
        <Text style={styles.coursMatiere}>{cours.matiere}</Text>
        {cours.details.typeEvaluation ? (
          <View style={styles.examBadge}>
            <MaterialIcons name="assignment" size={12} color={COLORS.warning} />
            <Text style={styles.examText}>{cours.details.typeEvaluation}</Text>
          </View>
        ) : null}
        {cours.details.theme ? (
          <Text style={styles.coursTheme} numberOfLines={1}>
            {cours.details.theme}
          </Text>
        ) : null}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={onClose}>
          <MaterialIcons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>

        <View style={styles.headerTitle}>
          <Text style={styles.monthTitle}>
            {MOIS_NOMS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </Text>
        </View>

        <TouchableOpacity style={styles.headerButton} onPress={goToCurrentMonth}>
          <MaterialIcons name="today" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Navigation mois */}
      <View style={styles.monthNav}>
        <TouchableOpacity style={styles.monthNavButton} onPress={goToPreviousMonth}>
          <MaterialIcons name="chevron-left" size={28} color={COLORS.textPrimary} />
        </TouchableOpacity>

        <View style={styles.monthNavCenter}>
          <Text style={styles.monthNavText}>
            {MOIS_NOMS[currentMonth.getMonth()]}
          </Text>
        </View>

        <TouchableOpacity style={styles.monthNavButton} onPress={goToNextMonth}>
          <MaterialIcons name="chevron-right" size={28} color={COLORS.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* En-têtes des jours */}
      <View style={styles.weekDaysHeader}>
        {JOURS_SEMAINE.map((jour, index) => (
          <View key={jour} style={styles.weekDayCell}>
            <Text
              style={[
                styles.weekDayText,
                (index === 5 || index === 6) && styles.weekDayTextWeekend,
              ]}>
              {jour}
            </Text>
          </View>
        ))}
      </View>

      {/* Grille du calendrier */}
      <View style={styles.calendarGrid}>
        {monthDays.map((day, index) => renderCalendarDay(day, index))}
      </View>

      {/* Cours du jour sélectionné */}
      {selectedDay && (
        <View style={styles.selectedDayPanel}>
          <View style={styles.selectedDayHeader}>
            <Text style={styles.selectedDayTitle}>
              {CalendarGeneratorService.formatDateComplete(selectedDay)}
            </Text>
            <TouchableOpacity
              style={styles.goToWeekButton}
              onPress={() => handleGoToWeek(selectedDay)}>
              <MaterialIcons name="view-week" size={16} color={COLORS.primary} />
              <Text style={styles.goToWeekText}>Vue semaine</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.coursListScroll} showsVerticalScrollIndicator={false}>
            {coursJourSelectionne.length === 0 ? (
              <View style={styles.emptyDay}>
                <MaterialIcons name="event-busy" size={32} color={COLORS.textMuted} />
                <Text style={styles.emptyDayText}>Aucun cours ce jour</Text>
              </View>
            ) : (
              coursJourSelectionne.map(cours => renderCoursItem(cours))
            )}
          </ScrollView>
        </View>
      )}

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
  monthTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  monthNavButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthNavCenter: {
    flex: 1,
    alignItems: 'center',
  },
  monthNavText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  weekDaysHeader: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  weekDayCell: {
    flex: 1,
    alignItems: 'center',
  },
  weekDayText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  weekDayTextWeekend: {
    color: COLORS.textMuted,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 8,
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 4,
    borderWidth: 0.5,
    borderColor: COLORS.border,
  },
  dayCellOtherMonth: {
    opacity: 0.4,
  },
  dayCellWeekend: {
    backgroundColor: COLORS.cardDark + '40',
  },
  dayCellToday: {
    backgroundColor: COLORS.primary + '20',
  },
  dayCellSelected: {
    backgroundColor: COLORS.primary + '40',
    borderColor: COLORS.primary,
    borderWidth: 2,
  },
  dayNumber: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  dayNumberOtherMonth: {
    color: COLORS.textMuted,
  },
  dayNumberWeekend: {
    color: COLORS.textMuted,
  },
  dayNumberToday: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  dayNumberSelected: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  indicators: {
    marginTop: 2,
    alignItems: 'center',
  },
  examIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.warning,
    marginBottom: 2,
  },
  colorDots: {
    flexDirection: 'row',
    gap: 2,
  },
  colorDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  selectedDayPanel: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: 8,
  },
  selectedDayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  selectedDayTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  goToWeekButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: COLORS.primary + '20',
    borderRadius: 16,
  },
  goToWeekText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
  coursListScroll: {
    flex: 1,
    padding: 16,
  },
  emptyDay: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  emptyDayText: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 8,
  },
  coursItem: {
    backgroundColor: COLORS.cardDark,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
  },
  coursHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  coursTime: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  detailBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  coursMatiere: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  examBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
    backgroundColor: COLORS.warning + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  examText: {
    fontSize: 11,
    color: COLORS.warning,
    fontWeight: '500',
  },
  coursTheme: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
});
