import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {DailyGoal} from '../services/LocalStorageService';

const COLORS = {
  primary: '#6c2bee',
  background: '#161022',
  card: '#1d172a',
  textPrimary: '#ffffff',
  textSecondary: '#94a3b8',
  success: '#22c55e',
  error: '#ef4444',
};

interface DailyGoalModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (goal: DailyGoal) => void;
  onComplete: () => void;
  onDelete: () => void;
  currentGoal: DailyGoal | null;
}

export default function DailyGoalModal({
  visible,
  onClose,
  onSave,
  onComplete,
  onDelete,
  currentGoal,
}: DailyGoalModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<{title?: string; description?: string}>({});

  useEffect(() => {
    if (currentGoal) {
      setTitle(currentGoal.title);
      setDescription(currentGoal.description);
    } else {
      setTitle('');
      setDescription('');
    }
    setErrors({});
  }, [currentGoal, visible]);

  const validateForm = () => {
    const newErrors: {title?: string; description?: string} = {};

    if (!title.trim()) {
      newErrors.title = 'Le titre est requis';
    }

    if (!description.trim()) {
      newErrors.description = 'La description est requise';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) {
      return;
    }

    const goal: DailyGoal = {
      id: currentGoal?.id || Date.now().toString(),
      title: title.trim(),
      description: description.trim(),
      isCompleted: currentGoal?.isCompleted || false,
      createdAt: currentGoal?.createdAt || new Date().toISOString(),
      completedAt: currentGoal?.completedAt,
    };

    onSave(goal);
  };

  const handleComplete = () => {
    onComplete();
  };

  const handleDelete = () => {
    onDelete();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalContainer}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Header */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {currentGoal ? 'Modifier l\'objectif' : 'Nouvel objectif'}
                </Text>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <MaterialIcons name="close" size={24} color={COLORS.textSecondary} />
                </TouchableOpacity>
              </View>

              {/* Form */}
              <View style={styles.form}>
                {/* Title Input */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Titre de l'objectif</Text>
                  <View style={[styles.inputWrapper, errors.title && styles.inputError]}>
                    <MaterialIcons name="flag" size={20} color={COLORS.textSecondary} />
                    <TextInput
                      style={styles.input}
                      placeholder="Ex: Maîtriser le Calcul II"
                      placeholderTextColor={COLORS.textSecondary}
                      value={title}
                      onChangeText={(text) => {
                        setTitle(text);
                        if (errors.title) {
                          setErrors({...errors, title: ''});
                        }
                      }}
                    />
                  </View>
                  {errors.title && (
                    <Text style={styles.errorText}>{errors.title}</Text>
                  )}
                </View>

                {/* Description Input */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Description</Text>
                  <View style={[styles.textAreaWrapper, errors.description && styles.inputError]}>
                    <TextInput
                      style={styles.textArea}
                      placeholder="Ex: Terminer les exercices de révision du chapitre 4..."
                      placeholderTextColor={COLORS.textSecondary}
                      value={description}
                      onChangeText={(text) => {
                        setDescription(text);
                        if (errors.description) {
                          setErrors({...errors, description: ''});
                        }
                      }}
                      multiline
                      numberOfLines={4}
                      textAlignVertical="top"
                    />
                  </View>
                  {errors.description && (
                    <Text style={styles.errorText}>{errors.description}</Text>
                  )}
                </View>

                {/* Status indicator if goal exists */}
                {currentGoal && (
                  <View style={styles.statusContainer}>
                    <View style={[
                      styles.statusBadge,
                      currentGoal.isCompleted ? styles.statusCompleted : styles.statusPending
                    ]}>
                      <MaterialIcons
                        name={currentGoal.isCompleted ? 'check-circle' : 'schedule'}
                        size={16}
                        color={currentGoal.isCompleted ? COLORS.success : COLORS.primary}
                      />
                      <Text style={[
                        styles.statusText,
                        currentGoal.isCompleted ? styles.statusTextCompleted : styles.statusTextPending
                      ]}>
                        {currentGoal.isCompleted ? 'Objectif atteint !' : 'En cours'}
                      </Text>
                    </View>
                  </View>
                )}
              </View>

              {/* Actions */}
              <View style={styles.actionsContainer}>
                {/* Save Button */}
                <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                  <MaterialIcons name="save" size={20} color="#fff" />
                  <Text style={styles.saveButtonText}>
                    {currentGoal ? 'Mettre à jour' : 'Créer l\'objectif'}
                  </Text>
                </TouchableOpacity>

                {/* Complete & Delete buttons (only if goal exists) */}
                {currentGoal && !currentGoal.isCompleted && (
                  <TouchableOpacity style={styles.completeButton} onPress={handleComplete}>
                    <MaterialIcons name="check" size={20} color="#fff" />
                    <Text style={styles.completeButtonText}>Marquer comme atteint</Text>
                  </TouchableOpacity>
                )}

                {currentGoal && (
                  <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
                    <MaterialIcons name="delete-outline" size={20} color={COLORS.error} />
                    <Text style={styles.deleteButtonText}>
                      {currentGoal.isCompleted ? 'Définir un nouvel objectif' : 'Supprimer'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
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
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  form: {
    gap: 20,
  },
  inputContainer: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'transparent',
    gap: 12,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textPrimary,
    paddingVertical: 12,
  },
  textAreaWrapper: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  textArea: {
    fontSize: 16,
    color: COLORS.textPrimary,
    minHeight: 100,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.error,
  },
  statusContainer: {
    marginTop: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  statusCompleted: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
  },
  statusPending: {
    backgroundColor: 'rgba(108, 43, 238, 0.15)',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  statusTextCompleted: {
    color: COLORS.success,
  },
  statusTextPending: {
    color: COLORS.primary,
  },
  actionsContainer: {
    marginTop: 24,
    gap: 12,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.success,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  completeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.error,
    gap: 8,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.error,
  },
});
