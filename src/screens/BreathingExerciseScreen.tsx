import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Animated,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const COLORS = {
  primary: '#6c2bee',
  background: '#161022',
  card: '#1d172a',
  textPrimary: '#ffffff',
  textSecondary: '#94a3b8',
  inhale: '#22c55e',
  hold: '#f59e0b',
  exhale: '#3b82f6',
};

// Types d'exercices de respiration
const BREATHING_EXERCISES = [
  {
    id: 'relaxation',
    name: 'Relaxation',
    description: 'Idéal pour se détendre',
    inhale: 4,
    hold: 4,
    exhale: 4,
    cycles: 6,
  },
  {
    id: 'energy',
    name: 'Énergie',
    description: 'Pour se dynamiser',
    inhale: 4,
    hold: 2,
    exhale: 4,
    cycles: 8,
  },
  {
    id: 'sleep',
    name: 'Sommeil',
    description: 'Pour s\'endormir facilement',
    inhale: 4,
    hold: 7,
    exhale: 8,
    cycles: 4,
  },
];

type BreathingPhase = 'idle' | 'inhale' | 'hold' | 'exhale';

interface BreathingExerciseScreenProps {
  onClose: () => void;
}

export default function BreathingExerciseScreen({onClose}: BreathingExerciseScreenProps) {
  const [selectedExercise, setSelectedExercise] = useState(BREATHING_EXERCISES[0]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<BreathingPhase>('idle');
  const [currentCycle, setCurrentCycle] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0.5)).current;
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Gérer le cycle de respiration
  useEffect(() => {
    // Animation du cercle de respiration (définie à l'intérieur du useEffect)
    const animateBreathing = (phase: BreathingPhase, duration: number) => {
      const targetScale = phase === 'inhale' ? 1.5 : phase === 'exhale' ? 1 : 1.5;
      const targetOpacity = phase === 'inhale' ? 1 : phase === 'exhale' ? 0.5 : 1;

      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: targetScale,
          duration: duration * 1000,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: targetOpacity,
          duration: duration * 1000,
          useNativeDriver: true,
        }),
      ]).start();
    };
    if (!isRunning) {
      return;
    }

    const runBreathingCycle = async () => {
      // Inspiration
      setCurrentPhase('inhale');
      setCountdown(selectedExercise.inhale);
      animateBreathing('inhale', selectedExercise.inhale);

      await new Promise(resolve => {
        let remaining = selectedExercise.inhale;
        intervalRef.current = setInterval(() => {
          remaining -= 1;
          setCountdown(remaining);
          if (remaining <= 0) {
            clearInterval(intervalRef.current!);
            resolve(true);
          }
        }, 1000);
      });

      // Rétention
      if (selectedExercise.hold > 0) {
        setCurrentPhase('hold');
        setCountdown(selectedExercise.hold);
        animateBreathing('hold', selectedExercise.hold);

        await new Promise(resolve => {
          let remaining = selectedExercise.hold;
          intervalRef.current = setInterval(() => {
            remaining -= 1;
            setCountdown(remaining);
            if (remaining <= 0) {
              clearInterval(intervalRef.current!);
              resolve(true);
            }
          }, 1000);
        });
      }

      // Expiration
      setCurrentPhase('exhale');
      setCountdown(selectedExercise.exhale);
      animateBreathing('exhale', selectedExercise.exhale);

      await new Promise(resolve => {
        let remaining = selectedExercise.exhale;
        intervalRef.current = setInterval(() => {
          remaining -= 1;
          setCountdown(remaining);
          if (remaining <= 0) {
            clearInterval(intervalRef.current!);
            resolve(true);
          }
        }, 1000);
      });

      // Passer au cycle suivant
      setCurrentCycle(prev => {
        const newCycle = prev + 1;
        if (newCycle >= selectedExercise.cycles) {
          // Exercice terminé
          setIsRunning(false);
          setIsCompleted(true);
          setCurrentPhase('idle');
        }
        return newCycle;
      });
    };

    if (currentCycle < selectedExercise.cycles) {
      runBreathingCycle();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, currentCycle, selectedExercise.cycles, selectedExercise.exhale, selectedExercise.hold, selectedExercise.inhale, scaleAnim, opacityAnim]);

  const startExercise = () => {
    setIsRunning(true);
    setCurrentCycle(0);
    setIsCompleted(false);
    scaleAnim.setValue(1);
    opacityAnim.setValue(0.5);
  };

  const stopExercise = () => {
    setIsRunning(false);
    setCurrentPhase('idle');
    setCurrentCycle(0);
    setCountdown(0);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    scaleAnim.setValue(1);
    opacityAnim.setValue(0.5);
  };

  const getPhaseText = () => {
    switch (currentPhase) {
      case 'inhale':
        return 'Inspirez';
      case 'hold':
        return 'Retenez';
      case 'exhale':
        return 'Expirez';
      default:
        return 'Prêt';
    }
  };

  const getPhaseColor = () => {
    switch (currentPhase) {
      case 'inhale':
        return COLORS.inhale;
      case 'hold':
        return COLORS.hold;
      case 'exhale':
        return COLORS.exhale;
      default:
        return COLORS.primary;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <MaterialIcons name="close" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Exercice de Respiration</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Exercise Selector */}
      {!isRunning && !isCompleted && (
        <View style={styles.exerciseSelector}>
          {BREATHING_EXERCISES.map(exercise => (
            <TouchableOpacity
              key={exercise.id}
              style={[
                styles.exerciseOption,
                selectedExercise.id === exercise.id && styles.exerciseOptionActive,
              ]}
              onPress={() => setSelectedExercise(exercise)}>
              <Text
                style={[
                  styles.exerciseOptionName,
                  selectedExercise.id === exercise.id && styles.exerciseOptionNameActive,
                ]}>
                {exercise.name}
              </Text>
              <Text style={styles.exerciseOptionDesc}>{exercise.description}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Breathing Circle */}
      <View style={styles.breathingContainer}>
        <Animated.View
          style={[
            styles.breathingCircle,
            {
              transform: [{scale: scaleAnim}],
              opacity: opacityAnim,
              backgroundColor: getPhaseColor(),
            },
          ]}>
          <View style={styles.breathingInner}>
            {isRunning ? (
              <>
                <Text style={styles.phaseText}>{getPhaseText()}</Text>
                <Text style={styles.countdownText}>{countdown}</Text>
              </>
            ) : isCompleted ? (
              <>
                <MaterialIcons name="check-circle" size={48} color={COLORS.inhale} />
                <Text style={styles.completedText}>Terminé!</Text>
              </>
            ) : (
              <>
                <MaterialIcons name="spa" size={48} color={COLORS.primary} />
                <Text style={styles.readyText}>Prêt</Text>
              </>
            )}
          </View>
        </Animated.View>

        {/* Cycle Progress */}
        {isRunning && (
          <View style={styles.cycleProgress}>
            <Text style={styles.cycleText}>
              Cycle {currentCycle + 1} / {selectedExercise.cycles}
            </Text>
          </View>
        )}
      </View>

      {/* Exercise Info */}
      {!isRunning && !isCompleted && (
        <View style={styles.infoContainer}>
          <View style={styles.infoRow}>
            <View style={[styles.infoItem, {backgroundColor: COLORS.inhale + '20'}]}>
              <MaterialIcons name="arrow-upward" size={20} color={COLORS.inhale} />
              <Text style={styles.infoLabel}>Inspirer</Text>
              <Text style={[styles.infoValue, {color: COLORS.inhale}]}>
                {selectedExercise.inhale}s
              </Text>
            </View>
            <View style={[styles.infoItem, {backgroundColor: COLORS.hold + '20'}]}>
              <MaterialIcons name="pause" size={20} color={COLORS.hold} />
              <Text style={styles.infoLabel}>Retenir</Text>
              <Text style={[styles.infoValue, {color: COLORS.hold}]}>
                {selectedExercise.hold}s
              </Text>
            </View>
            <View style={[styles.infoItem, {backgroundColor: COLORS.exhale + '20'}]}>
              <MaterialIcons name="arrow-downward" size={20} color={COLORS.exhale} />
              <Text style={styles.infoLabel}>Expirer</Text>
              <Text style={[styles.infoValue, {color: COLORS.exhale}]}>
                {selectedExercise.exhale}s
              </Text>
            </View>
          </View>
          <Text style={styles.totalTime}>
            Durée totale: ~{Math.round((selectedExercise.inhale + selectedExercise.hold + selectedExercise.exhale) * selectedExercise.cycles / 60)} min
          </Text>
        </View>
      )}

      {/* Completed Message */}
      {isCompleted && (
        <View style={styles.completedContainer}>
          <Text style={styles.completedMessage}>
            Excellent! Vous avez terminé votre exercice de respiration.
          </Text>
          <Text style={styles.completedSubtext}>
            Prenez un moment pour apprécier cette sensation de calme.
          </Text>
        </View>
      )}

      {/* Action Button */}
      <View style={styles.buttonContainer}>
        {isCompleted ? (
          <TouchableOpacity
            style={styles.mainButton}
            onPress={() => {
              setIsCompleted(false);
              setCurrentCycle(0);
            }}>
            <MaterialIcons name="replay" size={24} color="#fff" />
            <Text style={styles.mainButtonText}>Recommencer</Text>
          </TouchableOpacity>
        ) : isRunning ? (
          <TouchableOpacity
            style={[styles.mainButton, styles.stopButton]}
            onPress={stopExercise}>
            <MaterialIcons name="stop" size={24} color="#fff" />
            <Text style={styles.mainButtonText}>Arrêter</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.mainButton} onPress={startExercise}>
            <MaterialIcons name="play-arrow" size={24} color="#fff" />
            <Text style={styles.mainButtonText}>Commencer</Text>
          </TouchableOpacity>
        )}
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
  exerciseSelector: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 20,
  },
  exerciseOption: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  exerciseOptionActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '20',
  },
  exerciseOptionName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  exerciseOptionNameActive: {
    color: COLORS.primary,
  },
  exerciseOptionDesc: {
    fontSize: 10,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  breathingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  breathingCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  breathingInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  phaseText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  countdownText: {
    fontSize: 56,
    fontWeight: 'bold',
    color: '#fff',
  },
  readyText: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginTop: 12,
  },
  completedText: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.inhale,
    marginTop: 12,
  },
  cycleProgress: {
    marginTop: 24,
  },
  cycleText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  infoContainer: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  infoItem: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
  },
  infoLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  infoValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  totalTime: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  completedContainer: {
    paddingHorizontal: 32,
    alignItems: 'center',
    marginBottom: 20,
  },
  completedMessage: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  completedSubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  buttonContainer: {
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
  stopButton: {
    backgroundColor: '#ef4444',
  },
  mainButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
});
