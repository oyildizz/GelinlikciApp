import React, { useEffect, useRef, useState } from 'react';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import type { WebView as WebViewType } from 'react-native-webview';
import { useAuth } from '../context/AuthContext';

const AccountScreen = () => {
  const [userToken, setUserToken] = useState<string | null>(null);
  const webViewRef = useRef<WebViewType>(null);
  const route = useRoute();
  const { login } = useAuth();

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

  const handleMessage = async (event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data?.type === 'login' && data?.user) {
        await AsyncStorage.setItem('userToken', JSON.stringify(data.user));
        login(data.user); // AuthContext güncelle
        setUserToken(JSON.stringify(data.user));
      }
    } catch (error) {
      console.warn('WebView message parse error:', error);
    }
  };

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
      onMessage={handleMessage}
    />
  );
};

export default AccountScreen;
