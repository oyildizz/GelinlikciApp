// WebViewScreen.tsx
import React from 'react';
import { WebView } from 'react-native-webview';
import { useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function WebViewScreen() {
  const route = useRoute();
  const { url } = route.params as { url: string };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <WebView
        source={{ uri: url }}
        style={{ flex: 1 }}
        sharedCookiesEnabled={false}
        thirdPartyCookiesEnabled={false}
        domStorageEnabled={false}
        javaScriptEnabled
      />
    </SafeAreaView>
  );
}
