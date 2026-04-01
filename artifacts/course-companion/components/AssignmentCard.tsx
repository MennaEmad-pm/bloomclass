import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { FONTS } from '@/constants/fonts';
import { Assignment } from '@/lib/supabase';

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

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
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
        onPress={() => Linking.openURL(assignment.task_link)}
        activeOpacity={0.7}
      >
        <Ionicons name="link-outline" size={14} color={colors.primary} />
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
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 10,
    shadowColor: '#3D2B30',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 1,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
    gap: 10,
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
  groupText: {
    fontSize: 12,
  },
  date: {
    fontSize: 12,
    marginBottom: 12,
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
  },
  viewBtnText: {
    fontSize: 13,
  },
});
