import React, { useState, useEffect } from "react";
import { WatchlistProvider } from "./src/context/WatchlistContext";
import HomeScreen from "./src/screens/HomeScreen";
import WatchedScreen from "./src/screens/WatchedScreen";
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { View, Text, StatusBar } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

const Stack = createNativeStackNavigator();

// Tema personalizzato per NavigationContainer - usa DefaultTheme come base
const navigationTheme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    primary: '#E50914',
    background: '#121212',
    card: '#121212',
    text: '#ffffff',
    border: '#333333',
    notification: '#E50914',
  },
};

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Pre-load fonts
        await Font.loadAsync({
          'Caveat': require('./assets/fonts/Caveat-Regular.ttf'),
          'Caveat-Bold': require('./assets/fonts/Caveat-Bold.ttf'),
          'Caveat-Medium': require('./assets/fonts/Caveat-Medium.ttf'),
          'Caveat-SemiBold': require('./assets/fonts/Caveat-SemiBold.ttf'),
          'Caveat-Variable': require('./assets/fonts/Caveat-VariableFont_wght.ttf'),
        });
      } catch (e) {
        console.warn(e);
      } finally {
        // Tell the application to render
        setAppIsReady(true);
        await SplashScreen.hideAsync();
      }
    }

    prepare();
  }, []);

  if (!appIsReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: "#121212" }}>
        <Text style={{ color: "#E50914" }}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#121212" }}>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />
      <WatchlistProvider>
        <NavigationContainer theme={navigationTheme}>
          <Stack.Navigator
            initialRouteName="Home"
            screenOptions={{
              headerShown: false,
              animation: 'fade',
              contentStyle: { backgroundColor: '#121212' },
              gestureEnabled: true,
              gestureDirection: 'horizontal',
              animationDuration: 200,
              // Prevent flashing during transitions
              presentation: 'card',
              detachPreviousScreen: false
            }}
          >
            <Stack.Screen 
              name="Home" 
              component={HomeScreen}
              options={{
                animationEnabled: true
              }}
            />
            <Stack.Screen 
              name="Watched" 
              component={WatchedScreen}
              options={{
                animationEnabled: true,
                contentStyle: { backgroundColor: '#121212' }
              }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </WatchlistProvider>
    </View>
  );
}
