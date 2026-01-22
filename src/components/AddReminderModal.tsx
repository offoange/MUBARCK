import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
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
  orange: '#fb923c',
  pink: '#f472b6',
  purple: '#a855f7',
  emerald: '#34d399',
  danger: '#ef4444',
};

// Catégories disponibles
const CATEGORIES = [
  {id: 'Santé', label: 'Santé', icon: 'favorite', color: COLORS.pink},
  {id: 'Études', label: 'Études', icon: 'menu-book', color: COLORS.orange},
  {id: 'Bien-être', label: 'Bien-être', icon: 'spa', color: COLORS.purple},
];

// Icônes disponibles pour les rappels
const ICONS = [
  {id: 'water-drop', label: 'Eau', color: COLORS.sky},
  {id: 'timer', label: 'Timer', color: COLORS.orange},
  {id: 'self-improvement', label: 'Méditation', color: COLORS.pink},
  {id: 'phonelink-off', label: 'Déconnexion', color: COLORS.purple},
  {id: 'fitness-center', label: 'Sport', color: COLORS.emerald},
  {id: 'restaurant', label: 'Repas', color: COLORS.orange},
  {id: 'bedtime', label: 'Sommeil', color: COLORS.sky},
  {id: 'directions-walk', label: 'Marche', color: COLORS.emerald},
];

// Types de répétition
const REPEAT_TYPES = [
  {id: 'none', label: 'Une seule fois'},
  {id: 'daily', label: 'Tous les jours'},
  {id: 'hourly', label: 'Toutes les X heures'},
];

interface AddReminderModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (reminder: NewReminder) => void;
}

export interface NewReminder {
  title: string;
  category: string;
  icon: string;
  iconColor: string;
  hour: number;
  minute: number;
  repeatType: 'daily' | 'hourly' | 'weekly' | 'none';
  repeatInterval?: number;
}

