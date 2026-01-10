import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Alert,
  AppState,
  Platform,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const COLORS = {
  primary: '#6c2bee',
  background: '#161022',
  card: '#1d172a',
  textPrimary: '#ffffff',
  textSecondary: '#94a3b8',
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
};

// Durées prédéfinies en minutes
const PRESET_DURATIONS = [15, 25, 45, 60];

interface FocusTimerScreenProps {
  onClose: () => void;
}

export default function FocusTimerScreen({onClose}: FocusTimerScreenProps) {
  const [selectedDuration, setSelectedDuration] = useState(25); // minutes
  const [timeRemaining, setTimeRemaining] = useState(25 * 60); // secondes
  const [isRunning, setIsRunning] = useState(false);
  const [isFocusModeActive, setIsFocusModeActive] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const appState = useRef(AppState.currentState);

  // Gérer le timer
  useEffect(() => {
    if (isRunning && timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            // Timer terminé
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeRemaining, handleTimerComplete]);

  // Écouter les changements d'état de l'app
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active' &&
        isFocusModeActive
      ) {
        // L'utilisateur est revenu dans l'app pendant le mode focus
        Alert.alert(
          'Mode Focus Actif',
          'Restez concentré! Évitez les distractions.',
          [{text: 'Continuer', style: 'default'}]
        );
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [isFocusModeActive]);

  const handleTimerComplete = () => {
    setIsRunning(false);
    setIsFocusModeActive(false);
    setSessionsCompleted(prev => prev + 1);

    Alert.alert(
      '🎉 Session terminée!',
      `Félicitations! Vous avez complété une session de ${selectedDuration} minutes de concentration.`,
      [
        {
          text: 'Pause (5 min)',
          onPress: () => {
            setSelectedDuration(5);
            setTimeRemaining(5 * 60);
          },
        },
        {
          text: 'Nouvelle session',
          onPress: () => {
            setTimeRemaining(selectedDuration * 60);
          },
        },
      ]
    );
  };

  const activateFocusMode = async () => {
    try {
      setIsFocusModeActive(true);
      setIsRunning(true);

      // Notification à l'utilisateur
      Alert.alert(
        '🔕 Mode Focus Activé',
        'Pour une concentration optimale:\n\n' +
        '• Activez le mode "Ne Pas Déranger" dans les paramètres de votre téléphone\n' +
        '• Fermez les autres applications\n' +
        '• Éloignez votre téléphone des distractions\n\n' +
        'Restez concentré pendant ' + selectedDuration + ' minutes!',
        [
          {
            text: 'Ouvrir Paramètres',
            onPress: () => openDeviceSettings(),
          },
          {
            text: 'Commencer',
            style: 'default',
          },
        ]
      );
    } catch (error) {
      console.error('Erreur lors de l\'activation du mode focus:', error);
    }
  };

  const openDeviceSettings = () => {
    // Sur Android, on peut ouvrir les paramètres de notification
    // Sur iOS, on ouvre les paramètres généraux
    if (Platform.OS === 'android') {
      const {Linking} = require('react-native');
      Linking.openSettings();
    } else {
      const {Linking} = require('react-native');
      Linking.openURL('app-settings:');
    }
  };

  const deactivateFocusMode = () => {
    Alert.alert(
      'Arrêter le mode Focus?',
      'Êtes-vous sûr de vouloir interrompre votre session de concentration?',
      [
        {text: 'Continuer', style: 'cancel'},
        {
          text: 'Arrêter',
          style: 'destructive',
          onPress: () => {
            setIsRunning(false);
            setIsFocusModeActive(false);
            setTimeRemaining(selectedDuration * 60);
          },
        },
      ]
    );
  };

  const toggleTimer = () => {
    if (isRunning) {
      deactivateFocusMode();
    } else {
      activateFocusMode();
    }
  };

  const selectDuration = (minutes: number) => {
    if (!isRunning) {
      setSelectedDuration(minutes);
      setTimeRemaining(minutes * 60);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculer la progression pour une utilisation future
  const _progress = 1 - timeRemaining / (selectedDuration * 60);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <MaterialIcons name="close" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mode Focus</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Sessions Counter */}
      <View style={styles.sessionsContainer}>
        <MaterialIcons name="emoji-events" size={20} color={COLORS.warning} />
        <Text style={styles.sessionsText}>
          {sessionsCompleted} session{sessionsCompleted !== 1 ? 's' : ''} aujourd'hui
        </Text>
      </View>

      {/* Timer Circle */}
      <View style={styles.timerContainer}>
        <View style={styles.timerCircle}>
          {/* Progress Ring */}
          <View
            style={[
              styles.progressRing,
              {
                borderColor: isFocusModeActive ? COLORS.success : COLORS.primary,
              },
            ]}
          />
          <View style={styles.timerInner}>
            <Text style={styles.timerText}>{formatTime(timeRemaining)}</Text>
            <Text style={styles.timerLabel}>
              {isFocusModeActive ? '🔕 Mode Focus' : 'Prêt'}
            </Text>
          </View>
        </View>
      </View>

      {/* Duration Presets */}
      <View style={styles.presetsContainer}>
        <Text style={styles.presetsTitle}>Durée</Text>
        <View style={styles.presetButtons}>
          {PRESET_DURATIONS.map(duration => (
            <TouchableOpacity
              key={duration}
              style={[
                styles.presetButton,
                selectedDuration === duration && styles.presetButtonActive,
                isRunning && styles.presetButtonDisabled,
              ]}
              onPress={() => selectDuration(duration)}
              disabled={isRunning}>
              <Text
                style={[
                  styles.presetButtonText,
                  selectedDuration === duration && styles.presetButtonTextActive,
                ]}>
                {duration} min
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Focus Mode Info */}
      <View style={styles.infoContainer}>
        <View style={styles.infoItem}>
          <MaterialIcons name="notifications-off" size={24} color={COLORS.primary} />
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoTitle}>Notifications silencieuses</Text>
            <Text style={styles.infoDescription}>
              Active le mode Ne Pas Déranger
            </Text>
          </View>
        </View>
        <View style={styles.infoItem}>
          <MaterialIcons name="psychology" size={24} color={COLORS.success} />
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoTitle}>Concentration maximale</Text>
            <Text style={styles.infoDescription}>
              Évitez les distractions pendant la session
            </Text>
          </View>
        </View>
      </View>

      {/* Start/Stop Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.mainButton,
            isFocusModeActive && styles.mainButtonActive,
          ]}
          onPress={toggleTimer}>
          <MaterialIcons
            name={isFocusModeActive ? 'stop' : 'play-arrow'}
            size={32}
            color="#fff"
          />
          <Text style={styles.mainButtonText}>
            {isFocusModeActive ? 'Arrêter' : 'Démarrer le Focus'}
          </Text>
        </TouchableOpacity>
      </View>
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
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  placeholder: {
    width: 40,
  },
  sessionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  sessionsText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  timerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  timerCircle: {
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: COLORS.card,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  progressRing: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    borderWidth: 4,
    borderColor: COLORS.primary,
  },
  timerInner: {
    alignItems: 'center',
  },
  timerText: {
    fontSize: 56,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  timerLabel: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: 8,
  },
  presetsContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  presetsTitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 12,
    textAlign: 'center',
  },
  presetButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  presetButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  presetButtonActive: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(108, 43, 238, 0.2)',
  },
  presetButtonDisabled: {
    opacity: 0.5,
  },
  presetButtonText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  presetButtonTextActive: {
    color: COLORS.primary,
  },
  infoContainer: {
    paddingHorizontal: 24,
    gap: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    padding: 16,
    borderRadius: 12,
    gap: 16,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  infoDescription: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  buttonContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  mainButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 16,
    gap: 12,
  },
  mainButtonActive: {
    backgroundColor: COLORS.danger,
  },
  mainButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
});
