import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { MessageCircle, ArrowRight } from 'lucide-react-native';
import { useColors } from '@/hooks/useColors';
import { FONTS } from '@/constants/fonts';

const FORM_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLSe5yROgVNzxE2FFT7Rzai_PFsvWIhjejcF_mA3lbwdJoaURLg/viewform';

export function FeedbackBanner() {
  const colors = useColors();

  return (
    <TouchableOpacity
      style={[styles.banner, { backgroundColor: colors.accent }]}
      onPress={() => Linking.openURL(FORM_URL)}
      activeOpacity={0.85}
    >
      <View style={styles.iconWrap}>
        <MessageCircle size={24} color={colors.card} />
      </View>
      <View style={styles.textWrap}>
        <Text style={[styles.label, { color: colors.card, fontFamily: FONTS.bodyBold }]}>
          Share Your Session Feedback
        </Text>
        <Text style={[styles.sub, { color: colors.card, fontFamily: FONTS.body }]}>
          Help us improve the course for everyone
        </Text>
      </View>
      <ArrowRight size={20} color={colors.card} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 16,
    padding: 18,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: {
    flex: 1,
  },
  label: {
    fontSize: 15,
    marginBottom: 2,
  },
  sub: {
    fontSize: 12,
    opacity: 0.85,
  },
});
