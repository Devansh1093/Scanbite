import { View, TouchableOpacity, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import ScanScreen from '../screens/ScanScreen';
import ResultScreen from '../screens/ResultScreen';
import SearchScreen from '../screens/SearchScreen';
import HistoryScreen from '../screens/HistoryScreen';
import DashboardScreen from '../screens/DashboardScreen';

const Stack = createNativeStackNavigator();

// Header buttons on the Scan screen - the only entry point into
// Search/History/Dashboard right now. A bottom tab navigator is the
// natural next step once these screens have enough real content to
// warrant persistent access from anywhere in the app.
function ScanHeaderLinks({ navigation }) {
  return (
    <View style={{ flexDirection: 'row', gap: 16 }}>
      <TouchableOpacity onPress={() => navigation.navigate('Search')}>
        <Text style={{ fontSize: 13, color: '#1D9E75', fontWeight: '600' }}>Search</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('History')}>
        <Text style={{ fontSize: 13, color: '#1D9E75', fontWeight: '600' }}>History</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Dashboard')}>
        <Text style={{ fontSize: 13, color: '#1D9E75', fontWeight: '600' }}>Stats</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Scan">
        <Stack.Screen
          name="Scan"
          component={ScanScreen}
          options={({ navigation }) => ({
            title: 'ScanBite',
            headerRight: () => <ScanHeaderLinks navigation={navigation} />,
          })}
        />
        <Stack.Screen name="Result" component={ResultScreen} options={{ title: 'Product' }} />
        <Stack.Screen name="Search" component={SearchScreen} options={{ title: 'Search' }} />
        <Stack.Screen name="History" component={HistoryScreen} options={{ title: 'History' }} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Dashboard' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
