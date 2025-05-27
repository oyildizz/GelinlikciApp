import React, { useEffect, useState, useCallback } from 'react';
import { WebView } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRoute } from '@react-navigation/native';

const AccountScreen = () => {
  const [userToken, setUserToken] = useState<string | null>(null);
  const [key, setKey] = useState(0);
  const route = useRoute();
  const routeParams = route.params as { refresh?: number } | undefined;

  const loadToken = async () => {
    const token = await AsyncStorage.getItem('userToken');
    setUserToken(token);
  };

  useEffect(() => {
    loadToken();
  }, []);

  useFocusEffect(
    useCallback(() => {
      setKey(prev => prev + 1);
    }, [routeParams?.refresh])
  );

  return (
    <WebView
      key={key}
      source={{
        uri: userToken
          ? 'https://angelhousewedding.com/hesabim'
          : 'https://angelhousewedding.com/uye-girisi/',
      }}
      style={{ flex: 1 }}
      sharedCookiesEnabled={true}
      javaScriptEnabled={true}
      domStorageEnabled={true}
      cacheMode="LOAD_NO_CACHE"
    />
  );
};

export default AccountScreen;
