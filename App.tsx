import React, {useState, useEffect} from 'react';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {ActivityIndicator, View, StyleSheet} from 'react-native';
import HomeScreen from './src/screens/HomeScreen';
import RappelsScreen from './src/screens/RappelsScreen';
import PlanningScreen from './src/screens/PlanningScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import SignUpScreen from './src/screens/SignUpScreen';
import LoginScreen from './src/screens/LoginScreen';
import FocusTimerScreen from './src/screens/FocusTimerScreen';
import BreathingExerciseScreen from './src/screens/BreathingExerciseScreen';
import NotesScreen from './src/screens/NotesScreen';
import LocalStorageService from './src/services/LocalStorageService';

type AuthScreen = 'loading' | 'onboarding' | 'signup' | 'login' | 'main';

function App(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState('home');
  const [authScreen, setAuthScreen] = useState<AuthScreen>('loading');
  const [showFocusTimer, setShowFocusTimer] = useState(false);
  const [showBreathingExercise, setShowBreathingExercise] = useState(false);
  const [showNotes, setShowNotes] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const isAuthenticated = await LocalStorageService.isAuthenticated();
      const hasCompletedOnboarding = await LocalStorageService.getHasCompletedOnboarding();

      if (isAuthenticated) {
        setAuthScreen('main');
      } else if (hasCompletedOnboarding) {
        setAuthScreen('login');
      } else {
        setAuthScreen('onboarding');
      }
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'authentification:', error);
      setAuthScreen('onboarding');
    }
  };

  const handleTabPress = (tab: string) => {
    setActiveTab(tab);
  };

  const handleOnboardingComplete = async () => {
    await LocalStorageService.setOnboardingCompleted(true);
    setAuthScreen('signup');
  };

  const handleSignUpSuccess = async () => {
    await LocalStorageService.setLoggedIn(true);
    setAuthScreen('main');
  };

  const handleLoginSuccess = async () => {
    await LocalStorageService.setLoggedIn(true);
    setAuthScreen('main');
  };

  const handleLogout = async () => {
    await LocalStorageService.clearAllData();
    setAuthScreen('onboarding');
  };

  const renderMainScreen = () => {
    switch (activeTab) {
      case 'reminders':
        return (
          <RappelsScreen activeTab={activeTab} onTabPress={handleTabPress} />
        );
      case 'schedule':
        return (
          <PlanningScreen activeTab={activeTab} onTabPress={handleTabPress} />
        );
      case 'profile':
        return (
          <ProfileScreen
            activeTab={activeTab}
            onTabPress={handleTabPress}
            onLogout={handleLogout}
          />
        );
      case 'home':
      default:
        return (
          <HomeScreen
            activeTab={activeTab}
            onTabPress={handleTabPress}
            onOpenFocusTimer={() => setShowFocusTimer(true)}
            onOpenBreathingExercise={() => setShowBreathingExercise(true)}
            onOpenNotes={() => setShowNotes(true)}
          />
        );
    }
  };

  const renderScreen = () => {
    // Afficher le FocusTimerScreen si actif
    if (showFocusTimer) {
      return <FocusTimerScreen onClose={() => setShowFocusTimer(false)} />;
    }

    // Afficher le BreathingExerciseScreen si actif
    if (showBreathingExercise) {
      return <BreathingExerciseScreen onClose={() => setShowBreathingExercise(false)} />;
    }

    // Afficher le NotesScreen si actif
    if (showNotes) {
      return <NotesScreen onClose={() => setShowNotes(false)} />;
    }

    switch (authScreen) {
      case 'loading':
        return (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6c2bee" />
          </View>
        );
      case 'onboarding':
        return (
          <OnboardingScreen
            onComplete={handleOnboardingComplete}
            onLogin={() => setAuthScreen('login')}
          />
        );
      case 'signup':
        return (
          <SignUpScreen
            onSignUpSuccess={handleSignUpSuccess}
            onLogin={() => setAuthScreen('login')}
          />
        );
      case 'login':
        return (
          <LoginScreen
            onLoginSuccess={handleLoginSuccess}
            onSignUp={() => setAuthScreen('signup')}
          />
        );
      case 'main':
      default:
        return renderMainScreen();
    }
  };

  return <SafeAreaProvider>{renderScreen()}</SafeAreaProvider>;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#161022',
  },
});

export default App;
