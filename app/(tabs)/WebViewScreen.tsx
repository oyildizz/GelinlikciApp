// WebViewScreen.tsx
import React from 'react';
import { WebView } from 'react-native-webview';
import { useRoute } from '@react-navigation/native';

export default function WebViewScreen() {
  const route = useRoute();
  const { url } = route.params as { url: string };

  return (
    <WebView
      source={{ uri: url }}
      style={{ flex: 1 }}
      sharedCookiesEnabled
      javaScriptEnabled
    />
  );
}
