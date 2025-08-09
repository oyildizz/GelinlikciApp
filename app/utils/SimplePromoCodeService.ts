// utils/SimplePromoCodeService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import promoCodesData from '../(tabs)/promoCodes.json';

interface AssignedPromoCode {
  code: string;
  assignedAt: string;
  deviceId: string;
  isUsed: boolean;
  discountPercentage: number;
}

class SimplePromoCodeService {
  private static readonly USER_PROMO_KEY = 'user_promo_code';
  private static readonly USED_CODES_KEY = 'used_promo_codes';
  private static readonly DEVICE_ID_KEY = 'device_unique_id';
  private static readonly GLOBAL_USED_CODES_KEY = 'global_used_promo_codes'; // Global kullanılan kodlar
  private static readonly DEVICE_REGISTRY_KEY = 'device_registry'; // Cihaz kayıt listesi

  // Basit ama kalıcı cihaz ID oluşturucu
  static async getDeviceId(): Promise<string> {
    try {
      let deviceId = await AsyncStorage.getItem(this.DEVICE_ID_KEY);
      
      if (!deviceId) {
        // Benzersiz ve kalıcı ID oluştur
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 15);
        deviceId = `WED_${timestamp}_${random}`;
        
        await AsyncStorage.setItem(this.DEVICE_ID_KEY, deviceId);
      }
      
      return deviceId;
    } catch (error) {
      console.error('Device ID oluşturma hatası:', error);
      return `WED_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    }
  }

  // Cihaz kayıt listesini getir
  static async getDeviceRegistry(): Promise<string[]> {
    try {
      const registry = await AsyncStorage.getItem(this.DEVICE_REGISTRY_KEY);
      return registry ? JSON.parse(registry) : [];
    } catch (error) {
      console.error('Cihaz kayıt listesi okuma hatası:', error);
      return [];
    }
  }

  // Cihazı kayıt listesine ekle
  static async addToDeviceRegistry(deviceId: string): Promise<void> {
    try {
      const registry = await this.getDeviceRegistry();
      if (!registry.includes(deviceId)) {
        registry.push(deviceId);
        await AsyncStorage.setItem(this.DEVICE_REGISTRY_KEY, JSON.stringify(registry));
      }
    } catch (error) {
      console.error('Cihaz kayıt ekleme hatası:', error);
    }
  }

  // Global kullanılan kodları getir
  static async getGlobalUsedCodes(): Promise<string[]> {
    try {
      const usedCodes = await AsyncStorage.getItem(this.GLOBAL_USED_CODES_KEY);
      return usedCodes ? JSON.parse(usedCodes) : [];
    } catch (error) {
      console.error('Global kullanılan kodları okuma hatası:', error);
      return [];
    }
  }

  // Global kullanılan kod listesine ekle
  static async addGlobalUsedCode(code: string): Promise<void> {
    try {
      const usedCodes = await this.getGlobalUsedCodes();
      if (!usedCodes.includes(code)) {
        usedCodes.push(code);
        await AsyncStorage.setItem(this.GLOBAL_USED_CODES_KEY, JSON.stringify(usedCodes));
      }
    } catch (error) {
      console.error('Global kullanılan kod ekleme hatası:', error);
    }
  }

  // Kullanıcının lokal kullanılan kodlarını getir (eski sistem ile uyumluluk)
  static async getUsedCodes(): Promise<string[]> {
    try {
      const usedCodes = await AsyncStorage.getItem(this.USED_CODES_KEY);
      return usedCodes ? JSON.parse(usedCodes) : [];
    } catch (error) {
      console.error('Kullanılan kodları okuma hatası:', error);
      return [];
    }
  }

  // Bu cihazın daha önce kod alıp almadığını kontrol et
  static async hasDeviceReceivedCode(): Promise<boolean> {
    try {
      const deviceId = await this.getDeviceId();
      const registry = await this.getDeviceRegistry();
      
      // Ayrıca kullanıcının lokal kaydı var mı da kontrol et
      const userPromo = await this.getUserPromoCode();
      
      return registry.includes(deviceId) || !!userPromo;
    } catch (error) {
      console.error('Cihaz kontrol hatası:', error);
      return false;
    }
  }

  // Kullanıcının mevcut promosyon kodunu kontrol et
  static async getUserPromoCode(): Promise<AssignedPromoCode | null> {
    try {
      const savedPromo = await AsyncStorage.getItem(this.USER_PROMO_KEY);
      return savedPromo ? JSON.parse(savedPromo) : null;
    } catch (error) {
      console.error('Promo kod okuma hatası:', error);
      return null;
    }
  }

  // Kullanıcıya yeni promosyon kodu ata
  static async assignPromoCode(): Promise<AssignedPromoCode | null> {
    try {
      // Cihaz ID al
      const deviceId = await this.getDeviceId();

      // Bu cihaz daha önce kod aldı mı kontrol et
      const hasReceivedCode = await this.hasDeviceReceivedCode();
      if (hasReceivedCode) {
        // Daha önce aldığı kodu getir
        const existingCode = await this.getUserPromoCode();
        if (existingCode) {
          console.log('Cihaz daha önce kod almış, mevcut kod döndürülüyor:', existingCode.code);
          return existingCode;
        }
      }

      // Global kullanılan kodları al
      const globalUsedCodes = await this.getGlobalUsedCodes();
      
      // İlk 100 kod kontrolü
      if (globalUsedCodes.length >= 100) {
        console.warn('İlk 100 promosyon kodu dağıtıldı!');
        return null;
      }
      
      // Kullanılmayan kodları filtrele
      const availableCodes = promoCodesData.promoCodes.filter(
        (code: string) => !globalUsedCodes.includes(code)
      );

      if (availableCodes.length === 0) {
        console.warn('Tüm promosyon kodları kullanılmış!');
        return null;
      }

      // Rastgele bir kod seç
      const randomIndex = Math.floor(Math.random() * availableCodes.length);
      const selectedCode = availableCodes[randomIndex];

      // Yeni promosyon kodu objesi oluştur
      const assignedPromo: AssignedPromoCode = {
        code: selectedCode,
        assignedAt: new Date().toISOString(),
        deviceId,
        isUsed: false,
        discountPercentage: promoCodesData.discountPercentage
      };

      // Kullanıcıya ata, global listesine ve cihaz registry'sine ekle
      await AsyncStorage.setItem(this.USER_PROMO_KEY, JSON.stringify(assignedPromo));
      await this.addGlobalUsedCode(selectedCode);
      await this.addToDeviceRegistry(deviceId);

      // Eski sistem ile uyumluluk için lokal listeye de ekle
      await this.addLocalUsedCode(selectedCode);

      console.log(`Promosyon kodu atandı: ${selectedCode} (${globalUsedCodes.length + 1}/100)`);
      return assignedPromo;

    } catch (error) {
      console.error('Promosyon kodu atama hatası:', error);
      return null;
    }
  }

  // Lokal kullanılan kod listesine ekle (eski sistem uyumluluğu)
  private static async addLocalUsedCode(code: string): Promise<void> {
    try {
      const usedCodes = await this.getUsedCodes();
      if (!usedCodes.includes(code)) {
        usedCodes.push(code);
        await AsyncStorage.setItem(this.USED_CODES_KEY, JSON.stringify(usedCodes));
      }
    } catch (error) {
      console.error('Lokal kullanılan kod ekleme hatası:', error);
    }
  }

  // Promosyon kodunu kullanıldı olarak işaretle
  static async markAsUsed(): Promise<void> {
    try {
      const promoCode = await this.getUserPromoCode();
      if (promoCode && !promoCode.isUsed) {
        promoCode.isUsed = true;
        await AsyncStorage.setItem(this.USER_PROMO_KEY, JSON.stringify(promoCode));
        console.log(`Promosyon kodu kullanıldı: ${promoCode.code}`);
      }
    } catch (error) {
      console.error('Promo kod güncelleme hatası:', error);
    }
  }

  // İstatistik bilgileri al
  static async getStats(): Promise<{
    totalCodes: number;
    usedCodes: number;
    availableCodes: number;
    userHasCode: boolean;
    userCode?: string;
    remainingQuota: number; // İlk 100'den kalan
  }> {
    try {
      const globalUsedCodes = await this.getGlobalUsedCodes();
      const userPromo = await this.getUserPromoCode();
      const deviceRegistry = await this.getDeviceRegistry();
      
      const totalCodes = promoCodesData.promoCodes.length;
      const usedCodesCount = globalUsedCodes.length;
      const remainingQuota = Math.max(0, 100 - usedCodesCount);
      const availableCodes = Math.min(totalCodes - usedCodesCount, remainingQuota);
      
      return {
        totalCodes,
        usedCodes: usedCodesCount,
        availableCodes,
        userHasCode: !!userPromo,
        userCode: userPromo?.code,
        remainingQuota,
      };
    } catch (error) {
      console.error('İstatistik alma hatası:', error);
      return {
        totalCodes: promoCodesData.promoCodes?.length || 200,
        usedCodes: 0,
        availableCodes: 100,
        userHasCode: false,
        remainingQuota: 100,
      };
    }
  }

  // Debug: Tüm verileri temizle (sadece test için)
  static async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        this.USER_PROMO_KEY,
        this.USED_CODES_KEY,
        this.DEVICE_ID_KEY,
        this.GLOBAL_USED_CODES_KEY,
        this.DEVICE_REGISTRY_KEY,
        'has_seen_promo_modal'
      ]);
      console.log('Tüm promosyon verileri temizlendi');
    } catch (error) {
      console.error('Veri temizleme hatası:', error);
    }
  }

  // Debug: Sadece modal gösterim durumunu sıfırla
  static async resetModalStatus(): Promise<void> {
    try {
      await AsyncStorage.removeItem('has_seen_promo_modal');
      console.log('Modal durumu sıfırlandı');
    } catch (error) {
      console.error('Modal durum sıfırlama hatası:', error);
    }
  }
}

export default SimplePromoCodeService;