import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import LocalStorageService, {Note} from '../services/LocalStorageService';

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

const NOTE_COLORS = [
  '#6c2bee', // Violet
  '#3b82f6', // Bleu
  '#22c55e', // Vert
  '#f59e0b', // Orange
  '#ef4444', // Rouge
  '#ec4899', // Rose
];

const SUBJECTS = [
  'Mathématiques',
  'Physique',
  'Chimie',
  'Biologie',
  'Français',
  'Anglais',
  'Histoire',
  'Géographie',
  'Informatique',
  'Autre',
];

interface NotesScreenProps {
  onClose: () => void;
}

export default function NotesScreen({onClose}: NotesScreenProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  // Champs du formulaire
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteSubject, setNoteSubject] = useState(SUBJECTS[0]);
  const [noteColor, setNoteColor] = useState(NOTE_COLORS[0]);

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      const savedNotes = await LocalStorageService.getNotes();
      setNotes(savedNotes);
    } catch (error) {
      console.error('Erreur lors du chargement des notes:', error);
    }
  };

  const openNewNoteModal = () => {
    setIsEditing(false);
    setCurrentNote(null);
    setNoteTitle('');
    setNoteContent('');
    setNoteSubject(SUBJECTS[0]);
    setNoteColor(NOTE_COLORS[0]);
    setIsModalVisible(true);
  };

  const openEditNoteModal = (note: Note) => {
    setIsEditing(true);
    setCurrentNote(note);
    setNoteTitle(note.title);
    setNoteContent(note.content);
    setNoteSubject(note.subject);
    setNoteColor(note.color);
    setIsModalVisible(true);
  };

  const saveNote = async () => {
    if (!noteTitle.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer un titre pour la note.');
      return;
    }

    if (!noteContent.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer le contenu de la note.');
      return;
    }

    try {
      const now = new Date().toISOString();

      if (isEditing && currentNote) {
        const updatedNote: Note = {
          ...currentNote,
          title: noteTitle.trim(),
          content: noteContent.trim(),
          subject: noteSubject,
          color: noteColor,
          updatedAt: now,
        };
        await LocalStorageService.updateNote(updatedNote);
      } else {
        const newNote: Note = {
          id: Date.now().toString(),
          title: noteTitle.trim(),
          content: noteContent.trim(),
          subject: noteSubject,
          color: noteColor,
          createdAt: now,
          updatedAt: now,
        };
        await LocalStorageService.addNote(newNote);
      }

      await loadNotes();
      setIsModalVisible(false);
      Alert.alert('Succès', isEditing ? 'Note mise à jour avec succès !' : 'Note enregistrée avec succès !');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la note:', error);
      Alert.alert('Erreur', 'Impossible de sauvegarder la note. Veuillez réessayer.');
    }
  };

  const deleteNote = async (noteId: string) => {
    Alert.alert(
      'Supprimer la note',
      'Êtes-vous sûr de vouloir supprimer cette note ?',
      [
        {text: 'Annuler', style: 'cancel'},
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await LocalStorageService.deleteNote(noteId);
              await loadNotes();
            } catch (error) {
              console.error('Erreur lors de la suppression de la note:', error);
            }
          },
        },
      ]
    );
  };

  const filteredNotes = notes.filter(note => {
    const matchesSearch =
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = !selectedSubject || note.subject === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <MaterialIcons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notes de Révision</Text>
        <TouchableOpacity onPress={openNewNoteModal} style={styles.addButton}>
          <MaterialIcons name="add" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <MaterialIcons name="search" size={20} color={COLORS.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher une note..."
          placeholderTextColor={COLORS.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <MaterialIcons name="close" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Subject Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}>
        <TouchableOpacity
          style={[
            styles.filterChip,
            !selectedSubject && styles.filterChipActive,
          ]}
          onPress={() => setSelectedSubject(null)}>
          <Text
            style={[
              styles.filterChipText,
              !selectedSubject && styles.filterChipTextActive,
            ]}>
            Tout
          </Text>
        </TouchableOpacity>
        {SUBJECTS.map(subject => (
          <TouchableOpacity
            key={subject}
            style={[
              styles.filterChip,
              selectedSubject === subject && styles.filterChipActive,
            ]}
            onPress={() => setSelectedSubject(subject)}>
            <Text
              style={[
                styles.filterChipText,
                selectedSubject === subject && styles.filterChipTextActive,
              ]}>
              {subject}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Notes List */}
      <ScrollView style={styles.notesList} contentContainerStyle={styles.notesContent}>
        {filteredNotes.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialIcons name="note-add" size={64} color={COLORS.textSecondary} />
            <Text style={styles.emptyStateTitle}>Aucune note</Text>
            <Text style={styles.emptyStateText}>
              Commencez à prendre des notes pour vos révisions
            </Text>
            <TouchableOpacity style={styles.emptyStateButton} onPress={openNewNoteModal}>
              <MaterialIcons name="add" size={20} color="#fff" />
              <Text style={styles.emptyStateButtonText}>Créer une note</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filteredNotes.map(note => (
            <TouchableOpacity
              key={note.id}
              style={[styles.noteCard, {borderLeftColor: note.color}]}
              onPress={() => openEditNoteModal(note)}
              onLongPress={() => deleteNote(note.id)}>
              <View style={styles.noteHeader}>
                <View style={[styles.subjectBadge, {backgroundColor: note.color + '30'}]}>
                  <Text style={[styles.subjectText, {color: note.color}]}>
                    {note.subject}
                  </Text>
                </View>
                <Text style={styles.noteDate}>{formatDate(note.updatedAt)}</Text>
              </View>
              <Text style={styles.noteTitle}>{note.title}</Text>
              <Text style={styles.notePreview} numberOfLines={2}>
                {note.content}
              </Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Note Modal */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {isEditing ? 'Modifier la note' : 'Nouvelle note'}
              </Text>
              <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                <MaterialIcons name="close" size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {/* Title Input */}
              <Text style={styles.inputLabel}>Titre</Text>
              <TextInput
                style={styles.input}
                placeholder="Titre de la note"
                placeholderTextColor={COLORS.textSecondary}
                value={noteTitle}
                onChangeText={setNoteTitle}
              />

              {/* Subject Selector */}
              <Text style={styles.inputLabel}>Matière</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.subjectSelector}>
                {SUBJECTS.map(subject => (
                  <TouchableOpacity
                    key={subject}
                    style={[
                      styles.subjectOption,
                      noteSubject === subject && styles.subjectOptionActive,
                    ]}
                    onPress={() => setNoteSubject(subject)}>
                    <Text
                      style={[
                        styles.subjectOptionText,
                        noteSubject === subject && styles.subjectOptionTextActive,
                      ]}>
                      {subject}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Color Selector */}
              <Text style={styles.inputLabel}>Couleur</Text>
              <View style={styles.colorSelector}>
                {NOTE_COLORS.map(color => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorOption,
                      {backgroundColor: color},
                      noteColor === color && styles.colorOptionActive,
                    ]}
                    onPress={() => setNoteColor(color)}>
                    {noteColor === color && (
                      <MaterialIcons name="check" size={16} color="#fff" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>

              {/* Content Input */}
              <Text style={styles.inputLabel}>Contenu</Text>
              <TextInput
                style={[styles.input, styles.contentInput]}
                placeholder="Écrivez vos notes de révision ici..."
                placeholderTextColor={COLORS.textSecondary}
                value={noteContent}
                onChangeText={setNoteContent}
                multiline
                textAlignVertical="top"
              />
            </ScrollView>

            {/* Save Button */}
            <TouchableOpacity style={styles.saveButton} onPress={saveNote}>
              <MaterialIcons name="save" size={20} color="#fff" />
              <Text style={styles.saveButtonText}>
                {isEditing ? 'Mettre à jour' : 'Enregistrer'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    marginHorizontal: 16,
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  filterContainer: {
    maxHeight: 44,
    marginBottom: 12,
  },
  filterContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.card,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
  },
  filterChipText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  filterChipTextActive: {
    color: '#fff',
  },
  notesList: {
    flex: 1,
  },
  notesContent: {
    padding: 16,
    gap: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginTop: 16,
  },
  emptyStateText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  emptyStateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 24,
    gap: 8,
  },
  emptyStateButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  noteCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    marginBottom: 12,
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  subjectBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  subjectText: {
    fontSize: 11,
    fontWeight: '600',
  },
  noteDate: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  notePreview: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.card,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  modalBody: {
    padding: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  contentInput: {
    minHeight: 150,
  },
  subjectSelector: {
    marginBottom: 16,
  },
  subjectOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.card,
    marginRight: 8,
  },
  subjectOptionActive: {
    backgroundColor: COLORS.primary,
  },
  subjectOptionText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  subjectOptionTextActive: {
    color: '#fff',
  },
  colorSelector: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  colorOption: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorOptionActive: {
    borderWidth: 3,
    borderColor: '#fff',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    margin: 20,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
