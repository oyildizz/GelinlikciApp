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

  // Basit cihaz ID oluşturucu
  static async getDeviceId(): Promise<string> {
    try {
      let deviceId = await AsyncStorage.getItem(this.DEVICE_ID_KEY);
      
      if (!deviceId) {
        // Basit unique ID oluştur
        deviceId = `WED_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        await AsyncStorage.setItem(this.DEVICE_ID_KEY, deviceId);
      }
      
      return deviceId;
    } catch (error) {
      console.error('Device ID oluşturma hatası:', error);
      return `WED_${Date.now()}`;
    }
  }

  // Kullanılan kodları getir
  static async getUsedCodes(): Promise<string[]> {
    try {
      const usedCodes = await AsyncStorage.getItem(this.USED_CODES_KEY);
      return usedCodes ? JSON.parse(usedCodes) : [];
    } catch (error) {
      console.error('Kullanılan kodları okuma hatası:', error);
      return [];
    }
  }

  // Kullanılan kod listesine ekle
  static async addUsedCode(code: string): Promise<void> {
    try {
      const usedCodes = await this.getUsedCodes();
      if (!usedCodes.includes(code)) {
        usedCodes.push(code);
        await AsyncStorage.setItem(this.USED_CODES_KEY, JSON.stringify(usedCodes));
      }
    } catch (error) {
      console.error('Kullanılan kod ekleme hatası:', error);
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
      // Zaten kod var mı kontrol et
      const existingCode = await this.getUserPromoCode();
      if (existingCode) {
        return existingCode;
      }

      // Kullanılan kodları al
      const usedCodes = await this.getUsedCodes();
      
      // Kullanılmayan kodları filtrele
      const availableCodes = promoCodesData.promoCodes.filter(
          (        code: string) => !usedCodes.includes(code)
      );

      if (availableCodes.length === 0) {
        console.warn('Tüm promosyon kodları kullanılmış!');
        return null;
      }

      // Rastgele bir kod seç
      const randomIndex = Math.floor(Math.random() * availableCodes.length);
      const selectedCode = availableCodes[randomIndex];

      // Cihaz ID al
      const deviceId = await this.getDeviceId();

      // Yeni promosyon kodu objesi oluştur
      const assignedPromo: AssignedPromoCode = {
        code: selectedCode,
        assignedAt: new Date().toISOString(),
        deviceId,
        isUsed: false,
        discountPercentage: promoCodesData.discountPercentage
      };

      // Kullanıcıya ata ve kullanılan listesine ekle
      await AsyncStorage.setItem(this.USER_PROMO_KEY, JSON.stringify(assignedPromo));
      await this.addUsedCode(selectedCode);

      console.log(`Promosyon kodu atandı: ${selectedCode}`);
      return assignedPromo;

    } catch (error) {
      console.error('Promosyon kodu atama hatası:', error);
      return null;
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
  }> {
    try {
      const usedCodes = await this.getUsedCodes();
      const userPromo = await this.getUserPromoCode();
      
      return {
        totalCodes: promoCodesData.promoCodes.length,
        usedCodes: usedCodes.length,
        availableCodes: promoCodesData.promoCodes.length - usedCodes.length,
        userHasCode: !!userPromo,
        userCode: userPromo?.code
      };
    } catch (error) {
      console.error('İstatistik alma hatası:', error);
      return {
        totalCodes: 200,
        usedCodes: 0,
        availableCodes: 200,
        userHasCode: false
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
        'has_seen_promo_modal'
      ]);
      console.log('Tüm promosyon verileri temizlendi');
    } catch (error) {
      console.error('Veri temizleme hatası:', error);
    }
  }
}

export default SimplePromoCodeService;