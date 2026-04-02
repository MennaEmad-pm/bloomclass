import React, { useEffect, useState, useCallback } from 'react';
import {
  ScrollView,
  RefreshControl,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import Toast from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';
import { supabase, Assignment } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { AssignmentCard } from '@/components/AssignmentCard';
import { useColors } from '@/hooks/useColors';
import { FONTS } from '@/constants/fonts';

export default function AssignmentsScreen() {
  const colors = useColors();
  const { profile, session } = useAuth();
  const insets = useSafeAreaInsets();

  const [studentName, setStudentName] = useState('');
  const [groupName, setGroupName] = useState('');
  const [taskLink, setTaskLink] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (profile?.full_name) setStudentName(profile.full_name);
  }, [profile]);

  const fetchAssignments = useCallback(async () => {
    try {
      const { data } = await supabase
        .from('assignments')
        .select('*')
        .order('submitted_at', { ascending: false });
      setAssignments(data ?? []);
    } catch (_e) {
      // silently ignore network errors
    } finally {
      setLoadingList(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchAssignments(); }, [fetchAssignments]);

  const onRefresh = () => { setRefreshing(true); fetchAssignments(); };

  const handleSubmit = async () => {
    if (!studentName.trim() || !groupName.trim() || !taskLink.trim()) {
      Toast.show({ type: 'error', text1: 'All fields are required' });
      return;
    }
    if (!session) {
      Toast.show({ type: 'error', text1: 'Please log in to submit assignments' });
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.from('assignments').insert({
      student_name: studentName.trim(),
      group_name: groupName.trim(),
      task_link: taskLink.trim(),
    });
    setSubmitting(false);

    if (error) {
      Toast.show({ type: 'error', text1: 'Submission failed', text2: error.message });
    } else {
      Toast.show({ type: 'success', text1: 'Assignment submitted!' });
      setGroupName('');
      setTaskLink('');
      fetchAssignments();
    }
  };

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 100 : insets.bottom + 24;

  return (
    <KeyboardAwareScrollViewCompat
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingTop: topPad + 16, paddingBottom: bottomPad }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
      }
      showsVerticalScrollIndicator={false}
      bottomOffset={20}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={[styles.pageTitle, { color: colors.textDark, fontFamily: FONTS.heading }]}>
        Assignments
      </Text>

      {/* Submission Form */}
      <View style={[styles.formCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <Text style={[styles.formTitle, { color: colors.textDark, fontFamily: FONTS.heading }]}>
          Submit Your Work
        </Text>

        <Text style={[styles.fieldLabel, { color: colors.textDark, fontFamily: FONTS.bodyMedium }]}>
          Student Name
        </Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.textDark, fontFamily: FONTS.body }]}
          value={studentName}
          onChangeText={setStudentName}
          placeholder="Your full name"
          placeholderTextColor={colors.textMuted}
        />

        <Text style={[styles.fieldLabel, { color: colors.textDark, fontFamily: FONTS.bodyMedium }]}>
          Group Name
        </Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.textDark, fontFamily: FONTS.body }]}
          value={groupName}
          onChangeText={setGroupName}
          placeholder="e.g. Group A"
          placeholderTextColor={colors.textMuted}
        />

        <Text style={[styles.fieldLabel, { color: colors.textDark, fontFamily: FONTS.bodyMedium }]}>
          Assignment Link
        </Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.textDark, fontFamily: FONTS.body }]}
          value={taskLink}
          onChangeText={setTaskLink}
          placeholder="https://..."
          placeholderTextColor={colors.textMuted}
          keyboardType="url"
          autoCapitalize="none"
        />

        <TouchableOpacity
          style={[styles.submitBtn, { backgroundColor: colors.primary }, submitting && styles.disabled]}
          onPress={handleSubmit}
          disabled={submitting}
          activeOpacity={0.8}
        >
          {submitting ? (
            <ActivityIndicator color={colors.primaryForeground} size="small" />
          ) : (
            <>
              <Ionicons name="cloud-upload-outline" size={18} color={colors.primaryForeground} />
              <Text style={[styles.submitBtnText, { color: colors.primaryForeground, fontFamily: FONTS.bodyBold }]}>
                Submit Assignment
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Submissions List */}
      <Text style={[styles.sectionLabel, { color: colors.textMuted, fontFamily: FONTS.bodyMedium }]}>
        All Submissions
      </Text>

      {loadingList && (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      )}

      {!loadingList && assignments.length === 0 && (
        <View style={styles.center}>
          <Ionicons name="document-outline" size={40} color={colors.border} />
          <Text style={[styles.emptyText, { color: colors.textMuted, fontFamily: FONTS.body }]}>
            No submissions yet.{'\n'}Be the first to submit!
          </Text>
        </View>
      )}

      {assignments.map(a => (
        <AssignmentCard key={a.id} assignment={a} />
      ))}
    </KeyboardAwareScrollViewCompat>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  pageTitle: {
    fontSize: 28,
    marginHorizontal: 16,
    marginBottom: 20,
  },
  formCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 24,
    shadowColor: '#3D2B30',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  formTitle: {
    fontSize: 18,
    marginBottom: 16,
  },
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
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 4,
  },
  submitBtnText: { fontSize: 16 },
  disabled: { opacity: 0.6 },
  sectionLabel: {
    fontSize: 12,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginHorizontal: 16,
    marginBottom: 10,
  },
  center: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
  },
});
