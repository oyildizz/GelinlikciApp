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
import { addDoc, collection, getDocs, query, orderBy, where } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import * as Notifications from "expo-notifications";
import { WebView } from "react-native-webview";

import { useFocusEffect, useRoute, useNavigation, RouteProp } from "@react-navigation/native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useAuth } from "../context/AuthContext";

import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { getDeviceId } from "../utils/getDeviceId";

type RootStackParamList = {
  "Prova Kartı": { goToUrl?: string | null };
};

type ProvaKartiRouteProp = RouteProp<RootStackParamList, "Prova Kartı">;
type ProvaKartiNavigationProp = NativeStackNavigationProp<RootStackParamList, "Prova Kartı">;

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



  const [notlar, setNotlar] = useState("");
  const [onay, setOnay] = useState(false);
  const [activeWebUrl, setActiveWebUrl] = useState<string | null>(null);
  const webViewRef = useRef<WebView>(null);
  const [randevular, setRandevular] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const bugun = new Date();
  bugun.setHours(0, 0, 0, 0);




 // Tarihler
  const [tarih1, setTarih1] = useState(new Date());
  const [tarih2, setTarih2] = useState(new Date());
  const [teslimTarihi, setTeslimTarihi] = useState(new Date());

  // Saatler
  const [saat1, setSaat1] = useState("10:00");
  const [saat2, setSaat2] = useState("10:00");
  const [teslimSaat, setTeslimSaat] = useState("10:00");

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
    }, [routeParams?.goToUrl])
  );

useEffect(() => {
  const getPermission = async () => {
    const { status } = await Notifications.requestPermissionsAsync();

    if (status !== 'granted') {
      alert('Bildirim izni verilmedi. Lütfen ayarlardan bildirime izin verin.');
    } else {
      console.log('Bildirim izni verildi.');
    }
  };

  getPermission();
}, []);

useEffect(() => {
  const getPermissionAndSetupChannel = async () => {
    const { status } = await Notifications.requestPermissionsAsync();

    if (status !== 'granted') {
      alert('Bildirim izni verilmedi. Lütfen ayarlardan bildirime izin verin.');
      return;
    }

    // ANDROID BİLDİRİM KANALI OLUŞTUR
    await Notifications.setNotificationChannelAsync("default", {
      name: "Genel Bildirimler",
      importance: Notifications.AndroidImportance.HIGH,
      sound: "default", // sesi açık olsun
      vibrationPattern: [0, 250, 250, 250], // titreşim deseni
      lightColor: "#FF231F7C", // LED bildirim rengi
    });

    console.log("Bildirim kanalı oluşturuldu.");
  };

  getPermissionAndSetupChannel();
}, []);


const randevulariYukle = async () => {
  setIsLoading(true);
  try {
    const deviceId = await getDeviceId(); // 📱

    const q = query(collection(db, "provaRandevular"), where("deviceId", "==", deviceId), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    const randevuListesi = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setRandevular(randevuListesi);
  } catch (error) {
    console.error("Randevular çekilirken hata:", error);
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

  const bildirimler = [
    { tarih: tarih1, saat: saat1, label: "1. prova randevunuz" },
    { tarih: tarih2, saat: saat2, label: "2. prova randevunuz" },
    { tarih: teslimTarihi, saat: teslimSaat, label: "Ürün teslim randevunuz" },
  ];

  for (const { tarih, saat, label } of bildirimler) {
    const hedefZaman = getBildirimZamani(tarih, saat);
    console.log("Hedef Zaman:", hedefZaman);
    for (const fark of zamanlar) {
      const farkInSeconds = Math.floor((hedefZaman.getTime() - suAn.getTime() - fark) / 1000);
      if (farkInSeconds <= 0) continue;
  // Bildirim bilgilerini logla
      console.log(`Bildirim için ayarlanan zaman: ${new Date(suAn.getTime() + farkInSeconds * 1000)}`);
      console.log(`Bildirim başlık: ${label}`);
      console.log(`Bildirim metni: ${
        fark === zamanlar[0]
          ? `${label} yarın saat ${saat}’te. Hatırlatmak istedik.`
          : `${label} 2 saat sonra başlıyor.`
      }`);
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Prova Randevunuz Yaklaşıyor!",
          body:
            fark === zamanlar[0]
              ? `${label} yarın saat ${saat}’te. Hatırlatmak istedik.`
              : `${label} 2 saat sonra başlıyor.`,
        },
        trigger: { type: "timeInterval", seconds: farkInSeconds, repeats: false } as any,
        
      });
      
    }
  }
};


