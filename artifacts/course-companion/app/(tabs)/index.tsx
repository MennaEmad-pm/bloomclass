import React, { useEffect, useState, useCallback } from 'react';
import {
  ScrollView,
  RefreshControl,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { InstructorCard } from '@/components/InstructorCard';
import { CourseRules } from '@/components/CourseRules';
import { FeedbackBanner } from '@/components/FeedbackBanner';
import { SessionCard } from '@/components/SessionCard';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, CourseSession } from '@/lib/supabase';
import { useColors } from '@/hooks/useColors';
import { FONTS } from '@/constants/fonts';

export default function HomeScreen() {
  const colors = useColors();
  const { isAdmin } = useAuth();
  const insets = useSafeAreaInsets();
  const [sessions, setSessions] = useState<CourseSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = useCallback(async () => {
    setError(null);
    const { data, error } = await supabase.from('sessions').select('*').order('id');
    if (error) {
      setError('Could not load sessions. Please check your connection.');
    } else {
      setSessions(data ?? []);
    }
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { fetchSessions(); }, [fetchSessions]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchSessions();
  };

  const handleSessionUpdate = (updated: CourseSession) => {
    setSessions(prev => prev.map(s => s.id === updated.id ? updated : s));
  };

  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingTop: topPad + 16, paddingBottom: Platform.OS === 'web' ? 100 : insets.bottom + 24 }]}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary}
        />
      }
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.pageTitle, { color: colors.textDark, fontFamily: FONTS.heading }]}>
        Course Companion
      </Text>

      <Text style={[styles.sectionLabel, { color: colors.textMuted, fontFamily: FONTS.bodyMedium }]}>
        About the Instructor
      </Text>
      <InstructorCard />

      <FeedbackBanner />

      <CourseRules />

      <Text style={[styles.sectionLabel, { color: colors.textMuted, fontFamily: FONTS.bodyMedium }]}>
        Sessions
      </Text>

      {loading && (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      )}

      {error && (
        <View style={[styles.errorBox, { backgroundColor: colors.muted, borderColor: colors.border }]}>
          <Text style={[styles.errorText, { color: colors.textMuted, fontFamily: FONTS.body }]}>
            {error}
          </Text>
        </View>
      )}

      {!loading && !error && sessions.length === 0 && (
        <View style={styles.center}>
          <Text style={[styles.emptyText, { color: colors.textMuted, fontFamily: FONTS.body }]}>
            Sessions are being prepared. Check back soon!
          </Text>
        </View>
      )}

      {sessions.map(session => (
        <SessionCard
          key={session.id}
          session={session}
          isAdmin={isAdmin}
          onUpdate={handleSessionUpdate}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { gap: 0 },
  pageTitle: {
    fontSize: 28,
    marginHorizontal: 16,
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 12,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginHorizontal: 16,
    marginBottom: 10,
    marginTop: 8,
  },
  center: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
  },
  errorBox: {
    marginHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
  },
});
