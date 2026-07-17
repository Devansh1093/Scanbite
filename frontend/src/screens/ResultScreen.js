import { ScrollView, View, Text, Image, StyleSheet, Button } from 'react-native';
import NutritionScoreBadge from '../components/NutritionScoreBadge';

export default function ResultScreen({ route, navigation }) {
  const { product } = route.params;
  const nutritionScore = product.nutritionScore;
  const metrics = nutritionScore?.metrics;
  const breakdown = nutritionScore?.breakdown;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {product.imageUrl ? (
        <Image source={{ uri: product.imageUrl }} style={styles.image} />
      ) : null}

      <Text style={styles.name}>{product.name}</Text>
      {product.brand ? <Text style={styles.brand}>{product.brand}</Text> : null}

      <View style={styles.badgeRow}>
        <NutritionScoreBadge nutritionScore={nutritionScore} />
      </View>

      {nutritionScore?.summary ? <Text style={styles.summary}>{nutritionScore.summary}</Text> : null}

      {/* Named nutrition facts that answer "what's actually in this" -
          Nutri-Score, additive count, allergens - shown plainly. */}
      {metrics ? (
        <View style={styles.metricsRow}>
          <MetricCard
            label="Nutri-Score"
            value={metrics.nutriScore.label}
            faded={!metrics.nutriScore.available}
          />
          <MetricCard
            label="Additives"
            value={metrics.additives.label}
            faded={metrics.additives.value === null}
          />
          <MetricCard
            label="Allergens"
            value={metrics.allergens.label}
            faded={!metrics.allergens.value.length}
          />
        </View>
      ) : null}

      {breakdown ? (
        <View style={styles.breakdownSection}>
          <Text style={styles.sectionTitle}>Why this score?</Text>
          <BreakdownRow label="Sugar" data={breakdown.sugar} />
          <BreakdownRow label="Salt" data={breakdown.salt} />
          <BreakdownRow label="Saturated fat" data={breakdown.saturatedFat} />
          <BreakdownRow label="Processing" data={breakdown.processing} />
        </View>
      ) : null}

      <View style={styles.scanAgain}>
        <Button title="Scan another product" onPress={() => navigation.navigate('Scan')} />
      </View>
    </ScrollView>
  );
}

function MetricCard({ label, value, faded }) {
  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={[styles.metricValue, faded && styles.metricValueFaded]}>{value}</Text>
    </View>
  );
}

function BreakdownRow({ label, data }) {
  const pct = (data.score / data.max) * 100;
  return (
    <View style={styles.row}>
      <View style={styles.rowHeader}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowScore}>{data.score}/{data.max}</Text>
      </View>
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${pct}%` }]} />
      </View>
      <Text style={styles.rowReason}>{data.reason}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 20, alignItems: 'center' },
  image: { width: 140, height: 140, borderRadius: 12, marginBottom: 16 },
  name: { fontSize: 20, fontWeight: '600', textAlign: 'center' },
  brand: { fontSize: 14, color: '#666', marginTop: 4 },
  badgeRow: { marginVertical: 16 },
  summary: { fontSize: 14, color: '#444', textAlign: 'center', marginBottom: 20 },

  metricsRow: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: 24,
    gap: 8,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#f7f7f7',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  metricLabel: { fontSize: 11, color: '#888', textTransform: 'uppercase', marginBottom: 6, textAlign: 'center' },
  metricValue: { fontSize: 13, fontWeight: '600', textAlign: 'center' },
  metricValueFaded: { color: '#999', fontWeight: '400', fontStyle: 'italic' },

  breakdownSection: { width: '100%' },
  sectionTitle: { fontSize: 15, fontWeight: '600', marginBottom: 14 },
  row: { marginBottom: 16 },
  rowHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  rowLabel: { fontSize: 13, fontWeight: '500', color: '#333' },
  rowScore: { fontSize: 12, color: '#666' },
  barTrack: { height: 6, backgroundColor: '#eee', borderRadius: 3, marginBottom: 6 },
  barFill: { height: 6, backgroundColor: '#1D9E75', borderRadius: 3 },
  rowReason: { fontSize: 12, color: '#777', lineHeight: 17 },

  scanAgain: { marginTop: 8, width: '100%' },
});
