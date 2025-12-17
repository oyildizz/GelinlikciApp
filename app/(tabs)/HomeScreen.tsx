
// HomeScreen.tsx (Düzeltilmiş JSON tabanlı promosyon sistemi)
import React, { useRef, useState, useCallback, useEffect } from 'react';
import { WebView } from 'react-native-webview';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import { View, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import type { WebView as WebViewType } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';

import SimplePromoCodeModal from '../../app/(tabs)/NewYearPromoCodeModal';
import SimplePromoCodeService from '../utils/SimplePromoCodeService';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const webViewRef = useRef<WebViewType>(null);
  const route = useRoute();
  const routeParams = route.params as { goToUrl?: string } | undefined;
  const [isLoading, setIsLoading] = useState(true);
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [isPromoCheckComplete, setIsPromoCheckComplete] = useState(false);

  const handleLoadStart = useCallback(() => {
    setIsLoading(true);
  }, []);

  const handleLoadEnd = useCallback(() => {
    setIsLoading(false);
  }, []);

  // Her uygulama açılışında modal kontrolü
  useEffect(() => {
    checkPromoCode();
  }, []);

  useEffect(() => {
    console.log("Modal visible state:", showPromoModal);
  }, [showPromoModal]);

  const checkPromoCode = async () => {
    try {
      console.log('Promosyon kodu kontrolü başlıyor...');
      
      // Kullanıcının kodu var mı kontrol et
      const userPromo = await SimplePromoCodeService.getUserPromoCode();
      
      if (userPromo) {
        // Kullanıcının kodu var, modal'ı göster
        console.log('Kullanıcının kodu mevcut:', userPromo.code);
        setTimeout(() => {
          console.log("Modal açılıyor (mevcut kod)...");
          setShowPromoModal(true);
        }, 1500); // 1.5 saniye bekle
      } else {
        // Kullanıcının kodu yok, kampanya hala aktif mi kontrol et
        const stats = await SimplePromoCodeService.getStats();
        console.log('Stats:', stats);
        console.log('Kalan kota:', stats.remainingQuota);

        if (stats.remainingQuota > 0) {
          // İlk 100 kişi kotası dolmamış, modal göster
          console.log("Modal gösterilecek (yeni kullanıcı)...");
          setTimeout(() => {
            console.log("Modal açılıyor...");
            setShowPromoModal(true);
          }, 1500);
        } else {
          // Kampanya bitmiş
          console.log('Kampanya sona ermiş');
        }
      }
    } catch (error) {
      console.error('Promosyon kodu kontrolü hatası:', error);
    } finally {
      setIsPromoCheckComplete(true);
    }
  };

  const handleClosePromoModal = async () => {
    try {
      console.log('Modal kapatılıyor...');
      setShowPromoModal(false);
    } catch (error) {
      console.error('Modal kapatma hatası:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (routeParams?.goToUrl && webViewRef.current) {
        webViewRef.current.injectJavaScript(`
          window.location.href = '${routeParams.goToUrl}';
          true;
        `);
      }
    }, [routeParams?.goToUrl])
  );

  return (
     <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['top', 'bottom']}>
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ uri: 'https://angelhousewedding.com/' }}
        style={styles.webview}
        sharedCookiesEnabled={true}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        cacheEnabled={true}
        startInLoadingState={false}
        onLoadStart={handleLoadStart}
        onLoadEnd={handleLoadEnd}
      />
      
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#104438" />
        </View>
      )}

      {/* Promosyon Kodu Modal - Her açılışta göster */}
      {isPromoCheckComplete && (
        <SimplePromoCodeModal
          visible={showPromoModal}
          onClose={handleClosePromoModal}
        />
      )}
    </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#104438',
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 68, 56, 0.8)',
  },
});




