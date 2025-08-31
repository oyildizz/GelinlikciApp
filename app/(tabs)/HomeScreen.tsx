// HomeScreen.tsx (Düzeltilmiş JSON tabanlı promosyon sistemi)
import React, { useRef, useState, useCallback, useEffect } from 'react';
import { WebView } from 'react-native-webview';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import { View, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import type { WebView as WebViewType } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';

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
    
    // Development için - test etmek istiyorsanız aşağıdaki satırı uncomment edin
    // SimplePromoCodeService.clearAllData();
  }, []);

  useEffect(() => {
    console.log("Modal visible state:", showPromoModal);
  }, [showPromoModal]);

  const checkFirstTime = async () => {
    try {
      // SADECE TESTİNG İÇİN - production'da kaldırın!
      // await AsyncStorage.clear();

      console.log('İlk açılış kontrolü başlıyor...');
      
      // Modal daha önce gösterilmiş mi kontrol et
      const hasSeenPromo = await AsyncStorage.getItem('has_seen_promo_modal');
      console.log('hasSeenPromo:', hasSeenPromo);
      
      if (hasSeenPromo) {
        console.log('Modal daha önce gösterilmiş, atlanıyor...');
        return;
      }

      // Bu cihaz daha önce kod almış mı kontrol et
      const hasDeviceReceivedCode = await SimplePromoCodeService.hasDeviceReceivedCode();
      console.log('hasDeviceReceivedCode:', hasDeviceReceivedCode);
      
      if (hasDeviceReceivedCode) {
        console.log('Bu cihaz daha önce kod almış, modal gösterilmiyor...');
        // Modal gösterildi olarak işaretle (çünkü bu cihaz zaten kod almış)
        await AsyncStorage.setItem('has_seen_promo_modal', 'true');
        return;
      }

      // İstatistikleri kontrol et
      const stats = await SimplePromoCodeService.getStats();
      console.log('Stats:', stats);
      console.log('Kalan kota:', stats.remainingQuota);
      console.log('Kullanılan kodlar:', stats.usedCodes);

      if (stats.remainingQuota > 0) {
        // İlk 100 kişi kotası dolmamış, modal göster
        console.log("Modal gösterilecek...");
        setTimeout(() => {
          console.log("Modal açılıyor...");
          setShowPromoModal(true);
        }, 2000); // 2 saniye bekle
      } else {
        // İlk 100 kişi kotası dolmuş
        console.log('İlk 100 kişi kotası dolmuş!');
        setTimeout(() => {
          Alert.alert(
            'Kampanya Sona Erdi',
            'İlk 100 kişiye özel promosyon kodu kampanyamız sona ermiştir. Yeni kampanyalarımızdan haberdar olmak için bizi takip edin!',
            [{ text: 'Tamam' }]
          );
        }, 2000);
        
        // Modal gösterildi olarak işaretle
        await AsyncStorage.setItem('has_seen_promo_modal', 'true');
      }
    } catch (error) {
      console.error('İlk açılış kontrolü hatası:', error);
    } finally {
      setIsPromoCheckComplete(true);
    }
  };

  const handleClosePromoModal = async () => {
    try {
      console.log('Modal kapatılıyor...');
      setShowPromoModal(false);
      // Modal gösterildi olarak işaretle
      await AsyncStorage.setItem('has_seen_promo_modal', 'true');
      console.log('Modal durumu kaydedildi');
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
    <SafeAreaView style={styles.container} edges={['top']}>
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

      {/* Promosyon Kodu Modal - Sadece kontrol tamamlandıktan sonra göster */}
      {isPromoCheckComplete && (
        <SimplePromoCodeModal
          visible={showPromoModal}
          onClose={handleClosePromoModal}
        />
      )}
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