import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Image,
  Alert,
  ActionSheetIOS,
  Platform,
  TextInput,
  Modal,
  Linking,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import {SafeAreaView} from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import ProfileStatCard from '../components/ProfileStatCard';
import GoalSlider from '../components/GoalSlider';
import SettingsItem from '../components/SettingsItem';
import BottomNavigation from '../components/BottomNavigation';
import LocalStorageService, {UserProfile, Goal} from '../services/LocalStorageService';

const COLORS = {
  primary: '#6c2bee',
  background: '#161022',
  card: '#1d172a',
  orange: '#f97316',
  emerald: '#34d399',
  pink: '#ec4899',
  sky: '#38bdf8',
  textPrimary: '#ffffff',
  textSecondary: '#94a3b8',
  danger: '#ef4444',
};

interface ProfileScreenProps {
  activeTab?: string;
  onTabPress?: (tab: string) => void;
  onLogout?: () => void;
}

export default function ProfileScreen({
  activeTab = 'profile',
  onTabPress,
  onLogout,
}: ProfileScreenProps) {
  const [morningMotivation, setMorningMotivation] = useState(true);
  const [hydrationNudges, setHydrationNudges] = useState(true);
  const [focusModeAlerts, setFocusModeAlerts] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: '',
    email: '',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDv1T6_MgXb2h74tuQcPVMvbw8S4R4pc8Z3-CfWR5oci3d8PSI1QKZ33IPQzRJ1qQjUgGPSmaTTP-oIP1iKm_WGUOu38P3H75umAWRzAXa3NkZkqKRMeonVId2OvWSlMgBSBCreAds8CmeG5LfaCyJLo10LTJrW0BtJgfkrAHBCMW8S24zfS-wum183e4jgZYcZF4dhfi7F9aeHyWwOEK2A1fBqaYMxMs7GPJsNxQ4hCBVzTdFQWrKN0bNe9Tth2LOvB4uhxJp5zAQ',
    level: 'LEVEL 1 DÉBUTANT',
    dayStreak: 0,
    wellnessScore: 0,
  });
  const [goals, setGoals] = useState<Goal[]>([
    {
      id: '1',
      icon: 'menu-book',
      iconColor: COLORS.primary,
      title: 'Objectif d\'étude quotidien',
      subtitle: 'Heures par jour',
      progress: 50,
      displayValue: '4h',
    },
    {
      id: '2',
      icon: 'bedtime',
      iconColor: COLORS.sky,
      title: 'Objectif de sommeil',
      subtitle: 'Durée cible',
      progress: 100,
      displayValue: '8h 00m',
    },
  ]);

  // Charger les données du profil et des paramètres depuis le stockage au démarrage
  useEffect(() => {
    const loadProfileData = async () => {
      try {
        // Charger le profil utilisateur
        const savedProfile = await LocalStorageService.getUserProfile();
        if (savedProfile) {
          setUserProfile(savedProfile);
        } else {
          // Si aucun profil n'est sauvegardé, sauvegarder le profil initial
          await LocalStorageService.saveUserProfile(userProfile);
        }

        // Charger les paramètres
        const savedSettings = await LocalStorageService.getSettings();
        if (savedSettings) {
          setMorningMotivation(savedSettings.morningMotivation);
          setHydrationNudges(savedSettings.hydrationNudges);
          setFocusModeAlerts(savedSettings.focusModeAlerts);
        } else {
          // Si aucun paramètre n'est sauvegardé, sauvegarder les paramètres initiaux
          await LocalStorageService.saveSettings({
            morningMotivation,
            hydrationNudges,
            focusModeAlerts,
            theme: 'dark',
          });
        }

        // Charger les objectifs
        const savedGoals = await LocalStorageService.getGoals();
        if (savedGoals && savedGoals.length > 0) {
          setGoals(savedGoals);
        } else {
          // Si aucun objectif n'est sauvegardé, sauvegarder les objectifs initiaux
          await LocalStorageService.saveGoals(goals);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données du profil:', error);
        Alert.alert('Erreur', 'Impossible de charger vos données de profil.');
      }
    };

    loadProfileData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Recharger le profil quand on revient sur l'écran profil (score, niveau à jour)
  useEffect(() => {
    const refreshProfile = async () => {
      if (activeTab === 'profile') {
        try {
          const savedProfile = await LocalStorageService.getUserProfile();
          if (savedProfile) {
            setUserProfile(savedProfile);
          }
        } catch (error) {
          console.error('Erreur lors du rafraîchissement du profil:', error);
        }
      }
    };
    refreshProfile();
  }, [activeTab]);

  // Fonction pour changer l'avatar
  const handleChangeAvatar = async () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Annuler', 'Prendre une photo', 'Choisir depuis la galerie'],
          cancelButtonIndex: 0,
        },
        async (buttonIndex) => {
          if (buttonIndex === 1) {
            await pickImageFromCamera();
          } else if (buttonIndex === 2) {
            await pickImageFromGallery();
          }
        }
      );
    } else {
      Alert.alert(
        'Changer la photo de profil',
        'Choisissez une option',
        [
          {text: 'Annuler', style: 'cancel'},
          {text: 'Prendre une photo', onPress: pickImageFromCamera},
          {text: 'Choisir depuis la galerie', onPress: pickImageFromGallery},
        ]
      );
    }
  };

  const pickImageFromCamera = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission refusée', 'Vous devez autoriser l\'accès à la caméra.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      await saveNewAvatar(result.assets[0].uri);
    }
  };

  const pickImageFromGallery = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission refusée', 'Vous devez autoriser l\'accès à la galerie.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      await saveNewAvatar(result.assets[0].uri);
    }
  };

  const saveNewAvatar = async (uri: string) => {
    try {
      const updatedProfile = {...userProfile, avatar: uri};
      setUserProfile(updatedProfile);
      await LocalStorageService.saveUserProfile(updatedProfile);
      Alert.alert('Succès', 'Votre photo de profil a été mise à jour !');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de l\'avatar:', error);
      Alert.alert('Erreur', 'Impossible de sauvegarder la photo.');
    }
  };

  // État pour le modal de changement de mot de passe
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('Erreur', 'Le nouveau mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      Alert.alert('Erreur', 'Les nouveaux mots de passe ne correspondent pas.');
      return;
    }
    try {
      const isValid = await LocalStorageService.verifyUserPassword(currentPassword);
      if (!isValid) {
        Alert.alert('Erreur', 'Le mot de passe actuel est incorrect.');
        return;
      }
      await LocalStorageService.saveUserPassword(newPassword);
      setShowPasswordModal(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      Alert.alert('Succès', 'Votre mot de passe a été modifié avec succès.');
    } catch (error) {
      console.error('Erreur lors du changement de mot de passe:', error);
      Alert.alert('Erreur', 'Impossible de modifier le mot de passe.');
    }
  };

  const handleHelpSupport = () => {
    Alert.alert(
      'Aide et Support',
      'Contactez-nous pour toute question ou problème :',
      [
        {
          text: 'Email',
          onPress: () => Linking.openURL('mailto:support@mubarakapp.com'),
        },
        {
          text: 'WhatsApp',
          onPress: () => Linking.openURL('https://wa.me/+33600000000'),
        },
        {text: 'Fermer', style: 'cancel'},
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profil</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Profile Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            <Image
              source={{
                uri: userProfile.avatar || 'https://lh3.googleusercontent.com/aida-public/AB6AXuDv1T6_MgXb2h74tuQcPVMvbw8S4R4pc8Z3-CfWR5oci3d8PSI1QKZ33IPQzRJ1qQjUgGPSmaTTP-oIP1iKm_WGUOu38P3H75umAWRzAXa3NkZkqKRMeonVId2OvWSlMgBSBCreAds8CmeG5LfaCyJLo10LTJrW0BtJgfkrAHBCMW8S24zfS-wum183e4jgZYcZF4dhfi7F9aeHyWwOEK2A1fBqaYMxMs7GPJsNxQ4hCBVzTdFQWrKN0bNe9Tth2LOvB4uhxJp5zAQ',
              }}
              style={styles.avatar}
            />
            <TouchableOpacity style={styles.editBadge} onPress={handleChangeAvatar}>
              <MaterialIcons name="edit" size={14} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>{userProfile.name}</Text>
          <Text style={styles.userEmail}>{userProfile.email}</Text>
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>{userProfile.level}</Text>
          </View>
        </View>

        {/* Edit Personal Details Button */}
        <TouchableOpacity style={styles.editButton}>
          <Text style={styles.editButtonText}>Modifier les informations personnelles</Text>
        </TouchableOpacity>

        {/* Stats Cards */}
        <View style={styles.statsRow}>
          <ProfileStatCard
            icon="local-fire-department"
            iconColor={COLORS.orange}
            value={userProfile.dayStreak?.toString() || '0'}
            label="Jours consécutifs"
          />
          <ProfileStatCard
            icon="favorite"
            iconColor={COLORS.emerald}
            value={`${userProfile.wellnessScore || 0}%`}
            label="Score bien-être"
          />
        </View>

        {/* My Goals Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mes objectifs</Text>
          <View style={styles.goalsContainer}>
            {goals.map(goal => (
              <GoalSlider
                key={goal.id}
                icon={goal.icon}
                iconColor={goal.iconColor}
                title={goal.title}
                subtitle={goal.subtitle}
                progress={goal.progress}
                displayValue={goal.displayValue}
                hasDropdown={goal.id === '2'}
              />
            ))}
          </View>
        </View>

        {/* Notification Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <SettingsItem
            icon="wb-sunny"
            iconColor={COLORS.orange}
            title="Motivation matinale"
            hasSwitch
            switchValue={morningMotivation}
            onSwitchChange={async (value) => {
              setMorningMotivation(value);
              try {
                await LocalStorageService.saveSettings({
                  morningMotivation: value,
                  hydrationNudges,
                  focusModeAlerts,
                  theme: 'dark',
                });
              } catch (error) {
                console.error('Erreur lors de la sauvegarde des paramètres:', error);
              }
            }}
          />
          <SettingsItem
            icon="water-drop"
            iconColor={COLORS.sky}
            title="Rappels d'hydratation"
            hasSwitch
            switchValue={hydrationNudges}
            onSwitchChange={async (value) => {
              setHydrationNudges(value);
              try {
                await LocalStorageService.saveSettings({
                  morningMotivation,
                  hydrationNudges: value,
                  focusModeAlerts,
                  theme: 'dark',
                });
              } catch (error) {
                console.error('Erreur lors de la sauvegarde des paramètres:', error);
              }
            }}
          />
          <SettingsItem
            icon="notifications-active"
            iconColor={COLORS.primary}
            title="Alertes mode concentration"
            hasSwitch
            switchValue={focusModeAlerts}
            onSwitchChange={async (value) => {
              setFocusModeAlerts(value);
              try {
                await LocalStorageService.saveSettings({
                  morningMotivation,
                  hydrationNudges,
                  focusModeAlerts: value,
                  theme: 'dark',
                });
              } catch (error) {
                console.error('Erreur lors de la sauvegarde des paramètres:', error);
              }
            }}
          />
        </View>

        {/* App Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Paramètres de l'application</Text>
          <SettingsItem
            icon="lock"
            iconColor={COLORS.primary}
            title="Changer le mot de passe"
            showArrow
            onPress={() => setShowPasswordModal(true)}
          />
          <SettingsItem
            icon="help"
            iconColor={COLORS.emerald}
            title="Aide et support"
            showArrow
            onPress={handleHelpSupport}
          />
        </View>

        {/* Log Out Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => {
            Alert.alert(
              'Déconnexion',
              'Êtes-vous sûr de vouloir vous déconnecter?',
              [
                {text: 'Annuler', style: 'cancel'},
                {
                  text: 'Déconnexion',
                  style: 'destructive',
                  onPress: () => onLogout?.(),
                },
              ]
            );
          }}
        >
          <Text style={styles.logoutText}>Déconnexion</Text>
        </TouchableOpacity>

        {/* Version */}
        <Text style={styles.versionText}>Version 2.4.0 (Build 302)</Text>

        {/* Bottom spacing for navigation */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNavigation
        activeTab={activeTab}
        onTabPress={onTabPress}
        onAddPress={() => console.log('Add pressed')}
      />

      {/* Modal Changement de Mot de Passe */}
      <Modal
        visible={showPasswordModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPasswordModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Changer le mot de passe</Text>
              <TouchableOpacity onPress={() => {
                setShowPasswordModal(false);
                setCurrentPassword('');
                setNewPassword('');
                setConfirmNewPassword('');
              }}>
                <MaterialIcons name="close" size={24} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalInputContainer}>
              <Text style={styles.modalInputLabel}>Mot de passe actuel</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Entrez votre mot de passe actuel"
                placeholderTextColor={COLORS.textSecondary}
                secureTextEntry
                value={currentPassword}
                onChangeText={setCurrentPassword}
              />
            </View>

            <View style={styles.modalInputContainer}>
              <Text style={styles.modalInputLabel}>Nouveau mot de passe</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Minimum 6 caractères"
                placeholderTextColor={COLORS.textSecondary}
                secureTextEntry
                value={newPassword}
                onChangeText={setNewPassword}
              />
            </View>

            <View style={styles.modalInputContainer}>
              <Text style={styles.modalInputLabel}>Confirmer le nouveau mot de passe</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Confirmez le mot de passe"
                placeholderTextColor={COLORS.textSecondary}
                secureTextEntry
                value={confirmNewPassword}
                onChangeText={setConfirmNewPassword}
              />
            </View>

            <TouchableOpacity style={styles.modalButton} onPress={handleChangePassword}>
              <Text style={styles.modalButtonText}>Modifier le mot de passe</Text>
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
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 20,
  },
  avatarSection: {
    alignItems: 'center',
    gap: 8,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.background,
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginTop: 8,
  },
  userEmail: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  levelBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 8,
  },
  levelText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    letterSpacing: 1,
  },
  editButton: {
    backgroundColor: COLORS.card,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  editButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  goalsContainer: {
    gap: 12,
  },
  logoutButton: {
    alignItems: 'center',
    paddingVertical: 14,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.danger,
  },
  versionText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  bottomSpacer: {
    height: 100,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    gap: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  modalInputContainer: {
    gap: 6,
  },
  modalInputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  modalInput: {
    backgroundColor: COLORS.background,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  modalButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
