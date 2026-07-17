import { useState, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Button } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { scanBarcode } from '../api/client';

export default function ScanScreen({ navigation }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // Guards against firing multiple requests for the same barcode while
  // the camera keeps detecting it every frame during the API round trip.
  const scanLockRef = useRef(false);

  if (!permission) {
    return <View style={styles.center} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.message}>Camera access is needed to scan barcodes.</Text>
        <Button title="Grant permission" onPress={requestPermission} />
      </View>
    );
  }

  async function handleBarcodeScanned({ data: barcode }) {
    if (scanLockRef.current) return;
    scanLockRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const product = await scanBarcode(barcode);
      navigation.navigate('Result', { product });
    } catch (err) {
      if (err.response?.status === 404) {
        setError('Product not found in Open Food Facts.');
      } else {
        setError('Could not reach the server. Check your connection.');
      }
    } finally {
      setLoading(false);
      // Release the lock after a short delay so the same product can be
      // rescanned intentionally, but not accidentally on every frame.
      setTimeout(() => {
        scanLockRef.current = false;
      }, 1500);
    }
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128'],
        }}
        onBarcodeScanned={handleBarcodeScanned}
      />

      <View style={styles.frame} />

      {loading ? (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.overlayText}>Looking up product…</Text>
        </View>
      ) : null}

      {error ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  message: { textAlign: 'center', marginBottom: 16 },
  frame: {
    position: 'absolute',
    top: '35%',
    left: '15%',
    width: '70%',
    height: '20%',
    borderWidth: 2,
    borderColor: '#fff',
    borderRadius: 12,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlayText: { color: '#fff', marginTop: 12, fontSize: 15 },
  errorBanner: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    backgroundColor: '#A32D2D',
    padding: 14,
    borderRadius: 10,
  },
  errorText: { color: '#fff', textAlign: 'center' },
});
