import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  FlatList,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  RefreshControl,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { Upload, FileText, X, CirclePlus } from 'lucide-react-native';
import { supabase, Assignment, AssignmentPost } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { AssignmentCard } from '@/components/AssignmentCard';
import { AssignmentPostCard } from '@/components/AssignmentPostCard';
import { useColors } from '@/hooks/useColors';
import { FONTS } from '@/constants/fonts';

type ListItem =
  | { type: 'admin_post'; data: AssignmentPost; date: string }
  | { type: 'student_submission'; data: Assignment; date: string };

export default function AssignmentsScreen() {
  const colors = useColors();
  const { profile, session } = useAuth();
  const insets = useSafeAreaInsets();
  const isAdmin = profile?.is_admin ?? false;

  // ─── Data state ─────────────────────────────────────────────
  const [posts, setPosts] = useState<AssignmentPost[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // ─── Student form state ──────────────────────────────────────
  const [studentName, setStudentName] = useState('');
  const [groupName, setGroupName] = useState('');
  const [taskLink, setTaskLink] = useState('');
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // ─── Admin post modal state ──────────────────────────────────
  const [showPostModal, setShowPostModal] = useState(false);
  const [postTitle, setPostTitle] = useState('');
  const [postDescription, setPostDescription] = useState('');
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    if (profile?.full_name) setStudentName(profile.full_name);
  }, [profile]);

  // ─── Fetch both tables in parallel ──────────────────────────
  const fetchAll = useCallback(async () => {
    try {
      const [postsResult, subsResult] = await Promise.all([
        supabase
          .from('assignment_posts')
          .select('*')
          .order('posted_at', { ascending: false }),
        supabase
          .from('assignments')
          .select(`*, assignment_posts ( id, title )`)
          .order('submitted_at', { ascending: false }),
      ]);

      const fetchedPosts: AssignmentPost[] = postsResult.data ?? [];
      const fetchedSubs: Assignment[] = subsResult.data ?? [];

      setPosts(fetchedPosts);
      setAssignments(fetchedSubs);
      setLoadingPosts(false);

      // Auto-select if only one post
      if (fetchedPosts.length === 1 && !selectedPostId) {
        setSelectedPostId(fetchedPosts[0].id);
      }
    } catch (_e) {
      // silently ignore network errors
    } finally {
      setLoadingList(false);
      setLoadingPosts(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const onRefresh = () => { setRefreshing(true); fetchAll(); };

  // ─── Submit student assignment ───────────────────────────────
  const handleSubmit = async () => {
    if (!studentName.trim() || !groupName.trim() || !taskLink.trim()) {
      Toast.show({ type: 'error', text1: 'All fields are required' });
      return;
    }
    if (!selectedPostId) {
      Toast.show({ type: 'error', text1: 'Please select an assignment to respond to' });
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
      assignment_post_id: selectedPostId,
    });
    setSubmitting(false);

    if (error) {
      Toast.show({ type: 'error', text1: 'Submission failed', text2: error.message });
    } else {
      Toast.show({ type: 'success', text1: 'Assignment submitted!' });
      setGroupName('');
      setTaskLink('');
      fetchAll();
    }
  };

  // ─── Post new assignment (admin) ─────────────────────────────
  const handlePostAssignment = async () => {
    if (!postTitle.trim()) {
      Toast.show({ type: 'error', text1: 'Assignment name is required' });
      return;
    }
    if (!postDescription.trim()) {
      Toast.show({ type: 'error', text1: 'Description is required' });
      return;
    }
    if (!session) return;

    setPosting(true);
    const { error } = await supabase.from('assignment_posts').insert({
      title: postTitle.trim(),
      description: postDescription.trim(),
      posted_by: session.user.id,
    });
    setPosting(false);

    if (error) {
      Toast.show({ type: 'error', text1: 'Failed to post', text2: error.message });
    } else {
      Toast.show({ type: 'success', text1: 'Assignment posted!' });
      setPostTitle('');
      setPostDescription('');
      setShowPostModal(false);
      fetchAll();
    }
  };

  // ─── Merge + sort list ───────────────────────────────────────
  const mergedList: ListItem[] = [
    ...posts.map(p => ({ type: 'admin_post' as const, data: p, date: p.posted_at })),
    ...assignments.map(a => ({ type: 'student_submission' as const, data: a, date: a.submitted_at })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Count submissions per post
  const submissionCountForPost = (postId: string) =>
    assignments.filter(a => a.assignment_post_id === postId).length;

  // ─── Render each list item ───────────────────────────────────
  const renderItem = ({ item }: { item: ListItem }) => {
    if (item.type === 'admin_post') {
      return (
        <AssignmentPostCard
          post={item.data}
          submissionCount={submissionCountForPost(item.data.id)}
        />
      );
    }
    return <AssignmentCard assignment={item.data} />;
  };

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 100 : insets.bottom + 24;
  const noPosts = !loadingPosts && posts.length === 0;

  return (
    <>
      <FlatList
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={{ paddingTop: topPad + 16, paddingBottom: bottomPad }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        data={mergedList}
        keyExtractor={item => `${item.type}-${item.data.id}`}
        renderItem={renderItem}
        ListHeaderComponent={
          <View>
            <Text style={[styles.pageTitle, { color: colors.textDark, fontFamily: FONTS.heading }]}>
              Assignments
            </Text>

            {/* Admin: Post New Assignment button */}
            {isAdmin && (
              <TouchableOpacity
                style={[styles.postBtn, { backgroundColor: colors.primary }]}
                onPress={() => setShowPostModal(true)}
                activeOpacity={0.85}
              >
                <CirclePlus size={20} color="#FFFAF7" />
                <Text style={[styles.postBtnText, { fontFamily: FONTS.bodyBold }]}>
                  Post New Assignment
                </Text>
              </TouchableOpacity>
            )}

            {/* Student submission form */}
            <View style={[styles.formCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <Text style={[styles.formTitle, { color: colors.textDark, fontFamily: FONTS.heading }]}>
                Submit Your Work
              </Text>

              {/* Responding to selector */}
              <Text style={[styles.fieldLabel, { color: colors.textDark, fontFamily: FONTS.bodyMedium }]}>
                Responding to
              </Text>

              {loadingPosts ? (
                <View style={styles.pillLoading}>
                  <ActivityIndicator size="small" color={colors.primary} />
                </View>
              ) : noPosts ? (
                <View style={[styles.noPostsBanner, { borderColor: colors.border, backgroundColor: colors.background }]}>
                  <Text style={[styles.noPostsText, { color: colors.textMuted, fontFamily: FONTS.body }]}>
                    No assignments posted yet. Check back soon!
                  </Text>
                </View>
              ) : (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.pillRow}
                  style={{ marginBottom: 14 }}
                >
                  {posts.map(p => {
                    const selected = selectedPostId === p.id;
                    return (
                      <TouchableOpacity
                        key={p.id}
                        style={[
                          styles.pill,
                          selected
                            ? { backgroundColor: colors.primary, borderColor: colors.primary }
                            : { backgroundColor: colors.background, borderColor: colors.primary },
                        ]}
                        onPress={() => setSelectedPostId(p.id)}
                        activeOpacity={0.8}
                      >
                        <Text style={[
                          styles.pillText,
                          { fontFamily: FONTS.bodyMedium, color: selected ? '#FFFAF7' : colors.primary },
                        ]}>
                          {p.title}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              )}

              <Text style={[styles.fieldLabel, { color: colors.textDark, fontFamily: FONTS.bodyMedium }]}>
                Student Name
              </Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.textDark, fontFamily: FONTS.body }, noPosts && styles.disabled]}
                value={studentName}
                onChangeText={setStudentName}
                placeholder="Your full name"
                placeholderTextColor={colors.textMuted}
                editable={!noPosts}
              />

              <Text style={[styles.fieldLabel, { color: colors.textDark, fontFamily: FONTS.bodyMedium }]}>
                Group Name
              </Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.textDark, fontFamily: FONTS.body }, noPosts && styles.disabled]}
                value={groupName}
                onChangeText={setGroupName}
                placeholder="e.g. Group A"
                placeholderTextColor={colors.textMuted}
                editable={!noPosts}
              />

              <Text style={[styles.fieldLabel, { color: colors.textDark, fontFamily: FONTS.bodyMedium }]}>
                Assignment Link
              </Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.textDark, fontFamily: FONTS.body }, noPosts && styles.disabled]}
                value={taskLink}
                onChangeText={setTaskLink}
                placeholder="https://..."
                placeholderTextColor={colors.textMuted}
                keyboardType="url"
                autoCapitalize="none"
                editable={!noPosts}
              />

              <TouchableOpacity
                style={[styles.submitBtn, { backgroundColor: colors.primary }, (submitting || noPosts) && styles.disabledBtn]}
                onPress={handleSubmit}
                disabled={submitting || noPosts}
                activeOpacity={0.8}
              >
                {submitting ? (
                  <ActivityIndicator color="#FFFAF7" size="small" />
                ) : (
                  <>
                    <Upload size={18} color="#FFFAF7" />
                    <Text style={[styles.submitBtnText, { color: '#FFFAF7', fontFamily: FONTS.bodyBold }]}>
                      Submit Assignment
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            <Text style={[styles.sectionLabel, { color: colors.textMuted, fontFamily: FONTS.bodyMedium }]}>
              All Activity
            </Text>

            {loadingList && (
              <View style={styles.center}>
                <ActivityIndicator color={colors.primary} size="large" />
              </View>
            )}
          </View>
        }
        ListEmptyComponent={
          !loadingList ? (
            <View style={styles.center}>
              <FileText size={40} color={colors.border} />
              <Text style={[styles.emptyText, { color: colors.textMuted, fontFamily: FONTS.body }]}>
                No posts or submissions yet.{'\n'}Be the first!
              </Text>
            </View>
          ) : null
        }
      />

      {/* Admin — Post New Assignment Modal */}
      <Modal
        visible={showPostModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowPostModal(false)}
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            style={[styles.modal, { backgroundColor: colors.background }]}
            contentContainerStyle={styles.modalContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.textDark, fontFamily: FONTS.heading }]}>
                New Assignment
              </Text>
              <TouchableOpacity onPress={() => setShowPostModal(false)} activeOpacity={0.7}>
                <X size={24} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.fieldLabel, { color: colors.textDark, fontFamily: FONTS.bodyMedium }]}>
              Assignment Name *
            </Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.textDark, fontFamily: FONTS.body }]}
              value={postTitle}
              onChangeText={setPostTitle}
              placeholder="e.g. Session 2 – User Research"
              placeholderTextColor={colors.textMuted}
            />

            <Text style={[styles.fieldLabel, { color: colors.textDark, fontFamily: FONTS.bodyMedium }]}>
              Description *
            </Text>
            <TextInput
              style={[styles.input, styles.multilineInput, { backgroundColor: colors.card, borderColor: colors.border, color: colors.textDark, fontFamily: FONTS.body }]}
              value={postDescription}
              onChangeText={setPostDescription}
              placeholder="Describe what students need to submit..."
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />

            <TouchableOpacity
              style={[styles.submitBtn, { backgroundColor: colors.primary }, posting && styles.disabledBtn]}
              onPress={handlePostAssignment}
              disabled={posting}
              activeOpacity={0.8}
            >
              {posting ? (
                <ActivityIndicator color="#FFFAF7" size="small" />
              ) : (
                <Text style={[styles.submitBtnText, { color: '#FFFAF7', fontFamily: FONTS.bodyBold }]}>
                  Post Assignment
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.cancelBtn, { borderColor: colors.border }]}
              onPress={() => setShowPostModal(false)}
              activeOpacity={0.7}
            >
              <Text style={[styles.cancelBtnText, { color: colors.textMuted, fontFamily: FONTS.bodyMedium }]}>
                Cancel
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  pageTitle: {
    fontSize: 28,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  postBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 18,
    borderRadius: 14,
    paddingVertical: 15,
  },
  postBtnText: {
    color: '#FFFAF7',
    fontSize: 16,
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
  pillLoading: {
    paddingVertical: 12,
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  pillRow: {
    flexDirection: 'row',
    gap: 8,
    paddingRight: 4,
  },
  pill: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  pillText: {
    fontSize: 13,
  },
  noPostsBanner: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    alignItems: 'center',
  },
  noPostsText: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 15,
    marginBottom: 14,
  },
  multilineInput: {
    minHeight: 120,
    paddingTop: 12,
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
  disabledBtn: { opacity: 0.55 },
  disabled: { opacity: 0.45 },
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
  // Modal
  modal: { flex: 1 },
  modalContent: {
    padding: 24,
    paddingBottom: 48,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 22,
  },
  cancelBtn: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 12,
  },
  cancelBtnText: { fontSize: 15 },
});
