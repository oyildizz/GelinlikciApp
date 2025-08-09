// components/SimplePromoCodeModal.tsx - Düzeltilmiş versiyon
import React, { useState, useRef, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  ActivityIndicator,
  Alert,
  Clipboard,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import SimplePromoCodeService from '../utils/SimplePromoCodeService';

interface SimplePromoCodeModalProps {
  visible: boolean;
  onClose: () => void;
}

const { width, height } = Dimensions.get('window');

const SimplePromoCodeModal: React.FC<SimplePromoCodeModalProps> = ({ visible, onClose }) => {
  const [promoCode, setPromoCode] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [showCode, setShowCode] = useState<boolean>(false);
  const [remainingQuota, setRemainingQuota] = useState<number>(100);
  const [error, setError] = useState<string>('');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (visible) {
      setError(''); // Hataları sıfırla
      assignPromoCode();
      loadStats();
      
      // Modal açılış animasyonu
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Modal kapatılırken state'leri sıfırla
      setPromoCode('');
      setShowCode(false);
      setLoading(false);
      setError('');
    }
  }, [visible]);

  const loadStats = async () => {
    try {
      const stats = await SimplePromoCodeService.getStats();
      setRemainingQuota(stats.remainingQuota);
      console.log('Modal Stats loaded:', stats);
    } catch (error) {
      console.error('İstatistik yükleme hatası:', error);
    }
  };

  const assignPromoCode = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('Promosyon kodu atanıyor...');
      
      // Önce mevcut kodu kontrol et
      let assignedCode = await SimplePromoCodeService.getUserPromoCode();
      
      if (assignedCode) {
        // Mevcut kod var
        console.log('Mevcut kod bulundu:', assignedCode.code);
        setPromoCode(assignedCode.code);
        setShowCode(true);
      } else {
        // Yeni kod ata
        console.log('Yeni kod atanıyor...');
        assignedCode = await SimplePromoCodeService.assignPromoCode();
        
        if (assignedCode) {
          console.log('Yeni kod atandı:', assignedCode.code);
          setPromoCode(assignedCode.code);
          setShowCode(true);
          await loadStats(); // İstatistikleri güncelle
        } else {
          // Kod atanamadı
          console.warn('Kod atanamadı!');
          setError('Kampanya sona erdi');
          
          // Hata durumunda modal'ı otomatik kapat
          setTimeout(() => {
            Alert.alert(
              'Kampanya Sona Erdi',
              'İlk 100 kişiye özel promosyon kodu kampanyamız sona ermiştir. Yeni kampanyalarımızdan haberdar olmak için bizi takip edin!',
              [
                {
                  text: 'Tamam',
                  onPress: handleClose
                }
              ]
            );
          }, 1000);
        }
      }
    } catch (error) {
      console.error('Promosyon kodu atama hatası:', error);
      setError('Kod alınırken hata oluştu');
      Alert.alert('Hata', 'Promosyon kodu alınırken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await Clipboard.setString(promoCode);
      Alert.alert('✅ Kopyalandı!', 'Promosyon kodu panoya kopyalandı.');
    } catch (error) {
      console.error('Kopyalama hatası:', error);
      Alert.alert('Hata', 'Kopyalama işlemi başarısız oldu.');
    }
  };

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleClose}
    >
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <Animated.View
          style={[
            styles.modalContainer,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Kapat butonu */}
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Feather name="x" size={24} color="#666" />
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.welcomeText}>Hoş Geldiniz! 💍</Text>
            <Text style={styles.subtitle}>
              Size özel bir hediyemiz var!
            </Text>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <View style={styles.giftIcon}>
              <Text style={styles.giftEmoji}>🎁</Text>
            </View>

            <Text style={styles.description}>
              İlk randevunuzda{' '}
              <Text style={styles.highlight}>%10 indirim</Text>
              {'\n'}kazanmak için bu kodu kullanın:
            </Text>

            {/* Promo Code Display */}
            <View style={styles.promoCodeContainer}>
              {loading ? (
                <>
                  <ActivityIndicator size="large" color="#104438" />
                  <Text style={styles.loadingText}>Kodunuz hazırlanıyor...</Text>
                </>
              ) : error ? (
                <View style={styles.errorContainer}>
                  <Feather name="alert-circle" size={30} color="#e74c3c" />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : showCode ? (
                <>
                  <Text style={styles.promoCode}>{promoCode}</Text>
                  <TouchableOpacity
                    style={styles.copyButton}
                    onPress={copyToClipboard}
                  >
                    <Feather name="copy" size={20} color="#104438" />
                    <Text style={styles.copyText}>Kopyala</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <Text style={styles.noCodeText}>Kod hazırlanıyor...</Text>
              )}
            </View>

            {/* Available codes info - Sadece başarılı durumlarda göster */}
            {showCode && remainingQuota > 0 && (
              <View style={styles.availableInfo}>
                <Text style={styles.availableText}>
                  🔥 İlk 100 kişiden birisisiniz! Kalan: {remainingQuota - 1}
                </Text>
              </View>
            )}

            {/* Success Info - Sadece kod başarıyla alındığında göster */}
            {showCode && !error && (
              <View style={styles.infoBox}>
                <Feather name="info" size={16} color="#666" />
                <Text style={styles.infoText}>
                  Bu kod sadece sizin için ayrılmıştır ve tek kullanımlıktır. 
                  Randevu sırasında görevlilerimize bu kodu gösterebilirsiniz.
                </Text>
              </View>
            )}

            {/* Error durumunda bilgi gösterme */}
            {error && (
              <View style={styles.errorInfoBox}>
                <Feather name="info" size={16} color="#e74c3c" />
                <Text style={styles.errorInfoText}>
                  İlk 100 kişiye özel kampanyamız sona ermiştir. 
                  Yeni kampanyalarımızı kaçırmamak için bizi takip edin!
                </Text>
              </View>
            )}
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    width: Math.min(width * 0.9, 400),
    maxHeight: height * 0.82,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    zIndex: 1,
    padding: 5,
  },
  header: {
    alignItems: 'center',
    paddingTop: 30,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#104438',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 5,
  },
  content: {
    padding: 20,
    alignItems: 'center',
  },
  giftIcon: {
    marginBottom: 20,
  },
  giftEmoji: {
    fontSize: 60,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    color: '#333',
    marginBottom: 25,
    lineHeight: 24,
  },
  highlight: {
    color: '#104438',
    fontWeight: 'bold',
    fontSize: 18,
  },
  promoCodeContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    minHeight: 100,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#104438',
    borderStyle: 'dashed',
    width: '100%',
  },
  promoCode: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#104438',
    letterSpacing: 3,
    marginBottom: 10,
    textAlign: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
    marginTop: 10,
    textAlign: 'center',
  },
  noCodeText: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
  },
  errorContainer: {
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#e74c3c',
    fontWeight: '600',
    marginTop: 10,
    textAlign: 'center',
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e8',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  copyText: {
    marginLeft: 5,
    color: '#104438',
    fontWeight: '600',
  },
  availableInfo: {
    backgroundColor: '#fff3cd',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginBottom: 15,
  },
  availableText: {
    color: '#856404',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#f0f8ff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 25,
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  errorInfoBox: {
    flexDirection: 'row',
    backgroundColor: '#ffeaea',
    padding: 15,
    borderRadius: 10,
    marginBottom: 25,
    alignItems: 'flex-start',
  },
  errorInfoText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: '#c0392b',
    lineHeight: 20,
  },
});

export default SimplePromoCodeModal;