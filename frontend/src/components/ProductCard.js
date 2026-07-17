import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';

export default function ProductCard({ product, onPress }) {
  const grade = product.nutritionScore?.grade;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      {product.imageUrl ? (
        <Image source={{ uri: product.imageUrl }} style={styles.image} />
      ) : (
        <View style={[styles.image, styles.imagePlaceholder]} />
      )}

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {product.name}
        </Text>
        {product.brand ? (
          <Text style={styles.brand} numberOfLines={1}>
            {product.brand}
          </Text>
        ) : null}
      </View>

      {grade ? (
        <View style={styles.gradePill}>
          <Text style={styles.gradeText}>{grade}</Text>
        </View>
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  image: { width: 48, height: 48, borderRadius: 8 },
  imagePlaceholder: { backgroundColor: '#eee' },
  info: { flex: 1, marginLeft: 12 },
  name: { fontSize: 15, fontWeight: '500' },
  brand: { fontSize: 13, color: '#666', marginTop: 2 },
  gradePill: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f2f2f2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradeText: { fontWeight: '700', fontSize: 14 },
});
