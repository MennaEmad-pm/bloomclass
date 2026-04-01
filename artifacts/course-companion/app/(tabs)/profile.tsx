import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import Toast from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { useColors } from '@/hooks/useColors';
import { FONTS } from '@/constants/fonts';

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { session, profile, signIn, signUp, signOut, updateProfile } = useAuth();
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  // Auth fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullNameAuth, setFullNameAuth] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Profile fields
  const [fullName, setFullName] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [currentPosition, setCurrentPosition] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name ?? '');
      setLinkedinUrl(profile.linkedin_url ?? '');
      setCurrentPosition(profile.current_position ?? 'Student');
    }
  }, [profile]);

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 100 : insets.bottom + 24;

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Toast.show({ type: 'error', text1: 'Please fill in all fields' });
      return;
    }
    setAuthLoading(true);
    const { error } = await signIn(email.trim(), password);
    setAuthLoading(false);
    if (error) {
      Toast.show({ type: 'error', text1: 'Login failed', text2: error.message });
    }
  };

  const handleSignUp = async () => {
    if (!email.trim() || !password.trim() || !fullNameAuth.trim()) {
      Toast.show({ type: 'error', text1: 'Please fill in all fields' });
      return;
    }
    setAuthLoading(true);
    const { error } = await signUp(email.trim(), password, fullNameAuth.trim());
    setAuthLoading(false);
    if (error) {
      Toast.show({ type: 'error', text1: 'Sign up failed', text2: error.message });
    } else {
      Toast.show({ type: 'success', text1: 'Account created!', text2: 'Welcome to Course Companion' });
    }
  };

  const handleSave = async () => {
    setSaving(true);
    const { error } = await updateProfile({
      full_name: fullName.trim(),
      linkedin_url: linkedinUrl.trim() || null,
      current_position: currentPosition.trim() || 'Student',
    });
    setSaving(false);
    if (error) {
      Toast.show({ type: 'error', text1: 'Save failed', text2: error.message });
    } else {
      Toast.show({ type: 'success', text1: 'Profile saved!' });
    }
  };

  if (!session) {
    return (
      <KeyboardAwareScrollViewCompat
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={{ paddingTop: topPad + 16, paddingBottom: bottomPad, flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        bottomOffset={20}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.pageTitle, { color: colors.textDark, fontFamily: FONTS.heading }]}>
          {authMode === 'login' ? 'Welcome Back' : 'Create Account'}
        </Text>
        <Text style={[styles.subtitle, { color: colors.textMuted, fontFamily: FONTS.body }]}>
          {authMode === 'login'
            ? 'Sign in to submit assignments and access your profile.'
            : 'Join the course to submit assignments and track your progress.'}
        </Text>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          {/* Toggle */}
          <View style={[styles.toggle, { backgroundColor: colors.muted }]}>
            <TouchableOpacity
              style={[styles.toggleBtn, authMode === 'login' && { backgroundColor: colors.card }]}
              onPress={() => setAuthMode('login')}
            >
              <Text style={[styles.toggleText, { color: authMode === 'login' ? colors.primary : colors.textMuted, fontFamily: FONTS.bodyMedium }]}>
                Log In
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleBtn, authMode === 'signup' && { backgroundColor: colors.card }]}
              onPress={() => setAuthMode('signup')}
            >
              <Text style={[styles.toggleText, { color: authMode === 'signup' ? colors.primary : colors.textMuted, fontFamily: FONTS.bodyMedium }]}>
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>

          {authMode === 'signup' && (
            <>
              <Text style={[styles.fieldLabel, { color: colors.textDark, fontFamily: FONTS.bodyMedium }]}>Full Name</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.textDark, fontFamily: FONTS.body }]}
                value={fullNameAuth}
                onChangeText={setFullNameAuth}
                placeholder="Your full name"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="words"
              />
            </>
          )}

          <Text style={[styles.fieldLabel, { color: colors.textDark, fontFamily: FONTS.bodyMedium }]}>Email</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.textDark, fontFamily: FONTS.body }]}
            value={email}
            onChangeText={setEmail}
            placeholder="your@email.com"
            placeholderTextColor={colors.textMuted}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={[styles.fieldLabel, { color: colors.textDark, fontFamily: FONTS.bodyMedium }]}>Password</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.textDark, fontFamily: FONTS.body }]}
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            placeholderTextColor={colors.textMuted}
            secureTextEntry
          />

          <TouchableOpacity
            style={[styles.authBtn, { backgroundColor: colors.primary }, authLoading && styles.disabled]}
            onPress={authMode === 'login' ? handleLogin : handleSignUp}
            disabled={authLoading}
            activeOpacity={0.8}
          >
            {authLoading ? (
              <ActivityIndicator color={colors.primaryForeground} size="small" />
            ) : (
              <Text style={[styles.authBtnText, { color: colors.primaryForeground, fontFamily: FONTS.bodyBold }]}>
                {authMode === 'login' ? 'Log In' : 'Create Account'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollViewCompat>
    );
  }

  return (
    <KeyboardAwareScrollViewCompat
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingTop: topPad + 16, paddingBottom: bottomPad }}
      showsVerticalScrollIndicator={false}
      bottomOffset={20}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={[styles.pageTitle, { color: colors.textDark, fontFamily: FONTS.heading }]}>
        Profile
      </Text>

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        {/* Avatar */}
        <View style={styles.avatarRow}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={[styles.avatarText, { color: colors.primaryForeground }]}>
              {(profile?.full_name ?? session.user.email ?? '?')[0].toUpperCase()}
            </Text>
          </View>
          <View>
            <Text style={[styles.profileName, { color: colors.textDark, fontFamily: FONTS.heading }]}>
              {profile?.full_name || 'Your Name'}
            </Text>
            <Text style={[styles.profileEmail, { color: colors.textMuted, fontFamily: FONTS.body }]}>
              {session.user.email}
            </Text>
          </View>
        </View>

        {profile?.is_admin && (
          <View style={[styles.adminBadge, { backgroundColor: colors.accent + '22', borderColor: colors.accent + '44' }]}>
            <Ionicons name="shield-checkmark" size={14} color={colors.accent} />
            <Text style={[styles.adminText, { color: colors.accent, fontFamily: FONTS.bodyMedium }]}>
              Administrator
            </Text>
          </View>
        )}

        <Text style={[styles.fieldLabel, { color: colors.textDark, fontFamily: FONTS.bodyMedium }]}>Full Name</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.textDark, fontFamily: FONTS.body }]}
          value={fullName}
          onChangeText={setFullName}
          placeholder="Your full name"
          placeholderTextColor={colors.textMuted}
          autoCapitalize="words"
        />

        <Text style={[styles.fieldLabel, { color: colors.textDark, fontFamily: FONTS.bodyMedium }]}>LinkedIn URL</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.textDark, fontFamily: FONTS.body }]}
          value={linkedinUrl}
          onChangeText={setLinkedinUrl}
          placeholder="https://linkedin.com/in/..."
          placeholderTextColor={colors.textMuted}
          keyboardType="url"
          autoCapitalize="none"
        />

        <Text style={[styles.fieldLabel, { color: colors.textDark, fontFamily: FONTS.bodyMedium }]}>Current Position</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.textDark, fontFamily: FONTS.body }]}
          value={currentPosition}
          onChangeText={setCurrentPosition}
          placeholder="Student"
          placeholderTextColor={colors.textMuted}
          autoCapitalize="words"
        />

        <TouchableOpacity
          style={[styles.authBtn, { backgroundColor: colors.primary }, saving && styles.disabled]}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.8}
        >
          {saving ? (
            <ActivityIndicator color={colors.primaryForeground} size="small" />
          ) : (
            <Text style={[styles.authBtnText, { color: colors.primaryForeground, fontFamily: FONTS.bodyBold }]}>
              Save Changes
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.logoutBtn, { borderColor: colors.border }]}
        onPress={signOut}
        activeOpacity={0.7}
      >
        <Ionicons name="log-out-outline" size={18} color={colors.textMuted} />
        <Text style={[styles.logoutText, { color: colors.textMuted, fontFamily: FONTS.bodyMedium }]}>
          Log Out
        </Text>
      </TouchableOpacity>
    </KeyboardAwareScrollViewCompat>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  pageTitle: {
    fontSize: 28,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 21,
    marginHorizontal: 16,
    marginBottom: 24,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#3D2B30',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  toggle: {
    flexDirection: 'row',
    borderRadius: 10,
    padding: 3,
    marginBottom: 20,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  toggleText: { fontSize: 14 },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 16,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '700',
  },
  profileName: {
    fontSize: 17,
  },
  profileEmail: {
    fontSize: 13,
  },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  adminText: { fontSize: 12 },
  fieldLabel: {
    fontSize: 13,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 15,
    marginBottom: 14,
  },
  authBtn: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  authBtnText: { fontSize: 16 },
  disabled: { opacity: 0.6 },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 14,
  },
  logoutText: { fontSize: 15 },
});
