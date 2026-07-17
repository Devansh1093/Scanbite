// Your phone (or emulator) can't reach "localhost" - that resolves to the
// phone itself, not your dev machine. Use your machine's LAN IP instead.
//
// Find it with:
//   Linux/Mac: ifconfig | grep "inet "  (or `ip addr`)
//   Windows:   ipconfig
//
// Android emulator (not physical device) can alternatively use 10.0.2.2,
// which is a special alias to the host machine's localhost.

export const API_BASE_URL = 'http://192.168.29.194:5000/api';
