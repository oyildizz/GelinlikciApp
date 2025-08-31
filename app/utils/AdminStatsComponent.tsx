// components/AdminStatsComponent.tsx - Düzeltilmiş versiyon
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ScrollView,
  Modal,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import SimplePromoCodeService from './SimplePromoCodeService';

interface AdminStatsComponentProps {
  visible: boolean;
  onClose: () => void;
}

const AdminStatsComponent: React.FC<AdminStatsComponentProps> = ({ visible, onClose }) => {
  const [stats, setStats] = useState<{
    totalCodes: number;
    usedCodes: number;
    availableCodes: number;
    userHasCode: boolean;
    userCode?: string;
    remainingQuota: number;
  }>({
    totalCodes: 200,
    usedCodes: 0,
    availableCodes: 100,
    userHasCode: false,
    remainingQuota: 100,
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      loadStats();
    }
  }, [visible]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const currentStats = await SimplePromoCodeService.getStats();
      setStats(currentStats);
    } catch (error) {
      console.error('İstatistik yükleme hatası:', error);
      Alert.alert('Hata', 'İstatistikler yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const resetAllData = () => {
    Alert.alert(
      'Tüm Verileri Sıfırla',
      'Bu işlem tüm kullanılan kodları, cihaz kayıtlarını ve modal durumunu sıfırlayacak. Tüm kodlar tekrar kullanılabilir hale gelecek. Emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sıfırla',
          style: 'destructive',
          onPress: async () => {
            try {
              await SimplePromoCodeService.clearAllData();
              await loadStats();
              Alert.alert('Başarılı', 'Tüm veriler sıfırlandı.');
            } catch (error) {
              Alert.alert('Hata', 'Veriler sıfırlanırken bir hata oluştu.');
            }
          }
        }
      ]
    );
  };

  const resetModalStatus = () => {
    Alert.alert(
      'Modal Durumunu Sıfırla',
      'Bu işlem sadece modal gösterim durumunu sıfırlar. Promosyon kodu verileri etkilenmez.',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sıfırla',
          style: 'default',
          onPress: async () => {
            try {
              await SimplePromoCodeService.resetModalStatus();
              Alert.alert('Başarılı', 'Modal durumu sıfırlandı. Uygulama yeniden başlatıldığında modal görünecek.');
            } catch (error) {
              Alert.alert('Hata', 'Modal durumu sıfırlanırken bir hata oluştu.');
            }
          }
        }
      ]
    );
  };

  const quotaPercentage = Math.round((stats.usedCodes / 100) * 100);
  const totalUsagePercentage = stats.totalCodes > 0 
    ? Math.round((stats.usedCodes / stats.totalCodes) * 100) 
    : 0;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Promosyon Kodu İstatistikleri</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Feather name="x" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={loadStats}
              colors={['#104438']}
            />
          }
        >
          {/* Kota Durumu */}
          <View style={styles.quotaCard}>
            <Text style={styles.quotaTitle}>🎯 İlk 100 Kişi Kotası</Text>
            <View style={styles.quotaContent}>
              <Text style={styles.quotaNumber}>
                {stats.usedCodes} / 100
              </Text>
              <Text style={styles.quotaSubtext}>
                Kalan: {stats.remainingQuota}
              </Text>
            </View>
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { 
                      width: `${quotaPercentage}%`,
                      backgroundColor: quotaPercentage >= 90 ? '#e74c3c' : quotaPercentage >= 70 ? '#f39c12' : '#104438'
                    }
                  ]} 
                />
              </View>
              <Text style={styles.progressText}>{quotaPercentage}%</Text>
            </View>
          </View>

          {/* Ana İstatistikler */}
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, styles.totalCard]}>
              <Feather name="package" size={30} color="#104438" />
              <Text style={styles.statNumber}>{stats.totalCodes}</Text>
              <Text style={styles.statLabel}>Toplam Kod</Text>
            </View>

            <View style={[styles.statCard, styles.usedCard]}>
              <Feather name="check-circle" size={30} color="#e74c3c" />
              <Text style={[styles.statNumber, { color: '#e74c3c' }]}>
                {stats.usedCodes}
              </Text>
              <Text style={styles.statLabel}>Dağıtılan</Text>
            </View>

            <View style={[styles.statCard, styles.availableCard]}>
              <Feather name="gift" size={30} color="#27ae60" />
              <Text style={[styles.statNumber, { color: '#27ae60' }]}>
                {stats.remainingQuota}
              </Text>
              <Text style={styles.statLabel}>Kalan Kota</Text>
            </View>
          </View>

          {/* Durum Bilgileri */}
          <View style={styles.statusCard}>
            <Text style={styles.statusTitle}>Sistem Durumu</Text>
            
            <View style={styles.statusRow}>
              <Feather 
                name={stats.remainingQuota > 20 ? "check-circle" : stats.remainingQuota > 5 ? "alert-circle" : "x-circle"} 
                size={20} 
                color={stats.remainingQuota > 20 ? "#27ae60" : stats.remainingQuota > 5 ? "#f39c12" : "#e74c3c"} 
              />
            </View>

            <View style={styles.statusRow}>
              <Feather 
                name={stats.userHasCode ? "user-check" : "user-x"} 
                size={20} 
                color={stats.userHasCode ? "#3498db" : "#95a5a6"} 
              />
              <View style={styles.statusTextContainer}>
                <Text style={styles.statusLabel}>Bu Cihaz</Text>
                <Text style={styles.statusValue}>
                  {stats.userHasCode 
                    ? `Kod alınmış: ${stats.userCode}` 
                    : "Henüz kod alınmamış"}
                </Text>
              </View>
            </View>

            <View style={styles.statusRow}>
              <Feather 
                name="database" 
                size={20} 
                color="#3498db" 
              />
              <View style={styles.statusTextContainer}>
                <Text style={styles.statusLabel}>Toplam Kullanım</Text>
                <Text style={styles.statusValue}>
                  {stats.usedCodes} / {stats.totalCodes} (%{totalUsagePercentage})
                </Text>
              </View>
            </View>
          </View>

          {/* Öneriler */}
          <View style={styles.recommendationsCard}>
            <Text style={styles.recommendationsTitle}>💡 Öneriler</Text>
            
            {stats.remainingQuota <= 0 && (
              <View style={styles.recommendationItem}>
                <Text style={styles.recommendationText}>
                  • İlk 100 kişi kotası doldu! Yeni kullanıcılara modal gösterilmeyecek.
                </Text>
              </View>
            )}
            
            {stats.remainingQuota > 0 && stats.remainingQuota < 10 && (
              <View style={styles.recommendationItem}>
                <Text style={styles.recommendationText}>
                  • Kota bitmek üzere! Son {stats.remainingQuota} kod kaldı.
                </Text>
              </View>
            )}
            
            {quotaPercentage > 80 && stats.remainingQuota > 0 && (
              <View style={styles.recommendationItem}>
                <Text style={styles.recommendationText}>
                  • Yüksek talep var! Kampanya başarılı gidiyor.
                </Text>
              </View>
            )}
            
            {stats.remainingQuota > 50 && (
              <View style={styles.recommendationItem}>
                <Text style={styles.recommendationText}>
                  • Kota bol miktarda. Kampanyayı daha aktif tanıtabilirsiniz.
                </Text>
              </View>
            )}
          </View>

          {/* Admin Aksiyonları */}
          <View style={styles.actionsCard}>
            <Text style={styles.actionsTitle}>🔧 Admin Aksiyonları</Text>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={loadStats}
              disabled={loading}
            >
              <Feather name="refresh-cw" size={20} color="white" />
              <Text style={styles.actionButtonText}>İstatistikleri Yenile</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionButton, styles.warningButton]}
              onPress={resetModalStatus}
            >
              <Feather name="eye" size={20} color="white" />
              <Text style={styles.actionButtonText}>Modal Durumunu Sıfırla</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionButton, styles.dangerButton]}
              onPress={resetAllData}
            >
              <Feather name="trash-2" size={20} color="white" />
              <Text style={styles.actionButtonText}>Tüm Verileri Sıfırla</Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Angel House Wedding - Promosyon Sistemi v2.0
            </Text>
            <Text style={styles.footerSubtext}>
              İlk 100 Kişi Sistemi - Son güncelleme: {new Date().toLocaleString('tr-TR')}
            </Text>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
  },
  header: {
    backgroundColor: '#104438',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  closeButton: {
    padding: 5,
  },
  content: {
    padding: 20,
  },
  quotaCard: {
    backgroundColor: '#104438',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  quotaTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  quotaContent: {
    alignItems: 'center',
    marginBottom: 15,
  },
  quotaNumber: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
  },
  quotaSubtext: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginTop: 5,
  },
  statsGrid: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  totalCard: {
    borderTopWidth: 4,
    borderTopColor: '#104438',
  },
  usedCard: {
    borderTopWidth: 4,
    borderTopColor: '#e74c3c',
  },
  availableCard: {
    borderTopWidth: 4,
    borderTopColor: '#27ae60',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#104438',
    marginTop: 10,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
    textAlign: 'center',
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  progressBar: {
    flex: 1,
    height: 10,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 5,
    marginRight: 10,
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
  },
  progressText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    minWidth: 45,
  },
  statusCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  statusTextContainer: {
    marginLeft: 15,
    flex: 1,
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
  },
  statusValue: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  recommendationsCard: {
    backgroundColor: '#fff3cd',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  recommendationsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 10,
  },
  recommendationItem: {
    marginBottom: 8,
  },
  recommendationText: {
    fontSize: 14,
    color: '#856404',
    lineHeight: 20,
  },
  actionsCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  actionButton: {
    backgroundColor: '#104438',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  warningButton: {
    backgroundColor: '#f39c12',
  },
  dangerButton: {
    backgroundColor: '#e74c3c',
  },
  actionButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 10,
    fontSize: 16,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  footerSubtext: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
  },
});

export default AdminStatsComponent;