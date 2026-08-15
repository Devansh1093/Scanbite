import { useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from 'react-native';

import { CameraView, useCameraPermissions } from 'expo-camera';

import { getStats, scanBarcode } from '../api/client';
import { colors, spacing, radius, typography } from '../theme/theme';
import { useFocusEffect } from '@react-navigation/native';

export default function HomeScreen({ navigation }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [stats, setStats] = useState(null);
  const [menuVisible, setMenu] = useState(false);
  const [loading, setLoading] = useState(false);

  const scanLockRef = useRef(false);

  // Get dashboard statistics
 useFocusEffect(
  useCallback(() => {
    getStats()
      .then(setStats)
      .catch(() => {});
  }, [])
);

  // Camera permission
  if (!permission) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.permissionTitle}>
          Camera access needed
        </Text>

        <Text style={styles.permissionText}>
          ScanBite needs your camera to scan product barcodes.
        </Text>

        <Pressable
          style={styles.permissionButton}
          onPress={requestPermission}
        >
          <Text style={styles.permissionButtonText}>
            Grant permission
          </Text>
        </Pressable>
      </View>
    );
  }

  async function handleBarcodeScanned({ data: barcode }) {
    if (scanLockRef.current) return;

    scanLockRef.current = true;
    setLoading(true);

    try {
      const product = await scanBarcode(barcode);

      navigation.navigate('Result', {
        product,
      });
    } catch (err) {
      console.log('Scan error:', err);
    } finally {
      setLoading(false);

      setTimeout(() => {
        scanLockRef.current = false;
      }, 1500);
    }
  }

  const totalScans = stats?.totalScans ?? 0;

  return (
    <View style={styles.container}>

      {/* ================= HEADER ================= */}

      <View style={styles.header}>

        <Pressable
          style={styles.menuButton}
          onPress={() => setMenu(!menuVisible)}
        >
          <Text style={styles.menuIcon}>☰</Text>
        </Pressable>

        <Text style={styles.logo}>
          ScanBite
        </Text>

      </View>


      {/* ================= MENU ================= */}

      {menuVisible && (
        <View style={styles.menu}>

          <Pressable
            style={styles.menuItem}
            onPress={() => {
              setMenu(false);
              navigation.navigate('Search');
            }}
          >
            <Text style={styles.menuIconSmall}>⌕</Text>
            <Text style={styles.menuText}>
              Search
            </Text>
          </Pressable>


          <Pressable
            style={styles.menuItem}
            onPress={() => {
              setMenu(false);
              navigation.navigate('History');
            }}
          >
            <Text style={styles.menuIconSmall}>◷</Text>
            <Text style={styles.menuText}>
              History
            </Text>
          </Pressable>

        </View>
      )}


      {/* ================= DASHBOARD ================= */}

      <Text style={styles.dashboardTitle}>
        Dashboard
      </Text>

      <Text style={styles.subtitle}>
        Keep track of your products
      </Text>


      {/* ================= STATS ================= */}

      <View style={styles.statCard}>

        <Text style={styles.statNumber}>
          {totalScans}
        </Text>

        <Text style={styles.statLabel}>
          Products scanned
        </Text>

      </View>


      {/* ================= SCANNER ================= */}

      <View style={styles.scannerCard}>

        <CameraView
          style={StyleSheet.absoluteFillObject}
          facing="back"
          barcodeScannerSettings={{
            barcodeTypes: [
              'ean13',
              'ean8',
              'upc_a',
              'upc_e',
              'code128',
            ],
          }}
          onBarcodeScanned={handleBarcodeScanned}
        />


        {/* Dark overlay */}

        <View style={styles.overlay} />


        {/* Scanner title */}

        <View style={styles.scannerHeader}>

          <View>
            <Text style={styles.scannerTitle}>
              Scan a Product
            </Text>

            <Text style={styles.scannerSubtitle}>
              Point the barcode inside the frame
            </Text>
          </View>

          <View style={styles.barcodeCircle}>
            <Text style={styles.barcodeIcon}>
              ▥
            </Text>
          </View>

        </View>


        {/* Scanner frame */}

        <View style={styles.frame}>

          <View style={styles.cornerTL} />
          <View style={styles.cornerTR} />
          <View style={styles.cornerBL} />
          <View style={styles.cornerBR} />

          <View style={styles.scanCircle}>
            <Text style={styles.bigBarcode}>
              ▥
            </Text>
          </View>

        </View>


        {/* Instruction */}

        <View style={styles.instruction}>
          <Text style={styles.instructionText}>
            Align the barcode within the frame
          </Text>
        </View>


        {/* Loading */}

        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator
              size="large"
              color="#FFFFFF"
            />

            <Text style={styles.loadingText}>
              Looking up product...
            </Text>
          </View>
        )}

      </View>

    </View>
  );
}


