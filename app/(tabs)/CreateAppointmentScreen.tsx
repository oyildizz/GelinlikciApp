import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import type { WebView as WebViewType } from 'react-native-webview';

export default function CreateAppointmentScreen() {
  const webViewRef = useRef<WebViewType>(null);
  const route = useRoute();
  const routeParams = route.params as { goToUrl?: string } | undefined;

  const [hasError, setHasError] = useState(false);
  const [webViewKey, setWebViewKey] = useState(0);

  useFocusEffect(() => {
    if (routeParams?.goToUrl && webViewRef.current) {
      webViewRef.current.injectJavaScript(`
        window.location.href = '${routeParams.goToUrl}';
        true;
      `);
    }
  });

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
          source={{ uri: 'https://angelhousewedding.com/randevu-al' }}
          style={{ flex: 1 }}
          sharedCookiesEnabled={true}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          cacheEnabled={true}
          originWhitelist={['*']}
          startInLoadingState={true}
          onError={() => setHasError(true)}
          renderError={() => <View />}
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
}

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
