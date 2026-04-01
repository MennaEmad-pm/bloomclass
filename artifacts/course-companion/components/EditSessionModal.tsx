import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { supabase, CourseSession } from '@/lib/supabase';
import { useColors } from '@/hooks/useColors';
import { FONTS } from '@/constants/fonts';

type Props = {
  session: CourseSession;
  visible: boolean;
  onClose: () => void;
  onSaved: (updated: CourseSession) => void;
};

export function EditSessionModal({ session, visible, onClose, onSaved }: Props) {
  const colors = useColors();
  const [title, setTitle] = useState(session.title);
  const [presentationUrl, setPresentationUrl] = useState(session.presentation_url ?? '');
  const [notes, setNotes] = useState(session.notes ?? '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setTitle(session.title);
    setPresentationUrl(session.presentation_url ?? '');
    setNotes(session.notes ?? '');
  }, [session]);

  const save = async () => {
    if (!title.trim()) {
      Toast.show({ type: 'error', text1: 'Title is required' });
      return;
    }
    setSaving(true);
    const updates = {
      title: title.trim(),
      presentation_url: presentationUrl.trim() || null,
      notes: notes.trim() || null,
    };
    const { error } = await supabase.from('sessions').update(updates).eq('id', session.id);
    setSaving(false);
    if (error) {
      Toast.show({ type: 'error', text1: 'Failed to save', text2: error.message });
    } else {
      Toast.show({ type: 'success', text1: 'Session updated!' });
      onSaved({ ...session, ...updates });
      onClose();
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.sheet, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.textDark, fontFamily: FONTS.heading }]}>
              Edit Session {session.id}
            </Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close" size={22} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={[styles.label, { color: colors.textDark, fontFamily: FONTS.bodyMedium }]}>
              Title
            </Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.textDark, fontFamily: FONTS.body }]}
              value={title}
              onChangeText={setTitle}
              placeholder="Session title"
              placeholderTextColor={colors.textMuted}
            />

            <Text style={[styles.label, { color: colors.textDark, fontFamily: FONTS.bodyMedium }]}>
              Presentation URL
            </Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.textDark, fontFamily: FONTS.body }]}
              value={presentationUrl}
              onChangeText={setPresentationUrl}
              placeholder="https://..."
              placeholderTextColor={colors.textMuted}
              keyboardType="url"
              autoCapitalize="none"
            />

            <Text style={[styles.label, { color: colors.textDark, fontFamily: FONTS.bodyMedium }]}>
              Notes
            </Text>
            <TextInput
              style={[styles.input, styles.textArea, { backgroundColor: colors.background, borderColor: colors.border, color: colors.textDark, fontFamily: FONTS.body }]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Session notes..."
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: colors.primary }, saving && styles.disabled]}
              onPress={save}
              disabled={saving}
              activeOpacity={0.8}
            >
              {saving ? (
                <ActivityIndicator color={colors.primaryForeground} size="small" />
              ) : (
                <Text style={[styles.saveBtnText, { color: colors.primaryForeground, fontFamily: FONTS.bodyBold }]}>
                  Save Changes
                </Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(61,43,48,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
  },
  label: {
    fontSize: 13,
    marginBottom: 6,
    marginTop: 4,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 15,
    marginBottom: 14,
  },
  textArea: {
    height: 100,
    paddingTop: 11,
  },
  saveBtn: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  saveBtnText: {
    fontSize: 16,
  },
  disabled: {
    opacity: 0.6,
  },
});
