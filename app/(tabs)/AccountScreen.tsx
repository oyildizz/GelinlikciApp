import React, { useEffect, useRef, useState } from 'react';
import { WebView } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import type { WebView as WebViewType } from 'react-native-webview';

const AccountScreen = () => {
  const [userToken, setUserToken] = useState<string | null>(null);
  const webViewRef = useRef<WebViewType>(null);
  const route = useRoute();
  const routeParams = route.params as { goToUrl?: string } | undefined;

  useEffect(() => {
    const loadToken = async () => {
      const token = await AsyncStorage.getItem('userToken');
      setUserToken(token);
    };
    loadToken();
  }, []);

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
      source={{
        uri: userToken
          ? 'https://angelhousewedding.com/hesabim'
          : 'https://angelhousewedding.com/uye-girisi/',
      }}
      style={{ flex: 1 }}
      sharedCookiesEnabled={true}
      javaScriptEnabled={true}
      domStorageEnabled={true}
      cacheEnabled={true}
      originWhitelist={['*']}
      startInLoadingState={true}
    />
  );
};

export default AccountScreen;
