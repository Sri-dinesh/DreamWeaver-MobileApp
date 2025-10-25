import { useAuth } from '@/context/AuthContext';
import { fetchAllStats, Stats } from '@/services/statsService';
import { gradients, palette, radii, shadows, spacing, typography } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);

        // Fetch stats from our statsService
        const fetchedStats = await fetchAllStats();
        setStats(fetchedStats);
      } catch (error) {
        console.error('Error fetching stats:', error);
        setStats({
          dreamCount: 0,
          lucidDreamCount: 0,
          avgSleep: '0h',
          daysActive: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Create profile stats array based on our fetched data
  const profileStats = [
    {
      label: 'Dreams Logged',
      value: stats ? stats.dreamCount.toString() : '0',
    },
    {
      label: 'Lucid Dreams',
      value: stats ? stats.lucidDreamCount.toString() : '0',
    },
    {
      label: 'Days Active',
      value: stats && stats.daysActive ? stats.daysActive.toString() : '0',
    },
    {
      label: 'Avg Sleep',
      value: stats ? stats.avgSleep : '0h',
    },
  ];

  const menuItems = [
    {
      title: 'Edit Profile',
      subtitle: 'Update your personal information',
      icon: 'person-outline',
      route: '/edit-profile',
    },
    {
      title: 'Export Journal',
      subtitle: 'Download your dream data',
      icon: 'download-outline',
      route: '/export-journal',
    },
    {
      title: 'Privacy & Security',
      subtitle: 'Manage your privacy settings',
      icon: 'shield-outline',
      route: '/privacy-settings',
    },
    {
      title: 'Notifications',
      subtitle: 'Configure reminder settings',
      icon: 'notifications-outline',
      route: '/notification-settings',
    },
    {
      title: 'Help & Support',
      subtitle: 'Get help and contact support',
      icon: 'help-circle-outline',
      route: '/help-support',
    },
    {
      title: 'About',
      subtitle: 'App version and information',
      icon: 'information-circle-outline',
      route: '/about',
    },
  ];

  const handleLogout = async () => {
    await logout();
  };


  // Check if profile photo exists and is a valid URL
  const hasValidProfilePhoto = user?.profile_picture_url && 
    user.profile_picture_url.startsWith('http');
  
  // Use default profile image if no valid URL exists or if it's the placeholder path
  const shouldUseDefaultImage = !hasValidProfilePhoto;

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={palette.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => router.push('/edit-profile')}
        >
          <Ionicons name="create-outline" size={20} color={palette.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            {hasValidProfilePhoto ? (
              <View style={styles.avatar}>
                <Image
                  source={{ uri: user.profile_picture_url }}
                  style={styles.avatarImage}
                  resizeMode="cover"
                  onError={() => {
                    // If image fails to load, it will fall back to default
                    console.log('Failed to load profile image');
                  }}
                />
              </View>
            ) : (
              <View style={styles.avatar}>
                <Image
                  source={require('@/assets/images/default-profile.png')}
                  style={styles.avatarImage}
                  resizeMode="cover"
                />
              </View>
            )}
          </View>

          <Text style={styles.userName}>{user.username}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>

          <Text style={styles.userBio}>{user.bio || 'No bio added yet'}</Text>

          <View style={styles.statsContainer}>
            {loading ? (
              <ActivityIndicator size="small" color={palette.primary} />
            ) : (
              profileStats.map((stat, index) => (
                <View key={index} style={styles.statItem}>
                  <Text style={styles.statValue}>{stat.value}</Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                </View>
              ))
            )}
          </View>
        </View>

        <View style={styles.menuSection}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={() => router.push(item.route as any)}
            >
              <View style={styles.menuIcon}>
                <Ionicons name={item.icon as any} size={20} color={palette.primary} />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={palette.textSecondary} />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          <Text style={styles.logoutButtonText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>DreamWeaver v1.0.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.backgroundPrimary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.xl,
    paddingTop: spacing.xxxl,
    backgroundColor: palette.surface,
    borderBottomWidth: 1,
    borderBottomColor: palette.divider,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    ...typography.subheading,
    color: palette.textPrimary,
  },
  editButton: {
    padding: spacing.xs,
  },
  content: {
    padding: spacing.xl,
  },
  profileSection: {
    backgroundColor: palette.surface,
    borderRadius: radii.lg,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.xl,
    ...shadows.soft,
  },
  avatarContainer: {
    marginBottom: spacing.md,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: palette.primary,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    ...shadows.medium,
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '600',
    color: 'white',
  },
  userName: {
    ...typography.heading,
    color: palette.textPrimary,
    marginBottom: spacing.xs,
  },
  userEmail: {
    ...typography.body,
    color: palette.textSecondary,
    marginBottom: spacing.xs,
  },
  userBio: {
    ...typography.bodySecondary,
    color: palette.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  statsContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    ...typography.heading,
    color: palette.primary,
    marginBottom: spacing.xs,
  },
  statLabel: {
    ...typography.caption,
    color: palette.textSecondary,
    textAlign: 'center',
  },
  menuSection: {
    backgroundColor: palette.surface,
    borderRadius: radii.lg,
    overflow: 'hidden',
    marginBottom: spacing.xl,
    ...shadows.soft,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: palette.divider,
  },
  menuIcon: {
    width: 44,
    height: 44,
    borderRadius: radii.lg,
    backgroundColor: `${palette.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    ...typography.body,
    color: palette.textPrimary,
    marginBottom: spacing.xxs,
  },
  menuSubtitle: {
    ...typography.bodySecondary,
    color: palette.textSecondary,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.surface,
    borderRadius: radii.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    gap: spacing.xs,
    ...shadows.subtle,
  },
  logoutButtonText: {
    ...typography.body,
    color: '#EF4444',
  },
  versionText: {
    ...typography.caption,
    color: palette.textMuted,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: palette.backgroundPrimary,
  },
});