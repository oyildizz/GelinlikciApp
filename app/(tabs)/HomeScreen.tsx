// HomeScreen.tsx (Basit JSON tabanlı promosyon sistemi)
import React, { useRef, useState, useCallback, useEffect } from 'react';
import { WebView } from 'react-native-webview';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import { View, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import type { WebView as WebViewType } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';

import SimplePromoCodeModal from '../../app/(tabs)/SimplePromoCodeModal';
import SimplePromoCodeService from '../utils/SimplePromoCodeService';

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

  // İlk açılış kontrolü
  useEffect(() => {
    checkFirstTime();
    
    // Development için - eğer test etmek istiyorsanız
    // SimplePromoCodeService.clearAllData(); // Bu satırı uncomment edin
  }, []);
useEffect(() => {
  console.log("Modal visible state:", showPromoModal);
}, [showPromoModal]);

  const checkFirstTime = async () => {
    try {
      await AsyncStorage.clear();

      const hasSeenPromo = await AsyncStorage.getItem('has_seen_promo_modal');
      console.log('hasSeenPromo:', hasSeenPromo);
      if (!hasSeenPromo) {
        // İlk kez açılıyor, mevcut kod var mı kontrol et
        const stats = await SimplePromoCodeService.getStats();
        console.log('Stats:', stats);
        console.log("Kalan kod:", stats.availableCodes);


        if (stats.availableCodes > 0) {
          // Kodlar mevcut, modal göster
          setTimeout(() => {
            console.log("Modal açılıyor...");
            setShowPromoModal(true);
          }, 2000);
        } else {
          // Kodlar tükendi
          console.log('Tüm promosyon kodları tükendi');
          setTimeout(() => {
            Alert.alert(
              'Bilgilendirme',
              'Promosyon kodları tükendi. Yeni kampanyalarımızdan haberdar olmak için bizi takip edin!',
              [{ text: 'Tamam' }]
            );
          }, 2000);
        }
      }
    } catch (error) {
      console.error('İlk açılış kontrolü hatası:', error);
    }
     finally {
    setIsPromoCheckComplete(true); // kontrol tamamlandı
  }
  };

  const handleClosePromoModal = async () => {
    try {
      setShowPromoModal(false);
      // Modal gösterildi olarak işaretle
      await AsyncStorage.setItem('has_seen_promo_modal', 'true');
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

      {/* Basit Promosyon Kodu Modal */}
     {isPromoCheckComplete && (
  <SimplePromoCodeModal
    visible={showPromoModal}
    onClose={handleClosePromoModal}
  />
)}
    </View>
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