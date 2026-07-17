import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { getStats } from '../api/client';

export default function DashboardScreen() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStats()
      .then(setStats)
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!stats || stats.totalScans === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.empty}>Scan some products to see your stats here.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.cardValue}>{stats.totalScans}</Text>
        <Text style={styles.cardLabel}>Total scans</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardValue}>
          {stats.averageScore ? Math.round(stats.averageScore) : '—'}
        </Text>
        <Text style={styles.cardLabel}>Average eco score</Text>
      </View>

      {/* Grade distribution chart is a good week-3 addition once there's
          enough scan volume to make a chart meaningful - a bar chart via
          a lightweight RN chart lib (e.g. react-native-gifted-charts)
          slots in here. */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  empty: { textAlign: 'center', color: '#666' },
  card: {
    backgroundColor: '#f2f2f2',
    borderRadius: 14,
    padding: 20,
    marginBottom: 14,
    alignItems: 'center',
  },
  cardValue: { fontSize: 32, fontWeight: '700' },
  cardLabel: { fontSize: 13, color: '#666', marginTop: 4 },
});
