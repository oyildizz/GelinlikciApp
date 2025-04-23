import React, { useRef,useEffect, useState, useCallback } from 'react';
import { StyleSheet, View, BackHandler } from 'react-native';
import { WebView } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HomeScreen() {
  const [userToken, setUserToken] = useState<string | null>(null);

  const webViewRef = useRef<WebView>(null);
  const [canGoBack, setCanGoBack] = useState(false);

  const handleBackPress = useCallback(() => {
    if (canGoBack && webViewRef.current) {
      webViewRef.current.goBack();
      return true;
    }
    return false;
  }, [canGoBack]);


  useEffect(() => {
    const loadToken = async () => {
      const token = await AsyncStorage.getItem('userToken'); // Kullanıcı tokenini yükle
      if (token) {
        setUserToken(token);
      }
    };
    loadToken();
  }, []);

  React.useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', handleBackPress);
    return () => BackHandler.removeEventListener('hardwareBackPress', handleBackPress);
  }, [handleBackPress]);

  return (
    <View style={styles.container}>
      <WebView
         source={{ uri: userToken ? `https://angelhousewedding.com/?token=${userToken}` : 'https://angelhousewedding.com/' }} 
         style={{ flex: 1 }}
         sharedCookiesEnabled={true} // Çerezleri koru (oturumu açık tutar)
         javaScriptEnabled={true} // JavaScript aktif
         domStorageEnabled={true} // Tarayıcı depolaması açık
         cacheMode="LOAD_NO_CACHE" // Sayfanın en güncel halini yükle

      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
