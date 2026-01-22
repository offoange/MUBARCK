/**
 * Modal pour ajouter une activité personnelle
 */

import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {ActivitePersonnelle, TypeActivite, COLORS_SCHEDULE as COLORS} from '../../types/schedule';

interface AddActivityModalProps {
  visible: boolean;
  selectedDate: string;
  onClose: () => void;
  onSave: (activity: Omit<ActivitePersonnelle, 'id'>) => void;
}

const TYPES_ACTIVITE: {type: TypeActivite; label: string; icon: string; color: string}[] = [
  {type: 'etude', label: 'Étude', icon: 'menu-book', color: '#4A90E2'},
  {type: 'sport', label: 'Sport', icon: 'sports-soccer', color: '#F39C12'},
  {type: 'loisir', label: 'Loisir', icon: 'sports-esports', color: '#9B59B6'},
  {type: 'rendez_vous', label: 'Rendez-vous', icon: 'event', color: '#E74C3C'},
  {type: 'autre', label: 'Autre', icon: 'more-horiz', color: '#95A5A6'},
];

const HEURES_DISPONIBLES = [
  '06:00', '06:30', '07:00', '07:30', '08:00', '08:30', '09:00', '09:30',
  '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
  '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30',
  '22:00',
];

export default function AddActivityModal({
  visible,
  selectedDate,
  onClose,
  onSave,
}: AddActivityModalProps) {
  const [titre, setTitre] = useState('');
  const [description, setDescription] = useState('');
  const [heureDebut, setHeureDebut] = useState('09:00');
  const [heureFin, setHeureFin] = useState('10:00');
  const [type, setType] = useState<TypeActivite>('etude');
  const [rappel, setRappel] = useState(false);
  const [showHeureDebutPicker, setShowHeureDebutPicker] = useState(false);
  const [showHeureFinPicker, setShowHeureFinPicker] = useState(false);

  const selectedTypeInfo = TYPES_ACTIVITE.find(t => t.type === type);

  const resetForm = () => {
    setTitre('');
    setDescription('');
    setHeureDebut('09:00');
    setHeureFin('10:00');
    setType('etude');
    setRappel(false);
  };

  const handleSave = () => {
    if (!titre.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer un titre pour l\'activité');
      return;
    }

    if (heureDebut >= heureFin) {
      Alert.alert('Erreur', 'L\'heure de fin doit être après l\'heure de début');
      return;
    }

    const activity: Omit<ActivitePersonnelle, 'id'> = {
      titre: titre.trim(),
      description: description.trim(),
      date: selectedDate,
      heureDebut,
      heureFin,
      type,
      couleur: selectedTypeInfo?.color || COLORS.primary,
      rappel,
      complete: false,
    };

    onSave(activity);
    resetForm();
    onClose();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const jours = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    const mois = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
    return `${jours[date.getDay()]} ${date.getDate()} ${mois[date.getMonth()]}`;
  };

  const renderTimePicker = (
    isVisible: boolean,
    currentValue: string,
    onSelect: (time: string) => void,
    onClose: () => void
  ) => {
    if (!isVisible) return null;

    return (
      <Modal visible={isVisible} transparent animationType="fade">
        <TouchableOpacity
          style={styles.timePickerOverlay}
          activeOpacity={1}
          onPress={onClose}>
          <View style={styles.timePickerContainer}>
            <Text style={styles.timePickerTitle}>Sélectionner l'heure</Text>
            <ScrollView style={styles.timePickerScroll}>
              {HEURES_DISPONIBLES.map(heure => (
                <TouchableOpacity
                  key={heure}
                  style={[
                    styles.timePickerItem,
                    currentValue === heure && styles.timePickerItemSelected,
                  ]}
                  onPress={() => {
                    onSelect(heure);
                    onClose();
                  }}>
                  <Text
                    style={[
                      styles.timePickerItemText,
                      currentValue === heure && styles.timePickerItemTextSelected,
                    ]}>
                    {heure}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalContainer}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                <MaterialIcons name="close" size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Nouvelle activité</Text>
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Ajouter</Text>
              </TouchableOpacity>
            </View>

            {/* Date */}
            <View style={styles.dateContainer}>
              <MaterialIcons name="event" size={20} color={COLORS.primary} />
              <Text style={styles.dateText}>{formatDate(selectedDate)}</Text>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {/* Titre */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Titre *</Text>
                <TextInput
                  style={styles.textInput}
                  value={titre}
                  onChangeText={setTitre}
                  placeholder="Ex: Révision mathématiques"
                  placeholderTextColor={COLORS.textMuted}
                />
              </View>

              {/* Type d'activité */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Type d'activité</Text>
                <View style={styles.typeContainer}>
                  {TYPES_ACTIVITE.map(t => (
                    <TouchableOpacity
                      key={t.type}
                      style={[
                        styles.typeChip,
                        type === t.type && {backgroundColor: t.color},
                      ]}
                      onPress={() => setType(t.type)}>
                      <MaterialIcons
                        name={t.icon}
                        size={18}
                        color={type === t.type ? '#fff' : COLORS.textSecondary}
                      />
                      <Text
                        style={[
                          styles.typeChipText,
                          type === t.type && {color: '#fff'},
                        ]}>
                        {t.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Horaires */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Horaires</Text>
                <View style={styles.timeRow}>
                  <TouchableOpacity
                    style={styles.timeButton}
                    onPress={() => setShowHeureDebutPicker(true)}>
                    <MaterialIcons name="schedule" size={18} color={COLORS.textSecondary} />
                    <Text style={styles.timeButtonText}>{heureDebut}</Text>
                  </TouchableOpacity>
                  <Text style={styles.timeSeparator}>→</Text>
                  <TouchableOpacity
                    style={styles.timeButton}
                    onPress={() => setShowHeureFinPicker(true)}>
                    <MaterialIcons name="schedule" size={18} color={COLORS.textSecondary} />
                    <Text style={styles.timeButtonText}>{heureFin}</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Description */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Description (optionnel)</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Ajouter des détails..."
                  placeholderTextColor={COLORS.textMuted}
                  multiline
                  numberOfLines={3}
                />
              </View>

              {/* Rappel */}
              <TouchableOpacity
                style={styles.rappelContainer}
                onPress={() => setRappel(!rappel)}>
                <View style={styles.rappelLeft}>
                  <MaterialIcons name="notifications" size={22} color={COLORS.textSecondary} />
                  <Text style={styles.rappelText}>Activer le rappel</Text>
                </View>
                <View style={[styles.checkbox, rappel && styles.checkboxChecked]}>
                  {rappel && <MaterialIcons name="check" size={16} color="#fff" />}
                </View>
              </TouchableOpacity>

              <View style={styles.bottomSpacer} />
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Time Pickers */}
      {renderTimePicker(
        showHeureDebutPicker,
        heureDebut,
        setHeureDebut,
        () => setShowHeureDebutPicker(false)
      )}
      {renderTimePicker(
        showHeureFinPicker,
        heureFin,
        setHeureFin,
        () => setShowHeureFinPicker(false)
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: COLORS.primary + '15',
  },
  dateText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.primary,
  },
  modalBody: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  typeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: COLORS.cardDark,
    borderRadius: 20,
  },
  typeChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  timeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.card,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  timeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  timeSeparator: {
    fontSize: 18,
    color: COLORS.textMuted,
  },
  rappelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.card,
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  rappelLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rappelText: {
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.textMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  bottomSpacer: {
    height: 40,
  },
  timePickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timePickerContainer: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    width: '80%',
    maxHeight: '60%',
    overflow: 'hidden',
  },
  timePickerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    textAlign: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  timePickerScroll: {
    maxHeight: 300,
  },
  timePickerItem: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  timePickerItemSelected: {
    backgroundColor: COLORS.primary + '20',
  },
  timePickerItemText: {
    fontSize: 16,
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  timePickerItemTextSelected: {
    color: COLORS.primary,
    fontWeight: '600',
  },
});
