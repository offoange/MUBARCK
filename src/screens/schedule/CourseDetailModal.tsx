/**
 * Modal de détail d'un cours
 * Permet de voir et modifier les détails variables d'un cours
 */

import React, {useState, useEffect} from 'react';
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
import {CoursGenere, DetailsCours, COLORS_SCHEDULE as COLORS} from '../../types/schedule';
import {useSchedule} from '../../context/ScheduleContext';
import CalendarGeneratorService from '../../services/CalendarGeneratorService';

interface CourseDetailModalProps {
  visible: boolean;
  cours: CoursGenere;
  onClose: () => void;
}

export default function CourseDetailModal({visible, cours, onClose}: CourseDetailModalProps) {
  const {updateDetailsCours, updateStatutCours} = useSchedule();

  const [isEditing, setIsEditing] = useState(false);
  const [theme, setTheme] = useState('');
  const [unite, setUnite] = useState('');
  const [typeEvaluation, setTypeEvaluation] = useState('');
  const [notesPersonnelles, setNotesPersonnelles] = useState('');
  const [objectifs, setObjectifs] = useState<string[]>([]);
  const [activites, setActivites] = useState<string[]>([]);
  const [newObjectif, setNewObjectif] = useState('');
  const [newActivite, setNewActivite] = useState('');

  useEffect(() => {
    if (cours) {
      setTheme(cours.details.theme);
      setUnite(cours.details.unite);
      setTypeEvaluation(cours.details.typeEvaluation);
      setNotesPersonnelles(cours.details.notesPersonnelles);
      setObjectifs([...cours.details.objectifs]);
      setActivites([...cours.details.activites]);
    }
  }, [cours]);

  const handleSave = async () => {
    try {
      const details: Partial<DetailsCours> = {
        theme,
        unite,
        typeEvaluation,
        notesPersonnelles,
        objectifs,
        activites,
      };

      await updateDetailsCours(cours.id, details);
      setIsEditing(false);
      Alert.alert('Succès', 'Les détails ont été sauvegardés');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      Alert.alert('Erreur', 'Impossible de sauvegarder les détails');
    }
  };

  const handleCancel = () => {
    setTheme(cours.details.theme);
    setUnite(cours.details.unite);
    setTypeEvaluation(cours.details.typeEvaluation);
    setNotesPersonnelles(cours.details.notesPersonnelles);
    setObjectifs([...cours.details.objectifs]);
    setActivites([...cours.details.activites]);
    setIsEditing(false);
  };

  const handleAddObjectif = () => {
    if (newObjectif.trim()) {
      setObjectifs([...objectifs, newObjectif.trim()]);
      setNewObjectif('');
    }
  };

  const handleRemoveObjectif = (index: number) => {
    setObjectifs(objectifs.filter((_, i) => i !== index));
  };

  const handleAddActivite = () => {
    if (newActivite.trim()) {
      setActivites([...activites, newActivite.trim()]);
      setNewActivite('');
    }
  };

  const handleRemoveActivite = (index: number) => {
    setActivites(activites.filter((_, i) => i !== index));
  };

  const handleChangeStatut = (statut: CoursGenere['statut']) => {
    Alert.alert(
      'Changer le statut',
      `Voulez-vous marquer ce cours comme "${getStatutLabel(statut)}" ?`,
      [
        {text: 'Annuler', style: 'cancel'},
        {
          text: 'Confirmer',
          onPress: async () => {
            await updateStatutCours(cours.id, statut);
          },
        },
      ]
    );
  };

  const getStatutLabel = (statut: CoursGenere['statut']) => {
    switch (statut) {
      case 'a_venir':
        return 'À venir';
      case 'en_cours':
        return 'En cours';
      case 'complete':
        return 'Terminé';
      case 'annule':
        return 'Annulé';
      default:
        return statut;
    }
  };

  const getStatutColor = (statut: CoursGenere['statut']) => {
    switch (statut) {
      case 'a_venir':
        return COLORS.primary;
      case 'en_cours':
        return COLORS.success;
      case 'complete':
        return COLORS.textMuted;
      case 'annule':
        return COLORS.error;
      default:
        return COLORS.textSecondary;
    }
  };

  const duree = CalendarGeneratorService.calculerDureeMinutes(cours.heureDebut, cours.heureFin);

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalContainer}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={[styles.modalHeader, {backgroundColor: cours.couleur}]}>
              <View style={styles.headerTop}>
                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                  <MaterialIcons name="close" size={24} color="#fff" />
                </TouchableOpacity>
                {!isEditing ? (
                  <TouchableOpacity style={styles.editButton} onPress={() => setIsEditing(true)}>
                    <MaterialIcons name="edit" size={20} color="#fff" />
                    <Text style={styles.editButtonText}>Modifier</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.editActions}>
                    <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                      <Text style={styles.cancelButtonText}>Annuler</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                      <MaterialIcons name="check" size={20} color={cours.couleur} />
                      <Text style={[styles.saveButtonText, {color: cours.couleur}]}>Sauvegarder</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              <Text style={styles.modalMatiere}>{cours.matiere}</Text>
              <Text style={styles.modalDate}>
                {CalendarGeneratorService.formatDateComplete(cours.date)}
              </Text>
              <View style={styles.timeRow}>
                <MaterialIcons name="schedule" size={16} color="rgba(255,255,255,0.8)" />
                <Text style={styles.modalTime}>
                  {cours.heureDebut} - {cours.heureFin} ({CalendarGeneratorService.formatDuree(duree)})
                </Text>
                {cours.salle ? (
                  <>
                    <MaterialIcons name="room" size={16} color="rgba(255,255,255,0.8)" />
                    <Text style={styles.modalSalle}>{cours.salle}</Text>
                  </>
                ) : null}
              </View>
            </View>

            {/* Content */}
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {/* Statut */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Statut</Text>
                <View style={styles.statutContainer}>
                  {(['a_venir', 'complete', 'annule'] as const).map(s => (
                    <TouchableOpacity
                      key={s}
                      style={[
                        styles.statutChip,
                        cours.statut === s && {backgroundColor: getStatutColor(s)},
                      ]}
                      onPress={() => handleChangeStatut(s)}>
                      <Text
                        style={[
                          styles.statutChipText,
                          cours.statut === s && {color: '#fff'},
                        ]}>
                        {getStatutLabel(s)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Thème */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Thème du cours</Text>
                {isEditing ? (
                  <TextInput
                    style={styles.textInput}
                    value={theme}
                    onChangeText={setTheme}
                    placeholder="Ex: Les causes des conflits mondiaux..."
                    placeholderTextColor={COLORS.textMuted}
                    multiline
                  />
                ) : (
                  <Text style={[styles.sectionContent, !theme && styles.emptyContent]}>
                    {theme || 'Aucun thème défini'}
                  </Text>
                )}
              </View>

              {/* Unité */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Unité</Text>
                {isEditing ? (
                  <TextInput
                    style={styles.textInput}
                    value={unite}
                    onChangeText={setUnite}
                    placeholder="Ex: Unité 3: LES DONNÉES"
                    placeholderTextColor={COLORS.textMuted}
                  />
                ) : (
                  <Text style={[styles.sectionContent, !unite && styles.emptyContent]}>
                    {unite || 'Aucune unité définie'}
                  </Text>
                )}
              </View>

              {/* Type d'évaluation */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <MaterialIcons name="assignment" size={20} color={COLORS.warning} />
                  <Text style={styles.sectionTitle}>Évaluation</Text>
                </View>
                {isEditing ? (
                  <TextInput
                    style={styles.textInput}
                    value={typeEvaluation}
                    onChangeText={setTypeEvaluation}
                    placeholder="Ex: Examen, Contrôle, Révision..."
                    placeholderTextColor={COLORS.textMuted}
                  />
                ) : (
                  <Text style={[styles.sectionContent, !typeEvaluation && styles.emptyContent]}>
                    {typeEvaluation || 'Aucune évaluation prévue'}
                  </Text>
                )}
              </View>

              {/* Objectifs */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Objectifs</Text>
                {objectifs.length === 0 && !isEditing ? (
                  <Text style={styles.emptyContent}>Aucun objectif défini</Text>
                ) : (
                  <View style={styles.listContainer}>
                    {objectifs.map((obj, index) => (
                      <View key={index} style={styles.listItem}>
                        <MaterialIcons name="check-circle" size={16} color={COLORS.success} />
                        <Text style={styles.listItemText}>{obj}</Text>
                        {isEditing && (
                          <TouchableOpacity onPress={() => handleRemoveObjectif(index)}>
                            <MaterialIcons name="close" size={18} color={COLORS.error} />
                          </TouchableOpacity>
                        )}
                      </View>
                    ))}
                  </View>
                )}
                {isEditing && (
                  <View style={styles.addItemContainer}>
                    <TextInput
                      style={styles.addItemInput}
                      value={newObjectif}
                      onChangeText={setNewObjectif}
                      placeholder="Ajouter un objectif..."
                      placeholderTextColor={COLORS.textMuted}
                      onSubmitEditing={handleAddObjectif}
                    />
                    <TouchableOpacity style={styles.addItemButton} onPress={handleAddObjectif}>
                      <MaterialIcons name="add" size={20} color="#fff" />
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              {/* Activités */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Activités</Text>
                {activites.length === 0 && !isEditing ? (
                  <Text style={styles.emptyContent}>Aucune activité définie</Text>
                ) : (
                  <View style={styles.listContainer}>
                    {activites.map((act, index) => (
                      <View key={index} style={styles.listItem}>
                        <MaterialIcons name="play-arrow" size={16} color={COLORS.primary} />
                        <Text style={styles.listItemText}>{act}</Text>
                        {isEditing && (
                          <TouchableOpacity onPress={() => handleRemoveActivite(index)}>
                            <MaterialIcons name="close" size={18} color={COLORS.error} />
                          </TouchableOpacity>
                        )}
                      </View>
                    ))}
                  </View>
                )}
                {isEditing && (
                  <View style={styles.addItemContainer}>
                    <TextInput
                      style={styles.addItemInput}
                      value={newActivite}
                      onChangeText={setNewActivite}
                      placeholder="Ajouter une activité..."
                      placeholderTextColor={COLORS.textMuted}
                      onSubmitEditing={handleAddActivite}
                    />
                    <TouchableOpacity style={styles.addItemButton} onPress={handleAddActivite}>
                      <MaterialIcons name="add" size={20} color="#fff" />
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              {/* Notes personnelles */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <MaterialIcons name="note" size={20} color={COLORS.textSecondary} />
                  <Text style={styles.sectionTitle}>Notes personnelles</Text>
                </View>
                {isEditing ? (
                  <TextInput
                    style={[styles.textInput, styles.textArea]}
                    value={notesPersonnelles}
                    onChangeText={setNotesPersonnelles}
                    placeholder="Ajoutez vos notes personnelles..."
                    placeholderTextColor={COLORS.textMuted}
                    multiline
                    numberOfLines={4}
                  />
                ) : (
                  <Text style={[styles.sectionContent, !notesPersonnelles && styles.emptyContent]}>
                    {notesPersonnelles || 'Aucune note'}
                  </Text>
                )}
              </View>

              {/* Dernière mise à jour */}
              {cours.details.derniereMiseAJour && (
                <View style={styles.lastUpdate}>
                  <MaterialIcons name="update" size={14} color={COLORS.textMuted} />
                  <Text style={styles.lastUpdateText}>
                    Dernière modification: {new Date(cours.details.derniereMiseAJour).toLocaleDateString('fr-FR')}
                  </Text>
                </View>
              )}

              <View style={styles.bottomSpacer} />
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
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
    padding: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    gap: 6,
  },
  editButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  editActions: {
    flexDirection: 'row',
    gap: 8,
  },
  cancelButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  cancelButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#fff',
    gap: 4,
  },
  saveButtonText: {
    fontWeight: '600',
    fontSize: 14,
  },
  modalMatiere: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  modalDate: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 8,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalTime: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginRight: 12,
  },
  modalSalle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
  },
  modalBody: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  sectionContent: {
    fontSize: 16,
    color: COLORS.textPrimary,
    lineHeight: 24,
  },
  emptyContent: {
    color: COLORS.textMuted,
    fontStyle: 'italic',
  },
  textInput: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  statutContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  statutChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.cardDark,
  },
  statutChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  listContainer: {
    gap: 8,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: COLORS.card,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
  },
  listItemText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textPrimary,
    lineHeight: 20,
  },
  addItemContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  addItemInput: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  addItemButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lastUpdate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  lastUpdateText: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  bottomSpacer: {
    height: 40,
  },
});
