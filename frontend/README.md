# ScanBite App (React Native / Expo)

Scans a product barcode, calls the ScanBite backend, and shows the
environmental score.

## Setup

```bash
npm install
```

Before running, set your backend's LAN IP in `src/config/api.js` —
`localhost` won't resolve to your dev machine from a phone or emulator.
Find your IP with `ip addr` (Linux) and make sure your backend's `PORT`
(5000) is reachable on your network (same wifi as your phone).

```bash
npx expo start
```

Scan the QR code with the Expo Go app on your phone (install from the
App Store / Play Store), or press `a` for Android emulator / `i` for iOS
simulator.

## Structure

```
App.js                      entry point
src/
  config/api.js              backend base URL - EDIT THIS FIRST
  api/client.js               axios calls to backend
  navigation/AppNavigator.js  stack navigation
  screens/
    ScanScreen.js              camera + barcode detection
    ResultScreen.js             product + eco score display
    SearchScreen.js             search cached products
    HistoryScreen.js            past scans
    DashboardScreen.js          aggregate stats
  components/
    EcoScoreBadge.js            grade badge (A-E, color coded)
    ProductCard.js               list item for search/history
```

## Notes

- Barcode detection uses `expo-camera`'s built-in scanner (SDK 51+, ML
  Kit under the hood on Android, AVFoundation on iOS) - no custom native
  build required, works in Expo Go.
- `ScanScreen` locks after a successful scan for 1.5s to avoid firing
  duplicate requests while the camera keeps re-detecting the same
  barcode every frame during the API round trip.
- Navigation is a single stack for now (Scan is the entry point). Once
  Search/History/Dashboard have enough content to warrant persistent
  access, swap to a bottom tab navigator.
- No auth wired in yet - matches the backend's current state.
