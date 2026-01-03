import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ImageBackground,
  StatusBar,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import WellnessCard from '../components/WellnessCard';
import QuickActionButton from '../components/QuickActionButton';
import ScheduleItem from '../components/ScheduleItem';
import BottomNavigation from '../components/BottomNavigation';

const COLORS = {
  primary: '#6c2bee',
  background: '#161022',
  card: '#1d172a',
  sky: '#38bdf8',
  emerald: '#34d399',
  rose: '#fb7185',
  textPrimary: '#ffffff',
  textSecondary: '#94a3b8',
};

export default function HomeScreen() {
  const [activeTab, setActiveTab] = useState('home');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatarContainer}>
            <Image
              source={{
                uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDv1T6_MgXb2h74tuQcPVMvbw8S4R4pc8Z3-CfWR5oci3d8PSI1QKZ33IPQzRJ1qQjUgGPSmaTTP-oIP1iKm_WGUOu38P3H75umAWRzAXa3NkZkqKRMeonVId2OvWSlMgBSBCreAds8CmeG5LfaCyJLo10LTJrW0BtJgfkrAHBCMW8S24zfS-wum183e4jgZYcZF4dhfi7F9aeHyWwOEK2A1fBqaYMxMs7GPJsNxQ4hCBVzTdFQWrKN0bNe9Tth2LOvB4uhxJp5zAQ',
              }}
              style={styles.avatar}
            />
            <View style={styles.onlineIndicator} />
          </View>
          <View>
            <Text style={styles.greeting}>Bonjour,</Text>
            <Text style={styles.userName}>Mubarak</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.notificationButton}>
          <MaterialIcons name="notifications" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Focus of the Day Card */}
        <TouchableOpacity activeOpacity={0.95}>
          <ImageBackground
            source={{
              uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDFL2uUyaeX5T8MvmWCnIUKbFtGLGNmEzGgk6mdw0ywJzbnpeAPBwJk9YZ8sYoFf6jB7maDXIDQS9A1XX1iVYAC8HH-XFHFdI0MQ6E8A5Jz8unBVXy5MQ4FNg98Yyf4P30slzikx2hAWWcdwDnDetKRkNHHHnd9Y3JrLrUezJW-JEJe_a-qzZya-IUohVOu5GqZ0P8r78GMnsEncJ8cJm9rl3Tb2UECFvqfqh-e7CVBj3-KagPFwKqw3llAnRwdmrRpb-fxnPYUT-Q',
            }}
            style={styles.focusCard}
            imageStyle={styles.focusCardImage}>
            <View style={styles.focusCardOverlay} />
            <View style={styles.focusCardContent}>
              <View style={styles.focusBadge}>
                <Text style={styles.focusBadgeText}>OBJECTIF DU JOUR</Text>
              </View>
              <View style={styles.focusTextContainer}>
                <Text style={styles.focusTitle}>Maîtriser le Calcul II</Text>
                <Text style={styles.focusDescription}>
                  Terminer les exercices de révision du chapitre 4 avant la session de groupe d'étude.
                </Text>
              </View>
            </View>
          </ImageBackground>
        </TouchableOpacity>

        {/* Wellness Tracker */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Suivi Bien-être</Text>
            <TouchableOpacity>
              <Text style={styles.sectionLink}>Détails</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.wellnessGrid}>
            <WellnessCard
              icon="water-drop"
              label="Eau"
              value="1.2L"
              progress={60}
              color={COLORS.sky}
            />
            <WellnessCard
              icon="bedtime"
              label="Sommeil"
              value="7h 20m"
              progress={85}
              color={COLORS.primary}
            />
            <WellnessCard
              icon="directions-run"
              label="Pas"
              value="3,500"
              progress={45}
              color={COLORS.emerald}
            />
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions Rapides</Text>
          <View style={styles.quickActionsGrid}>
            <QuickActionButton
              icon="timer"
              title="Minuteur Focus"
              subtitle="25 min"
              color={COLORS.primary}
            />

            <QuickActionButton
              icon="self-improvement"
              title="Respirer"
              subtitle="3 min détente"
              color={COLORS.emerald}
            />
            <QuickActionButton
              icon="edit-note"
              title="Notes"
              subtitle="Écrire ses pensées"
              color={COLORS.rose}
            />
          </View>
        </View>

        {/* Today's Schedule */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Programme du Jour</Text>
          <View style={styles.scheduleContainer}>
            <ScheduleItem
              icon="menu-book"
              title="Groupe d'étude Biologie"
              subtitle="Bibliothèque Salle 302 • avec Sarah & Mike"
              time="14:00"
              isActive={true}
              avatars={[
                'https://lh3.googleusercontent.com/aida-public/AB6AXuDUejXpi-962rBrjpwjFeuL1JGm8XyJt0CQeA2htoIQOWdDaAqn9mwGbnwTzqzpO_8staRvOBSVDjIqzdHXk-JnXL7N60Dd28a2VeYyOl1ig9_RgFdq_BWXnc2UZ0fjUSgIGZ4bdOdWi0EhhLgStY6q5XtjuV0A4_7D7iU0vBJUi01FXLAsmO7duXm3VYhYsJCebbdgAOICobnCw3xYLnTv2pgTujGc5m-S25vz40Ww9LQ4dbYe0Kd-5ToZkIJd8zs_OLEI3Bz0ZXM',
                'https://lh3.googleusercontent.com/aida-public/AB6AXuCmfoT-fYmtDjXiqmqa4CQahTrc2c9H_RJzBOjFbctV0_TWayhlboldlgpJ-GDD5wGOs5WRExxk7tbTto1wg00ovcwD1QZngz7RDOSRaHFJihAd1SeDIfvkEAgp1e0NKCZOuJYECfQwo3gDj9AxAI5o0g1fVd5fTrUbTaJR-JVTw11F1RiyfBJCGn6gxgzxyeUobkK2GpRVDmc0Rz7G5Z8xpFYBCpNE2WAI4XThQjcnan5FYK599MD0eJt3KQ1qhzx9l2OcMQK_CQA',
              ]}
            />
            <ScheduleItem
              icon="fitness-center"
              title="Séance de Sport"
              subtitle="Routine jambes"
              time="16:30"
            />
            <ScheduleItem
              icon="spa"
              title="Méditation du Soir"
              subtitle="Routine de détente"
              time="20:00"
              isLast={true}
            />
          </View>
        </View>

        {/* Bottom spacing for navigation */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNavigation
        activeTab={activeTab}
        onTabPress={setActiveTab}
        onAddPress={() => console.log('Add pressed')}
      />
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
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#22c55e',
    borderWidth: 2,
    borderColor: COLORS.background,
  },
  greeting: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 24,
  },
  focusCard: {
    height: 220,
    borderRadius: 16,
    overflow: 'hidden',
  },
  focusCardImage: {
    borderRadius: 16,
  },
  focusCardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 16,
  },
  focusCardContent: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  focusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  focusBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 1,
  },
  focusTextContainer: {
    gap: 8,
  },
  focusTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  focusDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 20,
  },
  section: {
    gap: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  sectionLink: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  wellnessGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  scheduleContainer: {
    gap: 0,
  },
  bottomSpacer: {
    height: 100,
  },
});
