/**
 * Écran de configuration initiale de l'emploi du temps
 * Assistant guidé pour saisir l'emploi du temps de base
 */

import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {
  EmploiDuTempsBase,
  CoursBase,
  PeriodeAnnee,
  PeriodeVacances,
  JourCours,
  MATIERES_PREDEFINIES,
  EMPLOI_DU_TEMPS_DEFAUT,
  COLORS_SCHEDULE as COLORS,
} from '../../types/schedule';
import {useSchedule} from '../../context/ScheduleContext';

interface SetupScheduleScreenProps {
  onComplete: () => void;
  onCancel: () => void;
}

type SetupStep = 'welcome' | 'schedule' | 'period' | 'vacations' | 'confirm';

const JOURS: JourCours[] = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi'];
const JOURS_LABELS: Record<JourCours, string> = {
  lundi: 'Lundi',
  mardi: 'Mardi',
  mercredi: 'Mercredi',
  jeudi: 'Jeudi',
  vendredi: 'Vendredi',
};

export default function SetupScheduleScreen({onComplete, onCancel}: SetupScheduleScreenProps) {
  const {saveEmploiDuTempsBase, savePeriodeAnnee, saveVacances, genererCours} = useSchedule();

  const [currentStep, setCurrentStep] = useState<SetupStep>('welcome');
  const [emploiDuTemps, setEmploiDuTemps] = useState<EmploiDuTempsBase>(EMPLOI_DU_TEMPS_DEFAUT);
  const [selectedJour, setSelectedJour] = useState<JourCours>('lundi');
  const [periodeAnnee, setPeriodeAnnee] = useState<PeriodeAnnee>({
    dateDebut: '2026-01-12',
    dateFin: '2026-06-30',
  });
  const [vacances, setVacances] = useState<PeriodeVacances[]>([
    {id: '1', nom: 'Vacances de Février', debut: '2026-02-10', fin: '2026-02-21'},
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddCours, setShowAddCours] = useState(false);
  const [showAddVacances, setShowAddVacances] = useState(false);
  const [_editingCours, setEditingCours] = useState<CoursBase | null>(null);

  // Form state for new cours
  const [newCoursMatiere, setNewCoursMatiere] = useState('');
  const [newCoursHeureDebut, setNewCoursHeureDebut] = useState('08:00');
  const [newCoursHeureFin, setNewCoursHeureFin] = useState('09:00');
  const [newCoursSalle, setNewCoursSalle] = useState('');
  const [newCoursCouleur, setNewCoursCouleur] = useState('#6c2bee');

  // Form state for vacances
  const [newVacancesNom, setNewVacancesNom] = useState('');
  const [newVacancesDebut, setNewVacancesDebut] = useState('');
  const [newVacancesFin, setNewVacancesFin] = useState('');

  const handleNext = () => {
    const steps: SetupStep[] = ['welcome', 'schedule', 'period', 'vacations', 'confirm'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const handleBack = () => {
    const steps: SetupStep[] = ['welcome', 'schedule', 'period', 'vacations', 'confirm'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  const handleAddCours = () => {
    if (!newCoursMatiere) {
      Alert.alert('Erreur', 'Veuillez sélectionner une matière');
      return;
    }

    const newCours: CoursBase = {
      id: `${selectedJour}_${Date.now()}`,
      heureDebut: newCoursHeureDebut,
      heureFin: newCoursHeureFin,
      matiere: newCoursMatiere,
      salle: newCoursSalle,
      couleur: newCoursCouleur,
    };

    setEmploiDuTemps(prev => ({
      ...prev,
      [selectedJour]: [...prev[selectedJour], newCours].sort((a, b) =>
        a.heureDebut.localeCompare(b.heureDebut)
      ),
    }));

    resetCoursForm();
    setShowAddCours(false);
  };

  const handleDeleteCours = (coursId: string) => {
    Alert.alert(
      'Supprimer le cours',
      'Êtes-vous sûr de vouloir supprimer ce cours ?',
      [
        {text: 'Annuler', style: 'cancel'},
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            setEmploiDuTemps(prev => ({
              ...prev,
              [selectedJour]: prev[selectedJour].filter(c => c.id !== coursId),
            }));
          },
        },
      ]
    );
  };

  const handleAddVacances = () => {
    if (!newVacancesNom || !newVacancesDebut || !newVacancesFin) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    const newVacance: PeriodeVacances = {
      id: Date.now().toString(),
      nom: newVacancesNom,
      debut: newVacancesDebut,
      fin: newVacancesFin,
    };

    setVacances(prev => [...prev, newVacance]);
    resetVacancesForm();
    setShowAddVacances(false);
  };

  const handleDeleteVacances = (vacancesId: string) => {
    setVacances(prev => prev.filter(v => v.id !== vacancesId));
  };

  const resetCoursForm = () => {
    setNewCoursMatiere('');
    setNewCoursHeureDebut('08:00');
    setNewCoursHeureFin('09:00');
    setNewCoursSalle('');
    setNewCoursCouleur('#6c2bee');
    setEditingCours(null);
  };

  const resetVacancesForm = () => {
    setNewVacancesNom('');
    setNewVacancesDebut('');
    setNewVacancesFin('');
  };

  const handleComplete = async () => {
    try {
      setIsLoading(true);

      // Sauvegarder la configuration
      await saveEmploiDuTempsBase(emploiDuTemps);
      await savePeriodeAnnee(periodeAnnee);
      await saveVacances(vacances);

      // Générer tous les cours
      await genererCours();

      Alert.alert(
        'Configuration terminée !',
        'Votre emploi du temps a été configuré et tous les cours ont été générés.',
        [{text: 'OK', onPress: onComplete}]
      );
    } catch (error) {
      console.error('Erreur lors de la configuration:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de la configuration.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderWelcomeStep = () => (
    <View style={styles.stepContent}>
      <View style={styles.welcomeIcon}>
        <MaterialIcons name="calendar-today" size={80} color={COLORS.primary} />
      </View>
      <Text style={styles.welcomeTitle}>Configuration de l'emploi du temps</Text>
      <Text style={styles.welcomeDescription}>
        Bienvenue ! Cet assistant va vous guider pour configurer votre emploi du temps de base.
        Cette configuration ne sera à faire qu'une seule fois en début d'année.
      </Text>
      <View style={styles.welcomeFeatures}>
        <View style={styles.featureItem}>
          <MaterialIcons name="check-circle" size={24} color={COLORS.success} />
          <Text style={styles.featureText}>Emploi du temps fixe pour l'année</Text>
        </View>
        <View style={styles.featureItem}>
          <MaterialIcons name="check-circle" size={24} color={COLORS.success} />
          <Text style={styles.featureText}>Génération automatique des cours</Text>
        </View>
        <View style={styles.featureItem}>
          <MaterialIcons name="check-circle" size={24} color={COLORS.success} />
          <Text style={styles.featureText}>Gestion des vacances scolaires</Text>
        </View>
      </View>
      <Text style={styles.welcomeNote}>
        Note : Un emploi du temps par défaut (MYP 5B) est pré-rempli. Vous pouvez le modifier selon vos besoins.
      </Text>
    </View>
  );

  const renderScheduleStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Emploi du temps de base</Text>
      <Text style={styles.stepDescription}>
        Configurez les cours pour chaque jour de la semaine
      </Text>

      {/* Sélecteur de jour */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.jourSelector}>
        {JOURS.map(jour => (
          <TouchableOpacity
            key={jour}
            style={[styles.jourButton, selectedJour === jour && styles.jourButtonActive]}
            onPress={() => setSelectedJour(jour)}>
            <Text style={[styles.jourButtonText, selectedJour === jour && styles.jourButtonTextActive]}>
              {JOURS_LABELS[jour]}
            </Text>
            <Text style={[styles.jourCount, selectedJour === jour && styles.jourCountActive]}>
              {emploiDuTemps[jour].length} cours
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Liste des cours du jour */}
      <ScrollView style={styles.coursList}>
        {emploiDuTemps[selectedJour].length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialIcons name="event-busy" size={48} color={COLORS.textMuted} />
            <Text style={styles.emptyStateText}>Aucun cours pour ce jour</Text>
          </View>
        ) : (
          emploiDuTemps[selectedJour].map(cours => (
            <View key={cours.id} style={[styles.coursItem, {borderLeftColor: cours.couleur}]}>
              <View style={styles.coursInfo}>
                <Text style={styles.coursHoraire}>
                  {cours.heureDebut} - {cours.heureFin}
                </Text>
                <Text style={styles.coursMatiere}>{cours.matiere}</Text>
                {cours.salle ? (
                  <Text style={styles.coursSalle}>{cours.salle}</Text>
                ) : null}
              </View>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteCours(cours.id)}>
                <MaterialIcons name="delete" size={20} color={COLORS.error} />
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>

      {/* Bouton ajouter */}
      <TouchableOpacity style={styles.addButton} onPress={() => setShowAddCours(true)}>
        <MaterialIcons name="add" size={24} color="#fff" />
        <Text style={styles.addButtonText}>Ajouter un cours</Text>
      </TouchableOpacity>
    </View>
  );

  const renderPeriodStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Période scolaire</Text>
      <Text style={styles.stepDescription}>
        Définissez les dates de début et de fin de l'année scolaire
      </Text>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Date de début</Text>
        <TextInput
          style={styles.input}
          value={periodeAnnee.dateDebut}
          onChangeText={text => setPeriodeAnnee(prev => ({...prev, dateDebut: text}))}
          placeholder="AAAA-MM-JJ"
          placeholderTextColor={COLORS.textMuted}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Date de fin</Text>
        <TextInput
          style={styles.input}
          value={periodeAnnee.dateFin}
          onChangeText={text => setPeriodeAnnee(prev => ({...prev, dateFin: text}))}
          placeholder="AAAA-MM-JJ"
          placeholderTextColor={COLORS.textMuted}
        />
      </View>

      <View style={styles.infoBox}>
        <MaterialIcons name="info" size={20} color={COLORS.primary} />
        <Text style={styles.infoText}>
          Les weekends (samedi et dimanche) seront automatiquement exclus
        </Text>
      </View>
    </View>
  );

  const renderVacationsStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Périodes de vacances</Text>
      <Text style={styles.stepDescription}>
        Ajoutez les périodes de vacances scolaires à exclure
      </Text>

      <ScrollView style={styles.vacancesList}>
        {vacances.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialIcons name="beach-access" size={48} color={COLORS.textMuted} />
            <Text style={styles.emptyStateText}>Aucune période de vacances</Text>
          </View>
        ) : (
          vacances.map(v => (
            <View key={v.id} style={styles.vacancesItem}>
              <View style={styles.vacancesInfo}>
                <Text style={styles.vacancesNom}>{v.nom}</Text>
                <Text style={styles.vacancesDates}>
                  {v.debut} → {v.fin}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteVacances(v.id)}>
                <MaterialIcons name="delete" size={20} color={COLORS.error} />
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>

      <TouchableOpacity style={styles.addButton} onPress={() => setShowAddVacances(true)}>
        <MaterialIcons name="add" size={24} color="#fff" />
        <Text style={styles.addButtonText}>Ajouter des vacances</Text>
      </TouchableOpacity>
    </View>
  );

  const renderConfirmStep = () => {
    const totalCours = JOURS.reduce((acc, jour) => acc + emploiDuTemps[jour].length, 0);

    return (
      <View style={styles.stepContent}>
        <View style={styles.confirmIcon}>
          <MaterialIcons name="check-circle" size={80} color={COLORS.success} />
        </View>
        <Text style={styles.confirmTitle}>Prêt à générer !</Text>
        <Text style={styles.confirmDescription}>
          Vérifiez le résumé de votre configuration avant de générer l'emploi du temps
        </Text>

        <View style={styles.summaryCard}>
          <View style={styles.summaryItem}>
            <MaterialIcons name="event" size={24} color={COLORS.primary} />
            <View style={styles.summaryItemInfo}>
              <Text style={styles.summaryItemLabel}>Période scolaire</Text>
              <Text style={styles.summaryItemValue}>
                {periodeAnnee.dateDebut} → {periodeAnnee.dateFin}
              </Text>
            </View>
          </View>

          <View style={styles.summaryItem}>
            <MaterialIcons name="school" size={24} color={COLORS.primary} />
            <View style={styles.summaryItemInfo}>
              <Text style={styles.summaryItemLabel}>Cours par semaine</Text>
              <Text style={styles.summaryItemValue}>{totalCours} cours</Text>
            </View>
          </View>

          <View style={styles.summaryItem}>
            <MaterialIcons name="beach-access" size={24} color={COLORS.primary} />
            <View style={styles.summaryItemInfo}>
              <Text style={styles.summaryItemLabel}>Périodes de vacances</Text>
              <Text style={styles.summaryItemValue}>{vacances.length} période(s)</Text>
            </View>
          </View>
        </View>

        <View style={styles.warningBox}>
          <MaterialIcons name="warning" size={20} color={COLORS.warning} />
          <Text style={styles.warningText}>
            Cette action générera tous les cours pour l'année. Vous pourrez modifier les détails ensuite.
          </Text>
        </View>
      </View>
    );
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'welcome':
        return renderWelcomeStep();
      case 'schedule':
        return renderScheduleStep();
      case 'period':
        return renderPeriodStep();
      case 'vacations':
        return renderVacationsStep();
      case 'confirm':
        return renderConfirmStep();
      default:
        return null;
    }
  };

  const renderAddCoursModal = () => (
    <Modal visible={showAddCours} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Ajouter un cours</Text>
            <TouchableOpacity onPress={() => {
              resetCoursForm();
              setShowAddCours(false);
            }}>
              <MaterialIcons name="close" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            <Text style={styles.inputLabel}>Matière</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.matieresList}>
              {MATIERES_PREDEFINIES.map(m => (
                <TouchableOpacity
                  key={m.nom}
                  style={[
                    styles.matiereChip,
                    {backgroundColor: m.couleur + '30', borderColor: m.couleur},
                    newCoursMatiere === m.nom && {backgroundColor: m.couleur},
                  ]}
                  onPress={() => {
                    setNewCoursMatiere(m.nom);
                    setNewCoursCouleur(m.couleur);
                  }}>
                  <MaterialIcons
                    name={m.icone as any}
                    size={16}
                    color={newCoursMatiere === m.nom ? '#fff' : m.couleur}
                  />
                  <Text
                    style={[
                      styles.matiereChipText,
                      {color: newCoursMatiere === m.nom ? '#fff' : m.couleur},
                    ]}>
                    {m.nom}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.rowInputs}>
              <View style={[styles.inputGroup, {flex: 1}]}>
                <Text style={styles.inputLabel}>Début</Text>
                <TextInput
                  style={styles.input}
                  value={newCoursHeureDebut}
                  onChangeText={setNewCoursHeureDebut}
                  placeholder="08:00"
                  placeholderTextColor={COLORS.textMuted}
                />
              </View>
              <View style={[styles.inputGroup, {flex: 1}]}>
                <Text style={styles.inputLabel}>Fin</Text>
                <TextInput
                  style={styles.input}
                  value={newCoursHeureFin}
                  onChangeText={setNewCoursHeureFin}
                  placeholder="09:00"
                  placeholderTextColor={COLORS.textMuted}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Salle (optionnel)</Text>
              <TextInput
                style={styles.input}
                value={newCoursSalle}
                onChangeText={setNewCoursSalle}
                placeholder="Ex: Salle 101, Labo..."
                placeholderTextColor={COLORS.textMuted}
              />
            </View>
          </ScrollView>

          <TouchableOpacity style={styles.modalButton} onPress={handleAddCours}>
            <Text style={styles.modalButtonText}>Ajouter</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderAddVacancesModal = () => (
    <Modal visible={showAddVacances} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Ajouter des vacances</Text>
            <TouchableOpacity onPress={() => {
              resetVacancesForm();
              setShowAddVacances(false);
            }}>
              <MaterialIcons name="close" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>

          <View style={styles.modalBody}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nom de la période</Text>
              <TextInput
                style={styles.input}
                value={newVacancesNom}
                onChangeText={setNewVacancesNom}
                placeholder="Ex: Vacances de Pâques"
                placeholderTextColor={COLORS.textMuted}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Date de début</Text>
              <TextInput
                style={styles.input}
                value={newVacancesDebut}
                onChangeText={setNewVacancesDebut}
                placeholder="AAAA-MM-JJ"
                placeholderTextColor={COLORS.textMuted}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Date de fin</Text>
              <TextInput
                style={styles.input}
                value={newVacancesFin}
                onChangeText={setNewVacancesFin}
                placeholder="AAAA-MM-JJ"
                placeholderTextColor={COLORS.textMuted}
              />
            </View>
          </View>

          <TouchableOpacity style={styles.modalButton} onPress={handleAddVacances}>
            <Text style={styles.modalButtonText}>Ajouter</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const steps: SetupStep[] = ['welcome', 'schedule', 'period', 'vacations', 'confirm'];
  const currentStepIndex = steps.indexOf(currentStep);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onCancel} style={styles.headerButton}>
          <MaterialIcons name="close" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <View style={styles.stepsIndicator}>
          {steps.map((_, index) => (
            <View
              key={index}
              style={[
                styles.stepDot,
                index <= currentStepIndex && styles.stepDotActive,
              ]}
            />
          ))}
        </View>
        <View style={styles.headerButton} />
      </View>

      {/* Content */}
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {renderStep()}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        {currentStep !== 'welcome' && (
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <MaterialIcons name="arrow-back" size={20} color={COLORS.textPrimary} />
            <Text style={styles.backButtonText}>Retour</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.nextButton, currentStep === 'welcome' && {flex: 1}]}
          onPress={currentStep === 'confirm' ? handleComplete : handleNext}
          disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.nextButtonText}>
                {currentStep === 'confirm' ? 'Générer l\'emploi du temps' : 'Suivant'}
              </Text>
              {currentStep !== 'confirm' && (
                <MaterialIcons name="arrow-forward" size={20} color="#fff" />
              )}
            </>
          )}
        </TouchableOpacity>
      </View>

      {renderAddCoursModal()}
      {renderAddVacancesModal()}
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepsIndicator: {
    flexDirection: 'row',
    gap: 8,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.cardDark,
  },
  stepDotActive: {
    backgroundColor: COLORS.primary,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 24,
  },
  welcomeIcon: {
    alignItems: 'center',
    marginBottom: 24,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 16,
  },
  welcomeDescription: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  welcomeFeatures: {
    gap: 16,
    marginBottom: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  welcomeNote: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  jourSelector: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  jourButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: COLORS.cardDark,
    marginRight: 8,
    alignItems: 'center',
  },
  jourButtonActive: {
    backgroundColor: COLORS.primary,
  },
  jourButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  jourButtonTextActive: {
    color: '#fff',
  },
  jourCount: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  jourCountActive: {
    color: 'rgba(255,255,255,0.8)',
  },
  coursList: {
    flex: 1,
    marginBottom: 16,
  },
  coursItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderLeftWidth: 4,
  },
  coursInfo: {
    flex: 1,
  },
  coursHoraire: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  coursMatiere: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  coursSalle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  deleteButton: {
    padding: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyStateText: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 12,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '20',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  vacancesList: {
    flex: 1,
    marginBottom: 16,
  },
  vacancesItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  vacancesInfo: {
    flex: 1,
  },
  vacancesNom: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  vacancesDates: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  confirmIcon: {
    alignItems: 'center',
    marginBottom: 24,
  },
  confirmTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  confirmDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  summaryCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    gap: 16,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  summaryItemInfo: {
    flex: 1,
  },
  summaryItemLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 2,
  },
  summaryItemValue: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.warning + '20',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: COLORS.cardDark,
    gap: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  nextButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    gap: 8,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
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
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  modalBody: {
    padding: 16,
  },
  modalButton: {
    margin: 16,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  matieresList: {
    marginBottom: 16,
  },
  matiereChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    gap: 6,
  },
  matiereChipText: {
    fontSize: 12,
    fontWeight: '500',
  },
  rowInputs: {
    flexDirection: 'row',
    gap: 12,
  },
});
