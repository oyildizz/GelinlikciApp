import React, { useRef } from 'react';
import { WebView } from 'react-native-webview';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import type { WebView as WebViewType } from 'react-native-webview';

export default function CreateAppointmentScreen() {
  const webViewRef = useRef<WebViewType>(null);
  const route = useRoute();
  const routeParams = route.params as { goToUrl?: string } | undefined;

  useFocusEffect(() => {
    if (routeParams?.goToUrl && webViewRef.current) {
      webViewRef.current.injectJavaScript(`
        window.location.href = '${routeParams.goToUrl}';
        true;
      `);
    }
  });

  return (
    <WebView
      ref={webViewRef}
      source={{ uri: 'https://angelhousewedding.com/' }}
      style={{ flex: 1 }}
      sharedCookiesEnabled={true}
      javaScriptEnabled={true}
      domStorageEnabled={true}
      cacheEnabled={true}
      originWhitelist={['*']}
      startInLoadingState={true}
    />
  );
}
