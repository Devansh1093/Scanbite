import { View, Text, StyleSheet } from 'react-native';

const GRADE_COLORS = {
  A: '#1D9E75',
  B: '#639922',
  C: '#EF9F27',
  D: '#D85A30',
  E: '#A32D2D',
};

export default function NutritionScoreBadge({ nutritionScore }) {
  if (!nutritionScore || nutritionScore.value == null) {
    return (
      <View style={[styles.badge, { backgroundColor: '#999' }]}>
        <Text style={styles.grade}>?</Text>
        <Text style={styles.value}>No score</Text>
      </View>
    );
  }

  const color = GRADE_COLORS[nutritionScore.grade] || '#999';

  return (
    <View style={[styles.badge, { backgroundColor: color }]}>
      <Text style={styles.grade}>{nutritionScore.grade}</Text>
      <Text style={styles.value}>{nutritionScore.value}/100</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  grade: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
  },
  value: {
    fontSize: 13,
    color: '#fff',
    marginTop: 2,
  },
});
