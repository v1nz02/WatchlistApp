import React from "react";
import { WatchlistProvider } from "./src/context/WatchlistContext";
import HomeScreen from "./src/screens/HomeScreen";

export default function App() {
  return (
    <WatchlistProvider>
      <HomeScreen />
    </WatchlistProvider>
  );
}
