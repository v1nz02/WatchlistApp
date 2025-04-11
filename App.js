import React, { useState, useEffect } from "react";
import { WatchlistProvider } from "./src/context/WatchlistContext";
import HomeScreen from "./src/screens/HomeScreen";
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { View, Text } from 'react-native';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

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
    <WatchlistProvider>
      <HomeScreen />
    </WatchlistProvider>
  );
}
