
import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  ScrollView,
  Alert,
  StyleSheet,
  Switch,
  TouchableOpacity,
  Dimensions,
  Image,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  addDoc,
  collection,
  getDocs,
  query,
  orderBy,
  where,
  updateDoc,
  doc,
  deleteDoc,
  limit
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import * as Notifications from "expo-notifications";
import { WebView } from "react-native-webview";

import { useFocusEffect, useRoute, useNavigation, RouteProp } from "@react-navigation/native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useAuth } from "../context/AuthContext";
import { findNodeHandle } from "react-native";
import { UIManager } from "react-native";

import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { getDeviceId } from "../utils/getDeviceId";
// Dosyanın en üstüne import ekleyin
import { Platform, NativeModules } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';


// Component içinde, state'lerden önce bu fonksiyonu ekleyin
const getDeviceLocale = () => {
  let locale = "tr-TR";
  if (Platform.OS === "ios") {
    locale =
      NativeModules.SettingsManager?.settings?.AppleLocale ||
      NativeModules.SettingsManager?.settings?.AppleLanguages?.[0] ||
      "tr-TR";
  } else {
    locale = NativeModules.I18nManager?.localeIdentifier || "tr-TR";
  }
  return locale;
};

// Ardından tarihleri gösterirken Türkçe format kullanın
// toLocaleDateString yerine şunu kullanın:

const formatTarihTurkce = (date: Date) => {
  const gun = date.getDate().toString().padStart(2, "0");
  const ay = (date.getMonth() + 1).toString().padStart(2, "0");
  const yil = date.getFullYear();
  return `${gun}.${ay}.${yil}`;
};

type RootStackParamList = {
  "Prova Kartı": { goToUrl?: string | null };
};

type ProvaKartiRouteProp = RouteProp<RootStackParamList, "Prova Kartı">;
type ProvaKartiNavigationProp = NativeStackNavigationProp<RootStackParamList, "Prova Kartı">;

// Interface'i bileşen dışında tanımlayın
interface RandevuData {
  name: string;
  phone: string;
  email: string;
  tarih1: string;
  saat1: string;
  teslimTarihi: string;
  teslimSaat: string;
  notlar: string;
  deviceId: string;
  tarih2?: string;
  saat2?: string;
}

const screenWidth = Dimensions.get("window").width;
const saatSecenekleri = ["10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"];

