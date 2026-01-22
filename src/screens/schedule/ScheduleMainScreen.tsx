/**
 * Écran principal de gestion de l'emploi du temps
 * Gère la navigation entre les différentes vues et la configuration initiale
 */

import React, {useState, useEffect} from 'react';
import {View, StyleSheet, ActivityIndicator} from 'react-native';
import {useSchedule} from '../../context/ScheduleContext';
import {COLORS_SCHEDULE as COLORS, ActivitePersonnelle} from '../../types/schedule';
import SetupScheduleScreen from './SetupScheduleScreen';
import WeekViewScreen from './WeekViewScreen';
import MonthViewScreen from './MonthViewScreen';
import AddActivityModal from './AddActivityModal';
import BottomNavigation from '../../components/BottomNavigation';

interface ScheduleMainScreenProps {
  activeTab?: string;
  onTabPress?: (tab: string) => void;
}

type ScheduleView = 'week' | 'month' | 'setup';

export default function ScheduleMainScreen({
  activeTab = 'schedule',
  onTabPress,
}: ScheduleMainScreenProps) {
  const {estConfigure, isLoading, selectedDate, addActivite} = useSchedule();
  const [currentView, setCurrentView] = useState<ScheduleView>('week');
  const [showSetup, setShowSetup] = useState(false);
  const [showAddActivity, setShowAddActivity] = useState(false);

  useEffect(() => {
    if (!isLoading && !estConfigure) {
      setShowSetup(true);
    }
  }, [isLoading, estConfigure]);

  const handleSetupComplete = () => {
    setShowSetup(false);
    setCurrentView('week');
  };

  const handleSetupCancel = () => {
    setShowSetup(false);
  };

  const handleOpenSetup = () => {
    setShowSetup(true);
  };

  const handleOpenMonthView = () => {
    setCurrentView('month');
  };

  const handleCloseMonthView = () => {
    setCurrentView('week');
  };

  const handleAddPress = () => {
    setShowAddActivity(true);
  };

  const handleSaveActivity = async (activity: Omit<ActivitePersonnelle, 'id'>) => {
    await addActivite(activity);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (showSetup) {
    return (
      <SetupScheduleScreen
        onComplete={handleSetupComplete}
        onCancel={handleSetupCancel}
      />
    );
  }

  if (currentView === 'month') {
    return <MonthViewScreen onClose={handleCloseMonthView} />;
  }

  return (
    <View style={styles.container}>
      <WeekViewScreen
        onOpenSetup={handleOpenSetup}
        onOpenMonthView={handleOpenMonthView}
        activeTab={activeTab}
        onTabPress={onTabPress}
      />
      <BottomNavigation
        activeTab={activeTab}
        onTabPress={onTabPress}
        onAddPress={handleAddPress}
      />

      {/* Modal pour ajouter une activité personnelle */}
      <AddActivityModal
        visible={showAddActivity}
        selectedDate={selectedDate}
        onClose={() => setShowAddActivity(false)}
        onSave={handleSaveActivity}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
});
