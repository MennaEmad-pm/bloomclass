import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { FONTS } from '@/constants/fonts';
import { CourseSession } from '@/lib/supabase';
import { EditSessionModal } from './EditSessionModal';

type Props = {
  session: CourseSession;
  isAdmin: boolean;
  onUpdate: (updated: CourseSession) => void;
};

export function SessionCard({ session, isAdmin, onUpdate }: Props) {
  const colors = useColors();
  const [editOpen, setEditOpen] = useState(false);
  const hasPresentation = !!session.presentation_url;

  return (
    <>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <View style={styles.topRow}>
          <View style={[styles.badge, { backgroundColor: colors.primary }]}>
            <Text style={[styles.badgeText, { color: colors.primaryForeground, fontFamily: FONTS.bodyBold }]}>
              {session.id}
            </Text>
          </View>
          <Text style={[styles.title, { color: colors.textDark, fontFamily: FONTS.heading }]} numberOfLines={2}>
            {session.title}
          </Text>
        </View>

        {session.notes ? (
          <Text style={[styles.notes, { color: colors.textDark, fontFamily: FONTS.body }]}>
            {session.notes}
          </Text>
        ) : (
          <Text style={[styles.notesPlaceholder, { color: colors.textMuted, fontFamily: FONTS.body }]}>
            Notes will be added after the session.
          </Text>
        )}

        <View style={styles.actions}>
          <TouchableOpacity
            style={[
              styles.presentationBtn,
              hasPresentation
                ? { backgroundColor: colors.secondary }
                : { backgroundColor: colors.muted },
            ]}
            onPress={() => hasPresentation && Linking.openURL(session.presentation_url!)}
            disabled={!hasPresentation}
            activeOpacity={0.8}
          >
            <Ionicons
              name="easel-outline"
              size={15}
              color={hasPresentation ? colors.primaryForeground : colors.textMuted}
            />
            <Text
              style={[
                styles.presentationBtnText,
                {
                  fontFamily: FONTS.bodyMedium,
                  color: hasPresentation ? colors.primaryForeground : colors.textMuted,
                },
              ]}
            >
              {hasPresentation ? 'View Presentation' : 'Coming Soon'}
            </Text>
          </TouchableOpacity>

          {isAdmin && (
            <TouchableOpacity
              style={[styles.editBtn, { borderColor: colors.primary }]}
              onPress={() => setEditOpen(true)}
              activeOpacity={0.7}
            >
              <Ionicons name="pencil-outline" size={15} color={colors.primary} />
              <Text style={[styles.editBtnText, { color: colors.primary, fontFamily: FONTS.bodyMedium }]}>
                Edit
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <EditSessionModal
        session={session}
        visible={editOpen}
        onClose={() => setEditOpen(false)}
        onSaved={onUpdate}
      />
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
    marginHorizontal: 16,
    marginBottom: 12,
    shadowColor: '#3D2B30',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 10,
  },
  badge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  badgeText: {
    fontSize: 14,
  },
  title: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
    paddingTop: 4,
  },
  notes: {
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 14,
  },
  notesPlaceholder: {
    fontSize: 13,
    fontStyle: 'italic',
    lineHeight: 20,
    marginBottom: 14,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  presentationBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: 10,
  },
  presentationBtnText: {
    fontSize: 13,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
  },
  editBtnText: {
    fontSize: 13,
  },
});
