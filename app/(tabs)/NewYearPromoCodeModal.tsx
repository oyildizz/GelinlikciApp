
// components/NewYearPromoCodeModal.tsx - Kurumsal Versiyon
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
  ScrollView,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import SimplePromoCodeService from '../utils/SimplePromoCodeService';

interface NewYearPromoCodeModalProps {
  visible: boolean;
  onClose: () => void;
}

const { width, height } = Dimensions.get('window');

const NewYearPromoCodeModal: React.FC<NewYearPromoCodeModalProps> = ({ visible, onClose }) => {
  const [promoCode, setPromoCode] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [showCode, setShowCode] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (visible) {
      setError('');
      assignPromoCode();
      
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
      setPromoCode('');
      setShowCode(false);
      setLoading(false);
      setError('');
    }
  }, [visible]);

  const assignPromoCode = async () => {
    try {
      setLoading(true);
      setError('');
      
      let assignedCode = await SimplePromoCodeService.getUserPromoCode();
      
      if (assignedCode) {
        setPromoCode(assignedCode.code);
        setShowCode(true);
      } else {
        assignedCode = await SimplePromoCodeService.assignPromoCode();
        
        if (assignedCode) {
          setPromoCode(assignedCode.code);
          setShowCode(true);
        } else {
          setError('Kampanya sona erdi');
          
          setTimeout(() => {
            Alert.alert(
              'Kampanya Sona Erdi',
              'İlk 100 kişiye özel promosyon kampanyamız sona ermiştir.',
              [{ text: 'Tamam', onPress: handleClose }]
            );
          }, 1000);
        }
      }
    } catch (error) {
      console.error('Promosyon kodu atama hatası:', error);
      setError('Kod alınırken hata oluştu');
      Alert.alert('Hata', 'Promosyon kodu alınırken bir hata oluştu.');
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
    <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={handleClose}>
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <Animated.View style={[styles.modalContainer, { transform: [{ scale: scaleAnim }] }]}>
          {/* Kapat butonu */}
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Feather name="x" size={20} color="white" />
          </TouchableOpacity>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* Header */}
            <LinearGradient
              colors={["#104438", "#0a2e24"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.header}
            >
              <View style={styles.campaignBadge}>
                <Text style={styles.campaignText}>Angel House Wedding</Text>
              </View>

              <Text style={styles.headerTitle}>🎄 Yeni Yıl Kampanyası</Text>
              {/* <Text style={styles.headerSubtitle}>İlk 100 kişiye özel</Text> */}
              <View style={styles.accentLine} />
            </LinearGradient>

            {/* Content */}
            <View style={styles.content}>
              {/* Discount Section */}
              <View style={styles.discountSection}>
                <Text style={styles.discountLabel}>İlk randevunuzda</Text>

                <Text style={styles.discountValue}>%10</Text>

                <Text style={styles.discountDescription}>
                  İndirim kazanmak için aşağıdaki{"\n"}promosyon kodunu kullanın
                </Text>
              </View>

              {/* Divider */}
              <View style={styles.divider} />

              {/* Promo Code Box */}
              <LinearGradient
                colors={["#f8f9fa", "#e9ecef"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.promoBox}
              >
                {loading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#104438" />
                    <Text style={styles.loadingText}>Kodunuz hazırlanıyor...</Text>
                  </View>
                ) : error ? (
                  <View style={styles.errorContainer}>
                    <Feather name="alert-circle" size={28} color="#e74c3c" />
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                ) : showCode ? (
                  <>
                    <Text style={styles.promoLabel}>Promosyon Kodu</Text>
                    <Text style={styles.promoCode}>{promoCode}</Text>
                    <TouchableOpacity style={styles.copyButton} onPress={copyToClipboard}>
                      <LinearGradient
                        colors={["#104438", "#0a2e24"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.copyButtonGradient}
                      >
                        <Text style={styles.copyButtonIcon}>📋</Text>
                        <Text style={styles.copyButtonText}>Kodu Kopyala</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </>
                ) : (
                  <Text style={styles.noCodeText}>Kod hazırlanıyor...</Text>
                )}
              </LinearGradient>

              {/* Info Box */}
              {showCode && !error && (
                <LinearGradient
                  colors={["#f0f9ff", "#e0f2fe"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.infoBox}
                >
                  <Text style={styles.infoIcon}>ℹ️</Text>
                  <Text style={styles.infoText}>
                    Bu kod sadece sizin için ayrılmıştır ve tek kullanımlıktır. Randevu sırasında
                    görevlilerimize bu kodu gösterebilirsiniz.
                  </Text>
                </LinearGradient>
              )}

              {/* Error Info */}
              {error && (
                <View style={styles.errorInfoBox}>
                  <Feather name="info" size={16} color="#e74c3c" />
                  <Text style={styles.errorInfoText}>İlk 100 kişiye özel kampanyamız sona ermiştir.</Text>
                </View>
              )}
            </View>
          </ScrollView>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    width: Math.min(width * 0.9, 380),
    maxHeight: height * 0.82,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
    overflow: 'hidden',
  },
  scrollContent: {
    flexGrow: 1,
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    paddingTop: 25,
    paddingBottom: 18,
    paddingHorizontal: 20,
    alignItems: 'center',
    position: 'relative',
  },
  campaignBadge: {
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 215, 0, 0.4)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginBottom: 10,
  },
  campaignText: {
    color: '#FFD700',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
  },
  headerTitle: {
    color: 'white',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 5,
    textAlign: 'center',
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 13,
    textAlign: 'center',
  },
  accentLine: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#FFD700',
  },
  content: {
    padding: 25,
    paddingBottom: 28,
  },
  discountSection: {
    alignItems: 'center',
    marginBottom: 22,
  },
  discountLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  discountValueContainer: {
    paddingHorizontal: 5,
  },
  discountValue: {
    fontSize: 48,
    fontWeight: '800',
    color: '#c9082a',
    lineHeight: 48,
    marginBottom: 8,
  },
  discountDescription: {
    fontSize: 13,
    color: '#666',
    lineHeight: 19,
    textAlign: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#dee2e6',
    marginBottom:15,
    opacity: 0.5,
  },
  promoBox: {
    borderWidth: 2,
    borderColor: '#dee2e6',
    borderRadius: 12,
    padding: 20,
    marginBottom: 18,
    minHeight: 140,
    justifyContent: 'center',
    alignItems: 'center',
  },
  promoLabel: {
    fontSize: 11,
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '600',
    marginBottom: 10,
    textAlign: 'center',
  },
  promoCode: {
    fontSize: 30,
    fontWeight: '700',
    color: '#104438',
    letterSpacing: 4,
    textAlign: 'center',
    marginBottom: 12,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  copyButton: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  copyButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 22,
    paddingVertical: 11,
    gap: 8,
  },
  copyButtonIcon: {
    fontSize: 16,
  },
  copyButtonText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
  },
  noCodeText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  errorContainer: {
    alignItems: 'center',
    gap: 10,
  },
  errorText: {
    fontSize: 15,
    color: '#e74c3c',
    fontWeight: '600',
  },
  infoBox: {
    borderLeftWidth: 4,
    borderLeftColor: '#104438',
    borderRadius: 8,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  infoIcon: {
    fontSize: 18,
    flexShrink: 0,
    marginTop: 1,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#334155',
    lineHeight: 19,
  },
  errorInfoBox: {
    flexDirection: 'row',
    backgroundColor: '#ffeaea',
    padding: 14,
    borderRadius: 8,
    alignItems: 'flex-start',
    borderLeftWidth: 4,
    borderLeftColor: '#e74c3c',
    gap: 10,
  },
  errorInfoText: {
    flex: 1,
    fontSize: 13,
    color: '#c0392b',
    lineHeight: 19,
  },
});

export default NewYearPromoCodeModal;