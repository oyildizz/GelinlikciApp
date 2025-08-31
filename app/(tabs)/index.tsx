import React, { useRef, useEffect, useState, useCallback } from "react";
import { StyleSheet, View, BackHandler } from "react-native";
import { WebView } from "react-native-webview";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from 'react-native-safe-area-context';

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
      const token = await AsyncStorage.getItem("userToken"); // Kullanıcı tokenini yükle
      if (token) {
        setUserToken(token);
      }
    };
    loadToken();
  }, []);

  React.useEffect(() => {
    BackHandler.addEventListener("hardwareBackPress", handleBackPress);
    return () => BackHandler.removeEventListener("hardwareBackPress", handleBackPress);
  }, [handleBackPress]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <WebView
        source={{
          uri: userToken
            ? `https://angelhousewedding.com/?token=${userToken}`
            : "https://angelhousewedding.com/",
        }}
        style={{ flex: 1 }}
        sharedCookiesEnabled={false} 
        javaScriptEnabled={true} // JavaScript aktif
        domStorageEnabled={false} // Tarayıcı depolaması açık
        cacheMode="LOAD_NO_CACHE" // Sayfanın en güncel halini yükle
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
