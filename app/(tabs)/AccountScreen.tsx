import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
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

  const [hasError, setHasError] = useState(false);
  const [webViewKey, setWebViewKey] = useState(0);

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

  const retry = () => {
    setHasError(false);
    setWebViewKey((prev) => prev + 1);
  };

  return (
    <>
      {!hasError && (
        <WebView
          key={webViewKey}
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
          onError={() => setHasError(true)}
          renderError={() => <View />} // sistem hatasını gizle
          renderLoading={() => (
            <View style={styles.loading}>
              <ActivityIndicator size="large" color="#5897a3" />
            </View>
          )}
        />
      )}

      <Modal visible={hasError} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalText}>
              İnternet bağlantınızı kontrol edin ve tekrar deneyin.
            </Text>
            <TouchableOpacity onPress={retry} style={styles.retryButton}>
              <Text style={styles.retryButtonText}>Tekrar Dene</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#555',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    elevation: 5,
  },
  modalText: {
    fontSize: 16,
    color: '#000',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#5897a3',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AccountScreen;
