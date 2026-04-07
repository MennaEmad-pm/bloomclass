import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { List, Pencil, ChevronDown, ChevronUp, Trash2, PlusCircle } from 'lucide-react-native';
import { useColors } from '@/hooks/useColors';
import { FONTS } from '@/constants/fonts';
import { supabase, CourseRule } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

const DEFAULT_RULES = [
  'Respect all participants and maintain a safe, inclusive space.',
  'Be punctual — join sessions on time and notify if you\'ll be late.',
  'Keep your camera on during live sessions when possible.',
  'Engage actively: ask questions, participate in discussions.',
  'Submit assignments before stated deadlines.',
  'No plagiarism — all work must be your own or properly attributed.',
  'Be constructive in feedback, both giving and receiving.',
  'Keep course materials confidential.',
];

export function CourseRules() {
  const colors = useColors();
  const { isAdmin } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const [rules, setRules] = useState<string[]>(DEFAULT_RULES);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [editRules, setEditRules] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const fetchRules = useCallback(async () => {
    try {
      const { data } = await supabase
        .from('course_rules')
        .select('*')
        .order('order_index');
      if (data && data.length > 0) {
        setRules(data.map((r: CourseRule) => r.text));
      }
    } catch (_e) {
      // use default rules on error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRules(); }, [fetchRules]);

  const openEdit = () => {
    setEditRules([...rules]);
    setEditOpen(true);
  };

  const saveRules = async () => {
    const trimmed = editRules.map(r => r.trim()).filter(r => r.length > 0);
    if (trimmed.length === 0) {
      Alert.alert('Error', 'Please add at least one rule.');
      return;
    }
    setSaving(true);
    try {
      await supabase.from('course_rules').delete().neq('id', 0);
      const rows = trimmed.map((text, i) => ({ text, order_index: i + 1 }));
      const { error } = await supabase.from('course_rules').insert(rows);
      if (error) throw error;
      setRules(trimmed);
      setEditOpen(false);
    } catch (_e) {
      Alert.alert('Error', 'Failed to save rules. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const updateRule = (index: number, value: string) => {
    const updated = [...editRules];
    updated[index] = value;
    setEditRules(updated);
  };

  const addRule = () => {
    setEditRules([...editRules, '']);
  };

  const deleteRule = (index: number) => {
    setEditRules(editRules.filter((_, i) => i !== index));
  };

  return (
    <>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <TouchableOpacity style={styles.header} onPress={() => setExpanded(v => !v)} activeOpacity={0.7}>
          <View style={styles.titleRow}>
            <List size={20} color={colors.accent} />
            <Text style={[styles.title, { color: colors.textDark, fontFamily: FONTS.heading }]}>
              Course Rules
            </Text>
          </View>
          <View style={styles.headerRight}>
            {isAdmin && (
              <TouchableOpacity
                onPress={(e) => { e.stopPropagation?.(); openEdit(); }}
                style={[styles.editBtn, { borderColor: colors.primary }]}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Pencil size={14} color={colors.primary} />
              </TouchableOpacity>
            )}
            {expanded
              ? <ChevronUp size={18} color={colors.textMuted} />
              : <ChevronDown size={18} color={colors.textMuted} />
            }
          </View>
        </TouchableOpacity>

        {expanded && (
          <View style={styles.rulesContainer}>
            {loading ? (
              <ActivityIndicator color={colors.primary} style={{ paddingBottom: 12 }} />
            ) : (
              rules.map((rule, index) => (
                <View key={index} style={styles.ruleRow}>
                  <View style={[styles.ruleBadge, { backgroundColor: colors.primary }]}>
                    <Text style={[styles.ruleNumber, { color: colors.primaryForeground, fontFamily: FONTS.bodyBold }]}>
                      {index + 1}
                    </Text>
                  </View>
                  <Text style={[styles.ruleText, { color: colors.textDark, fontFamily: FONTS.body }]}>
                    {rule}
                  </Text>
                </View>
              ))
            )}
          </View>
        )}
      </View>

      {/* Edit Rules Modal (admin only) */}
      <Modal
        visible={editOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => !saving && setEditOpen(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={() => !saving && setEditOpen(false)} disabled={saving}>
              <Text style={[styles.modalCancel, { color: colors.textMuted, fontFamily: FONTS.body }]}>
                Cancel
              </Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.textDark, fontFamily: FONTS.heading }]}>
              Edit Rules
            </Text>
            <TouchableOpacity onPress={saveRules} disabled={saving}>
              {saving ? (
                <ActivityIndicator color={colors.primary} size="small" />
              ) : (
                <Text style={[styles.modalSave, { color: colors.primary, fontFamily: FONTS.bodyBold }]}>
                  Save
                </Text>
              )}
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.modalScroll}
            contentContainerStyle={styles.modalContent}
            keyboardShouldPersistTaps="handled"
          >
            {editRules.map((rule, index) => (
              <View key={index} style={[styles.editRow, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                <View style={[styles.ruleBadge, { backgroundColor: colors.primary }]}>
                  <Text style={[styles.ruleNumber, { color: colors.primaryForeground, fontFamily: FONTS.bodyBold }]}>
                    {index + 1}
                  </Text>
                </View>
                <TextInput
                  style={[styles.editInput, { color: colors.textDark, fontFamily: FONTS.body }]}
                  value={rule}
                  onChangeText={(v) => updateRule(index, v)}
                  placeholder="Rule text..."
                  placeholderTextColor={colors.textMuted}
                  multiline
                />
                <TouchableOpacity onPress={() => deleteRule(index)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Trash2 size={18} color="#E05858" />
                </TouchableOpacity>
              </View>
            ))}

            <TouchableOpacity
              style={[styles.addBtn, { borderColor: colors.primary }]}
              onPress={addRule}
            >
              <PlusCircle size={18} color={colors.primary} />
              <Text style={[styles.addBtnText, { color: colors.primary, fontFamily: FONTS.bodyMedium }]}>
                Add Rule
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#3D2B30',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  editBtn: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 5,
  },
  title: { fontSize: 17 },
  rulesContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 12,
  },
  ruleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  ruleBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 1,
  },
  ruleNumber: { fontSize: 12 },
  ruleText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 21,
  },
  modalContainer: { flex: 1 },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modalTitle: { fontSize: 17 },
  modalCancel: { fontSize: 16 },
  modalSave: { fontSize: 16 },
  modalScroll: { flex: 1 },
  modalContent: {
    padding: 16,
    gap: 10,
  },
  editRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  editInput: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    minHeight: 40,
    paddingTop: 2,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 4,
  },
  addBtnText: { fontSize: 15 },
});
