import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { Linkedin } from 'lucide-react-native';
import { useColors } from '@/hooks/useColors';
import { FONTS } from '@/constants/fonts';

export function InstructorCard() {
  const colors = useColors();

  const openLinkedIn = () => {
    Linking.openURL('https://www.linkedin.com/in/mennatallah-emad/');
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
      <View style={styles.header}>
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <Text style={[styles.avatarText, { color: colors.primaryForeground }]}>ME</Text>
        </View>
        <View style={styles.headerInfo}>
          <Text style={[styles.name, { color: colors.textDark, fontFamily: FONTS.heading }]}>
            Mennatallah
          </Text>
          <Text style={[styles.experience, { color: colors.textMuted, fontFamily: FONTS.body }]}>
            Senior Product Manager
          </Text>
        </View>
      </View>

      <Text style={[styles.bio, { color: colors.textMuted, fontFamily: FONTS.body }]}>
        I'm Mennatallah, a Senior Product Manager with over 10 years of experience working across digital platforms. I've led products from early discovery through delivery, worked with cross-functional teams in fast-paced environments, and spent years mentoring other PMs along the way — which is what brings me here today.
      </Text>

      <TouchableOpacity
        style={[styles.linkedInBtn, { backgroundColor: colors.primary }]}
        onPress={openLinkedIn}
        activeOpacity={0.8}
      >
        <Linkedin size={16} color={colors.primaryForeground} />
        <Text style={[styles.linkedInText, { color: colors.primaryForeground, fontFamily: FONTS.bodyMedium }]}>
          LinkedIn Profile
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#3D2B30',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
  },
  headerInfo: {
    flex: 1,
  },
  name: {
    fontSize: 20,
    marginBottom: 2,
  },
  experience: {
    fontSize: 14,
  },
  bio: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 16,
  },
  linkedInBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
  },
  linkedInText: {
    fontSize: 14,
  },
});