const handleSubmit = async () => {
  if (!name || !phone || !email || !onay) {
    Alert.alert("Hata", "Lütfen gerekli alanları doldurun ve onay kutusunu işaretleyin.");
    return;
  }

  const deviceId = await getDeviceId();

  try {
    await addDoc(collection(db, "provaRandevular"), {
      name,
      phone,
      email,
      tarih1: tarih1.toISOString().split("T")[0],
      saat1,
      tarih2: tarih2.toISOString().split("T")[0],
      saat2,
      teslimTarihi: teslimTarihi.toISOString().split("T")[0],
      teslimSaat,
      notlar,
      createdAt: new Date(),
      deviceId, // 🔥 Bu önemli!
    });

    await randevulariYukle();
    await bildirimGonder();
    Alert.alert("Başarılı", "Randevunuz oluşturuldu!");
    resetForm();
  } catch (error) {
    console.error("Randevu kaydı sırasında hata:", error);
    Alert.alert("Hata", "Randevu kaydı sırasında bir hata oluştu.");
  }
};


   const resetForm = () => {
    setName("");
    setPhone("");
    setEmail("");
    setNotlar("");
    setOnay(false);
    setTarih1(new Date());
    setTarih2(new Date());
    setTeslimTarihi(new Date());
    setSaat1("10:00");
    setSaat2("10:00");
    setTeslimSaat("10:00");
    setShowSaatSecenekleri({ saat1: false, saat2: false, teslimSaat: false });
    setShowDatePicker({ tarih1: false, tarih2: false, teslim: false });
  };
  

  // if (!user) {
  //   return (
  //     <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
  //       <Text style={{ fontSize: 16, color: "#444", textAlign: "center", marginBottom: 20 }}>
  //         Prova randevusu almak için lütfen giriş yapınız.
  //       </Text>
  //       <Button
  //         title="Giriş Yap"
  //         onPress={() => navigation.setParams({ goToUrl: "https://angelhousewedding.com/uye-girisi/" })}
  //       />
  //     </View>
  //   );
  // }

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      {activeWebUrl ? (
        <WebView
          ref={webViewRef}
          source={{ uri: activeWebUrl }}
          style={{ flex: 1 }}
          sharedCookiesEnabled={true}
          javaScriptEnabled={true}
          domStorageEnabled={true}
        />
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* <View style={styles.breadcrumbContainer}>
            <Text style={styles.breadcrumbText}>
              <Text
                style={styles.breadcrumbLink}
                onPress={() => navigation.setParams({ goToUrl: "https://angelhousewedding.com/giris" })}
              >
                Anasayfa
              </Text>
              {" » "}
              <Text style={styles.breadcrumbActive}>Prova Kartı</Text>
            </Text>
          </View> */}
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

          <Text style={{ color: "#5897a3", fontWeight: "bold", fontSize: 18, paddingBottom: 20 }}>
            Prova Randevusu Al
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

             <Text style={styles.label}>1. Prova Tarihi</Text>
      <Button color="#5897a3" title={tarih1.toLocaleDateString()} onPress={() => handleShowDate("tarih1")} />
      {showDatePicker.tarih1 && (
        <DateTimePicker
          value={tarih1}
          minimumDate={bugun}
          mode="date"
          display="default"
          onChange={(e, selected) => handleDateChange("tarih1", e, selected)}
        />
      )}

      <Text style={styles.label}>1. Prova Saati</Text>
      <TouchableOpacity style={styles.textField} onPress={() => toggleSaatSecenek("saat1")}> 
        <Text>{saat1}</Text>
      </TouchableOpacity>
      {showSaatSecenekleri.saat1 && (
        <View>{saatSecenekleri.map((s) => (
          <TouchableOpacity key={s} onPress={() => handleSaatSelect("saat1", s)}><Text>{s}</Text></TouchableOpacity>
        ))}</View>
      )}

      <Text style={styles.label}>2. Prova Tarihi</Text>
      <Button color="#5897a3" title={tarih2.toLocaleDateString()} onPress={() => handleShowDate("tarih2")} />
      {showDatePicker.tarih2 && (
        <DateTimePicker
          value={tarih2}
          minimumDate={bugun}
          mode="date"
          display="default"
          onChange={(e, selected) => handleDateChange("tarih2", e, selected)}
        />
      )}

      <Text style={styles.label}>2. Prova Saati</Text>
      <TouchableOpacity style={styles.textField} onPress={() => toggleSaatSecenek("saat2")}> 
        <Text>{saat2}</Text>
      </TouchableOpacity>
      {showSaatSecenekleri.saat2 && (
        <View>{saatSecenekleri.map((s) => (
          <TouchableOpacity key={s} onPress={() => handleSaatSelect("saat2", s)}><Text>{s}</Text></TouchableOpacity>
        ))}</View>
      )}

      <Text style={styles.label}>Ürün Teslim Tarihi</Text>
      <Button color="#5897a3" title={teslimTarihi.toLocaleDateString()} onPress={() => handleShowDate("teslim")} />
      {showDatePicker.teslim && (
        <DateTimePicker
          value={teslimTarihi}
          minimumDate={bugun}
          mode="date"
          display="default"
          onChange={(e, selected) => handleDateChange("teslim", e, selected)}
        />
      )}

      <Text style={styles.label}>Teslim Saati</Text>
      <TouchableOpacity style={styles.textField} onPress={() => toggleSaatSecenek("teslimSaat")}> 
        <Text>{teslimSaat}</Text>
      </TouchableOpacity>
      {showSaatSecenekleri.teslimSaat && (
        <View>{saatSecenekleri.map((s) => (
          <TouchableOpacity key={s} onPress={() => handleSaatSelect("teslimSaat", s)}><Text>{s}</Text></TouchableOpacity>
        ))}</View>
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
              <Button color="#5897a3" title="Randevu Al" onPress={handleSubmit} />
            </View>
          </View>
       <Text style={{ color: '#5897a3', fontWeight: 'bold', fontSize: 18, paddingTop: 30, paddingBottom: 10 }}>
  Oluşturulan Randevular
</Text>

{isLoading ? (
  <Text>Yükleniyor...</Text>
) : randevular.length === 0 ? (
  <Text>Henüz randevu oluşturulmamış.</Text>
) : (

  <View style={styles.randevuListContainer}>
  {randevular.map((item) => (
    <View key={item.id} style={styles.randevuCardStyled}>
      <Text style={styles.cardName}>{item.name}</Text>
      <Text style={styles.cardDetail}>📧 {item.email}</Text>
      <Text style={styles.cardDetail}>📞 {item.phone}</Text>

      <View style={styles.cardSection}>
        <Text style={styles.cardLabel}>1. Prova:</Text>
        <Text style={styles.cardValue}>{item.tarih1} - {item.saat1}</Text>
      </View>

      <View style={styles.cardSection}>
        <Text style={styles.cardLabel}>2. Prova:</Text>
        <Text style={styles.cardValue}>{item.tarih2} - {item.saat2}</Text>
      </View>

      <View style={styles.cardSection}>
        <Text style={styles.cardLabel}>Teslim:</Text>
        <Text style={styles.cardValue}>{item.teslimTarihi} - {item.teslimSaat}</Text>
      </View>

      {item.notlar ? (
        <View style={styles.cardSection}>
          <Text style={styles.cardLabel}>Not:</Text>
          <Text style={styles.cardValue}>{item.notlar}</Text>
        </View>
      ) : null}
    </View>
  ))}
</View>

)}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({

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
  flexDirection: 'row',
  flexWrap: 'wrap',
  justifyContent: 'space-between',
  marginBottom: 30,
},
randevuCard: {
  width: '48%',
  backgroundColor: '#f0f0f0',
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