export default function AddReminderModal({
  visible,
  onClose,
  onSave,
}: AddReminderModalProps) {
  const [title, setTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Santé');
  const [selectedIcon, setSelectedIcon] = useState(ICONS[0]);
  const [hour, setHour] = useState('08');
  const [minute, setMinute] = useState('00');
  const [repeatType, setRepeatType] = useState<'daily' | 'hourly' | 'weekly' | 'none'>('daily');
  const [repeatInterval, setRepeatInterval] = useState('2');

  const resetForm = () => {
    setTitle('');
    setSelectedCategory('Santé');
    setSelectedIcon(ICONS[0]);
    setHour('08');
    setMinute('00');
    setRepeatType('daily');
    setRepeatInterval('2');
  };

  const handleSave = () => {
    if (!title.trim()) {
      return;
    }

    const newReminder: NewReminder = {
      title: title.trim(),
      category: selectedCategory,
      icon: selectedIcon.id,
      iconColor: '#fff',
      hour: parseInt(hour, 10) || 0,
      minute: parseInt(minute, 10) || 0,
      repeatType,
      repeatInterval: repeatType === 'hourly' ? parseInt(repeatInterval, 10) || 2 : undefined,
    };

    onSave(newReminder);
    resetForm();
    onClose();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color={COLORS.textSecondary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Nouveau rappel</Text>
            <TouchableOpacity
              onPress={handleSave}
              style={[styles.saveButton, !title.trim() && styles.saveButtonDisabled]}>
              <Text style={[styles.saveButtonText, !title.trim() && styles.saveButtonTextDisabled]}>
                Ajouter
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Titre */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Titre du rappel</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: Boire de l'eau"
                placeholderTextColor={COLORS.textSecondary}
                value={title}
                onChangeText={setTitle}
              />
            </View>

            {/* Catégorie */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Catégorie</Text>
              <View style={styles.categoryGrid}>
                {CATEGORIES.map(cat => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.categoryItem,
                      selectedCategory === cat.id && styles.categoryItemSelected,
                    ]}
                    onPress={() => setSelectedCategory(cat.id)}>
                    <MaterialIcons
                      name={cat.icon}
                      size={24}
                      color={selectedCategory === cat.id ? cat.color : COLORS.textSecondary}
                    />
                    <Text
                      style={[
                        styles.categoryLabel,
                        selectedCategory === cat.id && {color: cat.color},
                      ]}>
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Icône */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Icône</Text>
              <View style={styles.iconGrid}>
                {ICONS.map(icon => (
                  <TouchableOpacity
                    key={icon.id}
                    style={[
                      styles.iconItem,
                      selectedIcon.id === icon.id && {backgroundColor: icon.color},
                    ]}
                    onPress={() => setSelectedIcon(icon)}>
                    <MaterialIcons
                      name={icon.id}
                      size={24}
                      color={selectedIcon.id === icon.id ? '#fff' : COLORS.textSecondary}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Heure */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Heure</Text>
              <View style={styles.timeContainer}>
                <TextInput
                  style={styles.timeInput}
                  placeholder="08"
                  placeholderTextColor={COLORS.textSecondary}
                  value={hour}
                  onChangeText={text => {
                    const num = text.replace(/[^0-9]/g, '');
                    if (num === '' || (parseInt(num, 10) >= 0 && parseInt(num, 10) <= 23)) {
                      setHour(num.slice(0, 2));
                    }
                  }}
                  keyboardType="numeric"
                  maxLength={2}
                />
                <Text style={styles.timeSeparator}>:</Text>
                <TextInput
                  style={styles.timeInput}
                  placeholder="00"
                  placeholderTextColor={COLORS.textSecondary}
                  value={minute}
                  onChangeText={text => {
                    const num = text.replace(/[^0-9]/g, '');
                    if (num === '' || (parseInt(num, 10) >= 0 && parseInt(num, 10) <= 59)) {
                      setMinute(num.slice(0, 2));
                    }
                  }}
                  keyboardType="numeric"
                  maxLength={2}
                />
              </View>
            </View>

            {/* Répétition */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Répétition</Text>
              <View style={styles.repeatContainer}>
                {REPEAT_TYPES.map(type => (
                  <TouchableOpacity
                    key={type.id}
                    style={[
                      styles.repeatItem,
                      repeatType === type.id && styles.repeatItemSelected,
                    ]}
                    onPress={() => setRepeatType(type.id as typeof repeatType)}>
                    <Text
                      style={[
                        styles.repeatLabel,
                        repeatType === type.id && styles.repeatLabelSelected,
                      ]}>
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Intervalle horaire */}
              {repeatType === 'hourly' && (
                <View style={styles.intervalContainer}>
                  <Text style={styles.intervalLabel}>Toutes les</Text>
                  <TextInput
                    style={styles.intervalInput}
                    value={repeatInterval}
                    onChangeText={text => {
                      const num = text.replace(/[^0-9]/g, '');
                      setRepeatInterval(num);
                    }}
                    keyboardType="numeric"
                    maxLength={2}
                  />
                  <Text style={styles.intervalLabel}>heures</Text>
                </View>
              )}
            </View>

            {/* Espace en bas */}
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
    maxHeight: '90%',
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
  saveButtonDisabled: {
    backgroundColor: COLORS.cardLight,
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  saveButtonTextDisabled: {
    color: COLORS.textSecondary,
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  categoryGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  categoryItem: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  categoryItemSelected: {
    backgroundColor: COLORS.cardLight,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  categoryLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  iconItem: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  timeInput: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    textAlign: 'center',
    width: 80,
  },
  timeSeparator: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  repeatContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  repeatItem: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  repeatItemSelected: {
    backgroundColor: COLORS.primary,
  },
  repeatLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
    textAlign: 'center',
  },
  repeatLabelSelected: {
    color: '#fff',
  },
  intervalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: 16,
  },
  intervalLabel: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  intervalInput: {
    backgroundColor: COLORS.card,
    borderRadius: 8,
    padding: 12,
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    textAlign: 'center',
    width: 60,
  },
  bottomSpacer: {
    height: 40,
  },
});
