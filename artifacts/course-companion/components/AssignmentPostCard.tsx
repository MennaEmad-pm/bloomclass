import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FONTS } from '@/constants/fonts';
import { AssignmentPost } from '@/lib/supabase';

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'long', day: 'numeric', year: 'numeric',
    });
  } catch {
    return iso;
  }
}

type Props = {
  post: AssignmentPost;
  submissionCount: number;
};

export function AssignmentPostCard({ post, submissionCount }: Props) {
  return (
    <View style={styles.shadow}>
      <LinearGradient
        colors={['#C9748A', '#D4795A']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <View style={styles.goldAccent} />

        <View style={styles.badgeRow}>
          <View style={styles.badge}>
            <Text style={[styles.badgeText, { fontFamily: FONTS.bodyMedium }]}>
              📌 New Assignment
            </Text>
          </View>
        </View>

        <Text style={[styles.title, { fontFamily: FONTS.heading }]}>
          {post.title}
        </Text>

        <Text style={[styles.description, { fontFamily: FONTS.body }]}>
          {post.description}
        </Text>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { fontFamily: FONTS.body }]}>
            Posted by Menna Emad · {formatDate(post.posted_at)}
          </Text>
          <Text style={[styles.footerText, { fontFamily: FONTS.body }]}>
            {submissionCount === 0
              ? 'No submissions yet'
              : `${submissionCount} submission${submissionCount === 1 ? '' : 's'}`}
          </Text>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  shadow: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 18,
    shadowColor: '#C9748A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },
  card: {
    borderRadius: 18,
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
    overflow: 'hidden',
  },
  goldAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: 4,
    backgroundColor: '#C9A96E',
    borderTopLeftRadius: 18,
    borderBottomLeftRadius: 18,
  },
  badgeRow: {
    marginBottom: 12,
    marginLeft: 8,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  badgeText: {
    color: '#FFFAF7',
    fontSize: 12,
  },
  title: {
    fontSize: 20,
    color: '#FFFAF7',
    marginBottom: 10,
    marginLeft: 8,
  },
  description: {
    fontSize: 14,
    color: 'rgba(255,250,247,0.9)',
    lineHeight: 22,
    marginBottom: 16,
    marginLeft: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginLeft: 8,
    gap: 8,
    flexWrap: 'wrap',
  },
  footerText: {
    fontSize: 12,
    color: 'rgba(255,250,247,0.7)',
  },
});