export function RandevuForm() {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [tarih, setTarih] = useState(new Date());
  const [showDate, setShowDate] = useState(false);
  const [saat, setSaat] = useState("10:00");

  const [editingId, setEditingId] = useState<string | null>(null);

  const [notlar, setNotlar] = useState("");
  const [onay, setOnay] = useState(false);
  const [activeWebUrl, setActiveWebUrl] = useState<string | null>(null);
  const webViewRef = useRef<WebView>(null);
  const [randevular, setRandevular] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const bugun = new Date();
  bugun.setHours(0, 0, 0, 0);

  const [showIkinciProva, setShowIkinciProva] = useState(false);

  const scrollViewRef = useRef<ScrollView>(null);
  const formStartRef = useRef<View>(null);

  // Tarihler
  const [tarih1, setTarih1] = useState<Date | null>(null);
  const [tarih2, setTarih2] = useState<Date | null>(null);
  const [teslimTarihi, setTeslimTarihi] = useState<Date | null>(null);

  // Saatler
  const [saat1, setSaat1] = useState<string | null>(null);
  const [saat2, setSaat2] = useState<string | null>(null);
  const [teslimSaat, setTeslimSaat] = useState<string | null>(null);

  // Tarih gösterim kontrolü
  const [showDatePicker, setShowDatePicker] = useState<{ [key: string]: boolean }>({
    tarih1: false,
    tarih2: false,
    teslim: false,
  });

  // Saat seçim kontrolü
  const [showSaatSecenekleri, setShowSaatSecenekleri] = useState<{ [key: string]: boolean }>({
    saat1: false,
    saat2: false,
    teslimSaat: false,
  });

  const handleShowDate = (key: string) => {
    setShowDatePicker((prev) => ({ ...prev, [key]: true }));
  };

  const handleEditRandevu = (randevu: any) => {
    setName(randevu.name);
    setPhone(randevu.phone);
    setEmail(randevu.email);
    setTarih1(new Date(randevu.tarih1));
    setSaat1(randevu.saat1);

    // İkinci prova varsa göster ve doldur
    if (randevu.tarih2 && randevu.saat2) {
      setShowIkinciProva(true);
      setTarih2(new Date(randevu.tarih2));
      setSaat2(randevu.saat2);
    } else {
      // İkinci prova yoksa boş bırak
      setTarih2(null);
      setSaat2(null);
    }

    setTeslimTarihi(new Date(randevu.teslimTarihi));
    setTeslimSaat(randevu.teslimSaat);
    setNotlar(randevu.notlar || "");
    setEditingId(randevu.id);

    setTimeout(() => {
      const scrollViewNode = findNodeHandle(scrollViewRef.current);
      if (formStartRef.current && scrollViewNode) {
        UIManager.measureLayout(
          findNodeHandle(formStartRef.current)!,
          scrollViewNode,
          () => {
            console.log("scroll hatası oldu");
          },
          (x, y) => {
            scrollViewRef.current?.scrollTo({ y, animated: true });
          }
        );
      }
    }, 300);
  };

  const handleDeleteRandevu = async (randevuId: string, randevuName: string) => {
    Alert.alert(
      "Randevuyu Sil",
      `"${randevuName}" isimli randevuyu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`,
      [
        {
          text: "İptal",
          style: "cancel",
        },
        {
          text: "Sil",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteDoc(doc(db, "provaRandevular", randevuId));
              Alert.alert("Başarılı", "Randevu başarıyla silindi.");
              await randevulariYukle();

              if (editingId === randevuId) {
                resetForm();
                setEditingId(null);
              }
            } catch (error) {
              console.error("Randevu silinirken hata:", error);
              Alert.alert("Hata", "Randevu silinirken bir hata oluştu.");
            }
          },
        },
      ]
    );
  };

  const handleDateChange = (key: string, event: any, selected?: Date) => {
    if (selected) {
      if (key === "tarih1") setTarih1(selected);
      if (key === "tarih2") setTarih2(selected);
      if (key === "teslim") setTeslimTarihi(selected);
    }
    setShowDatePicker((prev) => ({ ...prev, [key]: false }));
  };

  const toggleSaatSecenek = (key: string) => {
    setShowSaatSecenekleri((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSaatSelect = (key: string, value: string) => {
    if (key === "saat1") setSaat1(value);
    if (key === "saat2") setSaat2(value);
    if (key === "teslimSaat") setTeslimSaat(value);
    setShowSaatSecenekleri((prev) => ({ ...prev, [key]: false }));
  };

  const getBildirimZamani = (tarih: Date, saat: string) => {
    const [saatStr, dakikaStr] = saat.split(":");
    const date = new Date(tarih);
    date.setHours(Number(saatStr), Number(dakikaStr), 0, 0);
    return date;
  };

  const route = useRoute<ProvaKartiRouteProp>();
  const navigation = useNavigation<ProvaKartiNavigationProp>();
  const routeParams = route.params as { goToUrl?: string | null } | undefined;

  useFocusEffect(
    useCallback(() => {
      if (routeParams?.goToUrl) {
        setActiveWebUrl(routeParams.goToUrl);
      } else {
        setActiveWebUrl(null);
      }
      resetForm();
      setEditingId(null);
    }, [routeParams?.goToUrl])
  );

  useEffect(() => {
    const getPermission = async () => {
      const { status } = await Notifications.requestPermissionsAsync();

      if (status !== "granted") {
        alert("Bildirim izni verilmedi. Lütfen ayarlardan bildirime izin verin.");
      } else {
        console.log("Bildirim izni verildi.");
      }
    };

    getPermission();
  }, []);

  useEffect(() => {
    const getPermissionAndSetupChannel = async () => {
      const { status } = await Notifications.requestPermissionsAsync();

      if (status !== "granted") {
        alert("Bildirim izni verilmedi. Lütfen ayarlardan bildirime izin verin.");
        return;
      }

      await Notifications.setNotificationChannelAsync("default", {
        name: "Genel Bildirimler",
        importance: Notifications.AndroidImportance.HIGH,
        sound: "default",
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });

      console.log("Bildirim kanalı oluşturuldu.");
    };

    getPermissionAndSetupChannel();
  }, []);

  useEffect(() => {
    // 1. prova tarihi seçildiğinde ikinci prova bölümünü göster
    if (tarih1 && saat1) {
      setShowIkinciProva(true);
    } else {
      setShowIkinciProva(false);
    }
  }, [tarih1, saat1]);

  const resetForm = () => {
    setName("");
    setPhone("");
    setEmail("");
    setNotlar("");
    setOnay(false);
    setTarih1(null);
    setTarih2(null);
    setTeslimTarihi(null);
    setSaat1(null);
    setSaat2(null);
    setTeslimSaat(null);
    setShowSaatSecenekleri({ saat1: false, saat2: false, teslimSaat: false });
    setShowDatePicker({ tarih1: false, tarih2: false, teslim: false });
    setShowIkinciProva(false);
  };

  const randevulariYukle = async () => {
    setIsLoading(true);
    try {
      const deviceId = await getDeviceId();

      const q = query(
        collection(db, "provaRandevular"),
        where("deviceId", "==", deviceId),
        orderBy("createdAt", "desc"),
        limit(50) // Maksimum 50 kayıt getir
      );
      const querySnapshot = await getDocs(q);
      const randevuListesi = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setRandevular(randevuListesi);
    } catch (error) {
      console.error("Provalar çekilirken hata:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    randevulariYukle();
  }, []);

  const bildirimGonder = async () => {
    const zamanlar = [86400000, 7200000];
    const suAn = new Date();

    const bildirimler = [];

    // 1. prova her zaman var
    if (tarih1 && saat1) {
      bildirimler.push({ tarih: tarih1, saat: saat1, label: "1. prova randevunuz" });
    }

    // İkinci prova varsa ekle
    if (tarih2 && saat2) {
      bildirimler.push({ tarih: tarih2, saat: saat2, label: "2. prova randevunuz" });
    }

    // Teslim her zaman ekle
    if (teslimTarihi && teslimSaat) {
      bildirimler.push({ tarih: teslimTarihi, saat: teslimSaat, label: "Ürün teslim randevunuz" });
    }

    for (const { tarih, saat, label } of bildirimler) {
      const hedefZaman = getBildirimZamani(tarih, saat);
      console.log("Hedef Zaman:", hedefZaman);
      for (const fark of zamanlar) {
        const farkInSeconds = Math.floor((hedefZaman.getTime() - suAn.getTime() - fark) / 1000);
        if (farkInSeconds <= 0) continue;

        console.log(`Bildirim için ayarlanan zaman: ${new Date(suAn.getTime() + farkInSeconds * 1000)}`);
        console.log(`Bildirim başlık: ${label}`);
        console.log(
          `Bildirim metni: ${
            fark === zamanlar[0]
              ? `${label} yarın saat ${saat}'te. Hatırlatmak istedik.`
              : `${label} 2 saat sonra başlıyor.`
          }`
        );

        await Notifications.scheduleNotificationAsync({
          content: {
            title: "Prova Randevunuz Yaklaşıyor!",
            body:
              fark === zamanlar[0]
                ? `${label} yarın saat ${saat}'te. Hatırlatmak istedik.`
                : `${label} 2 saat sonra başlıyor.`,
          },
          trigger: { type: "timeInterval", seconds: farkInSeconds, repeats: false } as any,
        });
      }
    }
  };

  const handleSubmit = async () => {
    if (!name || !phone || !email || !onay || !tarih1 || !saat1 || !teslimTarihi || !teslimSaat) {
      Alert.alert("Hata", "Lütfen gerekli alanları doldurun ve onay kutusunu işaretleyin.");
      return;
    }

    const deviceId = await getDeviceId();

    try {
      const randevuData: RandevuData = {
        name,
        phone,
        email,
        tarih1: tarih1.toISOString().split("T")[0],
        saat1,
        teslimTarihi: teslimTarihi.toISOString().split("T")[0],
        teslimSaat,
        notlar,
        deviceId,
      };

      // İkinci prova seçildiyse ekle
      if (tarih2 && saat2) {
        randevuData.tarih2 = tarih2.toISOString().split("T")[0];
        randevuData.saat2 = saat2;
      }

      if (editingId) {
        const randevuRef = doc(db, "provaRandevular", editingId);
        await updateDoc(randevuRef, {
          ...randevuData,
          updatedAt: new Date(),
        });
        Alert.alert("Başarılı", "Prova randevusu güncellendi!");
        setEditingId(null);
      } else {
        await addDoc(collection(db, "provaRandevular"), {
          ...randevuData,
          createdAt: new Date(),
        });
        Alert.alert("Başarılı", "Provanız oluşturuldu!");
      }

      await randevulariYukle();
      await bildirimGonder();
      resetForm();
    } catch (error) {
      console.error("Prova kaydı sırasında hata:", error);
      Alert.alert("Hata", "Prova kaydı sırasında bir hata oluştu.");
    }
  };

  return (

  <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['top', 'bottom']}>
      {activeWebUrl ? (
        <WebView
          ref={webViewRef}
          source={{ uri: activeWebUrl }}
          style={{ flex: 1 }}
          sharedCookiesEnabled={false}
          javaScriptEnabled={true}
          domStorageEnabled={false}
        />
      ) : (
        <ScrollView ref={scrollViewRef} contentContainerStyle={styles.scrollContainer}>
          <View style={styles.introContainer}>
            <Image
              source={require("../../assets/images/siziBekliyoruz.png")}
              style={styles.introImage}
              resizeMode="contain"
            />
          </View>

          <Text style={{ color: "#888", textAlign: "center", fontSize: 14, paddingBottom: 20 }}>
            Prova tarih değişikliğini, firmayı arayarak onay almanız gerekmektedir.
          </Text>
          <View ref={formStartRef} />
          <Text style={{ color: "#5897a3", fontWeight: "bold", fontSize: 18, paddingBottom: 20 }}>
            Prova Kartı Oluştur
          </Text>

          <View style={styles.innerContainer}>
            <Text style={styles.label}>
              Adınız ve Soyadınız <Text style={styles.required}>*</Text>
            </Text>
            <TextInput value={name} onChangeText={setName} style={styles.textField} />
            <Text style={styles.label}>
              Telefon Numaranız <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              style={styles.textField}
            />
            <Text style={styles.label}>
              E-Posta Adresiniz <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              style={styles.textField}
            />
            <Text style={styles.label}>1. Prova Tarihi *</Text>
            <Button
              color="#5897a3"
              title={tarih1 ? formatTarihTurkce(tarih1) : "Tarih Seçiniz"}
              onPress={() => handleShowDate("tarih1")}
            />
            {/* // DateTimePicker için de locale eklemeyi deneyin: */}
            {showDatePicker.tarih1 && (
              <DateTimePicker
                value={tarih1 || new Date()}
                minimumDate={bugun}
                mode="date"
                display="default"
                locale="tr-TR"
                onChange={(e, selected) => handleDateChange("tarih1", e, selected)}
              />
            )}
            <Text style={styles.label}>1. Prova Saati *</Text>
            <TouchableOpacity style={styles.textField} onPress={() => toggleSaatSecenek("saat1")}>
              <Text style={{ color: saat1 ? "#000" : "#999" }}>{saat1 || "Saat Seçiniz"}</Text>
            </TouchableOpacity>
            {showSaatSecenekleri.saat1 && (
              <View>
                {saatSecenekleri.map((s) => (
                  <TouchableOpacity key={s} onPress={() => handleSaatSelect("saat1", s)}>
                    <Text style={styles.dropdownItem}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            {showIkinciProva && (
              <>
                <Text style={[styles.label, { marginTop: 25, color: "#666" }]}>
                  2. Prova Tarihi (İsteğe Bağlı)
                </Text>
                <Text style={{ fontSize: 12, color: "#999", marginBottom: 10 }}>
                  İkinci prova istemiyorsanız bu alanı boş bırakabilirsiniz
                </Text>
                <Button
                  color="#5897a3"
                  title={tarih2 ? tarih2.toLocaleDateString() : "Tarih Seçiniz"}
                  onPress={() => handleShowDate("tarih2")}
                />
                {showDatePicker.tarih2 && (
                  <DateTimePicker
                    value={tarih2 || new Date()}
                    minimumDate={bugun}
                    mode="date"
                    display="default"
                    locale="tr-TR" // Türkçe dil desteği
                    onChange={(e, selected) => handleDateChange("tarih2", e, selected)}
                  />
                )}

                <Text style={styles.label}>2. Prova Saati</Text>
                <TouchableOpacity style={styles.textField} onPress={() => toggleSaatSecenek("saat2")}>
                  <Text style={{ color: saat2 ? "#000" : "#999" }}>{saat2 || "Saat Seçiniz"}</Text>
                </TouchableOpacity>
                {showSaatSecenekleri.saat2 && (
                  <View>
                    {saatSecenekleri.map((s) => (
                      <TouchableOpacity key={s} onPress={() => handleSaatSelect("saat2", s)}>
                        <Text style={styles.dropdownItem}>{s}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </>
            )}
            <Text style={styles.label}>Ürün Teslim Tarihi *</Text>
            <Button
              color="#5897a3"
              title={teslimTarihi ? teslimTarihi.toLocaleDateString() : "Tarih Seçiniz"}
              onPress={() => handleShowDate("teslim")}
            />
            {showDatePicker.teslim && (
              <DateTimePicker
                value={teslimTarihi || new Date()}
                minimumDate={bugun}
                mode="date"
                display="default"
                locale="tr-TR" // Türkçe dil desteği
                onChange={(e, selected) => handleDateChange("teslim", e, selected)}
              />
            )}
            <Text style={styles.label}>Teslim Saati *</Text>
            <TouchableOpacity style={styles.textField} onPress={() => toggleSaatSecenek("teslimSaat")}>
              <Text style={{ color: teslimSaat ? "#000" : "#999" }}>{teslimSaat || "Saat Seçiniz"}</Text>
            </TouchableOpacity>
            {showSaatSecenekleri.teslimSaat && (
              <View>
                {saatSecenekleri.map((s) => (
                  <TouchableOpacity key={s} onPress={() => handleSaatSelect("teslimSaat", s)}>
                    <Text style={styles.dropdownItem}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            <Text style={styles.label}>Paragraf Metni</Text>
            <TextInput
              value={notlar}
              onChangeText={setNotlar}
              multiline
              numberOfLines={4}
              style={[styles.textField, { height: 100 }]}
              placeholder="Beğendiğiniz modellerin stok numarasını buraya yazabilirsiniz"
            />
            <View style={styles.checkboxContainer}>
              <Switch value={onay} onValueChange={setOnay} />
              <Text style={styles.checkboxLabel}>
                Bilgileri Onaylıyorum <Text style={styles.required}>*</Text>
              </Text>
            </View>
            <View style={styles.buttonContainer}>
              <Button
                color="#5897a3"
                title={editingId ? "Prova Güncelle" : "Prova Oluştur"}
                onPress={handleSubmit}
              />
            </View>
          </View>

          <Text style={styles.sectionTitle}>Oluşturulan Provalar</Text>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Yükleniyor...</Text>
            </View>
          ) : randevular.length === 0 ? (
            <View style={styles.emptyContainer}>
              <FontAwesome name="calendar-o" size={48} color="#ccc" />
              <Text style={styles.emptyText}>Henüz prova oluşturulmamış</Text>
              <Text style={styles.emptySubText}>
                İlk randevunuzu oluşturmak için yukarıdaki formu doldurun
              </Text>
            </View>
          ) : (
            <View style={styles.randevuListContainer}>
              {randevular.map((item, index) => (
                <View
                  key={item.id}
                  style={[styles.modernCard, { marginBottom: index === randevular.length - 1 ? 20 : 16 }]}
                >
                  <View style={styles.cardHeader}>
                    <View style={styles.avatarContainer}>
                      <FontAwesome name="user" size={20} color="#5897a3" />
                    </View>
                    <View style={styles.headerInfo}>
                      <Text style={styles.customerName}>{item.name}</Text>
                      <Text style={styles.customerContact}>📞 {item.phone}</Text>
                    </View>
                  </View>

                  <View style={styles.emailContainer}>
                    <FontAwesome name="envelope-o" size={14} color="#666" />
                    <Text style={styles.emailText}>{item.email}</Text>
                  </View>

                  <View style={styles.timelineContainer}>
                    <View style={styles.timelineItem}>
                      <View style={styles.timelineDot}>
                        <Text style={styles.timelineNumber}>1</Text>
                      </View>
                      <View style={styles.timelineContent}>
                        <Text style={styles.timelineTitle}>1. Prova</Text>
                        <View style={styles.dateTimeRow}>
                          <FontAwesome name="calendar" size={12} color="#5897a3" />
                          <Text style={styles.dateText}>{item.tarih1}</Text>
                          <FontAwesome name="clock-o" size={12} color="#5897a3" style={{ marginLeft: 12 }} />
                          <Text style={styles.timeText}>{item.saat1}</Text>
                        </View>
                      </View>
                    </View>

                    {item.tarih2 && item.saat2 && (
                      <>
                        <View style={styles.timelineLine} />
                        <View style={styles.timelineItem}>
                          <View style={styles.timelineDot}>
                            <Text style={styles.timelineNumber}>2</Text>
                          </View>
                          <View style={styles.timelineContent}>
                            <Text style={styles.timelineTitle}>2. Prova</Text>
                            <View style={styles.dateTimeRow}>
                              <FontAwesome name="calendar" size={12} color="#5897a3" />
                              <Text style={styles.dateText}>{item.tarih2}</Text>
                              <FontAwesome
                                name="clock-o"
                                size={12}
                                color="#5897a3"
                                style={{ marginLeft: 12 }}
                              />
                              <Text style={styles.timeText}>{item.saat2}</Text>
                            </View>
                          </View>
                        </View>
                      </>
                    )}

                    <View style={styles.timelineLine} />

                    <View style={styles.timelineItem}>
                      <View style={[styles.timelineDot, styles.deliveryDot]}>
                        <FontAwesome name="gift" size={12} color="#fff" />
                      </View>
                      <View style={styles.timelineContent}>
                        <Text style={styles.timelineTitle}>Ürün Teslim</Text>
                        <View style={styles.dateTimeRow}>
                          <FontAwesome name="calendar" size={12} color="#5897a3" />
                          <Text style={styles.dateText}>{item.teslimTarihi}</Text>
                          <FontAwesome name="clock-o" size={12} color="#5897a3" style={{ marginLeft: 12 }} />
                          <Text style={styles.timeText}>{item.teslimSaat}</Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  {item.notlar ? (
                    <View style={styles.notesContainer}>
                      <FontAwesome name="sticky-note-o" size={14} color="#666" />
                      <Text style={styles.notesText}>{item.notlar}</Text>
                    </View>
                  ) : null}

                  <View style={styles.actionContainer}>
                    <TouchableOpacity style={styles.editButton} onPress={() => handleEditRandevu(item)}>
                      <FontAwesome name="edit" size={16} color="#5897a3" />
                      <Text style={styles.editButtonText}>Düzenle</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDeleteRandevu(item.id, item.name)}
                    >
                      <FontAwesome name="trash-o" size={16} color="#e74c3c" />
                      <Text style={styles.deleteButtonText}>Sil</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    color: "#5897a3",
    fontWeight: "bold",
    fontSize: 18,
    paddingTop: 30,
    paddingBottom: 20,
    textAlign: "center",
  },

  loadingContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },

  loadingText: {
    color: "#666",
    fontSize: 16,
  },

  emptyContainer: {
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },

  emptyText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "600",
    marginTop: 16,
    textAlign: "center",
  },

  emptySubText: {
    color: "#999",
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
    lineHeight: 20,
  },

  modernCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderLeftWidth: 4,
    borderLeftColor: "#5897a3",
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },

  avatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#f0f8ff",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#e3f2fd",
  },

  headerInfo: {
    flex: 1,
    marginLeft: 12,
  },

  customerName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2c3e50",
    marginBottom: 2,
  },

  customerContact: {
    fontSize: 13,
    color: "#7f8c8d",
  },

  statusBadge: {
    backgroundColor: "#27ae60",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },

  statusText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
  },

  emailContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
  },

  emailText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#495057",
  },

  timelineContainer: {
    marginBottom: 20,
  },

  timelineItem: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  timelineDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#5897a3",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
    marginTop: 2,
  },

  deliveryDot: {
    backgroundColor: "#e67e22",
  },

  timelineNumber: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },

  timelineContent: {
    flex: 1,
    paddingBottom: 16,
  },

  timelineTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 6,
  },

  dateTimeRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  dateText: {
    marginLeft: 6,
    fontSize: 13,
    color: "#5897a3",
    fontWeight: "500",
  },

  timeText: {
    marginLeft: 6,
    fontSize: 13,
    color: "#5897a3",
    fontWeight: "500",
  },

  timelineLine: {
    width: 2,
    height: 20,
    backgroundColor: "#e9ecef",
    marginLeft: 15,
    marginBottom: 8,
  },

  notesContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 20,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#fff3cd",
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#ffc107",
  },

  notesText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#856404",
    lineHeight: 20,
    flex: 1,
  },

  actionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#f1f3f4",
    paddingTop: 16,
  },

  editButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e8f4f8",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    flex: 0.45,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#5897a3",
  },

  editButtonText: {
    color: "#5897a3",
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "600",
  },

  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fdf2f2",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    flex: 0.45,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e74c3c",
  },

  deleteButtonText: {
    color: "#e74c3c",
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "600",
  },

  cardActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  randevuListContainer: {
    width: "100%",
    paddingVertical: 10,
  },

  randevuCardStyled: {
    width: screenWidth < 400 ? "100%" : "95%",
    alignSelf: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: "#5897a3",
  },

  cardName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },

  cardDetail: {
    fontSize: 14,
    color: "#555",
    marginBottom: 2,
  },

  cardSection: {
    marginTop: 8,
  },

  cardLabel: {
    fontWeight: "600",
    fontSize: 13,
    color: "#444",
  },

  cardValue: {
    fontSize: 14,
    color: "#333",
  },

  randevuGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  randevuCard: {
    width: "48%",
    backgroundColor: "#f0f0f0",
    padding: 12,
    borderRadius: 6,
    marginBottom: 12,
  },
  breadcrumbContainer: {
    width: "90%",
  },
  breadcrumbText: {
    fontSize: 14,
    color: "#444",
    paddingTop: 20,
  },
  breadcrumbLink: {
    color: "#2e5e4e",
  },
  breadcrumbActive: {
    color: "#888",
  },
  headerImage: {
    width: 150,
    height: 50,
    marginTop: 10,
    alignSelf: "center",
  },
  scrollContainer: {
    paddingVertical: 20,
    paddingLeft: 20,
    paddingRight: 20,
    alignItems: "center",
  },
  fullWidthToolbar: {
    width: "100%",
    backgroundColor: "#F8F8F8",
    borderBottomColor: "#F8F8F8",
    borderBottomWidth: 1,
    paddingVertical: 8,
    marginBottom: 10,
  },
  innerContainer: {
    width: "90%",
    maxWidth: 600,
  },
  menuRow: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    marginTop: 20,
  },
  menuItem: {
    fontSize: screenWidth < 400 ? 10 : 12,
    color: "#000",
    marginVertical: 4,
    paddingRight: 10,
    paddingLeft: 10,
    fontFamily: "ArialMdm",
  },
  active: {
    textDecorationLine: "underline",
  },
  label: {
    marginTop: 15,
    fontWeight: "bold",
    fontSize: 14,
    color: "#333",
  },
  required: {
    color: "red",
  },
  textField: {
    backgroundColor: "#f9f9f9",
    borderRadius: 4,
    marginTop: 4,
    marginBottom: 15,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  dropdownItem: {
    padding: 10,
    backgroundColor: "#f0f0f0",
    marginVertical: 2,
    borderRadius: 4,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 15,
  },
  checkboxLabel: {
    marginLeft: 10,
  },
  buttonContainer: {
    marginTop: 20,
    borderRadius: 4,
    overflow: "hidden",
  },
  introContainer: {
    marginTop: 10,
    marginBottom: 20,
    alignItems: "center",
    paddingHorizontal: 20,
  },
  introImage: {
    height: 300,
  },
});

export default RandevuForm;

