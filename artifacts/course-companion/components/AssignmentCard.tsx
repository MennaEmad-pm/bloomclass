import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking, Alert } from 'react-native';
import { Link, CornerDownLeft } from 'lucide-react-native';
import { useColors } from '@/hooks/useColors';
import { FONTS } from '@/constants/fonts';
import { Assignment } from '@/lib/supabase';

function openLink(raw: string) {
  let url = raw.trim();
  if (url && !/^https?:\/\//i.test(url)) url = 'https://' + url;
  Linking.openURL(url).catch(() => {
    Alert.alert('Could not open link', 'The URL may be invalid or your device has no app to handle it.');
  });
}

const GROUP_COLORS = [
  '#C9748A', '#D4795A', '#C9A96E', '#7A9E9F', '#9B7BB8', '#5B8DB8',
];

function groupColor(group: string) {
  let hash = 0;
  for (let i = 0; i < group.length; i++) hash = group.charCodeAt(i) + ((hash << 5) - hash);
  return GROUP_COLORS[Math.abs(hash) % GROUP_COLORS.length];
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString('en-US', {
      month: 'long', day: 'numeric', year: 'numeric',
      hour: 'numeric', minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

type Props = { assignment: Assignment };

export function AssignmentCard({ assignment }: Props) {
  const colors = useColors();
  const color = groupColor(assignment.group_name);

  const linkedTitle = assignment.assignment_posts?.title ?? null;
  const showResponseTag = assignment.assignment_post_id != null;
  const isRemoved = showResponseTag && linkedTitle == null;

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
      {showResponseTag && (
        <View style={styles.responseTag}>
          <CornerDownLeft size={12} color={isRemoved ? '#8C6B72' : '#D4795A'} />
          <Text style={[
            styles.responseTagText,
            { color: isRemoved ? '#8C6B72' : '#D4795A', fontFamily: FONTS.body },
          ]}>
            {isRemoved ? 'In response to: [Assignment Removed]' : `In response to: "${linkedTitle}"`}
          </Text>
        </View>
      )}

      <View style={styles.topRow}>
        <Text style={[styles.name, { color: colors.textDark, fontFamily: FONTS.bodyBold }]}>
          {assignment.student_name}
        </Text>
        <View style={[styles.groupPill, { backgroundColor: color + '22', borderColor: color + '44' }]}>
          <Text style={[styles.groupText, { color, fontFamily: FONTS.bodyMedium }]}>
            {assignment.group_name}
          </Text>
        </View>
      </View>

      <Text style={[styles.date, { color: colors.textMuted, fontFamily: FONTS.body }]}>
        {formatDate(assignment.submitted_at)}
      </Text>

      <TouchableOpacity
        style={[styles.viewBtn, { borderColor: colors.primary }]}
        onPress={() => openLink(assignment.task_link)}
        activeOpacity={0.7}
      >
        <Link size={14} color={colors.primary} />
        <Text style={[styles.viewBtnText, { color: colors.primary, fontFamily: FONTS.bodyMedium }]}>
          View Submission
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    marginHorizontal: 16,
    marginBottom: 10,
    shadowColor: '#3D2B30',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 1,
  },
  responseTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#FDF0EC',
    borderLeftWidth: 3,
    borderLeftColor: '#D4795A',
    marginBottom: 2,
  },
  responseTagText: {
    fontSize: 12,
    fontStyle: 'italic',
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  name: {
    fontSize: 15,
    flex: 1,
  },
  groupPill: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  groupText: { fontSize: 12 },
  date: {
    fontSize: 12,
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  viewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    alignSelf: 'flex-start',
    marginHorizontal: 16,
    marginBottom: 14,
  },
  viewBtnText: { fontSize: 13 },
});
