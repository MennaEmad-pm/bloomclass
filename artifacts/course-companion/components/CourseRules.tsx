import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, LayoutAnimation } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { FONTS } from '@/constants/fonts';

const RULES = [
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
  const [expanded, setExpanded] = useState(false);

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(v => !v);
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
      <TouchableOpacity style={styles.header} onPress={toggle} activeOpacity={0.7}>
        <View style={styles.titleRow}>
          <Ionicons name="list-outline" size={20} color={colors.accent} />
          <Text style={[styles.title, { color: colors.textDark, fontFamily: FONTS.heading }]}>
            Course Rules
          </Text>
        </View>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={colors.textMuted}
        />
      </TouchableOpacity>

      {expanded && (
        <View style={styles.rulesContainer}>
          {RULES.map((rule, index) => (
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
          ))}
        </View>
      )}
    </View>
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
  title: {
    fontSize: 17,
  },
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
  ruleNumber: {
    fontSize: 12,
  },
  ruleText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 21,
  },
});
