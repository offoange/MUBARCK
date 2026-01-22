import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const COLORS = {
  primary: '#6c2bee',
  background: '#161022',
  card: '#1d172a',
  cardLight: '#2a2438',
  textPrimary: '#ffffff',
  textSecondary: '#94a3b8',
  sky: '#38bdf8',
  emerald: '#34d399',
  danger: '#ef4444',
};

type WellnessType = 'sleep' | 'steps' | 'water';

interface WellnessEditModalProps {
  visible: boolean;
  onClose: () => void;
  type: WellnessType;
  currentValue: {
    // Pour le sommeil
    hours?: number;
    minutes?: number;
    // Pour les pas et l'eau
    current?: number;
    target?: number;
  };
  onSave: (value: any) => void;
}

export default function WellnessEditModal({
  visible,
  onClose,
  type,
  currentValue,
  onSave,
}: WellnessEditModalProps) {
  // États pour le sommeil
  const [sleepHours, setSleepHours] = useState('0');
  const [sleepMinutes, setSleepMinutes] = useState('0');
  const [sleepTarget, setSleepTarget] = useState('8');

  // États pour les pas
  const [stepsCount, setStepsCount] = useState('0');
  const [stepsTarget, setStepsTarget] = useState('8000');

  // États pour l'eau
  const [waterAmount, setWaterAmount] = useState('0');
  const [waterTarget, setWaterTarget] = useState('2');

  // Initialiser les valeurs quand le modal s'ouvre
  useEffect(() => {
    if (visible) {
      if (type === 'sleep') {
        setSleepHours(String(currentValue.hours || 0));
        setSleepMinutes(String(currentValue.minutes || 0));
        setSleepTarget(String(currentValue.target || 8));
      } else if (type === 'steps') {
        setStepsCount(String(currentValue.current || 0));
        setStepsTarget(String(currentValue.target || 8000));
      } else if (type === 'water') {
        setWaterAmount(String(currentValue.current || 0));
        setWaterTarget(String(currentValue.target || 2));
      }
    }
  }, [visible, type, currentValue]);

  const handleSave = () => {
    if (type === 'sleep') {
      onSave({
        hours: parseInt(sleepHours, 10) || 0,
        minutes: parseInt(sleepMinutes, 10) || 0,
        target: parseInt(sleepTarget, 10) || 8,
      });
    } else if (type === 'steps') {
      onSave({
        current: parseInt(stepsCount, 10) || 0,
        target: parseInt(stepsTarget, 10) || 8000,
      });
    } else if (type === 'water') {
      onSave({
        current: parseFloat(waterAmount) || 0,
        target: parseFloat(waterTarget) || 2,
      });
    }
    onClose();
  };

  const getTitle = () => {
    switch (type) {
      case 'sleep':
        return 'Heures de sommeil';
      case 'steps':
        return 'Nombre de pas';
      case 'water':
        return 'Consommation d\'eau';
      default:
        return '';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'sleep':
        return 'bedtime';
      case 'steps':
        return 'directions-run';
      case 'water':
        return 'water-drop';
      default:
        return 'favorite';
    }
  };

  const getIconColor = () => {
    switch (type) {
      case 'sleep':
        return COLORS.primary;
      case 'steps':
        return COLORS.emerald;
      case 'water':
        return COLORS.sky;
      default:
        return COLORS.primary;
    }
  };

  // Boutons rapides pour ajouter des pas
  const quickAddSteps = (amount: number) => {
    const current = parseInt(stepsCount, 10) || 0;
    setStepsCount(String(current + amount));
  };

  // Boutons rapides pour ajouter de l'eau
  const quickAddWater = (amount: number) => {
    const current = parseFloat(waterAmount) || 0;
    setWaterAmount(String(Math.round((current + amount) * 10) / 10));
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color={COLORS.textSecondary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{getTitle()}</Text>
            <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
              <Text style={styles.saveButtonText}>Enregistrer</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Icône */}
            <View style={styles.iconContainer}>
              <View style={[styles.iconCircle, {backgroundColor: getIconColor()}]}>
                <MaterialIcons name={getIcon()} size={40} color="#fff" />
              </View>
            </View>

            {/* Contenu selon le type */}
            {type === 'sleep' && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Durée de sommeil cette nuit</Text>
                <View style={styles.timeContainer}>
                  <View style={styles.timeInputGroup}>
                    <TextInput
                      style={styles.timeInput}
                      value={sleepHours}
                      onChangeText={text => {
                        const num = text.replace(/[^0-9]/g, '');
                        if (num === '' || parseInt(num, 10) <= 24) {
                          setSleepHours(num);
                        }
                      }}
                      keyboardType="numeric"
                      maxLength={2}
                    />
                    <Text style={styles.timeLabel}>heures</Text>
                  </View>
                  <View style={styles.timeInputGroup}>
                    <TextInput
                      style={styles.timeInput}
                      value={sleepMinutes}
                      onChangeText={text => {
                        const num = text.replace(/[^0-9]/g, '');
                        if (num === '' || parseInt(num, 10) <= 59) {
                          setSleepMinutes(num);
                        }
                      }}
                      keyboardType="numeric"
                      maxLength={2}
                    />
                    <Text style={styles.timeLabel}>minutes</Text>
                  </View>
                </View>

                <Text style={[styles.sectionTitle, {marginTop: 24}]}>Objectif quotidien</Text>
                <View style={styles.targetContainer}>
                  <TextInput
                    style={styles.targetInput}
                    value={sleepTarget}
                    onChangeText={text => {
                      const num = text.replace(/[^0-9]/g, '');
                      setSleepTarget(num);
                    }}
                    keyboardType="numeric"
                    maxLength={2}
                  />
                  <Text style={styles.targetLabel}>heures par nuit</Text>
                </View>
              </View>
            )}

            {type === 'steps' && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Nombre de pas aujourd'hui</Text>
                <TextInput
                  style={styles.largeInput}
                  value={stepsCount}
                  onChangeText={text => {
                    const num = text.replace(/[^0-9]/g, '');
                    setStepsCount(num);
                  }}
                  keyboardType="numeric"
                  maxLength={6}
                />

                <Text style={styles.quickAddTitle}>Ajouter rapidement</Text>
                <View style={styles.quickAddContainer}>
                  <TouchableOpacity
                    style={styles.quickAddButton}
                    onPress={() => quickAddSteps(500)}>
                    <Text style={styles.quickAddText}>+500</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.quickAddButton}
                    onPress={() => quickAddSteps(1000)}>
                    <Text style={styles.quickAddText}>+1000</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.quickAddButton}
                    onPress={() => quickAddSteps(2000)}>
                    <Text style={styles.quickAddText}>+2000</Text>
                  </TouchableOpacity>
                </View>

                <Text style={[styles.sectionTitle, {marginTop: 24}]}>Objectif quotidien</Text>
                <View style={styles.targetContainer}>
                  <TextInput
                    style={styles.targetInput}
                    value={stepsTarget}
                    onChangeText={text => {
                      const num = text.replace(/[^0-9]/g, '');
                      setStepsTarget(num);
                    }}
                    keyboardType="numeric"
                    maxLength={6}
                  />
                  <Text style={styles.targetLabel}>pas par jour</Text>
                </View>
              </View>
            )}

            {type === 'water' && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Eau consommée aujourd'hui (L)</Text>
                <TextInput
                  style={styles.largeInput}
                  value={waterAmount}
                  onChangeText={text => {
                    const num = text.replace(/[^0-9.]/g, '');
                    setWaterAmount(num);
                  }}
                  keyboardType="decimal-pad"
                  maxLength={4}
                />

                <Text style={styles.quickAddTitle}>Ajouter rapidement</Text>
                <View style={styles.quickAddContainer}>
                  <TouchableOpacity
                    style={styles.quickAddButton}
                    onPress={() => quickAddWater(0.25)}>
                    <Text style={styles.quickAddText}>+0.25L</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.quickAddButton}
                    onPress={() => quickAddWater(0.5)}>
                    <Text style={styles.quickAddText}>+0.5L</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.quickAddButton}
                    onPress={() => quickAddWater(1)}>
                    <Text style={styles.quickAddText}>+1L</Text>
                  </TouchableOpacity>
                </View>

                <Text style={[styles.sectionTitle, {marginTop: 24}]}>Objectif quotidien</Text>
                <View style={styles.targetContainer}>
                  <TextInput
                    style={styles.targetInput}
                    value={waterTarget}
                    onChangeText={text => {
                      const num = text.replace(/[^0-9.]/g, '');
                      setWaterTarget(num);
                    }}
                    keyboardType="decimal-pad"
                    maxLength={3}
                  />
                  <Text style={styles.targetLabel}>litres par jour</Text>
                </View>
              </View>
            )}

            <View style={styles.bottomSpacer} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  content: {
    padding: 16,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
  },
  timeInputGroup: {
    alignItems: 'center',
  },
  timeInput: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    fontSize: 36,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    textAlign: 'center',
    width: 100,
  },
  timeLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 8,
  },
  targetContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  targetInput: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 12,
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    textAlign: 'center',
    width: 100,
  },
  targetLabel: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  largeInput: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 20,
    fontSize: 48,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  quickAddTitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 20,
    marginBottom: 12,
    textAlign: 'center',
  },
  quickAddContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  quickAddButton: {
    backgroundColor: COLORS.card,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  quickAddText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
  },
  bottomSpacer: {
    height: 40,
  },
});
