import React from 'react';
import { WebView } from 'react-native-webview';

export default function HomeScreen() {
  return (
    <WebView
      source={{ uri: 'https://angelhousewedding.com/' }}
      style={{ flex: 1 }}
      sharedCookiesEnabled={true}
      javaScriptEnabled={true}
      domStorageEnabled={true}
      cacheMode="LOAD_NO_CACHE"
    />
  );
}
