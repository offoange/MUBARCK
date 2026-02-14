import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  StatusBar,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import LocalStorageService from '../services/LocalStorageService';

const COLORS = {
  primary: '#6c2bee',
  background: '#161022',
  card: '#1d172a',
  textPrimary: '#ffffff',
  textSecondary: '#94a3b8',
  error: '#ef4444',
  success: '#22c55e',
};

interface SignUpScreenProps {
  onSignUpSuccess: () => void;
  onLogin: () => void;
}

export default function SignUpScreen({onSignUpSuccess, onLogin}: SignUpScreenProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    studyField: '',
    dailyStudyHours: '',
    sleepGoal: '',
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);

  const validateStep1 = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Le nom complet est requis';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'L\'email n\'est pas valide';
    }

    if (!formData.password) {
      newErrors.password = 'Le mot de passe est requis';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.studyField.trim()) {
      newErrors.studyField = 'Le domaine d\'études est requis';
    }

    if (!formData.dailyStudyHours) {
      newErrors.dailyStudyHours = 'Les heures d\'études par jour sont requises';
    }

    if (!formData.sleepGoal) {
      newErrors.sleepGoal = 'L\'objectif de sommeil est requis';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleSignUp = async () => {
    if (!validateStep2()) {
      return;
    }

    setIsLoading(true);

    try {
      // Sauvegarder le profil utilisateur
      await LocalStorageService.saveUserProfile({
        name: formData.fullName,
        email: formData.email,
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDv1T6_MgXb2h74tuQcPVMvbw8S4R4pc8Z3-CfWR5oci3d8PSI1QKZ33IPQzRJ1qQjUgGPSmaTTP-oIP1iKm_WGUOu38P3H75umAWRzAXa3NkZkqKRMeonVId2OvWSlMgBSBCreAds8CmeG5LfaCyJLo10LTJrW0BtJgfkrAHBCMW8S24zfS-wum183e4jgZYcZF4dhfi7F9aeHyWwOEK2A1fBqaYMxMs7GPJsNxQ4hCBVzTdFQWrKN0bNe9Tth2LOvB4uhxJp5zAQ',
        level: 'LEVEL 1 DÉBUTANT',
        dayStreak: 0,
        wellnessScore: 0,
      });

      // Sauvegarder les objectifs
      await LocalStorageService.saveGoals([
        {
          id: '1',
          icon: 'menu-book',
          iconColor: COLORS.primary,
          title: 'Objectif d\'études quotidien',
          subtitle: 'Heures par jour',
          progress: 0,
          displayValue: `${formData.dailyStudyHours}h`,
        },
        {
          id: '2',
          icon: 'bedtime',
          iconColor: '#38bdf8',
          title: 'Objectif de sommeil',
          subtitle: 'Durée cible',
          progress: 0,
          displayValue: `${formData.sleepGoal}h`,
        },
      ]);

      // Sauvegarder les paramètres initiaux
      await LocalStorageService.saveSettings({
        morningMotivation: true,
        hydrationNudges: true,
        focusModeAlerts: false,
        theme: 'dark',
      });

      // Sauvegarder le mot de passe pour la connexion future
      await LocalStorageService.saveUserPassword(formData.password);

      // Marquer l'utilisateur comme connecté
      await LocalStorageService.setLoggedIn(true);

      // Marquer l'onboarding comme complété
      await LocalStorageService.setOnboardingCompleted(true);
      
      Alert.alert(
        'Inscription réussie!',
        `Bienvenue ${formData.fullName}! Votre compte a été créé avec succès.`,
        [{text: 'Commencer', onPress: onSignUpSuccess}]
      );
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de l\'inscription.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderInput = (
    label: string,
    field: keyof typeof formData,
    placeholder: string,
    icon: string,
    options?: {
      secureTextEntry?: boolean;
      keyboardType?: 'default' | 'email-address' | 'numeric';
    }
  ) => (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={[styles.inputWrapper, errors[field] && styles.inputError]}>
        <MaterialIcons name={icon} size={20} color={COLORS.textSecondary} />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textSecondary}
          value={formData[field]}
          onChangeText={(text) => {
            setFormData({...formData, [field]: text});
            if (errors[field]) {
              setErrors({...errors, [field]: ''});
            }
          }}
          secureTextEntry={options?.secureTextEntry}
          keyboardType={options?.keyboardType || 'default'}
          autoCapitalize={field === 'email' ? 'none' : 'words'}
        />
      </View>
      {errors[field] && (
        <Text style={styles.errorText}>{errors[field]}</Text>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          
          {/* Header */}
          <View style={styles.header}>
            {step === 2 && (
              <TouchableOpacity onPress={() => setStep(1)} style={styles.backButton}>
                <MaterialIcons name="arrow-back" size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            )}
            <View style={styles.headerContent}>
              <Text style={styles.title}>
                {step === 1 ? 'Créer un compte' : 'Personnalisez votre expérience'}
              </Text>
              <Text style={styles.subtitle}>
                {step === 1 
                  ? 'Entrez vos informations pour commencer'
                  : 'Définissez vos objectifs personnels'}
              </Text>
            </View>
          </View>

          {/* Progress indicator */}
          <View style={styles.progressContainer}>
            <View style={[styles.progressStep, step >= 1 && styles.progressStepActive]} />
            <View style={[styles.progressLine, step >= 2 && styles.progressLineActive]} />
            <View style={[styles.progressStep, step >= 2 && styles.progressStepActive]} />
          </View>

          {/* Step 1: Personal Info */}
          {step === 1 && (
            <View style={styles.form}>
              {renderInput('Nom complet', 'fullName', 'John Doe', 'person')}
              {renderInput('Email', 'email', 'john@example.com', 'email', {keyboardType: 'email-address'})}
              {renderInput('Mot de passe', 'password', '••••••••', 'lock', {secureTextEntry: true})}
              {renderInput('Confirmer le mot de passe', 'confirmPassword', '••••••••', 'lock-outline', {secureTextEntry: true})}

              <TouchableOpacity style={styles.primaryButton} onPress={handleNext}>
                <Text style={styles.primaryButtonText}>Continuer</Text>
                <MaterialIcons name="arrow-forward" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          )}

          {/* Step 2: Goals */}
          {step === 2 && (
            <View style={styles.form}>
              {renderInput('Domaine d\'études', 'studyField', 'Ex: Informatique, Médecine...', 'school')}
              {renderInput('Heures d\'études par jour', 'dailyStudyHours', 'Ex: 4', 'schedule', {keyboardType: 'numeric'})}
              {renderInput('Objectif de sommeil (heures)', 'sleepGoal', 'Ex: 8', 'bedtime', {keyboardType: 'numeric'})}

              <TouchableOpacity
                style={[styles.primaryButton, isLoading && styles.buttonDisabled]}
                onPress={handleSignUp}
                disabled={isLoading}>
                <Text style={styles.primaryButtonText}>
                  {isLoading ? 'Inscription en cours...' : 'Créer mon compte'}
                </Text>
                {!isLoading && <MaterialIcons name="check" size={20} color="#fff" />}
              </TouchableOpacity>
            </View>
          )}

          {/* Login link */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Vous avez déjà un compte?</Text>
            <TouchableOpacity onPress={onLogin}>
              <Text style={styles.loginLink}>Se connecter</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  backButton: {
    marginBottom: 16,
  },
  headerContent: {},
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    lineHeight: 24,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  progressStep: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  progressStepActive: {
    backgroundColor: COLORS.primary,
  },
  progressLine: {
    width: 60,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginHorizontal: 8,
  },
  progressLineActive: {
    backgroundColor: COLORS.primary,
  },
  form: {
    gap: 20,
  },
  inputContainer: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
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
  errorText: {
    fontSize: 12,
    color: COLORS.error,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
    gap: 4,
  },
  loginText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  loginLink: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
  },
});