const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    paddingTop: 48,
  },


  /* HEADER */

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },

  menuButton: {
    width: 44,
    height: 44,
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginRight: 6,
  },

  menuIcon: {
    fontSize: 30,
    fontWeight: '700',
    color: colors.text,
  },

  logo: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.text,
  },


  /* MENU */

  menu: {
    position: 'absolute',
    top: 92,
    left: spacing.lg,

    width: 180,

    backgroundColor: colors.surface,
    borderRadius: radius.md,

    paddingVertical: spacing.sm,

    elevation: 10,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 10,

    zIndex: 100,
  },

  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',

    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },

  menuIconSmall: {
    fontSize: 22,
    width: 30,
    color: colors.text,
  },

  menuText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },


  /* DASHBOARD */

  dashboardTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    marginTop: spacing.md,
  },

  subtitle: {
    fontSize: 16,
    color: colors.textMuted,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },


  /* STATS */

  statCard: {
    height: 150,

    backgroundColor: colors.surface,

    borderRadius: 24,

    padding: spacing.lg,

    justifyContent: 'center',

    marginBottom: spacing.lg,
  },

  statNumber: {
    fontSize: 48,
    fontWeight: '800',
    color: colors.text,
  },

  statLabel: {
    fontSize: 16,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },


  /* SCANNER */

  scannerCard: {
    height: 500,

    borderRadius: 28,

    overflow: 'hidden',

    backgroundColor: '#000',
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },

  scannerHeader: {
    position: 'absolute',

    top: spacing.lg,
    left: spacing.lg,
    right: spacing.lg,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    zIndex: 5,
  },

  scannerTitle: {
    color: '#FFFFFF',
    fontSize: 21,
    fontWeight: '800',
  },

  scannerSubtitle: {
    color: '#FFFFFF',
    fontSize: 13,
    marginTop: 4,
    opacity: 0.9,
  },

  barcodeCircle: {
    width: 58,
    height: 58,

    borderRadius: 29,

    backgroundColor: 'rgba(0,0,0,0.6)',

    alignItems: 'center',
    justifyContent: 'center',

    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
  },

  barcodeIcon: {
    color: '#FFFFFF',
    fontSize: 28,
  },


  /* FRAME */

  frame: {
    position: 'absolute',

    top: 150,
    left: 28,
    right: 28,

    height: 190,

    alignItems: 'center',
    justifyContent: 'center',
  },

  cornerTL: {
    position: 'absolute',
    top: 0,
    left: 0,

    width: 48,
    height: 48,

    borderTopWidth: 5,
    borderLeftWidth: 5,

    borderColor: '#FFFFFF',
    borderTopLeftRadius: 18,
  },

  cornerTR: {
    position: 'absolute',
    top: 0,
    right: 0,

    width: 48,
    height: 48,

    borderTopWidth: 5,
    borderRightWidth: 5,

    borderColor: '#FFFFFF',
    borderTopRightRadius: 18,
  },

  cornerBL: {
    position: 'absolute',
    bottom: 0,
    left: 0,

    width: 48,
    height: 48,

    borderBottomWidth: 5,
    borderLeftWidth: 5,

    borderColor: '#FFFFFF',
    borderBottomLeftRadius: 18,
  },

  cornerBR: {
    position: 'absolute',
    bottom: 0,
    right: 0,

    width: 48,
    height: 48,

    borderBottomWidth: 5,
    borderRightWidth: 5,

    borderColor: '#FFFFFF',
    borderBottomRightRadius: 18,
  },


  scanCircle: {
    width: 110,
    height: 110,

    borderRadius: 55,

    borderWidth: 3,
    borderColor: '#FFFFFF',

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor: 'rgba(0,0,0,0.15)',
  },

  bigBarcode: {
    color: '#FFFFFF',
    fontSize: 50,
  },


  /* INSTRUCTION */

  instruction: {
    position: 'absolute',

    bottom: 20,
    left: 20,
    right: 20,

    alignItems: 'center',
  },

  instructionText: {
    color: '#FFFFFF',

    backgroundColor: 'rgba(0,0,0,0.65)',

    paddingHorizontal: 18,
    paddingVertical: 10,

    borderRadius: 20,

    fontSize: 14,
  },


  /* LOADING */

  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,

    backgroundColor: 'rgba(0,0,0,0.6)',

    alignItems: 'center',
    justifyContent: 'center',

    zIndex: 20,
  },

  loadingText: {
    color: '#FFFFFF',
    marginTop: spacing.md,
    fontSize: 15,
  },


  /* PERMISSION */

  center: {
    flex: 1,

    alignItems: 'center',
    justifyContent: 'center',

    padding: spacing.xl,

    backgroundColor: colors.background,
  },

  permissionTitle: {
    ...typography.h2,

    color: colors.text,

    marginBottom: spacing.sm,

    textAlign: 'center',
  },

  permissionText: {
    ...typography.body,

    color: colors.textMuted,

    textAlign: 'center',

    marginBottom: spacing.lg,
  },

  permissionButton: {
    backgroundColor: colors.primary,

    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,

    borderRadius: radius.pill,
  },

  permissionButtonText: {
    color: '#FFFFFF',

    fontWeight: '700',

    fontSize: 15,
  },

});