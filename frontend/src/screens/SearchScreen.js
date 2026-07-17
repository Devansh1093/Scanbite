import { useState, useCallback } from 'react';
import { View, TextInput, FlatList, StyleSheet, Text } from 'react-native';
import { searchProducts } from '../api/client';
import ProductCard from '../components/ProductCard';

export default function SearchScreen({ navigation }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const runSearch = useCallback(async (q) => {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const data = await searchProducts({ q, limit: 30 });
      setResults(data.products);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  function handleChange(text) {
    setQuery(text);
    // Simple debounce - fine for a portfolio project; swap for a proper
    // debounce hook if search gets called from more places.
    clearTimeout(handleChange._t);
    handleChange._t = setTimeout(() => runSearch(text), 400);
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Search products…"
        value={query}
        onChangeText={handleChange}
      />

      {loading ? <Text style={styles.status}>Searching…</Text> : null}
      {!loading && query && results.length === 0 ? (
        <Text style={styles.status}>No cached products match yet - scan a few first.</Text>
      ) : null}

      <FlatList
        data={results}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            onPress={() => navigation.navigate('Result', { product: item })}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  input: {
    margin: 16,
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#f2f2f2',
    fontSize: 15,
  },
  status: { textAlign: 'center', color: '#666', marginBottom: 12 },
});
